import { Trans } from '@lingui/macro'
import { Fraction, TradeType } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import {
  ApproveTransactionInfo,
  ClaimTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  TransactionInfo,
  TransactionType,
  WrapTransactionInfo,
} from 'state/transactions/types'
import styled from 'styled-components/macro'

import { nativeOnChain } from '../../constants/tokens'
import { useCurrency, useToken } from '../../hooks/Tokens'
import { shortenAddress } from '../../utils'
import { TransactionState } from './index'

const HighlightText = styled.span`
  color: ${({ theme }) => theme.textPrimary};
  font-weight: 600;
`

const BodyWrap = styled.div`
  line-height: 20px;
`

interface ActionProps {
  pending: JSX.Element
  success: JSX.Element
  failed: JSX.Element
  transactionState: TransactionState
}

const Action = ({ pending, success, failed, transactionState }: ActionProps) => {
  switch (transactionState) {
    case TransactionState.Failed:
      return failed
    case TransactionState.Success:
      return success
    default:
      return pending
  }
}

const formatAmount = (amountRaw: string, decimals: number, sigFigs: number): string =>
  new Fraction(amountRaw, JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))).toSignificant(sigFigs)

const FailedText = ({ transactionState }: { transactionState: TransactionState }) =>
  transactionState === TransactionState.Failed ? <Trans>failed</Trans> : <span />

const FormattedCurrencyAmount = ({
  rawAmount,
  currencyId,
  sigFigs = 2,
}: {
  rawAmount: string
  currencyId: string
  sigFigs: number
}) => {
  const currency = useCurrency(currencyId)

  return currency ? (
    <HighlightText>
      {formatAmount(rawAmount, currency.decimals, sigFigs)} {currency.symbol}
    </HighlightText>
  ) : null
}

const getRawAmounts = (
  info: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo
): { rawAmountFrom: string; rawAmountTo: string } => {
  return info.tradeType === TradeType.EXACT_INPUT
    ? { rawAmountFrom: info.inputCurrencyAmountRaw, rawAmountTo: info.expectedOutputCurrencyAmountRaw }
    : { rawAmountFrom: info.expectedInputCurrencyAmountRaw, rawAmountTo: info.outputCurrencyAmountRaw }
}

const SwapSummary = ({
  info,
  transactionState,
}: {
  info: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo
  transactionState: TransactionState
}) => {
  const actionProps = {
    transactionState,
    pending: <Trans>Swapping</Trans>,
    success: <Trans>Swapped</Trans>,
    failed: <Trans>Swap</Trans>,
  }
  const { rawAmountFrom, rawAmountTo } = getRawAmounts(info)

  return (
    <BodyWrap>
      <Action {...actionProps} />{' '}
      <FormattedCurrencyAmount rawAmount={rawAmountFrom} currencyId={info.inputCurrencyId} sigFigs={2} />{' '}
      <Trans>for </Trans>{' '}
      <FormattedCurrencyAmount rawAmount={rawAmountTo} currencyId={info.outputCurrencyId} sigFigs={2} />{' '}
      <FailedText transactionState={transactionState} />
    </BodyWrap>
  )
}

const ApprovalSummary = ({
  info,
  transactionState,
}: {
  info: ApproveTransactionInfo
  transactionState: TransactionState
}) => {
  const token = useToken(info.tokenAddress)
  const actionProps = {
    transactionState,
    pending: <Trans>Approving</Trans>,
    success: <Trans>Approved</Trans>,
    failed: <Trans>Approve</Trans>,
  }

  return (
    <BodyWrap>
      <Action {...actionProps} /> <HighlightText>{token?.symbol}</HighlightText>{' '}
      <FailedText transactionState={transactionState} />
    </BodyWrap>
  )
}

const ClaimSummary = ({
  info: { recipient, uniAmountRaw },
  transactionState,
}: {
  info: ClaimTransactionInfo
  transactionState: TransactionState
}) => {
  const actionProps = {
    transactionState,
    pending: <Trans>Claiming</Trans>,
    success: <Trans>Claimed</Trans>,
    failed: <Trans>Claim</Trans>,
  }

  return (
    <BodyWrap>
      {uniAmountRaw && (
        <>
          <Action {...actionProps} />{' '}
          <HighlightText>
            {formatAmount(uniAmountRaw, 18, 4)}
            UNI{' '}
          </HighlightText>{' '}
          <Trans>for</Trans> <HighlightText>{shortenAddress(recipient)}</HighlightText>
        </>
      )}{' '}
      <FailedText transactionState={transactionState} />
    </BodyWrap>
  )
}

const WrapSummary = ({
  info: { chainId, currencyAmountRaw, unwrapped },
  transactionState,
}: {
  info: WrapTransactionInfo
  transactionState: TransactionState
}) => {
  const native = chainId ? nativeOnChain(chainId) : undefined
  const from = unwrapped ? native?.wrapped.symbol ?? 'WETH' : native?.symbol ?? 'ETH'
  const to = unwrapped ? native?.symbol ?? 'ETH' : native?.wrapped.symbol ?? 'WETH'

  const amount = formatAmount(currencyAmountRaw, 18, 6)
  const actionProps = unwrapped
    ? {
        transactionState,
        pending: <Trans>Unwrapping</Trans>,
        success: <Trans>Unwrapped</Trans>,
        failed: <Trans>Unwrap</Trans>,
      }
    : {
        transactionState,
        pending: <Trans>Wrapping</Trans>,
        success: <Trans>Wrapped</Trans>,
        failed: <Trans>Wrap</Trans>,
      }

  return (
    <BodyWrap>
      <Action {...actionProps} />{' '}
      <HighlightText>
        {amount} {from}
      </HighlightText>{' '}
      <Trans>to</Trans>{' '}
      <HighlightText>
        {amount} {to}
      </HighlightText>{' '}
      <FailedText transactionState={transactionState} />
    </BodyWrap>
  )
}

const TransactionBody = ({ info, transactionState }: { info: TransactionInfo; transactionState: TransactionState }) => {
  switch (info.type) {
    case TransactionType.SWAP:
      return <SwapSummary info={info} transactionState={transactionState} />
    case TransactionType.WRAP:
      return <WrapSummary info={info} transactionState={transactionState} />
    case TransactionType.APPROVAL:
      return <ApprovalSummary info={info} transactionState={transactionState} />
    case TransactionType.CLAIM:
      return <ClaimSummary info={info} transactionState={transactionState} />
    default:
      return <span />
  }
}

export default TransactionBody
