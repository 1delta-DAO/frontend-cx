import { Trans } from '@lingui/macro'
import { Fraction, TradeType } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import {
  ApproveTransactionInfo,
  TransactionInfo,
  TransactionType
} from 'state/transactions/types'
import styled from 'styled-components/macro'
import { useToken } from '../../hooks/Tokens'
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


const TransactionBody = ({ info, transactionState }: { info: TransactionInfo; transactionState: TransactionState }) => {
  switch (info.type) {
    case TransactionType.APPROVAL:
      return <ApprovalSummary info={info} transactionState={transactionState} />
    default:
      return <span />
  }
}

export default TransactionBody
