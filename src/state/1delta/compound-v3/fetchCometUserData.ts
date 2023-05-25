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
import { cometBrokerAddress } from 'hooks/1delta/addresses1Delta'

export interface CompoundV3UserResponse {
  data: {
    [tokenSymbol: string]: {
      [asset: string]: {
        isAllowed: boolean;
        borrowBalance: SerializedBigNumber;
        supplyBalance: SerializedBigNumber;
        principal: SerializedBigNumber;
        baseTrackingIndex: SerializedBigNumber;
        baseTrackingAccrued: SerializedBigNumber;
        assetsIn: SerializedBigNumber;
        // user collateral
        balance: SerializedBigNumber;
      }
    }
  },
  chainId: number
}

export interface CompoundV3UserQueryParams {
  chainId: number
  account: string | undefined
}

export const fetchCometUserDataAsync: AsyncThunk<CompoundV3UserResponse, CompoundV3UserQueryParams, any> =
  createAsyncThunk<CompoundV3UserResponse, CompoundV3UserQueryParams>(
    '1delta/fetchCometUserDataAsync',

    async ({ chainId, account }) => {
      if (chainId !== SupportedChainId.POLYGON_MUMBAI || !account) return {
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
          name: 'getUserData',
          params: [account, tk, cometContract.address, cometBrokerAddress[chainId]],
        }
      })

      const multicallResult = await multicallSecondary(chainId, LENS_ABI, calls)
      const result = Object.assign(
        {},
        ...multicallResult.map((entry, index) => {
          return {
            [names[index]]: {
              [SupportedAssets.USDC]: {
                isAllowed: Boolean(entry[0]?.isAllowed),
                borrowBalance: entry[0]?.borrowBalance.toString(),
                supplyBalance: entry[0]?.supplyBalance.toString(),
                principal: entry[0]?.principal.toString(),
                baseTrackingIndex: entry[0]?.baseTrackingIndex.toString(),
                baseTrackingAccrued: entry[0]?.baseTrackingAccrued.toString(),
                assetsIn: entry[0]?.assetsIn.toString(),
                // user collateral
                balance: entry[0]?.balance.toString(),
              },
            }
          }
        })
      )

      return { data: result, chainId }
    }
  )
