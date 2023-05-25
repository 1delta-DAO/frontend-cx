import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getCometContract,
  getCometLensContract,
} from 'hooks/1delta/use1DeltaContract'
import { SerializedBigNumber, SupportedAssets } from 'types/1delta'
import { Call, multicallSecondary } from 'utils/multicall'
import LENS_ABI from 'abis/compound-v3/CometLens.json'

import { getCompoundV3TokenAddresses } from 'hooks/1delta/addressGetter'
import { SupportedChainId } from 'constants/chains'

export interface CompoundV3PublicResponse {
  data: {
    [tokenSymbol: string]: {
      [asset: string]: {
        offset: string;
        asset: string;
        priceFeed: string;
        scale: SerializedBigNumber;
        borrowCollateralFactor: SerializedBigNumber;
        liquidateCollateralFactor: SerializedBigNumber;
        liquidationFactor: SerializedBigNumber;
        supplyCap: SerializedBigNumber;
        // additional
        isBase: boolean;
        price: SerializedBigNumber;
        reserves: SerializedBigNumber;
        // base only
        borrowRate: SerializedBigNumber;
        supplyRate: SerializedBigNumber;
        utilization: SerializedBigNumber;
      }
    }
  },
  chainId: number
}

export interface CompoundV3PublicQueryParams {
  chainId: number
}

export const fetchCometReserveDataAsync: AsyncThunk<CompoundV3PublicResponse, CompoundV3PublicQueryParams, any> =
  createAsyncThunk<CompoundV3PublicResponse, CompoundV3PublicQueryParams>(
    '1delta/fetchCometReserveDataAsync',

    async ({ chainId }) => {
      if (chainId !== SupportedChainId.POLYGON_MUMBAI) return {
        chainId,
        data: {}
      }

      const rawAddressDict = getCompoundV3TokenAddresses(chainId)
      const lensContract = getCometLensContract(chainId)
      const cometContract = getCometContract(chainId, SupportedAssets.USDC)
      const tokens = Object.values(rawAddressDict)
      const names = Object.keys(rawAddressDict)
      const calls: Call[] = tokens.map((tk) => {
        return {
          address: lensContract.address,
          name: 'getAssetData',
          params: [tk, cometContract.address],
        }
      })


      const multicallResult = await multicallSecondary(chainId, LENS_ABI, calls)

      const result = Object.assign(
        {},
        ...multicallResult.map((entry, index) => {
          return {
            [names[index]]: {
              [SupportedAssets.USDC]: {
                offset: Number(entry[0].offset),
                asset: entry[0].asset,
                priceFeed: entry[0].priceFeed,
                scale: entry[0].scale.toString(),
                borrowCollateralFactor: entry[0].borrowCollateralFactor.toString(),
                liquidateCollateralFactor: entry[0].liquidateCollateralFactor.toString(),
                liquidationFactor: entry[0].liquidationFactor.toString(),
                supplyCap: entry[0].supplyCap.toString(),
                // additional
                isBase: entry[0].isBase,
                price: entry[0].price.toString(),
                reserves: entry[0].reserves.toString(),
                // base only
                borrowRate: entry[0].borrowRate.toString(),
                supplyRate: entry[0].supplyRate.toString(),
                utilization: entry[0].utilization.toString(),
                totalSupplyAsset: entry[0].totalSupplyAsset.toString(),
                totalBorrow: entry[0].totalBorrow.toString(),
              },
            }
          }
        })
      )

      return { data: result, chainId }
    }
  )
