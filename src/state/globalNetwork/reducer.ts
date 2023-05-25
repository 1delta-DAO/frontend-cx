import { createReducer } from '@reduxjs/toolkit'
import { chainIds, DEFAULT_CHAINID } from 'constants/chains'
import { setChainId, setAccount, setIsSupported, setBlockNumber } from './actions'
import { fetchTimestamp, fetchBlockDataAndNativeBalance } from './fetchGeneralData'

export interface GlobalNetworkState {
  readonly chainId: number
  readonly account: string | undefined
  readonly connectionIsSupported: boolean
  networkData: {
    [chainId: number]: {
      readonly lastTimestamp: string
      readonly blockNumber: number
      readonly nativeBalance: string | undefined
    }
  }
}

const initialChainId = Number(DEFAULT_CHAINID)

const initialData = {
  lastTimestamp: String(Math.round(Date.now() / 1000)),
  blockNumber: 0,
  nativeBalance: undefined
}

const initialState: GlobalNetworkState = {
  chainId: initialChainId,
  account: undefined,
  connectionIsSupported: true,
  networkData: Object.assign({}, ...chainIds.map(c => { return { [c]: initialData } }))
}

export default createReducer<GlobalNetworkState>(initialState, (builder) =>
  builder
    .addCase(setChainId, (state, { payload: { chainId } }) => {
      state.chainId = chainId
    })
    .addCase(setAccount, (state, { payload: { account } }) => {
      state.account = account
    })
    .addCase(setBlockNumber, (state, { payload: { blockNumber, chainId } }) => {
      state.networkData[chainId].blockNumber = blockNumber
    })
    .addCase(setIsSupported, (state, { payload: { isSupported } }) => {
      state.connectionIsSupported = isSupported
    })
    .addCase(fetchTimestamp.fulfilled, (state, action) => {
      state.networkData[action.payload.chainId].lastTimestamp = action.payload.timestamp
    })
    .addCase(fetchBlockDataAndNativeBalance.fulfilled, (state, action) => {
      const chainId = action.payload.chainId
      if (Number(state.networkData[chainId].lastTimestamp) < Number(action.payload.timestamp)) {
        state.networkData[chainId].lastTimestamp = action.payload.timestamp
      }
      if (state.networkData[chainId].blockNumber < action.payload.blockNumber) {
        state.networkData[chainId].blockNumber = action.payload.blockNumber
        // we do not want to fetch old balances
        state.networkData[chainId].nativeBalance = action.payload.nativeBalance
      }
    })
)
