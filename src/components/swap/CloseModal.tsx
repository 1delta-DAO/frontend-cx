import { Trans } from '@lingui/macro'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { formatPercentInBasisPointsNumber, formatToDecimal, getTokenAddress } from 'analytics/utils'
import { ButtonLight, ButtonYellow } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Row from 'components/Row'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Text } from 'rebass'
import { InterfaceTrade } from 'state/routing/types'
import { computeRealizedPriceImpact } from 'utils/prices'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'
import styled from 'styled-components/macro'
import { opacify } from 'theme/utils'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'
import { WarningIcon } from 'nft/components/icons'
import { ExtendedSlot } from 'state/slots/hooks'
import { useDerivedSwapInfoMarginAlgebraClose } from 'state/professionalTradeSelection/tradeHooks'
import { assetToId } from 'pages/Trading'
import { useChainId } from 'state/globalNetwork/hooks'
import { LendingProtocol } from 'state/1delta/actions'
import { SupportedAssets } from 'types/1delta'
import { useCurrency } from 'hooks/Tokens'
import { UniswapTrade } from 'utils/Types'


let LAST_VALID_TRADE_CLOSE: UniswapTrade | undefined;
let LAST_VALID_AMOUNT_OUT: CurrencyAmount<Currency> | undefined;

export default function CloseModal({
  slot,
  attemptingTxn,
  txHash,
  onConfirm,
  onDismiss,
  isOpen,
}: {
  slot: ExtendedSlot
  isOpen: boolean
  attemptingTxn: boolean
  txHash: string | undefined
  onConfirm: () => void
  onDismiss: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const [acceptRisk, setAcceptRisk] = useState(false)
  const [lastTxnHashLogged, setLastTxnHashLogged] = useState<string | null>(null)

  const chainId = useChainId()
  const [tokenInId, tokenOutId] = [
    assetToId(slot.collateralSymbol as SupportedAssets, chainId, LendingProtocol.COMPOUND),
    assetToId(slot.debtSymbol as SupportedAssets, chainId, LendingProtocol.COMPOUND)
  ]

  const tokenIn = useCurrency(tokenInId, LendingProtocol.COMPOUND)
  const tokenOut = useCurrency(tokenOutId, LendingProtocol.COMPOUND)
  const outAmount = tokenOut && CurrencyAmount.fromRawAmount(tokenOut, slot.debtBalance)

  const {
    trade: { state: tradeStateAlgebra, trade: tradeAlgebra },
    allowedSlippage,
    parsedAmount: parsedAmountAlgebra,
    inputError: swapInputErrorAlgebra,
  } = useDerivedSwapInfoMarginAlgebraClose(
    outAmount,
    tokenIn,
  )

  const [parsedAmount, trade] = useMemo(() => {

    const currTrade = tradeAlgebra
    const parsedAmount = parsedAmountAlgebra
    if (!currTrade) {
      if (LAST_VALID_TRADE_CLOSE && LAST_VALID_AMOUNT_OUT && parsedAmount && LAST_VALID_AMOUNT_OUT?.toFixed() === outAmount?.toFixed())
        return [parsedAmount, LAST_VALID_TRADE_CLOSE]
      else return [parsedAmount, undefined]
    } else {
      LAST_VALID_TRADE_CLOSE = currTrade
      LAST_VALID_AMOUNT_OUT = outAmount
      return [parsedAmount, currTrade]
    }
  }, [tradeAlgebra, outAmount])


  // const onModalDismiss = useCallback(() => {
  //   if (isOpen) setShouldLogModalCloseEvent(true)
  //   onDismiss()
  // }, [isOpen, onDismiss])

  // const modalHeader = useCallback(() => {
  //   return trade ? (
  //     <SwapModalHeader
  //       trade={trade}
  //       shouldLogModalCloseEvent={shouldLogModalCloseEvent}
  //       setShouldLogModalCloseEvent={setShouldLogModalCloseEvent}
  //       allowedSlippage={allowedSlippage}
  //       recipient={recipient}
  //       showAcceptChanges={showAcceptChanges}
  //       onAcceptChanges={onAcceptChanges}
  //     />
  //   ) : null
  // }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade, shouldLogModalCloseEvent])

  // const modalBottom = useCallback(() => {
  //   return trade ? (
  //     <AutoColumn>
  //       {hasRiskError && (
  //         <WarningText fontSize={16} fontWeight={500} textAlign="center">
  //           Your health factor might drop to {healthFactor.toLocaleString()}
  //         </WarningText>
  //       )}
  //       {hasRiskError && !acceptRisk && (
  //         <ButtonYellow
  //           height="50px"
  //           onClick={() => {
  //             setAcceptRisk(true)
  //           }}
  //           style={{ margin: '10px 0 0 0' }}
  //           id={"CONFIRM_SWAP_BUTTON"}
  //         >
  //           <Row justifyContent="center" alignItems="center">
  //             <WarningIcon width="30px" height="30px" color="" />
  //             <Text fontSize={14} fontWeight={500} color="red" marginLeft="5px">
  //               Accept: {riskMessage}
  //             </Text>
  //           </Row>
  //         </ButtonYellow>
  //       )}
  //       <SwapModalFooter
  //         onConfirm={onConfirm}
  //         trade={trade}
  //         hash={txHash}
  //         allowedSlippage={allowedSlippage}
  //         disabledConfirm={showAcceptChanges || (!acceptRisk && hasRiskError)}
  //         swapErrorMessage={swapErrorMessage}
  //         swapQuoteReceivedDate={swapQuoteReceivedDate}
  //         fiatValueInput={fiatValueInput}
  //         fiatValueOutput={fiatValueOutput}
  //       />
  //     </AutoColumn>
  //   ) : null
  // }, [
  //   onConfirm,
  //   showAcceptChanges,
  //   swapErrorMessage,
  //   trade,
  //   allowedSlippage,
  //   txHash,
  //   swapQuoteReceivedDate,
  //   fiatValueInput,
  //   fiatValueOutput,
  // ])

  // // text to show while loading
  // const pendingText = (
  //   <Trans>
  //     Swapping {trade?.inputAmount?.toSignificant(6)} {trade?.inputAmount?.currency?.symbol} for{' '}
  //     {trade?.outputAmount?.toSignificant(6)} {trade?.outputAmount?.currency?.symbol}
  //   </Trans>
  // )

  // const confirmationContent = useCallback(
  //   () =>
  //     swapErrorMessage ? (
  //       <TransactionErrorContent onDismiss={onModalDismiss} message={swapErrorMessage} />
  //     ) : (
  //       <ConfirmationModalContent
  //         title={<Trans>Confirm Swap</Trans>}
  //         onDismiss={onModalDismiss}
  //         topContent={modalHeader}
  //         bottomContent={modalBottom}
  //       />
  //     ),
  //   [onModalDismiss, modalBottom, modalHeader, swapErrorMessage]
  // )

  // useEffect(() => {
  //   if (!attemptingTxn && isOpen && txHash && trade && txHash !== lastTxnHashLogged) {
  //     setLastTxnHashLogged(txHash)
  //   }
  // }, [attemptingTxn, isOpen, txHash, trade, lastTxnHashLogged])

  // return (
  //   <TransactionConfirmationModal
  //     isOpen={isOpen}
  //     onDismiss={onModalDismiss}
  //     attemptingTxn={attemptingTxn}
  //     hash={txHash}
  //     content={confirmationContent}
  //     pendingText={pendingText}
  //     currencyToAdd={trade?.outputAmount.currency}
  //   />
  // )

  return null
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
