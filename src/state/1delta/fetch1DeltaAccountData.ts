import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import { getAccountFactoryContract } from 'hooks/1delta/use1DeltaContract'
import multicall, { Call, multicallSecondary } from 'utils/multicall'
import DIAMOND_FACTORY_ABI from 'abis/account-based/DiamondFactory.json'

export interface Account1DeltaUserResponse {
  chainId: number
  accounts: {
    [index: number]: {
      accountAddress: string
      accountOwner: string
      accountName: string
      creationTimestamp: number
    }
  }
}

export interface DeltaUserQueryParams {
  chainId: number
  account?: string
}

export const fetch1DeltaUserAccountDataAsync: AsyncThunk<Account1DeltaUserResponse, DeltaUserQueryParams, any> =
  createAsyncThunk<Account1DeltaUserResponse, DeltaUserQueryParams>(
    '1delta/fetch1DeltaUserAccountDataAsync',

    async ({ chainId, account }) => {
      if (!account) return { accounts: {}, chainId: 0 }

      const factoryContract = getAccountFactoryContract(chainId)

      const callData: Call = {
        address: factoryContract.address,
        name: 'getAccountMeta',
        params: [account],
      }

      const resultData: any[] = await multicallSecondary(chainId, DIAMOND_FACTORY_ABI, [callData])

      const result =
        resultData[0].accountMeta.length === 0
          ? {}
          : Object.assign(
            {},
            ...(resultData[0].accountMeta as any[]).map((a, index) => {
              const meta: any = a
              return {
                [index]: {
                  accountAddress: meta?.accountAddress,
                  accountOwner: meta?.accountOwner,
                  accountName: meta?.accountName,
                  creationTimestamp: Number(meta?.creationTimestamp.toString()),
                },
              }
            })
          )
      return { accounts: result, chainId }
    }
  )
