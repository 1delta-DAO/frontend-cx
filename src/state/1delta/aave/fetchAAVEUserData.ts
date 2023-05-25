import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import { getAAVETokenAddresses } from 'hooks/1delta/addressGetter'
import { getAavePoolContract, getAavePoolDataProviderContract } from 'hooks/1delta/use1DeltaContract'
import { SerializedBigNumber, SupportedAssets } from 'types/1delta'
import multicall, { Call, multicallSecondary } from 'utils/multicall'
import AAVE_POOL_AND_DATA_PROVIDER_ABI from 'abis/aave/AAVEPoolAndDataProvider.json'

export interface AAVEPoolV3UserResponse {
  chainId: number
  totals: {
    totalCollateralBase: SerializedBigNumber
    totalDebtBase: SerializedBigNumber
    availableBorrowsBase: SerializedBigNumber
    currentLiquidationThreshold: SerializedBigNumber
    ltv: SerializedBigNumber
    healthFactor: SerializedBigNumber
    data: SerializedBigNumber
  }
  data: {
    [tokenSymbol: string]: {
      supplyBalance?: SerializedBigNumber
      borrowBalanceStable?: SerializedBigNumber
      borrowBalanceVariable?: SerializedBigNumber
    }
  }
}

export interface AAVEPoolV3UserQueryParams {
  chainId: number
  account: string
}

export interface AAVEPoolV3UserReserveResponse {
  chainId: number
  data: {
    [tokenSymbol: string]: {
      currentATokenBalance: SerializedBigNumber
      currentStableDebt: SerializedBigNumber
      currentVariableDebt: SerializedBigNumber
      principalStableDebt: SerializedBigNumber
      scaledVariableDebt: SerializedBigNumber
      stableBorrowRate: SerializedBigNumber
      liquidityRate: SerializedBigNumber
      stableRateLastUpdated: number
      usageAsCollateralEnabled: boolean
    }
  }
  totals: {
    totalCollateralBase: SerializedBigNumber
    totalDebtBase: SerializedBigNumber
    availableBorrowsBase: SerializedBigNumber
    currentLiquidationThreshold: SerializedBigNumber
    ltv: SerializedBigNumber
    healthFactor: SerializedBigNumber
    data: SerializedBigNumber
  }
}

export interface AAVEPoolV3UserReservesQueryParams {
  chainId: number
  account: string
  assetsToQuery: SupportedAssets[]
}

export const fetchAAVEUserReserveDataAsync: AsyncThunk<
  AAVEPoolV3UserReserveResponse,
  AAVEPoolV3UserReservesQueryParams,
  any
> = createAsyncThunk<AAVEPoolV3UserReserveResponse, AAVEPoolV3UserReservesQueryParams>(
  '1delta/fetchAAVEUserReserveDataAsync',

  async ({ chainId, account, assetsToQuery }) => {
    const providerContract = getAavePoolDataProviderContract(chainId)
    const poolContract = getAavePoolContract(chainId)
    const aaveAddresses = getAAVETokenAddresses(chainId)
    const assets = assetsToQuery.map((a) => aaveAddresses[a])
    const names = assetsToQuery
    const calls: Call[] = assets.map((tk) => {
      return {
        address: providerContract.address,
        name: 'getUserReserveData',
        params: [tk, account],
      }

    })

    const callConfig = {
      address: poolContract.address,
      name: 'getUserConfiguration',
      params: [account],
    }

    const callData = {
      address: poolContract.address,
      name: 'getUserAccountData',
      params: [account],
    }

    const multicallResult: any[] = await multicallSecondary(chainId, AAVE_POOL_AND_DATA_PROVIDER_ABI, [...calls, callData, callConfig])
    const length = multicallResult.length
    const result: any = Object.assign(
      {},
      ...multicallResult.slice(0, length - 2).map((entry: any, index) => {
        return {
          [names[index]]: {
            currentATokenBalance: entry?.currentATokenBalance.toString(),
            currentStableDebt: entry?.currentStableDebt.toString(),
            currentVariableDebt: entry?.currentVariableDebt.toString(),
            principalStableDebt: entry?.principalStableDebt.toString(),
            scaledVariableDebt: entry?.scaledVariableDebt.toString(),
            stableBorrowRate: entry?.stableBorrowRate.toString(),
            liquidityRate: entry?.liquidityRate.toString(),
            stableRateLastUpdated: entry?.stableRateLastUpdated,
            usageAsCollateralEnabled: entry?.usageAsCollateralEnabled,
          },
        }
      })
    )
    const resultConfig = multicallResult[length - 1]
    const resultData = multicallResult[length - 2]

    return {
      chainId,
      data: result,
      totals: {
        totalCollateralBase: resultData?.totalCollateralBase.toString(),
        totalDebtBase: resultData?.totalDebtBase.toString(),
        availableBorrowsBase: resultData?.availableBorrowsBase.toString(),
        currentLiquidationThreshold: resultData?.currentLiquidationThreshold.toString(),
        ltv: resultData?.ltv.toString(),
        healthFactor: resultData?.healthFactor.toString(),
        data: resultConfig[0]?.data.toHexString(),
      },
    }
  }
)
