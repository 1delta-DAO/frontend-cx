import { TradeType } from '@uniswap/sdk-core'
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
  SWAP,
  DEPOSIT_LIQUIDITY_STAKING,
  WITHDRAW_LIQUIDITY_STAKING,
  CLAIM,
  VOTE,
  DELEGATE,
  WRAP,
  CREATE_V3_POOL,
  ADD_LIQUIDITY_V3_POOL,
  ADD_LIQUIDITY_V2_POOL,
  MIGRATE_LIQUIDITY_V3,
  COLLECT_FEES,
  REMOVE_LIQUIDITY_V3,
  SUBMIT_PROPOSAL,
  QUEUE,
  EXECUTE,
  DIRECT_INTERACTION,
  MONEY_MARKET,
  SINGLE_SIDE,
  MARGIN_TRADE,
}

export interface BaseTransactionInfo {
  type: TransactionType
}

export interface QueueTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.QUEUE
  governorAddress: string
  proposalId: number
}

export interface ExecuteTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.EXECUTE
  governorAddress: string
  proposalId: number
}

export interface DelegateTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.DELEGATE
  delegatee: string
}

export interface ApproveTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.APPROVAL
  tokenAddress: string
  spender: string
}

// direct interaction with lending protocol,i.e. depoist eth

export interface DirectMoneyMarketTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.DIRECT_INTERACTION
  subType: MarginTradeType
  currencyId: string
  amount: string
  protocol: string
  account?: string
}

interface BaseSwapTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.SWAP
  tradeType: TradeType
  inputCurrencyId: string
  outputCurrencyId: string
}

interface BaseMoneyMarketTransactionInfo {
  type: TransactionType.MONEY_MARKET
  tradeType: TradeType
  inputCurrencyId: string
  outputCurrencyId: string
  subType: MarginTradeType
  protocol: string
  account?: string
}

// money market transactions, swap and deposit, borrow and swap, swap and repay etc.

export interface ExactInputMoneyMarketTransactionInfo extends BaseMoneyMarketTransactionInfo {
  tradeType: TradeType.EXACT_INPUT
  inputCurrencyAmountRaw: string
  expectedOutputCurrencyAmountRaw: string
  minimumOutputCurrencyAmountRaw: string
}

export interface ExactOutputMoneyMarketTransactionInfo extends BaseMoneyMarketTransactionInfo {
  tradeType: TradeType.EXACT_OUTPUT
  outputCurrencyAmountRaw: string
  expectedInputCurrencyAmountRaw: string
  maximumInputCurrencyAmountRaw: string
}

// single side trade
interface BaseSingleSideTransactionInfo {
  type: TransactionType.SINGLE_SIDE
  tradeType: TradeType
  inputCurrencyId: string
  outputCurrencyId: string
  subType: PositionSides
  protocol: string
  account?: string
}

export interface ExactInputSingleSideTransactionInfo extends BaseSingleSideTransactionInfo {
  tradeType: TradeType.EXACT_INPUT
  inputCurrencyAmountRaw: string
  expectedOutputCurrencyAmountRaw: string
  minimumOutputCurrencyAmountRaw: string
}

export interface ExactOutputSingleSideTransactionInfo extends BaseSingleSideTransactionInfo {
  tradeType: TradeType.EXACT_OUTPUT
  outputCurrencyAmountRaw: string
  expectedInputCurrencyAmountRaw: string
  maximumInputCurrencyAmountRaw: string
}

// margin trades
interface BaseMarginTradeTransactionInfo {
  type: TransactionType.MARGIN_TRADE
  tradeType: TradeType
  inputCurrencyId: string
  outputCurrencyId: string
  subType: MarginTradeType
  protocol: string
  account?: string
}

export interface ExactInputMarginTradeTransactionInfo extends BaseMarginTradeTransactionInfo {
  tradeType: TradeType.EXACT_INPUT
  inputCurrencyAmountRaw: string
  expectedOutputCurrencyAmountRaw: string
  minimumOutputCurrencyAmountRaw: string
}

export interface ExactOutputMarginTradeTransactionInfo extends BaseMarginTradeTransactionInfo {
  tradeType: TradeType.EXACT_OUTPUT
  outputCurrencyAmountRaw: string
  expectedInputCurrencyAmountRaw: string
  maximumInputCurrencyAmountRaw: string
}

export interface ExactInputSwapTransactionInfo extends BaseSwapTransactionInfo {
  tradeType: TradeType.EXACT_INPUT
  inputCurrencyAmountRaw: string
  expectedOutputCurrencyAmountRaw: string
  minimumOutputCurrencyAmountRaw: string
}

export interface ExactOutputSwapTransactionInfo extends BaseSwapTransactionInfo {
  tradeType: TradeType.EXACT_OUTPUT
  outputCurrencyAmountRaw: string
  expectedInputCurrencyAmountRaw: string
  maximumInputCurrencyAmountRaw: string
}

export interface WrapTransactionInfo {
  type: TransactionType.WRAP
  unwrapped: boolean
  currencyAmountRaw: string
  chainId?: number
}

export interface ClaimTransactionInfo {
  type: TransactionType.CLAIM
  recipient: string
  uniAmountRaw?: string
}

export interface SubmitProposalTransactionInfo {
  type: TransactionType.SUBMIT_PROPOSAL
}

export type TransactionInfo =
  | ApproveTransactionInfo
  | ExactOutputSwapTransactionInfo
  | ExactInputSwapTransactionInfo
  | ClaimTransactionInfo
  | QueueTransactionInfo
  | ExecuteTransactionInfo
  | DelegateTransactionInfo
  | WrapTransactionInfo
  | SubmitProposalTransactionInfo
  | DirectMoneyMarketTransactionInfo
  | ExactInputMoneyMarketTransactionInfo
  | ExactOutputMoneyMarketTransactionInfo
  | ExactInputSingleSideTransactionInfo
  | ExactOutputSingleSideTransactionInfo
  | ExactInputMarginTradeTransactionInfo
  | ExactOutputMarginTradeTransactionInfo

export interface TransactionDetails {
  hash: string
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  info: TransactionInfo
}
