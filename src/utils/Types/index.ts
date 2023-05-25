import { Currency, TradeType } from "@uniswap/sdk-core"
import { ethers } from "ethers"
import { InterfaceTrade } from "state/routing/types"


export interface SimpleTransactionResponse {
  hash: string
}

export type ContractCall = () => Promise<ethers.providers.TransactionResponse>
export type ContractCallWithOptions = (opts: any) => Promise<ethers.providers.TransactionResponse>


export interface ContractCallData {
  args: any
  method: any
  estimate: any
  call?: ContractCall | undefined
}

export interface ContractCallDataWithOptions {
  args: any
  method: any
  estimate: any
  call?: ContractCallWithOptions | undefined
}

export type UniswapTrade = InterfaceTrade<Currency, Currency, TradeType>
