import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import { getSupportedAssets } from 'constants/1delta'
import { SupportedChainId } from 'constants/chains'
import { getOVixOTokens } from 'hooks/1delta/addresses0Vix'
import { getCompoundCTokens } from 'hooks/1delta/addressesCompound'
import { getCompoundLensContract } from 'hooks/1delta/use1DeltaContract'
import { SerializedBigNumber } from 'types/1delta'
import multicall, { Call, multicallSecondary } from 'utils/multicall'
import COMPOUND_LENS_ABI from 'abis/compound-v2/CompoundLens.json'
import OVIX_LENS_ABI from 'abis/compound-v2/OVixLens.json'
import { LendingProtocol } from '../actions'

export interface CompoundPublicResponse {
  chainId: number
  data: {
    [tokenSymbol: string]: {
      exchangeRateCurrent: SerializedBigNumber
      // for compound these are rates per block, for ovix they are rates per ms
      supplyRatePerBlock: SerializedBigNumber
      borrowRatePerBlock: SerializedBigNumber
      reserveFactorMantissa: SerializedBigNumber
      totalBorrows: SerializedBigNumber
      totalReserves: SerializedBigNumber
      totalSupply: SerializedBigNumber
      totalCash: SerializedBigNumber
      isListed: boolean
      collateralFactorMantissa: SerializedBigNumber
      underlyingAssetAddress: string
      cTokenDecimals: SerializedBigNumber
      underlyingDecimals: SerializedBigNumber
      compSupplySpeed: SerializedBigNumber
      compBorrowSpeed: SerializedBigNumber
      borrowCap: SerializedBigNumber
    }
  }
}

export interface CompoundPublicQueryParams {
  chainId: number
}

export const fetchCompoundPublicDataAsync: AsyncThunk<CompoundPublicResponse, CompoundPublicQueryParams, any> =
  createAsyncThunk<CompoundPublicResponse, CompoundPublicQueryParams>(
    '1delta/fetchCompoundPublicDataAsync',

    async ({ chainId }) => {
      const isEthereum = chainId === SupportedChainId.MAINNET || chainId === SupportedChainId.GOERLI
      const rawAddressDict = isEthereum
        ? getCompoundCTokens(chainId, getSupportedAssets(chainId, LendingProtocol.COMPOUND))
        : getOVixOTokens(chainId, getSupportedAssets(chainId, LendingProtocol.COMPOUND))
      const lensContract = getCompoundLensContract(chainId)
      const tokens = Object.values(rawAddressDict)
      const names = Object.keys(rawAddressDict)

      const calls: Call[] = tokens.map((tk) => {
        return {
          address: lensContract.address,
          name: 'cTokenMetadata',
          params: [tk],
        }
      })
      const multicallResult = await multicallSecondary(chainId, isEthereum ? COMPOUND_LENS_ABI : OVIX_LENS_ABI, calls)

      const result = Object.assign(
        {},
        ...multicallResult.map((entry, index) => {
          return {
            [names[index]]: {
              exchangeRateCurrent: entry[0]?.exchangeRateCurrent.toString(),
              supplyRatePerBlock: entry[0]?.supplyRatePerBlock.toString(),
              borrowRatePerBlock: entry[0]?.borrowRatePerBlock.toString(),
              reserveFactorMantissa: entry[0]?.reserveFactorMantissa.toString(),
              totalBorrows: entry[0]?.totalBorrows.toString(),
              totalReserves: entry[0]?.totalReserves.toString(),
              totalSupply: entry[0]?.totalSupply.toString(),
              totalCash: entry[0]?.totalCash.toString(),
              isListed: entry[0]?.isListed,
              collateralFactorMantissa: entry[0]?.collateralFactorMantissa.toString(),
              underlyingAssetAddress: entry[0]?.underlyingAssetAddress,
              cTokenDecimals: entry[0]?.cTokenDecimals.toString(),
              underlyingDecimals: entry[0]?.underlyingDecimals.toString(),
              compSupplySpeed: entry[0]?.compSupplySpeed.toString(),
              compBorrowSpeed: entry[0]?.compBorrowSpeed.toString(),
              borrowCap: entry[0]?.borrowCap.toString(),
            },
          }
        })
      )
      return { data: result, chainId }
    }
  )
