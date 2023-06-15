import { TradeType } from '@uniswap/sdk-core'
import { Mode, TradeAction } from 'pages/Trading'
import { MarginTradeType, PositionSides } from 'types/1delta'

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}

/**
 * Be careful adding to this enum, always assign a unique value (typescript will not prevent duplicate values).
 * These values is persisted in state and if you change the value it will cause errors
 */
export enum TransactionType {
  APPROVAL = 0,
  LEVERAGED_POSITION
}

export interface BaseTransactionInfo {
  type: TransactionType
}

export interface ApproveTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.APPROVAL
  tokenAddress: string
  spender: string
}


export interface TradeExecutionTransactionInfo {
  type: TransactionType.LEVERAGED_POSITION
  direction: Mode
  tradeAction: TradeAction
  collateralCurrencyId: string
  debtCurrencyId: string
  providedCurrencyId: string
  slot?: string
  collateralAmountRaw: string
  debtAmountRaw: string
  providedAmountRaw: string
}

export type TransactionInfo =
  | ApproveTransactionInfo
  | TradeExecutionTransactionInfo

export interface TransactionDetails {
  hash: string
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  info: TransactionInfo
}
