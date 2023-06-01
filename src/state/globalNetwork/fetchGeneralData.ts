import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import multicall, { Call, multicallSecondary } from 'utils/multicall'
import UniswapInterfaceMulticallJson from '@uniswap/v3-periphery/artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import { MULTICALL_ADDRESS } from 'constants/addresses'
import { getMulticallV2Address } from 'hooks/1delta/addresses'
import { SupportedChainId } from 'constants/chains'
import { simpleRpcProvider } from 'utils/1delta/contractHelper'
import { getSecondaryProvider } from 'constants/providers'

export interface TimestampResponse {
  timestamp: string,
  chainId: number
}

export interface TimstampQueryParams {
  chainId: number
}

const MultiABI = [
  {
    "inputs": [],
    "name": "getCurrentBlockTimestamp",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "getEthBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBlockNumber",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
]

export const fetchTimestamp: AsyncThunk<TimestampResponse, TimstampQueryParams, any> =
  createAsyncThunk<TimestampResponse, TimstampQueryParams>(
    'globalNetwork/fetchTimestamp',

    async ({ chainId }) => {

      const calls: Call[] = [{
        address: MULTICALL_ADDRESS[chainId],
        name: 'getCurrentBlockTimestamp',
        params: [],
      }
      ]

      const multicallResult = await multicall(chainId, UniswapInterfaceMulticallJson.abi, calls)
      const result = multicallResult[0][0].toString()
      return {
        timestamp: result,
        chainId
      }
    }
  )

export interface TimestampAndBalanceResponse {
  timestamp: string
  nativeBalance: string | undefined
  blockNumber: number,
  chainId: number
}

export interface TimestampAndBalanceQueryParams {
  chainId: number
  account?: string;
}

export const fetchBlockDataAndNativeBalance: AsyncThunk<TimestampAndBalanceResponse, TimestampAndBalanceQueryParams, any> =
  createAsyncThunk<TimestampAndBalanceResponse, TimestampAndBalanceQueryParams>(
    'globalNetwork/fetchBlockDataAndNativeBalance',

    async ({ chainId, account }) => {
      if (account) {
        if (chainId !== SupportedChainId.POLYGON_ZK_EVM) {
          const calls: Call[] = [{
            address: MULTICALL_ADDRESS[chainId],
            name: 'getCurrentBlockTimestamp',
            params: [],
          }, {
            address: MULTICALL_ADDRESS[chainId],
            name: 'getEthBalance',
            params: [account],
          },
          {
            address: getMulticallV2Address(chainId),
            name: 'getBlockNumber',
            params: [],
          }
          ]

          const multicallResult = await multicallSecondary(chainId, MultiABI, calls)

          return {
            timestamp: multicallResult[0][0].toString(),
            nativeBalance: multicallResult[1].balance.toString(),
            blockNumber: Number(multicallResult[2].blockNumber.toString()),
            chainId
          }
        } else {

          const calls: Call[] = [{
            address: MULTICALL_ADDRESS[chainId],
            name: 'getCurrentBlockTimestamp',
            params: [],
          }, {
            address: MULTICALL_ADDRESS[chainId],
            name: 'getEthBalance',
            params: [account],
          }
          ]

          // multicall2 on zkEVM not yet found
          const bn = await getSecondaryProvider(chainId).getBlockNumber()

          let multicallResult: any;
          try {
            multicallResult = await multicallSecondary(chainId, MultiABI, calls)
          } catch (e) {
            console.log(e)
            return {
              timestamp: 0,
              nativeBalance: '0',
              blockNumber: bn,
              chainId
            }
          }

          return {
            timestamp: multicallResult[0][0].toString(),
            nativeBalance: multicallResult[1].balance.toString(),
            blockNumber: bn,
            chainId
          }

        }
      }
      const calls: Call[] = [{
        address: MULTICALL_ADDRESS[chainId],
        name: 'getCurrentBlockTimestamp',
        params: [],
      },
      {
        address: getMulticallV2Address(chainId),
        name: 'getBlockNumber',
        params: [],
      },
      ]

      const multicallResult = await multicallSecondary(chainId, MultiABI, calls)

      return {
        timestamp: multicallResult[0][0].toString(),
        blockNumber: Number(multicallResult[1].blockNumber.toString()),
        nativeBalance: undefined,
        chainId
      }

    }
  )