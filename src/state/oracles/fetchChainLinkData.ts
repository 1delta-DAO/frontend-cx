import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import { chainLinkOracles, getChainLinkKeys } from 'hooks/1delta/addresses'
import multicall, { Call, multicallSecondary } from 'utils/multicall'
import CHAIN_LINK_AGGREGATOR_ABI from 'abis/chainlink/ChainLinkAggregator.json'
import { ChainLinkResponse } from './reducer'

export interface ChainLinkAggregatedResponse {
  data: {
    [key: string]: ChainLinkResponse
  }
  chainId: number
}

export interface ChainLinkQueryParams {
  chainId: number
}

export const fetchChainLinkData: AsyncThunk<ChainLinkAggregatedResponse, ChainLinkQueryParams, any> = createAsyncThunk<
  ChainLinkAggregatedResponse,
  ChainLinkQueryParams
>('oracles/fetchChainLinkData', async ({ chainId }) => {
  const keys = getChainLinkKeys(chainId)
  const addresses = keys.map((k) => chainLinkOracles[k][chainId])
  const calls: Call[] = addresses.map((tk) => {
    return {
      address: tk,
      name: 'latestRoundData',
      params: [],
    }
  })

  const multicallResult = await multicallSecondary(chainId, CHAIN_LINK_AGGREGATOR_ABI, calls)

  const result = Object.assign(
    {},
    ...multicallResult.map((entry, index) => {
      return {
        [keys[index]]: {
          roundId: Number(entry?.roundId?.toString()) ?? 0,
          price: entry?.answer?.toString() ?? '0',
          startedAt: entry?.startedAt?.toString() ?? '0',
          updatedAt: entry?.updatedAt?.toString() ?? '0',
          answeredInRound: Number(entry?.answeredInRound?.toString()) ?? 0,
        },
      }
    })
  )

  return { data: result, chainId }
})
