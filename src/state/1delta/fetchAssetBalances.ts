import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import multicall, { Call } from 'utils/multicall'
import ERC20 from 'abis/erc20.json'
import { LendingProtocol } from './actions'
import { getTokenAddresses } from 'hooks/1delta/addressGetter'



export interface UserBalanceResponse {
  balances: { [asset: string]: string }
  chainId: number
}

export interface UserBalanceQuery {
  chainId: number
  account: string
  lendingProtocol: LendingProtocol
}

export const fetchUserBalances: AsyncThunk<
  UserBalanceResponse,
  UserBalanceQuery,
  any
> = createAsyncThunk<UserBalanceResponse, UserBalanceQuery>(
  '1delta/fetchBalances',

  async ({ chainId, account, lendingProtocol }) => {
    if (!account) return {
      balances: {},
      chainId
    }
    const tokenAddresses = getTokenAddresses(chainId, lendingProtocol)
    const names = Object.keys(tokenAddresses)
    const calls: Call[] = names.map((tk) => {
      return {
        address: tokenAddresses[tk],
        name: 'balanceOf',
        params: [account],
      }

    })
    try {
      const multicallResult: any[] = await multicall(chainId, ERC20, calls)
      const result: any = Object.assign(
        {},
        ...multicallResult.map((entry: any, index) => {
          return {
            [names[index]]: entry.toString(),
          }
        })
      )
      return {
        balances: result,
        chainId
      }
    } catch (error) {
      console.log(error)
      return {
        balances: {},
        chainId
      }
    }
  }
)
