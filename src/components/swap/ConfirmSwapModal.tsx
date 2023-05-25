import { Trans } from '@lingui/macro'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'

import { formatPercentInBasisPointsNumber, formatToDecimal, getTokenAddress } from 'analytics/utils'
import { ButtonError } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'
import { ETHEREUM_CHAINS, TOKEN_SVGS } from 'constants/1delta'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Text } from 'rebass'
import { InterfaceTrade } from 'state/routing/types'
import { ThemedText } from 'theme'
import { MarginTradeType, SupportedAssets } from 'types/1delta'
import { computeRealizedPriceImpact } from 'utils/prices'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'
import styled from 'styled-components/macro'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import { SwapCallbackError } from './styleds'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'
import { ArrowDown, ArrowUp } from 'react-feather'
import { LendingProtocolLogoRaw } from 'components/ProtocolLogo'
import { LendingProtocol } from 'state/1delta/actions'
import { useChainId } from 'state/globalNetwork/hooks'


export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  swapQuoteReceivedDate,
  fiatValueInput,
  fiatValueOutput,
}: {
  isOpen: boolean
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
  originalTrade: Trade<Currency, Currency, TradeType> | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: Percent
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  onDismiss: () => void
  swapQuoteReceivedDate: Date | undefined
  fiatValueInput?: CurrencyAmount<Token> | null
  fiatValueOutput?: CurrencyAmount<Token> | null
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const [lastTxnHashLogged, setLastTxnHashLogged] = useState<string | null>(null)
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        shouldLogModalCloseEvent={shouldLogModalCloseEvent}
        setShouldLogModalCloseEvent={setShouldLogModalCloseEvent}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade, shouldLogModalCloseEvent])

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        hash={txHash}
        allowedSlippage={allowedSlippage}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        swapQuoteReceivedDate={swapQuoteReceivedDate}
        fiatValueInput={fiatValueInput}
        fiatValueOutput={fiatValueOutput}
      />
    ) : null
  }, [
    onConfirm,
    showAcceptChanges,
    swapErrorMessage,
    trade,
    allowedSlippage,
    txHash,
    swapQuoteReceivedDate,
    fiatValueInput,
    fiatValueOutput,
  ])

  // text to show while loading
  const pendingText = (
    <Trans>
      Swapping {trade?.inputAmount?.toSignificant(6)} {trade?.inputAmount?.currency?.symbol} for{' '}
      {trade?.outputAmount?.toSignificant(6)} {trade?.outputAmount?.currency?.symbol}
    </Trans>
  )

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onModalDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={<Trans>Confirm Swap</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  useEffect(() => {
    if (!attemptingTxn && isOpen && txHash && trade && txHash !== lastTxnHashLogged) {
      setLastTxnHashLogged(txHash)
    }
  }, [attemptingTxn, isOpen, txHash, trade, lastTxnHashLogged])

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onModalDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      currencyToAdd={trade?.outputAmount.currency}
    />
  )
}

export const RowFlat = styled.div`
  display: flex;
  align-items: flex-end;
`

export const ColReverse = styled.div<{ isReverse: boolean }>`
  padding: 20px;
  min-height: 200px;
  width: 100%;
  display: flex;
  flex-direction: column ${({ isReverse }) => (isReverse ? '-reverse' : '')};
  justify-content: space-between;
  align-items: center;
`

export const Col = styled.div`
  padding: 20px;
  min-height: 170px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`

export const ColInner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`

export function ConfirmDirectInteractionModal({
  interaction,
  ccy,
  amount,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
}: {
  isOpen: boolean
  interaction: MarginTradeType
  ccy: SupportedAssets
  amount: string | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  onDismiss: () => void
  swapQuoteReceivedDate: Date | undefined
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const [lastTxnHashLogged, setLastTxnHashLogged] = useState<string | null>(null)
  const chainId = useChainId()
  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  // text to show while loading
  const pendingText = (
    <ThemedText.MediumHeader>
      {String(interaction)} {String(ccy)}
    </ThemedText.MediumHeader>
  )
  const down = interaction === MarginTradeType.Repay || interaction === MarginTradeType.Supply

  const isEthereum = ETHEREUM_CHAINS.includes(chainId)
  const textGap = down ? 'to' : 'from'
  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onModalDismiss} message={swapErrorMessage} />
      ) : (
        <Col>
          <ColReverse isReverse={false}>
            <RowFlat>
              <img src={TOKEN_SVGS[ccy]} width="40px" style={{ marginRight: '10px' }} />
              <ColInner>
                <ThemedText.MediumHeader fontSize="12px">{amount}</ThemedText.MediumHeader>
                <ThemedText.MediumHeader fontSize="14px">{String(ccy)}</ThemedText.MediumHeader>
              </ColInner>
            </RowFlat>
            <div style={{ margin: '10px' }}>{down ? <ArrowDown /> : <ArrowUp />}</div>
            <LendingProtocolLogoRaw
              isSelected
              protocol={LendingProtocol.COMPOUND}
              chainId={chainId}
              width="100%"
              height="50px"
            />
          </ColReverse>
          <AutoRow>
            <ButtonError onClick={onConfirm} style={{ margin: '10px 0 0 0' }} id={"CONFIRM_SWAP_BUTTON"}>
              <Text fontSize={20} fontWeight={500}>
                <Trans>
                  Confirm {String(interaction)} {textGap} {isEthereum ? 'Compound' : '0VIX'}
                </Trans>
              </Text>
            </ButtonError>

            {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          </AutoRow>
        </Col>
      ),
    [onModalDismiss, swapErrorMessage]
  )

  useEffect(() => {
    if (!attemptingTxn && isOpen && txHash && txHash !== lastTxnHashLogged) {
      setLastTxnHashLogged(txHash)
    }
  }, [attemptingTxn, isOpen, txHash, lastTxnHashLogged])

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onModalDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      currencyToAdd={undefined}
    />
  )
}
