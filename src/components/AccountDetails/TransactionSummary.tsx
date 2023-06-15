import { Trans } from '@lingui/macro'
import { Fraction, TradeType } from '@uniswap/sdk-core'
import { formatEther } from 'ethers/lib/utils'
import JSBI from 'jsbi'
import { Mode, TradeAction } from 'pages/Trading'
import { MarginTradeType } from 'types/1delta'

import { nativeOnChain } from '../../constants/tokens'
import { useCurrency, useToken } from '../../hooks/Tokens'
import {
  ApproveTransactionInfo,
  TradeExecutionTransactionInfo,
  TransactionInfo,
  TransactionType,
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



function ApprovalSummary({ info }: { info: ApproveTransactionInfo }) {
  const token = useToken(info.tokenAddress)

  return <Trans>Approve {token?.symbol}</Trans>
}


function LeveragedPositionSummary({
  info,
}: {
  info: TradeExecutionTransactionInfo
}) {

  const action = info.tradeAction
  return (
    <>
      {action === TradeAction.OPEN && <>
        Deposit {
          <FormattedCurrencyAmountManaged
            rawAmount={info.providedAmountRaw}
            currencyId={info.providedCurrencyId}
            sigFigs={6}
          />
        } {' '}and{' '}
      </>}
      <Trans>
        {`${action} ${info.direction} `}{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.collateralAmountRaw}
          currencyId={info.collateralCurrencyId}
          sigFigs={6}
        />{' '}
        {'/ '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.debtAmountRaw}
          currencyId={info.debtCurrencyId}
          sigFigs={6}
        />{' '}
      </Trans>
      {action === TradeAction.CLOSE && Number(info.providedAmountRaw) > 0 && <>
        And Withdraw {
          <FormattedCurrencyAmountManaged
            rawAmount={info.providedAmountRaw}
            currencyId={info.providedCurrencyId}
            sigFigs={6}
          />
        } {' '}and{' '}
      </>}
    </>
  )
}

export function TransactionSummary({ info }: { info: TransactionInfo }) {
  switch (info.type) {
    case TransactionType.APPROVAL:
      return <ApprovalSummary info={info} />

    case TransactionType.LEVERAGED_POSITION:
      return <LeveragedPositionSummary info={info} />
  }
}
