import { ETHEREUM_CHAINS, ONE_18, TEN, getSupportedAssets, COMET_MARKET_MAPPING } from "constants/1delta"
import { ethers } from "ethers"
import { formatEther } from "ethers/lib/utils"
import { useMemo } from "react"
import { LendingProtocol } from "state/1delta/actions"
import { useDeltaAssetState, useGetSelectedAccount } from "state/1delta/hooks"
import { useNativeBalance } from "state/globalNetwork/hooks"
import { usePrices } from "state/oracles/hooks"
import { SupportedAssets } from "types/1delta"
import { TimeScale, calculateRateToNumber, formatAaveYieldToNumber } from "utils/tableUtils/format"

export interface AprData {
  apr: number
  borrowApr: number
  depositApr: number
}

export interface BalanceData {
  collateral: number
  deposits: number
  debt: number
  nav: number
}

export interface PreparedAssetData {
  userBorrow: number
  userBorrowUsd: number
  userBorrowStable: number
  userBorrowStableUsd: number
  collateralFactor: number
  liquidity: number
  liquidityUsd: number
  borrowApr: number
  hasStable: boolean
  borrowAprStable: number
  borrowEnabled: boolean
  hasPosition: boolean
  price: number;
  apr: number;
  totalSupply: number;
  totalSupplyUsd: number;
  userBalance: number;
  userBalanceUsd: number;
  hasBorrowPosition: boolean
  assetId: SupportedAssets;
  collateralEnabled: boolean;
  walletBalance: number
}

export interface BaseMarketData {
  assetsInMarket: SupportedAssets[]
  userBorrow: number
  userBorrowUsd: number
  collateralFactor: number
  liquidity: number
  liquidityUsd: number
  borrowApr: number
  hasPosition: boolean
  price: number;
  hasBorrowPosition: boolean
  assetId: SupportedAssets;
  walletBalance: number
}

// we avoid undefined
const defaultAnswer = {
  balanceData: {
    collateral: 0,
    deposits: 0,
    debt: 0,
    nav: 0,
  },
  aprData: {
    apr: 0,
    borrowApr: 0,
    depositApr: 0,
  },
  assetData: [],
  baseMarketData: []
}

/**
 * Enriches the asset data for frontend-use
 * @param lender the lending protocol as enum
 * @param chainId chainId
 * @param account user wallet address
 * @returns enriched asset data, balances in lender and apr data
 */
export const usePrepareAssetData = (lender: LendingProtocol, chainId: number, account: string | undefined): {
  balanceData: BalanceData,
  aprData: AprData,
  assetData: PreparedAssetData[],
  baseMarketData: BaseMarketData[]
} => {
  const deltaAssets = useDeltaAssetState()
  const assets = useMemo(() => {
    return getSupportedAssets(chainId, lender).map((x) => deltaAssets[x]
    )
  }, [deltaAssets, lender, chainId])

  const native = useNativeBalance()
  const prices = usePrices(assets.map(a => a.id), chainId)
  const selectedAccount = useGetSelectedAccount(chainId, account)
  return useMemo(() => {
    let depositInterest = 0
    let deposits = 0
    let borrowInterest = 0
    let debt = 0
    let collateral = 0
    const assetData: PreparedAssetData[] = []
    const baseMarketData: BaseMarketData[] = []
    switch (lender) {
      case LendingProtocol.AAVE: {
        const hasAccount = Boolean(account)
        for (let i = 0; i < assets.length; i++) {
          const price = prices[i]
          const asset = assets[i]
          const apr = formatAaveYieldToNumber(asset?.aaveData[chainId].reserveData?.liquidityRate ?? '0')

          const userBalance = Number(
            formatEther(
              ethers.BigNumber.from(asset.aaveData[chainId].userData?.currentATokenBalance ?? '0').mul(
                TEN.pow(18 - (asset.decimals ?? 0))
              )
            )
          )

          const userBalanceUsd = userBalance * price
          depositInterest += userBalanceUsd * apr
          deposits += userBalanceUsd
          let userBorrow = 0
          let userBorrowStable = 0
          if (hasAccount) {
            userBorrowStable = Number(
              formatEther(
                ethers.BigNumber.from(asset?.aaveData[chainId].userData?.currentStableDebt).mul(
                  TEN.pow(18 - (asset.decimals ?? 0))
                ) ?? '0'
              )
            )
            userBorrow = Number(
              formatEther(
                ethers.BigNumber.from(asset?.aaveData[chainId].userData?.currentVariableDebt ?? '0').mul(
                  TEN.pow(18 - (asset.decimals ?? 0))
                ) ?? '0'
              )
            )
          }
          const userBorrowUsd = userBorrow * price
          const userBorrowStableUsd = userBorrowStable * price

          debt += userBorrowUsd
          debt += userBorrowStableUsd

          let borrowAprStable = 0
          const hasStable = asset?.aaveData[chainId].reserveData?.stableBorrowRateEnabled ?? false
          const borrowApr = formatAaveYieldToNumber(asset?.aaveData[chainId].reserveData?.variableBorrowRate ?? '0')

          if (hasStable)
            borrowAprStable = formatAaveYieldToNumber(asset?.aaveData[chainId].reserveData?.stableBorrowRate ?? '0')

          borrowInterest += userBorrow * borrowApr * price
          borrowInterest += userBorrowStable * borrowAprStable * price

          // this is the total supply, the conversion to USD is at the bottom
          const totalA = asset?.aaveData[chainId].reserveData?.totalAToken ?? '0'
          const totalSupply = Number(
            formatEther(
              ethers.BigNumber.from(totalA).mul(TEN.pow(18 - (asset.decimals ?? 0))) ?? '0'
            )
          )

          const totalSupplyUsd = totalSupply * Number(price)

          const walletBalance = hasAccount ?
            (asset.id === SupportedAssets.ETH || asset.id === SupportedAssets.MATIC) ?
              Number(formatEther(native ?? '0')) :
              Number(
                formatEther(
                  ethers.BigNumber.from(asset.walletBalance ?? '0').mul(
                    TEN.pow(18 - (asset.decimals ?? 0))
                  )
                )
              ) : 0

          // this is the total supply, the conversion to USD is at the bottom
          const formattedLiquidity = asset.id === SupportedAssets.GHO ? Infinity : Number(
            formatEther(
              ethers.BigNumber.from(asset.aaveData[chainId].reserveData?.totalAToken ?? '0')
                .sub(
                  ethers.BigNumber.from(asset.aaveData[chainId].reserveData?.totalStableDebt ?? '0').add(
                    asset.aaveData[chainId].reserveData?.totalVariableDebt ?? '0'
                  )
                )
                .mul(TEN.pow(18 - (asset?.decimals ?? 0))) ?? '0'
            )
          )
          const collateralFactor = Number(asset.aaveData[chainId].reserveData.liquidationThreshold ?? '0') / 10000
          collateral += userBalanceUsd * collateralFactor
          assetData.push(
            {
              collateralFactor,
              apr,
              borrowAprStable,
              borrowApr,
              totalSupply,
              totalSupplyUsd,
              price,
              assetId: asset.id,
              userBalanceUsd,
              userBalance,
              userBorrow,
              userBorrowUsd,
              userBorrowStable,
              userBorrowStableUsd,
              hasPosition: hasAccount && userBalance > 0,
              walletBalance,
              liquidity: formattedLiquidity,
              liquidityUsd: formattedLiquidity * price,
              hasStable,
              borrowEnabled: asset?.aaveData[chainId].reserveData.borrowingEnabled ?? false,
              hasBorrowPosition: userBorrow > 0 || userBorrowStable > 0,
              collateralEnabled: asset?.aaveData[chainId].userData?.usageAsCollateralEnabled ?? false
            }
          )

        }

        return {
          aprData: {
            apr: (depositInterest - borrowInterest) / (deposits - debt),
            borrowApr: borrowInterest / debt,
            depositApr: depositInterest / deposits
          },
          assetData,
          balanceData: {
            collateral,
            deposits,
            debt,
            nav: deposits - debt
          },
          baseMarketData: []
        }
      }
      case LendingProtocol.COMPOUND: {
        for (let i = 0; i < assets.length; i++) {
          const price = prices[i]
          const asset = assets[i]
          const userBalance = Number(
            formatEther(
              ethers.BigNumber.from(
                asset.compoundData[chainId]?.userData[selectedAccount ?? '']?.balanceOf ?? '0'
              )
                .mul(asset.compoundData[chainId]?.reserveData?.exchangeRateCurrent ?? '0')
                .div(ONE_18)
                .mul(TEN.pow(18 - (asset.decimals ?? 0)))
            )
          )

          const apr = calculateRateToNumber(
            asset.compoundData[chainId]?.reserveData.supplyRatePerBlock ?? '0',
            chainId,
            ETHEREUM_CHAINS.includes(chainId) ? TimeScale.BLOCK : TimeScale.MS
          )

          const userBalanceUsd = userBalance * price

          depositInterest += userBalanceUsd * apr
          deposits += userBalanceUsd

          const borrowApr = calculateRateToNumber(
            asset?.compoundData[chainId]?.reserveData?.borrowRatePerBlock ?? '0',
            chainId,
            ETHEREUM_CHAINS.includes(chainId) ? TimeScale.BLOCK : TimeScale.MS
          )

          let userBorrow = 0

          if (selectedAccount)
            userBorrow = Number(
              formatEther(
                ethers.BigNumber.from(
                  asset?.compoundData[chainId]?.userData[selectedAccount]?.borrowBalanceCurrent ?? '0'
                ).mul(TEN.pow(18 - (asset.decimals ?? 0))) ?? '0'
              )
            )

          // this is the total supply, the conversion to USD is at the bottom
          const totalCToken = asset?.compoundData[chainId]?.reserveData.totalSupply ?? '0'
          const rate = asset?.compoundData[chainId]?.reserveData.exchangeRateCurrent ?? '0'
          const totalSupply = Number(
            formatEther(
              ethers.BigNumber.from(totalCToken)
                .mul(rate)
                .div(ONE_18)
                .mul(TEN.pow(18 - (asset.decimals ?? 0)))
            )
          )

          const totalSupplyUsd = totalSupply * Number(price)
          const userBorrowUsd = userBorrow * price

          debt += userBorrowUsd
          borrowInterest += userBorrowUsd * borrowApr

          const walletBalance = Boolean(account) ?
            (asset.id === SupportedAssets.ETH || asset.id === SupportedAssets.MATIC) ?
              Number(formatEther(native ?? '0')) :
              Number(
                formatEther(
                  ethers.BigNumber.from(asset.walletBalance ?? '0').mul(
                    TEN.pow(18 - (asset.decimals ?? 0))
                  )
                )
              ) : 0


          // this is the total supply, the conversion to USD is at the bottom
          const formattedLiquidity = Number(
            formatEther(
              ethers.BigNumber.from(asset.compoundData[chainId]?.reserveData.totalCash ?? '0').mul(
                TEN.pow(18 - (asset?.decimals ?? 0))
              ) ?? '0'
            )
          )

          const collateralFactor = Number(formatEther(asset.compoundData[chainId].reserveData?.collateralFactorMantissa ?? '0'))
          collateral += userBalanceUsd * collateralFactor
          assetData.push(
            {
              collateralFactor,
              apr,
              borrowAprStable: 0,
              borrowApr,
              totalSupply,
              totalSupplyUsd,
              price,
              assetId: asset.id,
              userBalanceUsd,
              userBalance,
              userBorrow,
              userBorrowUsd,
              userBorrowStable: 0,
              userBorrowStableUsd: 0,
              hasPosition: Boolean(account) && userBalance > 0,
              walletBalance,
              liquidity: formattedLiquidity,
              liquidityUsd: formattedLiquidity * price,
              hasStable: false,
              borrowEnabled: true,
              hasBorrowPosition: userBorrow > 0,
              collateralEnabled: true
            }
          )

        }



        return {
          aprData: {
            apr: (depositInterest - borrowInterest) / (deposits - debt),
            borrowApr: borrowInterest / debt,
            depositApr: depositInterest / deposits
          },
          assetData,
          balanceData: {
            collateral,
            deposits,
            debt,
            nav: deposits - debt
          },
          baseMarketData: []
        }
      }

      case LendingProtocol.COMPOUNDV3: {
        const hasAccount = Boolean(account)
        const baseMarkets = [SupportedAssets.USDC]
        for (let j = 0; j < baseMarkets.length; j++) {
          const baseAsset = baseMarkets[j]
          for (let i = 0; i < assets.length; i++) {
            const price = prices[i]
            const asset = assets[i]
            const canBorrow = baseAsset === asset.id
            const apr = calculateRateToNumber(
              asset?.compoundV3Data[chainId][baseAsset]?.reserveData.supplyRate ?? '0',
              chainId,
              TimeScale.MS
            )
            const userBalance = Number(
              formatEther(
                ethers.BigNumber.from(asset?.compoundV3Data[chainId][baseAsset]?.userData?.balance ?? '0').mul(
                  TEN.pow(18 - (asset.decimals ?? 0))
                )
              )
            )

            const userBalanceUsd = userBalance * price
            depositInterest += userBalanceUsd * apr
            deposits += userBalanceUsd
            let userBorrow = 0
            if (hasAccount && canBorrow) {
              userBorrow = Number(
                formatEther(
                  ethers.BigNumber.from(asset?.compoundV3Data[chainId][baseAsset].userData?.borrowBalance ?? '0').mul(
                    TEN.pow(18 - (asset.decimals ?? 0))
                  ) ?? '0'
                )
              )
            }
            const userBorrowUsd = userBorrow * price

            debt += userBorrowUsd


            const borrowApr = calculateRateToNumber(
              asset?.compoundV3Data[chainId][baseAsset].reserveData?.borrowRate ?? '0',
              chainId,
              TimeScale.MS
            )


            borrowInterest += userBorrow * borrowApr * price

            // this is the total supply, the conversion to USD is at the bottom
            const totalA = asset.id === baseAsset ? asset?.compoundV3Data[chainId][baseAsset].reserveData?.reserves ?? '0'
              : asset?.compoundV3Data[chainId][baseAsset].reserveData?.totalSupplyAsset ?? '0'
            const totalSupply = Number(
              formatEther(
                ethers.BigNumber.from(totalA).mul(TEN.pow(18 - (asset.decimals ?? 0))) ?? '0'
              )
            )

            const totalSupplyUsd = totalSupply * Number(price)

            const walletBalance = hasAccount ?
              (asset.id === SupportedAssets.ETH || asset.id === SupportedAssets.MATIC) ?
                Number(formatEther(native ?? '0')) :
                Number(
                  formatEther(
                    ethers.BigNumber.from(asset.walletBalance ?? '0').mul(
                      TEN.pow(18 - (asset.decimals ?? 0))
                    )
                  )
                ) : 0

            // this is the total supply, the conversion to USD is at the bottom
            const formattedLiquidity = !canBorrow ? 0 : Number(
              formatEther(
                ethers.BigNumber.from(asset?.compoundV3Data[chainId][baseAsset].reserveData?.reserves ?? '0')
                  .sub(
                    ethers.BigNumber.from(asset.compoundV3Data[chainId][baseAsset].reserveData?.totalBorrow ?? '0')
                  )
                  .mul(TEN.pow(18 - (asset?.decimals ?? 0))) ?? '0'
              )
            )

            const collateralFactor = Number(formatEther(asset.compoundV3Data[chainId][baseAsset].reserveData.liquidateCollateralFactor ?? '0'))
            collateral += userBalanceUsd * collateralFactor
            assetData.push(
              {
                collateralFactor,
                apr,
                borrowAprStable: 0,
                borrowApr,
                totalSupply,
                totalSupplyUsd,
                price,
                assetId: asset.id,
                userBalanceUsd,
                userBalance,
                userBorrow,
                userBorrowUsd,
                userBorrowStable: 0,
                userBorrowStableUsd: 0,
                hasPosition: hasAccount && userBalance > 0,
                walletBalance,
                liquidity: formattedLiquidity,
                liquidityUsd: formattedLiquidity * price,
                hasStable: false,
                borrowEnabled: asset.id === baseAsset,
                hasBorrowPosition: userBorrow > 0,
                collateralEnabled: true
              }
            )

            if (asset.id === baseAsset)
              baseMarketData.push({
                collateralFactor,
                borrowApr,
                price,
                assetId: asset.id,
                userBorrow,
                userBorrowUsd,
                hasPosition: hasAccount && userBalance > 0,
                walletBalance,
                liquidity: formattedLiquidity,
                liquidityUsd: formattedLiquidity * price,
                hasBorrowPosition: userBorrow > 0,
                assetsInMarket: COMET_MARKET_MAPPING[chainId][asset.id]
              })

          }
        }

        return {
          aprData: {
            apr: (depositInterest - borrowInterest) / (deposits - debt),
            borrowApr: borrowInterest / debt,
            depositApr: depositInterest / deposits
          },
          assetData,
          balanceData: {
            collateral,
            deposits,
            debt,
            nav: deposits - debt
          },
          baseMarketData
        }
      }

      default: return defaultAnswer
    }
  },
    [assets, lender, account, chainId, selectedAccount]
  )

}