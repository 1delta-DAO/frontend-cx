import { createReducer } from '@reduxjs/toolkit'
import { chainIds, DEFAULT_CHAINID, SupportedChainId } from 'constants/chains'
import { UniswapTrade } from 'utils/Types'
import { fetchPools, fetchTrade } from './fetchTrade'

// new Pool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick)

export interface DeserializdPool {
  token0: string,
  token1: string,
  fee: string
  sqrtPriceX96: string
  liquidity: string
  tick: string
}

export const toAlgebraPid = (token0: string, token1: string) => {
  return token0 < token1 ? `${token0}-${token1}` : `${token1}-${token0}`
}

export interface DeserializedRoute {
  pools: DeserializdPool[];
  tokenPath: string[];
  input: string;
  output: string;
}

export interface Input {
  value: string
  tokenInAddres: string
  decimals: number
  tokenOutAddress: string
}

export interface AlgebraTradeState {
  chainId: number
  tradeInInput?: Input
  tradeIn: UniswapTrade | undefined
  tradeMarginInput?: Input
  tradeMargin: UniswapTrade | undefined
  pools: { [chainId: number]: { [pid: string]: DeserializdPool } }
  routes: { [chainId: number]: { [pid: string]: DeserializedRoute[] } }

}

const initialState = {
  chainId: SupportedChainId.POLYGON_ZK_EVM,
  tradeInInput: undefined,
  tradeIn: undefined,
  tradeMarginInput: undefined,
  tradeMargin: undefined,
  pools: { [SupportedChainId.POLYGON_ZK_EVM]: {} },
  routes: { [SupportedChainId.POLYGON_ZK_EVM]: {} }
}

export default createReducer<AlgebraTradeState>(initialState, (builder) =>
  builder
    .addCase(fetchPools.fulfilled, (state, action) => {
      // const chainId = action.payload.chainId
      // if (Number(state.networkData[chainId].lastTimestamp) < Number(action.payload.timestamp)) {
      //   state.networkData[chainId].lastTimestamp = action.payload.timestamp
      // }
      // if (state.networkData[chainId].blockNumber < action.payload.blockNumber) {
      //   state.networkData[chainId].blockNumber = action.payload.blockNumber
      //   // we do not want to fetch old balances
      //   state.networkData[chainId].nativeBalance = action.payload.nativeBalance
      // }
    })
    .addCase(fetchTrade.fulfilled, (state, action) => {
      // const chainId = action.payload.chainId
      // if (Number(state.networkData[chainId].lastTimestamp) < Number(action.payload.timestamp)) {
      //   state.networkData[chainId].lastTimestamp = action.payload.timestamp
      // }
      // if (state.networkData[chainId].blockNumber < action.payload.blockNumber) {
      //   state.networkData[chainId].blockNumber = action.payload.blockNumber
      //   // we do not want to fetch old balances
      //   state.networkData[chainId].nativeBalance = action.payload.nativeBalance
      // }
    })
)
