import { Trans } from '@lingui/macro'
import { Fraction, TradeType } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import { MarginTradeType } from 'types/1delta'

import { nativeOnChain } from '../../constants/tokens'
import { useCurrency, useToken } from '../../hooks/Tokens'
import {
  ApproveTransactionInfo,
  ClaimTransactionInfo,
  DelegateTransactionInfo,
  DirectMoneyMarketTransactionInfo,
  ExactInputMarginTradeTransactionInfo,
  ExactInputMoneyMarketTransactionInfo,
  ExactInputSingleSideTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputMarginTradeTransactionInfo,
  ExactOutputMoneyMarketTransactionInfo,
  ExactOutputSingleSideTransactionInfo,
  ExactOutputSwapTransactionInfo,
  ExecuteTransactionInfo,
  QueueTransactionInfo,
  SubmitProposalTransactionInfo,
  TransactionInfo,
  TransactionType,
  WrapTransactionInfo,
} from '../../state/transactions/types'

function formatAmount(amountRaw: string, decimals: number, sigFigs: number): string {
  return new Fraction(amountRaw, JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))).toSignificant(sigFigs)
}

function FormattedCurrencyAmount({
  rawAmount,
  symbol,
  decimals,
  sigFigs,
}: {
  rawAmount: string
  symbol: string
  decimals: number
  sigFigs: number
}) {
  return (
    <>
      {formatAmount(rawAmount, decimals, sigFigs)} {symbol}
    </>
  )
}

function FormattedCurrencyAmountManaged({
  rawAmount,
  currencyId,
  sigFigs = 6,
}: {
  rawAmount: string
  currencyId: string
  sigFigs: number
}) {
  const currency = useCurrency(currencyId)
  return currency ? (
    <FormattedCurrencyAmount
      rawAmount={rawAmount}
      decimals={currency.decimals}
      sigFigs={sigFigs}
      symbol={currency.symbol ?? '???'}
    />
  ) : null
}

function ClaimSummary({ info: { recipient, uniAmountRaw } }: { info: ClaimTransactionInfo }) {
  return typeof uniAmountRaw === 'string' ? (
    <Trans>
      Claim <FormattedCurrencyAmount rawAmount={uniAmountRaw} symbol={'UNI'} decimals={18} sigFigs={4} /> for{' '}
      {recipient}
    </Trans>
  ) : (
    <Trans>Claim UNI reward for {recipient}</Trans>
  )
}

function SubmitProposalTransactionSummary(_: { info: SubmitProposalTransactionInfo }) {
  return <Trans>Submit new proposal</Trans>
}

function ApprovalSummary({ info }: { info: ApproveTransactionInfo }) {
  const token = useToken(info.tokenAddress)

  return <Trans>Approve {token?.symbol}</Trans>
}

function QueueSummary({ info }: { info: QueueTransactionInfo }) {
  const proposalKey = `${info.governorAddress}/${info.proposalId}`
  return <Trans>Queue proposal {proposalKey}.</Trans>
}

function ExecuteSummary({ info }: { info: ExecuteTransactionInfo }) {
  const proposalKey = `${info.governorAddress}/${info.proposalId}`
  return <Trans>Execute proposal {proposalKey}.</Trans>
}

function DelegateSummary({ info: { delegatee } }: { info: DelegateTransactionInfo }) {
  return <Trans>Delegate voting power to {delegatee}</Trans>
}

function WrapSummary({ info: { chainId, currencyAmountRaw, unwrapped } }: { info: WrapTransactionInfo }) {
  const native = chainId ? nativeOnChain(chainId) : undefined

  if (unwrapped) {
    return (
      <Trans>
        Unwrap{' '}
        <FormattedCurrencyAmount
          rawAmount={currencyAmountRaw}
          symbol={native?.wrapped?.symbol ?? 'WETH'}
          decimals={18}
          sigFigs={6}
        />{' '}
        to {native?.symbol ?? 'ETH'}
      </Trans>
    )
  } else {
    return (
      <Trans>
        Wrap{' '}
        <FormattedCurrencyAmount
          rawAmount={currencyAmountRaw}
          symbol={native?.symbol ?? 'ETH'}
          decimals={18}
          sigFigs={6}
        />{' '}
        to {native?.wrapped?.symbol ?? 'WETH'}
      </Trans>
    )
  }
}

function DirectMoneyMarketSummary({ info }: { info: DirectMoneyMarketTransactionInfo }) {
  const accountText = info.account ? `${info.account}: ` : ''
  if (info.type === TransactionType.DIRECT_INTERACTION) {
    return (
      <Trans>
        {`${accountText}${info.subType}`}{' '}
        <FormattedCurrencyAmountManaged rawAmount={info.amount} currencyId={info.currencyId} sigFigs={6} />
        {[MarginTradeType.Repay, MarginTradeType.Supply].includes(info.subType) ? 'to' : 'from'}{' '}
        {info.protocol}
      </Trans>
    )
  } else {
    return null
  }
}

function MoneyMarketSwapSummary({
  info,
}: {
  info: ExactInputMoneyMarketTransactionInfo | ExactOutputMoneyMarketTransactionInfo
}) {
  const accountText = info.account ? `${info.account}: ` : ''
  if (info.subType === MarginTradeType.Repay || info.subType === MarginTradeType.Supply) {
    if (info.tradeType === TradeType.EXACT_INPUT) {
      return (
        <Trans>
          {`${accountText}Swap exactly`}{' '}
          <FormattedCurrencyAmountManaged
            rawAmount={info.inputCurrencyAmountRaw}
            currencyId={info.inputCurrencyId}
            sigFigs={6}
          />{' '}
          for{' '}
          <FormattedCurrencyAmountManaged
            rawAmount={info.expectedOutputCurrencyAmountRaw}
            currencyId={info.outputCurrencyId}
            sigFigs={6}
          />{' '}
          {`and ${info.subType} to ${info.protocol}`}
        </Trans>
      )
    } else {
      return (
        <Trans>
          {`${accountText}Swap`}{' '}
          <FormattedCurrencyAmountManaged
            rawAmount={info.expectedInputCurrencyAmountRaw}
            currencyId={info.inputCurrencyId}
            sigFigs={6}
          />{' '}
          for exactly{' '}
          <FormattedCurrencyAmountManaged
            rawAmount={info.outputCurrencyAmountRaw}
            currencyId={info.outputCurrencyId}
            sigFigs={6}
          />{' '}
          {`and ${info.subType} to ${info.protocol}`}
        </Trans>
      )
    }
  } else {
    if (info.tradeType === TradeType.EXACT_INPUT) {
      return (
        <Trans>
          {`${accountText}${info.subType} from ${info.protocol} and Swap exactly `}
          <FormattedCurrencyAmountManaged
            rawAmount={info.inputCurrencyAmountRaw}
            currencyId={info.inputCurrencyId}
            sigFigs={6}
          />{' '}
          for{' '}
          <FormattedCurrencyAmountManaged
            rawAmount={info.expectedOutputCurrencyAmountRaw}
            currencyId={info.outputCurrencyId}
            sigFigs={6}
          />
        </Trans>
      )
    } else {
      return (
        <Trans>
          {`${accountText}${info.subType} from ${info.protocol} and Swap exactly `}
          <FormattedCurrencyAmountManaged
            rawAmount={info.expectedInputCurrencyAmountRaw}
            currencyId={info.inputCurrencyId}
            sigFigs={6}
          />{' '}
          for exactly{' '}
          <FormattedCurrencyAmountManaged
            rawAmount={info.outputCurrencyAmountRaw}
            currencyId={info.outputCurrencyId}
            sigFigs={6}
          />
        </Trans>
      )
    }
  }
}

function SingleSideSwapSummary({
  info,
}: {
  info: ExactInputSingleSideTransactionInfo | ExactOutputSingleSideTransactionInfo
}) {
  const accountText = info.account ? `${info.account}: ` : ''
  if (info.tradeType === TradeType.EXACT_INPUT) {
    return (
      <Trans>
        {`${accountText}${info.subType}-Swap exactly`}{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.inputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{' '}
        for{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedOutputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />{' '}
        {`on ${info.protocol}`}
      </Trans>
    )
  } else {
    return (
      <Trans>
        {`${accountText}${info.subType}-Swap`}{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedInputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{' '}
        for exactly{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.outputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />{' '}
        {`on ${info.protocol}`}
      </Trans>
    )
  }
}

function MarginSwapSummary({
  info,
}: {
  info: ExactInputMarginTradeTransactionInfo | ExactOutputMarginTradeTransactionInfo
}) {
  const accountText = info.account ? `${info.account}: ` : ''
  if (info.tradeType === TradeType.EXACT_INPUT) {
    return (
      <Trans>
        {`${accountText}${info.subType} exactly`}{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.inputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{' '}
        for{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedOutputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />{' '}
        {`on ${info.protocol}`}
      </Trans>
    )
  } else {
    return (
      <Trans>
        {`${accountText}${info.subType}`}{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedInputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{' '}
        for exactly{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.outputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />{' '}
        {`on ${info.protocol}`}
      </Trans>
    )
  }
}

function SwapSummary({ info }: { info: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo }) {
  if (info.tradeType === TradeType.EXACT_INPUT) {
    return (
      <Trans>
        Swap exactly{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.inputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{' '}
        for{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedOutputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />
      </Trans>
    )
  } else {
    return (
      <Trans>
        Swap{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedInputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{' '}
        for exactly{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.outputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />
      </Trans>
    )
  }
}

export function TransactionSummary({ info }: { info: TransactionInfo }) {
  switch (info.type) {
    case TransactionType.CLAIM:
      return <ClaimSummary info={info} />

    case TransactionType.SWAP:
      return <SwapSummary info={info} />

    case TransactionType.APPROVAL:
      return <ApprovalSummary info={info} />

    case TransactionType.DELEGATE:
      return <DelegateSummary info={info} />

    case TransactionType.WRAP:
      return <WrapSummary info={info} />

    case TransactionType.QUEUE:
      return <QueueSummary info={info} />

    case TransactionType.EXECUTE:
      return <ExecuteSummary info={info} />

    case TransactionType.SUBMIT_PROPOSAL:
      return <SubmitProposalTransactionSummary info={info} />

    case TransactionType.DIRECT_INTERACTION:
      return <DirectMoneyMarketSummary info={info} />

    case TransactionType.MONEY_MARKET:
      return <MoneyMarketSwapSummary info={info} />

    case TransactionType.SINGLE_SIDE:
      return <SingleSideSwapSummary info={info} />

    case TransactionType.MARGIN_TRADE:
      return <MarginSwapSummary info={info} />
  }
}
