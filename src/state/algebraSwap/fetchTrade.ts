import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import multicall, { Call, multicallSecondary } from 'utils/multicall'
import UniswapInterfaceMulticallJson from '@uniswap/v3-periphery/artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import { MULTICALL_ADDRESS } from 'constants/addresses'
import { getMulticallV2Address } from 'hooks/1delta/addresses'
import { SupportedChainId } from 'constants/chains'
import { getMulticallContractTradeProvider, simpleRpcProvider } from 'utils/1delta/contractHelper'
import { getSecondaryProvider } from 'constants/providers'
import { DeserializdPool, DeserializedRoute, Input } from './reducer'
import { UniswapTrade } from 'utils/Types'

export interface TimestampResponse {
  timestamp: string,
  chainId: number
}

export interface TimstampQueryParams {
  chainId: number
}

export interface PoolResponse {
  pools: { [chainId: number]: { [pid: string]: DeserializdPool } }
  chainId: number
}

export interface PoolQueryData {
  chainId: number
  poolAddresses: string[]
}

export const fetchPools: AsyncThunk<PoolResponse, PoolQueryData, any> =
  createAsyncThunk<PoolResponse, PoolQueryData>(
    'algebraSwap/fetchPools',

    async ({ chainId, poolAddresses }) => {
      if (!chainId || !poolAddresses || poolAddresses.length === 0)
        return {
          pools: {},
          chainId
        }
      const multicallContract = getMulticallContractTradeProvider(chainId)

      const calls: any[] = poolAddresses.map(x => {
        return {
          target: '',
          gasLimit: '',
          callData: '',
        }
      })
      const globalState = await multicallContract.multicall()

      return {
        pools: {},
        chainId
      }
    }
  )



export interface TradeInputCalc {
  chainId: number
  isIn: number
  input?: Input
  routes?: DeserializedRoute[]
}

export interface TradeData {
  chainId: number
  trade?: UniswapTrade | undefined
}



export const fetchTrade: AsyncThunk<TradeData, TradeInputCalc, any> =
  createAsyncThunk<TradeData, TradeInputCalc>(
    'algebraSwap/fetchTraed',

    async ({ chainId, isIn, input, routes }) => {


      return {
        chainId,
        trade: undefined
      }


    }
  )