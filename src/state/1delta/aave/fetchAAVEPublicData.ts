import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import { getAddressesForChainIdFromAssetDict } from 'hooks/1delta/addresses'
import {
  getAavePoolContract,
  getAavePoolDataProviderContract,
} from 'hooks/1delta/use1DeltaContract'
import { SerializedBigNumber, SerializedNumber, SupportedAssets } from 'types/1delta'
import multicall, { Call, multicallSecondary } from 'utils/multicall'
import POOL_ABI from 'abis/aave/AAVEPoolV3.json'
import AAVE_POOL_DATA_PROVIDER_ABI from 'abis/aave/AAVEProtocolDataProvider.json'
import { ethers } from 'ethers'
import { getAAVETokenAddresses } from 'hooks/1delta/addressGetter'
import {
  addressesAaveATokens
} from 'hooks/1delta/addressesAave'

export interface AAVEPoolV3PublicResponse {
  data: {
    [tokenSymbol: string]: {
      currentStableBorrowRate: SerializedNumber
      currentLiquidityRate: SerializedNumber
      currentVariableBorrowRate: SerializedNumber
      aTokenAddress: string
      stableDebtTokenAddress: string
      variableDebtTokenAddress: string
      interestRateStrategyAddress: string
    }
  }
}

export interface AAVEPoolV3PublicQueryParams {
  chainId: number
}

export const fetchAAVEPublicDataAsync: AsyncThunk<AAVEPoolV3PublicResponse, AAVEPoolV3PublicQueryParams, any> =
  createAsyncThunk<AAVEPoolV3PublicResponse, AAVEPoolV3PublicQueryParams>(
    '1delta/fetchAAVEPublicDataAsync',

    async ({ chainId }) => {
      const rawAddressDict = getAAVETokenAddresses(chainId)
      const poolContract = getAavePoolContract(chainId)
      const tokens = Object.values(rawAddressDict)
      const names = Object.keys(rawAddressDict)
      const calls: Call[] = tokens.map((tk) => {
        return {
          address: poolContract.address,
          name: 'getReserveData',
          params: [tk],
        }
      })

      const multicallResult = await multicallSecondary(chainId, POOL_ABI, calls)

      const result = Object.assign(
        {},
        ...multicallResult.map((entry, index) => {
          return {
            [names[index]]: {
              underlyingAddress: tokens[index],
              currentStableBorrowRate: ethers.utils.formatEther(entry[0].currentStableBorrowRate ?? '0'),
              currentLiquidityRate: ethers.utils.formatEther(entry[0].currentLiquidityRate ?? '0'),
              currentVariableBorrowRate: ethers.utils.formatEther(entry[0].currentVariableBorrowRate ?? '0'),
              stableDebtTokenAddress: entry[0]?.stableDebtTokenAddress,
              variableDebtTokenAddress: entry[0]?.variableDebtTokenAddress,
              interestRateStrategyAddress: entry[0]?.interestRateStrategyAddress,
              aTokenAddress: entry[0]?.aTokenAddress,
            },
          }
        })
      )

      return { data: result }
    }
  )

export interface AAVEPoolV3ReserveResponse {
  data: {
    [tokenSymbol: string]: {
      // reserves
      unbacked: SerializedBigNumber
      accruedToTreasuryScaled: SerializedBigNumber
      totalAToken: SerializedBigNumber
      totalStableDebt: SerializedBigNumber
      totalVariableDebt: SerializedBigNumber
      liquidityRate: SerializedBigNumber
      variableBorrowRate: SerializedBigNumber
      stableBorrowRate: SerializedBigNumber
      averageStableBorrowRate: SerializedBigNumber
      liquidityIndex: SerializedBigNumber
      variableBorrowIndex: SerializedBigNumber
      lastUpdateTimestamp: number
    }
  }
  config: {
    [tokenSymbol: string]: {
      // reserve config
      decimals?: number
      ltv?: SerializedBigNumber
      liquidationThreshold?: SerializedBigNumber
      liquidationBonus?: SerializedBigNumber
      reserveFactor?: SerializedBigNumber
      usageAsCollateralEnabled?: boolean
      borrowingEnabled?: boolean
      stableBorrowRateEnabled?: boolean
      isActive?: boolean
      isFrozen?: boolean
    }
  }
  chainId: number
}

export interface AAVEPoolV3ReservesQueryParams {
  chainId: number
  assetsToQuery: SupportedAssets[]
}

export const fetchAAVEReserveDataAsync: AsyncThunk<AAVEPoolV3ReserveResponse, AAVEPoolV3ReservesQueryParams, any> =
  createAsyncThunk<AAVEPoolV3ReserveResponse, AAVEPoolV3ReservesQueryParams>(
    '1delta/fetchAAVEReserveDataAsync',

    async ({ chainId, assetsToQuery }) => {
      const providerContract = getAavePoolDataProviderContract(chainId)
      const tokenDict = getAAVETokenAddresses(chainId)

      const assets = assetsToQuery.map((a) => tokenDict[a])

      const names = Object.keys(tokenDict)

      const calls: Call[] = assets.map((tk) => {
        return {
          address: providerContract.address,
          name: 'getReserveData',
          params: [tk],
        }

      })

      const aTokenNames = Object.keys(getAddressesForChainIdFromAssetDict(addressesAaveATokens, chainId))
      const callsConfig: Call[] = assets.map((tk) => {
        return {
          address: providerContract.address,
          name: 'getReserveConfigurationData',
          params: [tk],
        }

      })

      let multicallResult: any[]
      try {
        multicallResult = await multicall(chainId, AAVE_POOL_DATA_PROVIDER_ABI, [...calls, ...callsConfig])
      } catch (err) {
        console.log('error', err)
        multicallResult = []
      }
      const multicallResultReserves = multicallResult.slice(0, calls.length)
      const resultReserves: any = Object.assign(
        {},
        ...multicallResultReserves.map((entry: any, index) => {
          return {
            [names[index]]: {
              unbacked: entry?.unbacked.toString(),
              accruedToTreasuryScaled: entry?.accruedToTreasuryScaled.toString(),
              totalAToken: entry?.totalAToken.toString(),
              totalStableDebt: entry?.totalStableDebt.toString(),
              totalVariableDebt: entry?.totalVariableDebt.toString(),
              liquidityRate: entry?.liquidityRate.toString(),
              variableBorrowRate: entry?.variableBorrowRate.toString(),
              stableBorrowRate: entry?.stableBorrowRate.toString(),
              averageStableBorrowRate: entry?.averageStableBorrowRate.toString(),
              liquidityIndex: entry?.liquidityIndex.toString(),
              variableBorrowIndex: entry?.variableBorrowIndex.toString(),
              lastUpdateTimestamp: entry?.lastUpdateTimestamp,
            },
          }
        })
      )

      const multicallResultConfig = multicallResult.slice(calls.length, multicallResult.length)
      const resultConfig: any = Object.assign(
        {},
        ...multicallResultConfig.map((entry: any, index) => {
          return {
            [aTokenNames[index]]: {
              decimals: Number(entry?.decimals),
              ltv: entry?.ltv.toString(),
              liquidationThreshold: entry?.liquidationThreshold.toString(),
              liquidationBonus: entry?.liquidationBonus.toString(),
              reserveFactor: entry?.reserveFactor.toString(),
              usageAsCollateralEnabled: entry?.usageAsCollateralEnabled,
              borrowingEnabled: entry?.borrowingEnabled,
              stableBorrowRateEnabled: entry?.stableBorrowRateEnabled,
              isActive: entry?.isActive,
              isFrozen: entry?.isFrozen,
            },
          }
        })
      )
      return {
        data: resultReserves,
        config: resultConfig,
        chainId,
      }
    }
  )

export interface AAVEPoolV3ReserveConfigResponse {
  data: {
    [tokenSymbol: string]: {
      // reserve config
      decimals?: number
      ltv?: SerializedBigNumber
      liquidationThreshold?: SerializedBigNumber
      liquidationBonus?: SerializedBigNumber
      reserveFactor?: SerializedBigNumber
      usageAsCollateralEnabled?: boolean
      borrowingEnabled?: boolean
      stableBorrowRateEnabled?: boolean
      isActive?: boolean
      isFrozen?: boolean
    }
  }
  chainId: number
}

export interface AAVEPoolV3ReserveConfigsQueryParams {
  chainId: number
  assetsToQuery: SupportedAssets[]
}

export const fetchAAVEReserveConfigDataAsync: AsyncThunk<
  AAVEPoolV3ReserveConfigResponse,
  AAVEPoolV3ReserveConfigsQueryParams,
  any
> = createAsyncThunk<AAVEPoolV3ReserveConfigResponse, AAVEPoolV3ReserveConfigsQueryParams>(
  '1delta/fetchAAVEReserveConfigDataAsync',

  async ({ chainId, assetsToQuery }) => {
    const providerContract = getAavePoolDataProviderContract(chainId)
    const assets = assetsToQuery.map((a) => getAAVETokenAddresses(chainId)[a])

    const names = Object.keys(getAddressesForChainIdFromAssetDict(addressesAaveATokens, chainId))
    const calls: Call[] = assets.map((tk) => {
      return {
        address: providerContract.address,
        name: 'getReserveConfigurationData',
        params: [tk],
      }
    })
    const multicallResult: any[] = await multicall(chainId, AAVE_POOL_DATA_PROVIDER_ABI, calls)

    const result: any = Object.assign(
      {},
      ...multicallResult.map((entry: any, index) => {
        return {
          [names[index]]: {
            decimals: Number(entry?.decimals),
            ltv: entry?.ltv.toString(),
            liquidationThreshold: entry?.liquidationThreshold.toString(),
            liquidationBonus: entry?.liquidationBonus.toString(),
            reserveFactor: entry?.reserveFactor.toString(),
            usageAsCollateralEnabled: entry?.usageAsCollateralEnabled,
            borrowingEnabled: entry?.borrowingEnabled,
            stableBorrowRateEnabled: entry?.stableBorrowRateEnabled,
            isActive: entry?.isActive,
            isFrozen: entry?.isFrozen,
          },
        }
      })
    )
    return {
      data: result,
      chainId,
    }
  }
)
