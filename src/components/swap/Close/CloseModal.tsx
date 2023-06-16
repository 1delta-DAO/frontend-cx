import { Trans } from '@lingui/macro'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
} from '../../TransactionConfirmationModal'
import { ExtendedSlot } from 'state/slots/hooks'
import { useDerivedSwapInfoMarginAlgebraClose } from 'state/professionalTradeSelection/tradeHooks'
import { assetToId, TradeAction } from 'pages/Trading'
import { useChainId } from 'state/globalNetwork/hooks'
import { LendingProtocol } from 'state/1delta/actions'
import { SupportedAssets } from 'types/1delta'
import { useCurrency } from 'hooks/Tokens'
import { UniswapTrade } from 'utils/Types'
import { useWeb3React } from '@web3-react/core'
import { useGetSlotContract } from 'hooks/1delta/use1DeltaContract'
import { Dots } from '../styleds'
import SlotSummary, { toNumber } from './SlotSummary'
import CloseModalHeader from './CloseModalHeader'
import { PairPositionRow } from 'components/TokenDetail'
import { useIsMobile } from 'hooks/useIsMobile'
import { createSlotCalldata } from 'utils/calldata/compound/slotMethodCreator'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { parseMessage } from 'constants/errors'
import { fetchUserSlots } from 'state/slots/fetchUserSlots'
import { useAppDispatch } from 'state/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from "state/transactions/types";
import { currencyId } from 'utils/currencyId'

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
  onConfirm,
  onDismiss,
  isOpen,
}: {
  slot?: ExtendedSlot
  isOpen: boolean
  onConfirm: () => void
  onDismiss: () => void
}) {
  const { account } = useWeb3React()

  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.

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
  }, [tradeAlgebra, outAmount, tokenInId, tokenOutId, slot])


  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade<Currency, Currency, TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const onModalDismiss = useCallback(() => {
    onDismiss()
    setSwapState({
      attemptingTxn,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage,
      txHash: undefined,
    })
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return trade ? (
      <CloseModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        recipient={account ?? ''}
        showAcceptChanges={false}
        onAcceptChanges={() => null}
      />
    ) : null
  }, [allowedSlippage, account, trade, slot])

  // text to show while loading
  const pendingText = (
    <Trans>
      Swapping {trade?.inputAmount?.toSignificant(6)} {trade?.inputAmount?.currency?.symbol} for{' '}
      {trade?.outputAmount?.toSignificant(6)} {trade?.outputAmount?.currency?.symbol}
    </Trans>
  )

  const addTransaction = useTransactionAdder()
  const dispatch = useAppDispatch()

  const onClose = useCallback(async () => {
    if (!trade) return null
    const { estimate, call } = createSlotCalldata(
      TradeAction.CLOSE,
      trade.outputAmount,
      trade,
      allowedSlippage,
      slotContract,
      account)

    if (call) {
      // estimate gas 
      let gasEstimate: any = undefined
      try {
        setSwapState({
          attemptingTxn: true,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: undefined,
        })
        gasEstimate = await estimate()
      } catch (error) {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      }
      const opts = gasEstimate ? {
        gasLimit: calculateGasMargin(gasEstimate),
      } : {}
      try {
        await call(opts)
          .then((txResponse) => {
            setSwapState({
              attemptingTxn: false,
              tradeToConfirm,
              showConfirm,
              swapErrorMessage: undefined,
              txHash: txResponse.hash,
            })
            if (trade && slot)
              addTransaction(
                txResponse,
                {
                  type: TransactionType.LEVERAGED_POSITION,
                  direction: slot.direction,
                  tradeAction: TradeAction.CLOSE,
                  collateralCurrencyId: currencyId(trade.inputAmount.currency),
                  debtCurrencyId: trade.outputAmount.toExact(),
                  providedCurrencyId: currencyId(trade.inputAmount.currency),
                  slot: '',
                  collateralAmountRaw: trade.outputAmount.toExact(),
                  debtAmountRaw: trade.inputAmount.toExact(),
                  providedAmountRaw: String(
                    Number(
                      toNumber(slot.collateralBalance, slot.collateralDecimals)) -
                    Number(trade.inputAmount.toExact())
                  ),
                }
              )
            dispatch(fetchUserSlots({ chainId, account }))

          }
          )
      } catch (e) {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          // rejection in the wallet has a different nesting
          swapErrorMessage: parseMessage(e),
          txHash: undefined,
        })
      }
    }
    return null
  },
    [trade, slot, tokenInId, tokenOutId, chainId]
  )

  const confirmationContent = useCallback(
    () => <ConfirmationModalContent
      title={Boolean(trade) ? <HeaderLabel>Close your Position
        {slot && <PairPositionRow
          pair={slot.pair}
          direction={slot?.direction}
          isMobile={isMobile}
          leverage={slot.leverage}
        />}
      </HeaderLabel> : <>{LoaderDots()}</>}
      onDismiss={onModalDismiss}
      topContent={modalHeader}
      bottomContent={() => <SlotSummary
        slot={slot}
        onClose={onClose}
        buttonDisabled={!Boolean(trade)}
      />}
    />,
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
