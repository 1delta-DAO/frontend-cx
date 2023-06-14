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
} from '../../TransactionConfirmationModal'
import SwapModalFooter from '../SwapModalFooter'
import SwapModalHeader from '../SwapModalHeader'
import { WarningIcon } from 'nft/components/icons'
import { ExtendedSlot } from 'state/slots/hooks'
import { useDerivedSwapInfoMarginAlgebraClose } from 'state/professionalTradeSelection/tradeHooks'
import { assetToId } from 'pages/Trading'
import { useChainId } from 'state/globalNetwork/hooks'
import { LendingProtocol } from 'state/1delta/actions'
import { SupportedAssets } from 'types/1delta'
import { useCurrency } from 'hooks/Tokens'
import { UniswapTrade } from 'utils/Types'
import { useWeb3React } from '@web3-react/core'
import { useGetSlotContract } from 'hooks/1delta/use1DeltaContract'
import { Dots } from '../styleds'
import SlotSummary from './SlotSummary'
import CloseModalHeader from './CloseModalHeader'
import { PairPositionRow } from 'components/TokenDetail'
import { useIsMobile } from 'hooks/useIsMobile'

const HeaderLabel = styled.div`
  color: ${({ theme }) => theme.deprecated_text1};
  position: relative;
  margin: 5px;
  font-weight: bold;
  font-size: 20px;
  opacity: 0.8;
`

const HeaderLabelDots = styled(Dots)`
  color: ${({ theme }) => theme.deprecated_text1};
  position: relative;
  font-weight: bold;
  margin: 5px;
  opacity: 0.8;
`

export const LoaderDots = (): React.ReactNode => {
  return (
    <HeaderLabelDots key={'loadingMM'} >
      Calculation closing trade
    </HeaderLabelDots>
  )
}

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
  slot?: ExtendedSlot
  isOpen: boolean
  attemptingTxn: boolean
  txHash: string | undefined
  onConfirm: () => void
  onDismiss: () => void
}) {
  const { account } = useWeb3React()

  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const [acceptRisk, setAcceptRisk] = useState(false)
  const [lastTxnHashLogged, setLastTxnHashLogged] = useState<string | null>(null)

  const chainId = useChainId()
  const [tokenInId, tokenOutId] = Boolean(slot) ? [
    assetToId(slot?.collateralSymbol as SupportedAssets, chainId, LendingProtocol.COMPOUND),
    assetToId(slot?.debtSymbol as SupportedAssets, chainId, LendingProtocol.COMPOUND)
  ] : [undefined, undefined]

  const tokenIn = useCurrency(tokenInId, LendingProtocol.COMPOUND)
  const tokenOut = useCurrency(tokenOutId, LendingProtocol.COMPOUND)
  const outAmount = tokenOut && CurrencyAmount.fromRawAmount(tokenOut, slot?.debtBalance ?? '0')

  const slotContract = useGetSlotContract(chainId, slot?.slot)

  const {
    trade: { state: tradeStateAlgebra, trade: tradeAlgebra },
    allowedSlippage,
    parsedAmount: parsedAmountAlgebra,
    inputError: swapInputErrorAlgebra,
  } = useDerivedSwapInfoMarginAlgebraClose(
    outAmount,
    tokenIn,
  )
  const isMobile = useIsMobile()

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


  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return trade ? (
      <CloseModalHeader
        trade={trade}
        shouldLogModalCloseEvent={shouldLogModalCloseEvent}
        setShouldLogModalCloseEvent={setShouldLogModalCloseEvent}
        allowedSlippage={allowedSlippage}
        recipient={account ?? ''}
        showAcceptChanges={false}
        onAcceptChanges={() => null}
      />
    ) : null
  }, [allowedSlippage, account, trade, shouldLogModalCloseEvent])

  // text to show while loading
  const pendingText = (
    <Trans>
      Swapping {trade?.inputAmount?.toSignificant(6)} {trade?.inputAmount?.currency?.symbol} for{' '}
      {trade?.outputAmount?.toSignificant(6)} {trade?.outputAmount?.currency?.symbol}
    </Trans>
  )

  const confirmationContent = useCallback(
    () => <ConfirmationModalContent
      title={Boolean(trade) ? <HeaderLabel>Close your Position
        {slot && <PairPositionRow pair={slot.pair} direction={slot?.direction} isMobile={isMobile} leverage={slot.leverage} />}
      </HeaderLabel> : <>{LoaderDots()}</>}
      onDismiss={onModalDismiss}
      topContent={modalHeader}
      bottomContent={() => <SlotSummary slot={slot} />}
    />
    ,
    [onModalDismiss, modalHeader]
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


const StyledButton = styled(ButtonLight)`
  border: 1px solid ${({ theme }) => opacify(24, theme.deprecated_error)};
  background: ${({ theme }) => theme.accentWarning};
`

const WarningText = styled(Text)`
  color: ${({ theme }) => theme.deprecated_warning};
`
