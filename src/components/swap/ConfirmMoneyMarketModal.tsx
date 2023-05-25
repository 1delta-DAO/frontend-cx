import { Trans } from '@lingui/macro'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'

import { formatPercentInBasisPointsNumber, formatToDecimal, getTokenAddress } from 'analytics/utils'
import { ButtonError, ButtonLight, ButtonYellow } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Row, { AutoRow } from 'components/Row'
import { ETHEREUM_CHAINS, TOKEN_SVGS, toLenderText } from 'constants/1delta'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Text } from 'rebass'
import { InterfaceTrade } from 'state/routing/types'
import { ThemedText } from 'theme'
import { MarginTradeType, SupportedAssets } from 'types/1delta'
import { computeRealizedPriceImpact } from 'utils/prices'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'
import styled from 'styled-components/macro'
import { opacify } from 'theme/utils'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import { SwapCallbackError } from './styleds'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'
import { ArrowDown, ArrowUp } from 'react-feather'
import { LendingProtocolLogo, LendingProtocolLogoRaw } from 'components/ProtocolLogo'
import { LendingProtocol } from 'state/1delta/actions'
import { WarningIcon } from 'nft/components/icons'
import { useChainId } from 'state/globalNetwork/hooks'
import { useCurrentLendingProtocol } from 'state/1delta/hooks'


export default function ConfirmMoneyMarketModal({
  healthFactor,
  hasRiskError,
  riskMessage,
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
  healthFactor: number
  hasRiskError: boolean
  riskMessage: string
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
  swapQuoteReceivedDate?: Date | undefined
  fiatValueInput?: CurrencyAmount<Token> | null
  fiatValueOutput?: CurrencyAmount<Token> | null
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const [acceptRisk, setAcceptRisk] = useState(false)
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
      <AutoColumn>
        {hasRiskError && (
          <WarningText fontSize={16} fontWeight={500} textAlign="center">
            Your health factor might drop to {healthFactor.toLocaleString()}
          </WarningText>
        )}
        {hasRiskError && !acceptRisk && (
          <ButtonYellow
            height="50px"
            onClick={() => {
              setAcceptRisk(true)
            }}
            style={{ margin: '10px 0 0 0' }}
            id={"CONFIRM_SWAP_BUTTON"}
          >
            <Row justifyContent="center" alignItems="center">
              <WarningIcon width="30px" height="30px" color="" />
              <Text fontSize={14} fontWeight={500} color="red" marginLeft="5px">
                Accept: {riskMessage}
              </Text>
            </Row>
          </ButtonYellow>
        )}
        <SwapModalFooter
          onConfirm={onConfirm}
          trade={trade}
          hash={txHash}
          allowedSlippage={allowedSlippage}
          disabledConfirm={showAcceptChanges || (!acceptRisk && hasRiskError)}
          swapErrorMessage={swapErrorMessage}
          swapQuoteReceivedDate={swapQuoteReceivedDate}
          fiatValueInput={fiatValueInput}
          fiatValueOutput={fiatValueOutput}
        />
      </AutoColumn>
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

const StyledButton = styled(ButtonLight)`
  border: 1px solid ${({ theme }) => opacify(24, theme.deprecated_error)};
  background: ${({ theme }) => theme.accentWarning};
`

const WarningText = styled(Text)`
  color: ${({ theme }) => theme.deprecated_warning};
`

export function ConfirmDirectInteractionModal({
  healthFactor,
  hasRiskError,
  riskMessage,
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
  healthFactor: number
  hasRiskError: boolean
  riskMessage: string
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
  swapQuoteReceivedDate?: Date | undefined
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const [acceptRisk, setAcceptRisk] = useState(false)
  const protocol = useCurrentLendingProtocol()
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
                <ThemedText.MediumHeader fontSize="14px">{amount}</ThemedText.MediumHeader>
                <ThemedText.MediumHeader fontSize="14px">{String(ccy)}</ThemedText.MediumHeader>
              </ColInner>
            </RowFlat>
            <div style={{ margin: '10px' }}>{down ? <ArrowDown /> : <ArrowUp />}</div>
            <LendingProtocolLogoRaw
              isSelected
              protocol={protocol}
              chainId={chainId}
              width="100%"
              height="50px"
            />
          </ColReverse>
          <AutoColumn>
            {hasRiskError && (
              <WarningText fontSize={16} fontWeight={500} textAlign="center">
                Your health factor might drop to {healthFactor.toLocaleString()}
              </WarningText>
            )}
            {hasRiskError && !acceptRisk && (
              <ButtonYellow
                height="50px"
                onClick={() => {
                  setAcceptRisk(true)
                }}
                style={{ margin: '10px 0 0 0' }}
                id={"CONFIRM_SWAP_BUTTON"}
              >
                <Row justifyContent="center" alignItems="center">
                  <WarningIcon width="30px" height="30px" color="" />
                  <Text fontSize={14} fontWeight={500} color="red" marginLeft="5px">
                    Accept: {riskMessage}
                  </Text>
                </Row>
              </ButtonYellow>
            )}
            <AutoRow>
              <ButtonError
                onClick={onConfirm}
                style={{ margin: '10px 0 0 0' }}
                id={"CONFIRM_SWAP_BUTTON"}
                disabled={!acceptRisk && hasRiskError}
              >
                <Text fontSize={20} fontWeight={500}>
                  <Trans>
                    Confirm {String(interaction)} {textGap} {toLenderText(protocol, chainId)}
                  </Trans>
                </Text>
              </ButtonError>

              {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            </AutoRow>
          </AutoColumn>
        </Col>
      ),
    [onModalDismiss, swapErrorMessage, acceptRisk, riskMessage]
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
