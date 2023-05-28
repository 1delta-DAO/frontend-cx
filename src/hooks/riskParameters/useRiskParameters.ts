import { AAVE_PRICE_PRECISION, BPS_BN, getSupportedAssets, LTV_PRECISION, ONE_18, TEN, TOKEN_META, ZERO_BN } from "constants/1delta"
import { BigNumber, ethers } from "ethers"
import { MappedSwapAmounts } from "pages/Trading/components/MarketTable"
import { useMemo } from "react"
import { LendingProtocol } from "state/1delta/actions"
import { useAppSelector } from "state/hooks"
import { usePriceParams } from "state/oracles/hooks"
import { AaveInterestMode, Asset, MarginTradeType, PositionSides, SupportedAssets } from "types/1delta"
import { UniswapTrade } from "utils/Types"
import { LtvAssetParams, LtvParams, TradeImpact } from "./types"
import { calculateAaveRiskChange } from "./useAaveParameters"
import { calculateCompoundRiskChange } from "./useCompoundParameters"


// see https://docs.aave.com/risk/asset-risk/risk-parameters
export function useGetRiskParameters(
  chainId: number,
  protocol: LendingProtocol,
  account?: string,
  baseAsset?: SupportedAssets
): LtvParams | undefined {
  const assets = getSupportedAssets(chainId, protocol)
  const assetData = useAppSelector((state) => state.delta.assets)
  const prices = usePriceParams(chainId, assets, protocol)

  let totalCollateral = ZERO_BN
  let totalRawCollateral = ZERO_BN
  let totalDebt = ZERO_BN

  const assetRiskData: { [key: string]: LtvAssetParams } = {}
  return useMemo(() => {
    // return nothing if not connected
    if (!account) return undefined
    switch (protocol) {
      case LendingProtocol.AAVE: {
        // we iterate through all assets and calculate collateral, debt and record process and liquidation thresholds
        for (let i = 0; i < assets.length; i++) {
          const name = assets[i] as SupportedAssets
          const price = prices[name].price

          // we we normalize everything to 18 decimals
          const multiplier = TEN.pow(18 - TOKEN_META[name].decimals)

          // the price has a provided precision
          const amountCollateral = price
            .mul(BigNumber.from(assetData[name]?.aaveData[chainId].userData?.currentATokenBalance ?? '0'))
            .mul(multiplier)
            .div(AAVE_PRICE_PRECISION)

          // threshold is a basis point value 100% = 10k
          const liquidationThreshold = assetData[name]?.aaveData[chainId].reserveData?.liquidationThreshold ?? '10000'

          // add adjusted collateral
          totalCollateral = totalCollateral.add(amountCollateral.mul(liquidationThreshold).div(BPS_BN))
          totalRawCollateral = totalRawCollateral.add(amountCollateral)

          // records debt for this specific asset
          let amountDebt = ZERO_BN
          const amountDebtStable = BigNumber.from(
            assetData[name]?.aaveData[chainId].userData?.currentStableDebt ?? '0'
          )
          const amountDebtVariable = BigNumber.from(
            assetData[name]?.aaveData[chainId].userData?.currentVariableDebt ?? '0'
          )

          // add debts if existing (for aave, at max one can be nonzero)
          if (amountDebtStable.gt(0))
            amountDebt = amountDebt.add(amountDebtStable.mul(price).mul(multiplier).div(AAVE_PRICE_PRECISION))
          if (amountDebtVariable.gt(0))
            amountDebt = amountDebt.add(amountDebtVariable.mul(price).mul(multiplier).div(AAVE_PRICE_PRECISION))

          // add the asset-specific debt in usd to the total debt
          totalDebt = totalDebt.add(amountDebt)

          assetRiskData[name] = {
            priceParams: {
              price,
              decimals: 8 // decimals are always 8 for aave prices
            },
            liquidationThreshold: BigNumber.from(liquidationThreshold),
            collateral: amountCollateral,
            debt: amountDebt,
          }
        }

        return {
          assetData: assetRiskData,
          collateral: totalCollateral,
          rawCollateral: totalRawCollateral,
          debt: totalDebt,
          currentLtv: totalCollateral.gt(0) ? totalDebt.mul(LTV_PRECISION).div(totalCollateral) : ZERO_BN,
          healthFactor: totalDebt.gt(0) ? totalCollateral.mul(LTV_PRECISION).div(totalDebt) : ethers.constants.MaxUint256,
        }
      }
      case LendingProtocol.COMPOUND: {
        // we iterate through all assets and calculate collateral, debt and record process and liquidation thresholds
        for (let i = 0; i < assets.length; i++) {
          const name = assets[i]
          const priceParams = prices[name]
          // we we normalize everything to 18 decimals, also the price
          const multiplier = TEN.pow(18 - TOKEN_META[name].decimals)
          const multiplierPrice = TEN.pow(18 - priceParams.decimals)

          // get balance
          const cTokenBal = BigNumber.from(
            assetData[name]?.compoundData[chainId].userData[account ?? '']?.balanceOf ?? '0'
          )
          const underlyingDeposited = cTokenBal
            .mul(assetData[name]?.compoundData[chainId].reserveData.exchangeRateCurrent ?? '0')
            .div(ONE_18)
            .mul(multiplier)

          // the price has a provided precision
          const amountCollateral = priceParams.price.mul(underlyingDeposited).mul(multiplierPrice).div(ONE_18)

          // threshold is a basis point value 100% = 1e18
          const liquidationThreshold =
            assetData[name]?.compoundData[chainId].reserveData?.collateralFactorMantissa ?? ONE_18

          // add adjusted collateral
          totalCollateral = totalCollateral.add(amountCollateral.mul(liquidationThreshold).div(ONE_18))
          totalRawCollateral = totalRawCollateral.add(amountCollateral)

          // records debt for this specific asset
          let amountDebt = BigNumber.from(
            assetData[name]?.compoundData[chainId].userData[account ?? '']?.borrowBalanceCurrent ?? '0'
          )

          // add debts if existing (for aave, at max one can be nonzero)
          amountDebt = amountDebt.mul(priceParams.price).mul(multiplier).mul(multiplierPrice).div(ONE_18)

          // add the asset-specific debt in usd to the total debt
          totalDebt = totalDebt.add(amountDebt)

          assetRiskData[name] = {
            priceParams,
            liquidationThreshold: BigNumber.from(liquidationThreshold),
            collateral: amountCollateral,
            debt: amountDebt,
          }
        }

        return {
          assetData: assetRiskData,
          collateral: totalCollateral,
          rawCollateral: totalRawCollateral,
          debt: totalDebt,
          currentLtv: totalCollateral.gt(0) ? totalDebt.mul(ONE_18).div(totalCollateral) : ZERO_BN,
          healthFactor: totalDebt.gt(0)
            ? totalCollateral.mul(ONE_18).div(totalDebt)
            : ethers.constants.MaxUint256
        }
      }
      case LendingProtocol.COMPOUNDV3: {
        const baseAssetKey = String(baseAsset)
        // we iterate through all assets and calculate collateral, debt and record process and liquidation thresholds
        for (let i = 0; i < assets.length; i++) {
          const name = assets[i]
          const priceParams = prices[name]
          // we we normalize everything to 18 decimals, also the price
          const multiplier = TEN.pow(18 - TOKEN_META[name].decimals)
          const multiplierPrice = TEN.pow(18 - priceParams.decimals)

          // get balance
          const underlyingDeposited = BigNumber.from(
            assetData[name]?.compoundV3Data[chainId][baseAssetKey].userData.balance ?? '0')
            .mul(multiplier)

          // the price has a provided precision
          const amountCollateral = priceParams.price.mul(underlyingDeposited).mul(multiplierPrice).div(ONE_18)

          // threshold is a basis point value 100% = 1e18
          const liquidationThreshold =
            assetData[name]?.compoundV3Data[chainId][baseAssetKey].reserveData?.liquidateCollateralFactor ?? ONE_18

          // add adjusted collateral
          totalCollateral = totalCollateral.add(amountCollateral.mul(liquidationThreshold).div(ONE_18))
          totalRawCollateral = totalRawCollateral.add(amountCollateral)

          // records debt for this specific asset
          let amountDebt = BigNumber.from(
            assetData[name]?.compoundV3Data[chainId][baseAssetKey].userData.borrowBalance ?? '0'
          )

          // add debts if existing (for aave, at max one can be nonzero)
          amountDebt = amountDebt.mul(priceParams.price).mul(multiplier).mul(multiplierPrice).div(ONE_18)

          // add the asset-specific debt in usd to the total debt
          totalDebt = totalDebt.add(amountDebt)

          assetRiskData[name] = {
            priceParams,
            liquidationThreshold: BigNumber.from(liquidationThreshold),
            collateral: amountCollateral,
            debt: amountDebt,
          }
        }

        return {
          assetData: assetRiskData,
          collateral: totalCollateral,
          rawCollateral: totalRawCollateral,
          debt: totalDebt,
          currentLtv: totalCollateral.gt(0) ? totalDebt.mul(ONE_18).div(totalCollateral) : ZERO_BN,
          healthFactor: totalDebt.gt(0)
            ? totalCollateral.mul(ONE_18).div(totalDebt)
            : totalCollateral.gt(0)
              ? ethers.constants.MaxUint256
              : ZERO_BN,
        }
      }
    }
  }, [
    assets,
    assetData,
    prices
  ]
  )
}



export const useRiskChange = (
  assetIn: Asset,
  assetOut: Asset,
  lendingProtocol: LendingProtocol,
  riskParameters: LtvParams | undefined,
  marginTradeType: MarginTradeType,
  trade: UniswapTrade | undefined,
  sourceBorrowInterestMode: AaveInterestMode,
  targetBorrowInterestMode: AaveInterestMode
): {
  riskChange: TradeImpact,
  tradeImpact: MappedSwapAmounts
} => {

  return useMemo(() => {
    if (!riskParameters) return {
      tradeImpact: {
        [assetIn.id]: { amount: 0, type: AaveInterestMode.NONE },
        [assetOut.id]: { amount: 0, type: AaveInterestMode.NONE }
      },
      riskChange: {
        ltv: ZERO_BN,
        ltvNew: ZERO_BN,
        ltvDelta: ZERO_BN,
        healthFactor: ZERO_BN,
        healthFactorNew: ZERO_BN,
        healthFactorDelta: ZERO_BN,
        marginImpact: ZERO_BN,
        deltaBorrow: ZERO_BN,
        deltaCollateral: ZERO_BN
      }
    }
    let [deltaIn, deltaOut] = ['0', '0']
    let [posSideIn, posSideOut] = [PositionSides.Borrow, PositionSides.Collateral]
    const tradeImpact = {
      [assetIn.id]: { amount: 0, type: AaveInterestMode.NONE },
      [assetOut.id]: { amount: 0, type: AaveInterestMode.NONE }
    }
    if (trade)
      switch (marginTradeType) {
        case MarginTradeType.Open: {
          [deltaOut, deltaIn] = [trade?.outputAmount.quotient.toString() ?? '0', trade?.inputAmount?.quotient.toString() ?? '0']
          posSideIn = PositionSides.Borrow
          posSideOut = PositionSides.Collateral
          tradeImpact[assetIn.id].amount = Number(trade?.inputAmount?.toExact())
          tradeImpact[assetOut.id].amount = Number(trade?.outputAmount?.toExact())
          tradeImpact[assetIn.id].type = sourceBorrowInterestMode
          break;
        }
        case MarginTradeType.Trim: {
          [deltaOut, deltaIn] = [
            BigNumber.from(trade?.outputAmount.quotient.toString() ?? '0').mul(-1).toString(),
            BigNumber.from(trade?.inputAmount?.quotient.toString() ?? '0').mul(-1).toString(),
          ]
          posSideIn = PositionSides.Collateral
          posSideOut = PositionSides.Borrow
          tradeImpact[assetIn.id].amount = -Number(trade?.inputAmount?.toExact())
          tradeImpact[assetOut.id].amount = -Number(trade?.outputAmount?.toExact())
          tradeImpact[assetOut.id].type = targetBorrowInterestMode
          break;
        }
        case MarginTradeType.Collateral: {
          [deltaIn, deltaOut] = [
            BigNumber.from(trade?.inputAmount.quotient.toString() ?? '0').mul(-1).toString(),
            trade?.outputAmount?.quotient.toString() ?? '0',
          ]
          posSideIn = PositionSides.Collateral
          posSideOut = PositionSides.Collateral
          tradeImpact[assetIn.id].amount = -Number(trade?.inputAmount?.toExact())
          tradeImpact[assetOut.id].amount = Number(trade?.outputAmount?.toExact())
          break;
        }
        case MarginTradeType.Debt: {
          [deltaIn, deltaOut] = [
            trade?.inputAmount.quotient.toString() ?? '0',
            BigNumber.from(trade?.outputAmount?.quotient.toString() ?? '0').mul(-1).toString(),
          ]
          posSideIn = PositionSides.Borrow
          posSideOut = PositionSides.Borrow

          tradeImpact[assetIn.id].amount = Number(trade?.inputAmount?.toExact())
          tradeImpact[assetOut.id].amount = -Number(trade?.outputAmount?.toExact())
          tradeImpact[assetIn.id].type = sourceBorrowInterestMode
          tradeImpact[assetOut.id].type = targetBorrowInterestMode
          break;
        }
        // collateral in reduces, collateral out increase
      }

    return {
      riskChange: calculateRiskChange(
        assetIn,
        assetOut,
        lendingProtocol,
        riskParameters,
        BigNumber.from(deltaIn),
        BigNumber.from(deltaOut),
        posSideIn,
        posSideOut
      ),
      tradeImpact
    }
  }, [
    riskParameters,
    assetIn,
    assetOut,
    trade,
    sourceBorrowInterestMode,
    targetBorrowInterestMode])
}



export const calculateRiskChange = (
  asset0: Asset,
  asset1: Asset | undefined,
  lendingProtocol: LendingProtocol,
  riskParameters: LtvParams | undefined,
  delta0: BigNumber,
  delta1: BigNumber | undefined,
  posSide0: PositionSides,
  posSide1: PositionSides | undefined
) => {

  switch (lendingProtocol) {
    case LendingProtocol.AAVE:
      return calculateAaveRiskChange(
        { asset: asset0.id, delta: BigNumber.from(delta0), side: posSide0 },
        asset1 && posSide1 && delta1 && { asset: asset1.id, delta: BigNumber.from(delta1), side: posSide1 },
        riskParameters
      )

    case LendingProtocol.COMPOUND:
      return calculateCompoundRiskChange(
        { asset: asset0.id, delta: BigNumber.from(delta0), side: posSide0 },
        asset1 && posSide1 && delta1 && { asset: asset1.id, delta: BigNumber.from(delta1), side: posSide1 },
        riskParameters
      )

    // compound V3 metrics match coumpound V2 here
    case LendingProtocol.COMPOUNDV3:
      return calculateCompoundRiskChange(
        { asset: asset0.id, delta: BigNumber.from(delta0), side: posSide0 },
        asset1 && posSide1 && delta1 && { asset: asset1.id, delta: BigNumber.from(delta1), side: posSide1 },
        riskParameters
      )
  }
}