import { answerToPrice, formatAavePrice } from 'utils/tableUtils/prices'
import { createReducer } from '@reduxjs/toolkit'
import { chainIds } from 'constants/chains'
import { getChainLinkKeys } from 'hooks/1delta/addresses'
import { getAAVETokenAddresses } from 'hooks/1delta/addressGetter'
import { HistData, SerializedBigNumber } from 'types/1delta'

import { resetState, setOraclesToLoading } from './actions'
import { fetchAAVEAggregatorDataAsync } from './fetchAaveAggregatorData'
import { fetchChainLinkData } from './fetchChainLinkData'

const MAX_HISTORY_LENGTH = 100

export interface ChainLinkResponse {
  roundId: number
  price: SerializedBigNumber
  startedAt: SerializedBigNumber
  updatedAt: SerializedBigNumber
  answeredInRound: number
}

export interface AaveAggregatorResponse {
  price: SerializedBigNumber
  decimals: number
  time: number
}

export interface AaveAggregatorData extends AaveAggregatorResponse {
  priceHist: HistData[]
}


export interface ChainLinkData extends ChainLinkResponse {
  decimals: number
  priceHist: HistData[]
}

const dummyResponse = {
  roundId: 0,
  answer: '0',
  startedAt: '0',
  updatedAt: '0',
  answeredInRound: 0,
}

export interface OracleState {
  loadingState: {
    chainLink: {
      publicLoaded: boolean
      publicLoading: boolean
    }
    band: {
      publicLoaded: boolean
    }
    aave: {
      publicLoading: boolean
      publicLoaded: boolean
    }
  }
  data: {
    [chainId: number]: {
      chainLink: { [key: string]: ChainLinkData }
      aave: { [key: string]: AaveAggregatorData }
    }
  }
}

const generateData = (chainId: number) => {
  return {
    chainLink: Object.assign(
      {},
      ...getChainLinkKeys(chainId).map((k) => {
        let decs
        const ccyTo = k.split('-')[1]
        switch (ccyTo) {
          case 'ETH':
          case 'MATIC':
            decs = 18
            break
          case 'USD':
            decs = 8
            break
          case 'USDC':
            decs = 8
            break
          default:
            decs = 8
        }

        return { [k]: { ...dummyResponse, decimals: decs, priceHist: [] } }
      })
    ),
    aave: Object.assign(
      {},
      ...Object.keys(getAAVETokenAddresses(chainId)).map((k) => {
        return { [k]: { price: 0, time: 0, priceHist: [], decimals: 8 } }
      })
    ),
  }
}

export const initialState: OracleState = {
  loadingState: {
    chainLink: {
      publicLoading: false,
      publicLoaded: false,
    },
    band: {
      publicLoaded: false,
    },
    aave: {
      publicLoading: false,
      publicLoaded: false,
    }
  },
  data: Object.assign(
    {},
    ...chainIds.map((id) => {
      return { [id]: generateData(id) }
    })
  ),
}


export default createReducer<OracleState>(initialState, (builder) =>
  builder
    .addCase(resetState, () => initialState)
    .addCase(setOraclesToLoading, (state) => {
      state.loadingState = {
        chainLink: {
          publicLoading: false,
          publicLoaded: false,
        },
        band: {
          publicLoaded: false,
        },
        aave: {
          publicLoading: false,
          publicLoaded: false,
        }
      }
    })
    // public data fetch
    .addCase(fetchChainLinkData.pending, (state) => {
      // state.userDataLoading = true
      state.loadingState.chainLink.publicLoading = true
    })
    .addCase(fetchChainLinkData.fulfilled, (state, action) => {
      const assetKeys = Object.keys(action.payload.data)
      const chainId = action.payload.chainId
      for (let i = 0; i < assetKeys.length; i++) {
        const key = assetKeys[i]
        const priceData = action.payload.data[key]
        const histLength = state.data[chainId].chainLink[key].priceHist?.length
        if (state.data[chainId].chainLink[key].roundId > 0) {
          // delete every second item if length > MAX_HISTORY_LENGTH
          if (histLength && histLength > MAX_HISTORY_LENGTH) {
            state.data[chainId].chainLink[key].priceHist =
              state.data[chainId].chainLink[key].priceHist?.filter(function (_, i) {
                return i % 2 === 0;
              })
          }

          // we convert hist prices to numbers in state
          state.data[chainId].chainLink[key].priceHist?.push(
            {
              time: Math.floor(Date.now() / 1000) - 1,
              price: answerToPrice(priceData.price, state.data[chainId].chainLink[key].decimals),
            }
          )
        }
        state.data[chainId].chainLink[key] = {
          ...state.data[chainId].chainLink[key],
          ...priceData,
        }
      }
      state.loadingState.chainLink.publicLoaded = true
      state.loadingState.chainLink.publicLoading = false
    })
    /// handle aave
    // prices from oracle
    .addCase(fetchAAVEAggregatorDataAsync.fulfilled, (state, action) => {
      const assetKeys = Object.keys(action.payload.data)
      const chainId = action.payload.chainId
      for (let i = 0; i < assetKeys.length; i++) {
        const key = assetKeys[i]
        const priceData = action.payload.data[key]
        if (Number(state.data[chainId].aave[key].price) > 0) {
          const histLength = state.data[chainId].aave[key]?.priceHist?.length
          // delete every second item if length > MAX_HISTORY_LENGTH
          if (histLength && histLength > MAX_HISTORY_LENGTH) {
            state.data[chainId].aave[key].priceHist = state.data[chainId].aave[key].priceHist?.filter(function (_, i) {
              return i % 2 === 0;
            })
          }
          state.data[chainId].aave[key].priceHist?.push({
            price: formatAavePrice(String(priceData.price)),
            time: priceData.time
          })
        }
        state.data[chainId].aave[key] = {
          ...state.data[chainId].aave[key],
          ...priceData,
        }
      }
      state.loadingState.aave.publicLoaded = true
      state.loadingState.aave.publicLoading = false
    })
    .addCase(fetchAAVEAggregatorDataAsync.pending, (state) => {
      //
      state.loadingState.aave.publicLoading = true
    })
)
