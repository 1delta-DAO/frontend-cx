import { Trans } from '@lingui/macro'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import CurrencyInputCustomList from 'components/CurrencyInputPanel/CustomListInputPanel/CurrencyInputCustomList'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import PriceImpactWarning from 'components/swap/PriceImpactWarning'
import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { MouseoverTooltip } from 'components/Tooltip'
import { MAINNET_CHAINS } from 'constants/1delta'
import { isSupportedChain } from 'constants/chains'
import { NavBarVariant, useNavBarFlag } from 'featureFlags/flags/navBar'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { filterSupportedAssets, getAaveTokens } from 'hooks/1delta/tokens'
import { useGetTradeContract } from 'hooks/1delta/use1DeltaContract'
import JSBI from 'jsbi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Text } from 'rebass'
import { useCurrentLendingProtocol, useFetchUserData, useGetCurrentAccount } from 'state/1delta/hooks'
import { useToggleWalletModal } from 'state/application/hooks'
import { useAppDispatch } from 'state/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { AaveInterestMode, Asset, MarginTradeType, OneDeltaTradeType, PositionSides, SupportedAssets } from 'types/1delta'
import { ButtonConfirmed, ButtonLight, ButtonPrimary } from 'components/Button'
import { GreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { AutoRow } from 'components/Row'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import { ArrowWrapper, Dots, PageWrapper, SwapCallbackError, SwapWrapper } from 'components/swap/styleds'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { ApprovalState } from 'hooks/useApproveCallback'
import useIsArgentWallet from 'hooks/useIsArgentWallet'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import useWrapCallback, { WrapErrorText, WrapType } from 'hooks/useWrapCallback'
import { Field } from 'state/swap/actions'
import {
  useSingleSideActionHandlers,
  useSingleSideState,
} from 'state/singleSide/hooks'
import { useExpertModeManager } from 'state/user/hooks'
import { LinkStyledButton, ThemedText } from '../../../../../theme'
import { computeFiatValuePriceImpact } from '../../../../../utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from '../../../../../utils/maxAmountSpend'
import { computeRealizedPriceImpact, warningSeverity } from '../../../../../utils/prices'
import { ArrowContainer, InputWrapper } from 'components/Wrappers/wrappers'
import { largerPercentValue } from '../../../../../utils/1delta/generalFormatters'
import SingleSideTradeHeader from '../../../../../components/ModalHeader/SingleSideTradeHeader'
import { DepositYield } from 'components/YieldDetails/YieldOptionButtons'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { useDerivedSwapInfoClientSideSingleSideBroker } from 'state/singleSide/hooks'
import { AdvancedRiskDetailsSingleSide } from 'pages/1delta/components/RiskDetails/AdvancedRiskDetailsSingleSide'
import { useTransactionAdder } from 'state/transactions/hooks'
import { MarginTradingButtonText, PositionSideKey, SwapPanelContainer } from 'components/Styles'
import { DebtOptionButtonMarginTrade } from 'pages/1delta/components/InterestRateButtons/YieldOptionButtons'
import { parseMessage } from 'constants/errors'
import { useCurrencyAmounts } from 'hooks/trade'
import { useYields } from 'hooks/trade/useYields'
import { useGeneralRiskValidation } from 'pages/1delta/hooks/riskValidation'
import { useGeneralBalanceValidation } from 'pages/1delta/hooks/balanceValidation'
import { useGetRiskParameters, useRiskChange } from 'hooks/riskParameters/useRiskParameters'
import { generateCalldata } from 'utils/calldata/generateCall'
import { TradeConfig } from 'utils/calldata/generateCall'
import { useMarginTradeApproval } from 'hooks/approval'
import { LendingProtocol } from 'state/1delta/actions'
import { currencyId } from 'utils/currencyId'
import { TransactionType } from 'state/transactions/types'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { TradeState } from 'state/routing/types'
import { useIsMobile } from 'hooks/useIsMobile'
import { ArrowDown, CheckCircle, HelpCircle } from 'react-feather'
import AddressInputPanel from 'components/AddressInputPanel'

export const AutoColumnAdjusted = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  isMobile: boolean
}>`
  ${({ isMobile }) => (!isMobile ? 'display: grid;' : '')}
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
`

const PanelContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: space-between;
  justify-content: center;
  margin: 5px;
`

const TRADE_STRING = 'SingleSideTrade'

export interface SingleSideSwapInterface {
  selectedToken0: Token
  selectedToken1: Token
  selectedAsset0: Asset
  selectedAsset1: Asset
  side: PositionSides
}

export default function GeneralSingleSideSwap({
  selectedToken0,
  selectedToken1,
  selectedAsset0,
  selectedAsset1,
  side,
}: SingleSideSwapInterface) {
  const navBarFlag = useNavBarFlag()
  const navBarFlagEnabled = navBarFlag === NavBarVariant.Enabled
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled

  const currentProtocol = useCurrentLendingProtocol()
  const baseAsset: SupportedAssets = SupportedAssets.USDC

  const { account, chainId } = useChainIdAndAccount()

  const deltaAccount = useGetCurrentAccount(chainId)

  const relevantAccount = currentProtocol === LendingProtocol.COMPOUND ? deltaAccount?.accountAddress : account

  const hasNoImplementation = useMemo(() =>
    MAINNET_CHAINS.includes(chainId) ? currentProtocol !== LendingProtocol.COMPOUND : false,
    [chainId, currentProtocol]
  )

  const restrictedTokenList = useMemo(() => {
    return getAaveTokens(chainId)
  }, [chainId])

  const isMobile = useIsMobile()

  const [sourceBorrowInterestMode, setSourceBorrowInterestMode] = useState(AaveInterestMode.STABLE)

  const [targetBorrowInterestMode, setTargetBorrowInterestMode] = useState(AaveInterestMode.STABLE)

  const theme = useTheme()

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  const [assetState, switchAssets] = useState<{ assetIn: SupportedAssets; assetOut: SupportedAssets }>({
    assetIn: selectedAsset0.id,
    assetOut: selectedAsset1.id,
  })

  const { assetIn, assetOut, tokenIn, tokenOut } = useMemo(() => {
    if (assetState.assetIn === selectedAsset0.id) return {
      assetIn: selectedAsset0,
      assetOut: selectedAsset1,
      tokenIn: selectedToken0,
      tokenOut: selectedToken1
    }
    return {
      assetIn: selectedAsset1,
      assetOut: selectedAsset0,
      tokenIn: selectedToken1,
      tokenOut: selectedToken0
    }
  }, [assetState])

  const marginTradeType = side === PositionSides.Borrow ? MarginTradeType.Debt : MarginTradeType.Collateral

  const currencyAmounts = useCurrencyAmounts(
    chainId,
    relevantAccount,
    currentProtocol,
    marginTradeType,
    assetIn,
    assetOut,
    tokenIn,
    tokenOut,
    sourceBorrowInterestMode,
    targetBorrowInterestMode,
    undefined,
    SupportedAssets.USDC
  )

  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: currencyAmounts[Field.INPUT]?.currency,
      [Field.OUTPUT]: currencyAmounts[Field.OUTPUT]?.currency,
    }),
    [currencyAmounts]
  )

  // swap state
  const { independentField, typedValue, recipient } = useSingleSideState()
  const {
    trade: { state: tradeState, trade },
    allowedSlippage,
    parsedAmount,
    inputError: swapInputError,
  } = useDerivedSwapInfoClientSideSingleSideBroker(currencyAmounts)

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const recipientAddress = recipient

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
          [Field.INPUT]: parsedAmount,
          [Field.OUTPUT]: parsedAmount,
        }
        : {
          [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
          [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
        },
    [independentField, parsedAmount, showWrap, trade]
  )

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [!trade?.swaps, TradeState.LOADING === tradeState, TradeState.SYNCING === tradeState],
    [trade, tradeState]
  )

  const fiatValueInput = useStablecoinValue(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useStablecoinValue(parsedAmounts[Field.OUTPUT])
  const stablecoinPriceImpact = useMemo(
    () => (routeIsSyncing ? undefined : computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)),
    [fiatValueInput, fiatValueOutput, routeIsSyncing]
  )

  const { onUserInput, onChangeRecipient } = useSingleSideActionHandlers()

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const [maxInput, setMaxInput] = useState(false)
  const [maxOutput, setMaxOutput] = useState(false)

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
      maxInput && setMaxInput(false)
      maxOutput && setMaxOutput(false)
    },
    [onUserInput, maxInput, maxOutput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
      maxOutput && setMaxOutput(false)
      maxInput && setMaxInput(false)
    },
    [onUserInput, maxInput, maxOutput]
  )

  const addTransaction = useTransactionAdder()

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

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }),
    [dependentField, independentField, parsedAmounts, showWrap, typedValue]
  )

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const marginTraderContract = useGetTradeContract(
    chainId,
    currentProtocol,
    OneDeltaTradeType.SingleSide,
    relevantAccount,
    baseAsset,
    false
  )

  const {
    approvalStateOfConcern,
    handleApprove,
    setApprovalSubmitted,
    showApproveFlow,
    approvalPending,
    approvalSubmitted,
    approveTokenButtonDisabled,
    abstractApproval
  } = useMarginTradeApproval(
    currentProtocol,
    relevantAccount,
    trade,
    marginTradeType,
    marginTraderContract.address,
    allowedSlippage,
    sourceBorrowInterestMode,
    baseAsset,
    hasNoImplementation
  )

  const handleSelectInterestModeSource = useCallback(() => {
    if (!assetIn?.aaveData[chainId].reserveData?.stableBorrowRateEnabled) {
      setSourceBorrowInterestMode(AaveInterestMode.VARIABLE)
      return null // no selections shall be possible
    } else {
      if (sourceBorrowInterestMode !== AaveInterestMode.VARIABLE)
        return setSourceBorrowInterestMode(AaveInterestMode.VARIABLE)
      return setSourceBorrowInterestMode(AaveInterestMode.STABLE)
    }
  }, [sourceBorrowInterestMode, assetIn])

  const handleSelectInterestModeTarget = useCallback(() => {
    if (!assetOut?.aaveData[chainId].reserveData?.stableBorrowRateEnabled) {
      setTargetBorrowInterestMode(AaveInterestMode.VARIABLE)
      return null // no selections shall be possible
    } else {
      if (targetBorrowInterestMode !== AaveInterestMode.VARIABLE)
        return setTargetBorrowInterestMode(AaveInterestMode.VARIABLE)
      return setTargetBorrowInterestMode(AaveInterestMode.STABLE)
    }
  }, [targetBorrowInterestMode, assetOut])

  const maxInputAmount: CurrencyAmount<Currency> | undefined | null = useMemo(
    () => currencyAmounts[Field.INPUT] && maxAmountSpend(currencyAmounts[Field.INPUT]),
    [currencyAmounts]
  )

  const maxOutputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyAmounts[Field.OUTPUT]),
    [currencyAmounts]
  )

  const showMaxButton =
    !maxInput && Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount)) &&
    side === PositionSides.Collateral
  const showMaxButtonOut =
    !maxOutput && Boolean(maxOutputAmount?.greaterThan(0) && !parsedAmounts[Field.OUTPUT]?.equalTo(maxOutputAmount)) &&
    side === PositionSides.Borrow


  const fetchData = useFetchUserData(
    currentProtocol,
    chainId,
    relevantAccount,
    filterSupportedAssets(trade?.inputAmount?.currency, trade?.outputAmount?.currency)
  )

  const { call, estimate } = useMemo(() => {
    const tradeConfig: TradeConfig = {
      trade,
      parsedAmount,
      recipient: relevantAccount,
      allowedSlippage,
      marginTraderContract,
      sourceBorrowInterestMode,
      targetBorrowInterestMode,
      isMaxIn: !showMaxButton,
      isMaxOut: !showMaxButtonOut,
      inIsETH: false,
      outIsETH: false,
      walletIsETH: false
    }

    return generateCalldata(
      currentProtocol,
      marginTradeType,
      relevantAccount,
      tradeConfig
    )
  }, [
    currentProtocol,
    allowedSlippage,
    parsedAmounts,
    marginTraderContract,
    sourceBorrowInterestMode,
    targetBorrowInterestMode,
    relevantAccount,
    parsedAmount,
    trade,
    showMaxButton,
    showMaxButtonOut,
    isExpertMode
  ])


  const handleSwap = useCallback(async () => {
    if (!trade) {
      return
    }
    if (stablecoinPriceImpact && !confirmPriceImpactWithoutFee(stablecoinPriceImpact)) {
      return
    }

    // estimate gas 
    let gasEstimate: any = undefined
    try {
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
    const opts = gasEstimate ? { gasLimit: calculateGasMargin(gasEstimate) } : {}

    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    if (call)
      await call(opts)
        .then((txResponse) => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: txResponse.hash,
          })

          if (trade)
            addTransaction(
              txResponse,
              trade.tradeType === TradeType.EXACT_INPUT
                ? {
                  protocol: currentProtocol,
                  type: TransactionType.SINGLE_SIDE,
                  subType: side,
                  tradeType: TradeType.EXACT_INPUT,
                  inputCurrencyId: currencyId(trade.inputAmount.currency),
                  inputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                  expectedOutputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                  outputCurrencyId: currencyId(trade.outputAmount.currency),
                  minimumOutputCurrencyAmountRaw: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
                }
                : {
                  protocol: currentProtocol,
                  type: TransactionType.SINGLE_SIDE,
                  subType: side,
                  tradeType: TradeType.EXACT_OUTPUT,
                  inputCurrencyId: currencyId(trade.inputAmount.currency),
                  maximumInputCurrencyAmountRaw: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
                  outputCurrencyId: currencyId(trade.outputAmount.currency),
                  outputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                  expectedInputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                }
            )

          fetchData()
        })
        .catch((error) => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            // rejection in the wallet has a different nesting
            swapErrorMessage: parseMessage(error),
            txHash: undefined,
          })
        })
  }, [
    stablecoinPriceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    relevantAccount,
    trade?.inputAmount?.currency?.symbol,
    trade?.outputAmount?.currency?.symbol,
  ])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const [swapQuoteReceivedDate, setSwapQuoteReceivedDate] = useState<Date | undefined>()

  // warnings on the greater of fiat value price impact and execution price impact
  const { priceImpactSeverity, largerPriceImpact } = useMemo(() => {
    const marketPriceImpact = trade?.priceImpact ? computeRealizedPriceImpact(trade) : undefined
    const largerPriceImpact = largerPercentValue(marketPriceImpact, stablecoinPriceImpact)
    return { priceImpactSeverity: warningSeverity(largerPriceImpact), largerPriceImpact }
  }, [stablecoinPriceImpact, trade])

  const isArgentWallet = useIsArgentWallet()

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleSwitchAssets = useCallback(() => {
    setMaxInput(false)
    setMaxOutput(false)
    return switchAssets({ assetIn: assetState.assetOut, assetOut: assetState.assetIn })
  }, [assetState])

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
    !maxInput && setMaxInput(true)
    maxOutput && setMaxOutput(false)
  }, [maxInputAmount, onUserInput, maxInput, maxOutput])


  const handleMaxOutput = useCallback(() => {
    maxOutputAmount && onUserInput(Field.OUTPUT, maxOutputAmount.toExact())
    !maxOutput && setMaxOutput(true)
    maxInput && setMaxInput(false)
  }, [maxOutputAmount, onUserInput, maxInput, maxOutput])

  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode
  const showPriceImpactWarning = largerPriceImpact && priceImpactSeverity > 3

  const { asset0Yields: assetInYields, asset1Yields: assetOutYields } = useYields(chainId, assetIn, assetOut, currentProtocol)

  const [hasStableRateIn, hasStableRateOut] = useMemo(() => {
    if (currentProtocol === LendingProtocol.AAVE)
      return [
        assetIn?.aaveData[chainId].reserveData?.stableBorrowRateEnabled ?? false,
        assetOut?.aaveData[chainId].reserveData?.stableBorrowRateEnabled ?? false,
      ]
    else return [false, false]
  }, [assetIn, assetOut, chainId])

  useEffect(() => {
    if (!hasStableRateIn) {
      setSourceBorrowInterestMode(AaveInterestMode.VARIABLE)
    }
    if (!hasStableRateOut) {
      setTargetBorrowInterestMode(AaveInterestMode.VARIABLE)
    }
  }, [hasStableRateIn, hasStableRateOut])


  const riskParameters = useGetRiskParameters(chainId, currentProtocol, relevantAccount, baseAsset)

  const { riskChange, tradeImpact } = useRiskChange(
    assetIn,
    assetOut,
    currentProtocol,
    riskParameters,
    marginTradeType,
    trade,
    sourceBorrowInterestMode,
    targetBorrowInterestMode
  )

  const [riskErrorText, hasRiskError, hf] = useGeneralRiskValidation(riskChange, marginTradeType, isExpertMode)


  const [balanceErrorText, hasBalanceError] = useGeneralBalanceValidation(
    relevantAccount,
    currencyAmounts,
    parsedAmount,
    marginTradeType,
    trade
  )

  const [validatedSwapText, buttonDisabled,] = useMemo(() => {
    if (hasNoImplementation) return ['Coming Soon!', true]

    if (Boolean(relevantAccount)) {

      if (balanceErrorText) return [balanceErrorText, true]
      if (swapInputError) return [swapInputError, true]
      if (riskErrorText && hf < 1.05) {
        if (hf >= 1) {
          return [riskErrorText, false]
        }
        // for a critical violation we disable the button
        return [riskErrorText, true]
      }
      if (routeIsSyncing || routeIsLoading) return [<Dots key={'loadingMS'}>Calculating Trade</Dots>, true]

      if (priceImpactSeverity > 2) return ['Swap Anyway', false]

      if (priceImpactTooHigh) return ['Price Impact Too High', true]

      switch (marginTradeType) {
        case MarginTradeType.Collateral: {
          return ['Swap Collaterals', false]
        }
        case MarginTradeType.Debt: {
          return ['Swap Debts', false]
        }
      }
    }

    return ['Create a 1delta Account to trade!', true]
  }, [
    routeIsLoading,
    routeIsSyncing,
    priceImpactTooHigh,
    priceImpactSeverity,
    riskErrorText,
    balanceErrorText,
    hf,
  ])

  return (
    <>
      <PageWrapper redesignFlag={redesignFlagEnabled} navBarFlag={navBarFlagEnabled}>
        <SwapWrapper id="swap-page" redesignFlag={redesignFlagEnabled}>
          <SingleSideTradeHeader allowedSlippage={allowedSlippage} side={side} />
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
            swapQuoteReceivedDate={swapQuoteReceivedDate}
            fiatValueInput={fiatValueInput}
            fiatValueOutput={fiatValueOutput}
          />
          {relevantAccount && (
            <PanelContainer>
              <AdvancedRiskDetailsSingleSide
                tradeImpact={riskChange}
                allowedSlippage={allowedSlippage}
                noTrade={!typedValue}
                isMobile={isMobile}
              />
            </PanelContainer>
          )}
          <AutoColumnAdjusted gap={'0px'} isMobile={isMobile}>
            <div style={{ display: 'relative' }}>
              <SwapPanelContainer redesignFlag={redesignFlagEnabled}>
                {side === PositionSides.Borrow ? (
                  <>
                    <PositionSideKey textAlign={'left'}>
                      <MouseoverTooltip text={'The asset configuration to borrow.'}>
                        Borrow
                      </MouseoverTooltip>
                    </PositionSideKey>
                    <DebtOptionButtonMarginTrade
                      handleSelectInterestMode={handleSelectInterestModeSource}
                      hasStableBorrow={hasStableRateIn}
                      borrowRateStable={assetInYields.borrowStableYield}
                      borrowRateVariable={assetInYields.borrowYield}
                      selectedBorrowInterestMode={sourceBorrowInterestMode}
                      isMobile={isMobile}
                    />
                  </>
                ) : (
                  <>
                    <PositionSideKey textAlign={'left'}>
                      <MouseoverTooltip
                        text={
                          'The asset configuration to withdraw. Make sure that you approved the respective interest bearing token.'
                        }
                      >
                        Withdraw
                      </MouseoverTooltip>
                    </PositionSideKey>
                    <DepositYield liquidityRate={assetInYields.supplyYield} isMobile={isMobile} />
                  </>
                )}
                <InputWrapper redesignFlag={redesignFlagEnabled}>
                  <CurrencyInputCustomList
                    providedTokenList={restrictedTokenList}
                    label={
                      independentField === Field.OUTPUT && !showWrap ? (
                        <Trans>From (at most)</Trans>
                      ) : (
                        <Trans>From</Trans>
                      )
                    }
                    value={formattedAmounts[Field.INPUT]}
                    showMaxButton={showMaxButton}
                    currency={currencyAmounts[Field.INPUT]?.currency}
                    onUserInput={handleTypeInput}
                    onMax={handleMaxInput}
                    fiatValue={fiatValueInput ?? undefined}
                    otherCurrency={null}
                    showCommonBases={true}
                    id={"CURRENCY_INPUT_PANEL"}
                    loading={independentField === Field.OUTPUT && routeIsSyncing}
                    providedCurrencyBalance={currencyAmounts[Field.INPUT]}
                    balanceText={
                      side === PositionSides.Borrow
                        ? sourceBorrowInterestMode === AaveInterestMode.STABLE
                          ? 'Your stable debt'
                          : sourceBorrowInterestMode === AaveInterestMode.VARIABLE
                            ? 'Your variable debt'
                            : ' No debt of any kind'
                        : 'Your deposits'
                    }
                  />
                </InputWrapper>
              </SwapPanelContainer>
              <ArrowWrapper clickable={isSupportedChain(chainId)} redesignFlag={redesignFlagEnabled}>
                {redesignFlagEnabled ? (
                  <ArrowContainer
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      handleSwitchAssets()
                    }}
                    color={theme.textPrimary}
                  >
                    <ArrowDown size="16" color={theme.deprecated_text2} />
                  </ArrowContainer>
                ) : (
                  <ArrowContainer
                    onClick={() => {
                      handleSwitchAssets()
                      setApprovalSubmitted(false)
                    }}
                  >
                    <ArrowDown size="16" color={theme.deprecated_text2} />
                  </ArrowContainer>
                )}
              </ArrowWrapper>
            </div>
            <div>
              <AutoColumnAdjusted gap={redesignFlagEnabled ? '12px' : '8px'} isMobile={isMobile}>
                <SwapPanelContainer redesignFlag={redesignFlagEnabled}>
                  {side === PositionSides.Borrow ? (
                    <>
                      <PositionSideKey textAlign={'left'}>
                        <MouseoverTooltip text={'The asset configuration to repay.'}>
                          Repay To
                        </MouseoverTooltip>
                      </PositionSideKey>
                      <DebtOptionButtonMarginTrade
                        handleSelectInterestMode={handleSelectInterestModeTarget}
                        hasStableBorrow={hasStableRateOut}
                        borrowRateStable={assetOutYields.borrowStableYield}
                        borrowRateVariable={assetOutYields.borrowYield}
                        selectedBorrowInterestMode={targetBorrowInterestMode}
                        isMobile={isMobile}
                      />
                    </>
                  ) : (
                    <>
                      <PositionSideKey textAlign={'left'}>
                        <MouseoverTooltip text={'The asset configuration to supply as collateral.'}>
                          Supply
                        </MouseoverTooltip>
                      </PositionSideKey>
                      <DepositYield liquidityRate={assetOutYields.supplyYield} isMobile={isMobile} />
                    </>
                  )}
                  <InputWrapper redesignFlag={redesignFlagEnabled}>
                    <CurrencyInputCustomList
                      providedTokenList={restrictedTokenList}
                      value={formattedAmounts[Field.OUTPUT]}
                      onUserInput={handleTypeOutput}
                      label={
                        independentField === Field.INPUT && !showWrap ? (
                          <Trans>To (at least)</Trans>
                        ) : (
                          <Trans>To</Trans>
                        )
                      }
                      showMaxButton={showMaxButtonOut}
                      onMax={handleMaxOutput}
                      hideBalance={false}
                      fiatValue={fiatValueOutput ?? undefined}
                      priceImpact={stablecoinPriceImpact}
                      currency={currencyAmounts[Field.OUTPUT]?.currency} //{currencies[Field.OUTPUT] ?? null}
                      providedCurrencyBalance={currencyAmounts[Field.OUTPUT]}
                      balanceText={
                        side === PositionSides.Borrow
                          ? targetBorrowInterestMode === AaveInterestMode.STABLE
                            ? 'Your stable debt'
                            : targetBorrowInterestMode === AaveInterestMode.VARIABLE
                              ? 'Your variable debt'
                              : ' No debt of any kind'
                          : 'Your deposits'
                      }
                      // onCurrencySelect={null}
                      otherCurrency={null}
                      showCommonBases={true}
                      id={"CURRENCY_OUTPUT_PANEL"}
                      loading={independentField === Field.INPUT && routeIsSyncing}
                    />
                  </InputWrapper>
                </SwapPanelContainer>

                {recipient !== null && !showWrap ? (
                  <>
                    <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                      <ArrowWrapper clickable={false} redesignFlag={redesignFlagEnabled}>
                        <ArrowDown size="16" color={theme.deprecated_text2} />
                      </ArrowWrapper>
                      <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                        <Trans>- Remove recipient</Trans>
                      </LinkStyledButton>
                    </AutoRow>
                    <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                  </>
                ) : null}
                {!showWrap && userHasSpecifiedInputOutput && (trade || routeIsLoading || routeIsSyncing) && (
                  <SwapDetailsDropdown
                    trade={trade}
                    syncing={routeIsSyncing}
                    loading={routeIsLoading}
                    showInverted={showInverted}
                    setShowInverted={setShowInverted}
                    allowedSlippage={allowedSlippage}
                  />
                )}
                {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />}
                <div>
                  {swapIsUnsupported ? (
                    <ButtonPrimary disabled={true}>
                      <ThemedText.DeprecatedMain mb="4px">
                        <Trans>Unsupported Asset</Trans>
                      </ThemedText.DeprecatedMain>
                    </ButtonPrimary>
                  ) : !account ? (
                    <ButtonLight onClick={toggleWalletModal} redesignFlag={redesignFlagEnabled}>
                      <Trans>Connect Wallet</Trans>
                    </ButtonLight>
                  ) : showWrap ? (
                    <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                      {wrapInputError ? (
                        <WrapErrorText wrapInputError={wrapInputError} />
                      ) : wrapType === WrapType.WRAP ? (
                        <Trans>Wrap</Trans>
                      ) : wrapType === WrapType.UNWRAP ? (
                        <Trans>Unwrap</Trans>
                      ) : null}
                    </ButtonPrimary>
                  ) : routeNotFound && userHasSpecifiedInputOutput && !routeIsLoading && !routeIsSyncing ? (
                    <GreyCard style={{ textAlign: 'center' }}>
                      <ThemedText.DeprecatedMain mb="4px">
                        <Trans>Insufficient liquidity for this trade.</Trans>
                      </ThemedText.DeprecatedMain>
                    </GreyCard>
                  ) : showApproveFlow ? (
                    <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }} gap={'5px'}>
                      <AutoColumn style={{ width: '100%' }} gap="12px">
                        <ButtonConfirmed
                          onClick={handleApprove}
                          disabled={approveTokenButtonDisabled}
                          width="100%"
                          altDisabledStyle={approvalStateOfConcern === ApprovalState.PENDING} // show solid button while waiting
                          confirmed={
                            approvalStateOfConcern === ApprovalState.APPROVED
                          }
                        >
                          <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }} height="20px">
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              {/* we need to shorten this string on mobile */}
                              {approvalStateOfConcern === ApprovalState.APPROVED ? (
                                <MarginTradingButtonText>
                                  {side === PositionSides.Collateral
                                    ? `You can now swap your collaterals`
                                    : `You can now swap your debts`}
                                </MarginTradingButtonText>
                              ) : (
                                <MarginTradingButtonText>
                                  {side === PositionSides.Collateral
                                    ? abstractApproval
                                      ? `Allow your 1delta account to deposit ${currencies[Field.OUTPUT]?.symbol}`
                                      : `Allow withdrawing ${currencies[Field.INPUT]?.symbol}`
                                    : abstractApproval
                                      ? `Allow your 1delta account to repay ${currencies[Field.OUTPUT]?.symbol}` :
                                      `Allow borrowing ${currencies[Field.INPUT]?.symbol}`}
                                </MarginTradingButtonText>
                              )}
                            </span>
                            {approvalPending || approvalStateOfConcern === ApprovalState.PENDING ? (
                              <Loader stroke={theme.white} />
                            ) : (approvalSubmitted && approvalStateOfConcern === ApprovalState.APPROVED) ? (
                              <CheckCircle size="20" color={theme.deprecated_green1} />
                            ) : (
                              <MouseoverTooltip
                                text={
                                  <Trans>
                                    You must give the 1delta smart contracts permission to use your{' '}
                                    {currencies[Field.INPUT]?.symbol}. You only have to do this once per token.
                                  </Trans>
                                }
                              >
                                <HelpCircle size="20" color={theme.deprecated_white} style={{ marginLeft: '8px' }} />
                              </MouseoverTooltip>
                            )}
                          </AutoRow>
                        </ButtonConfirmed>
                        <ButtonPrimary
                          onClick={() => {
                            if (isExpertMode) {
                              handleSwap()
                            } else {
                              setSwapState({
                                tradeToConfirm: trade,
                                attemptingTxn: false,
                                swapErrorMessage: undefined,
                                showConfirm: true,
                                txHash: undefined,
                              })
                            }
                          }}
                          width="100%"
                          id="swap-button"
                          disabled={
                            routeIsSyncing ||
                            routeIsLoading ||
                            (approvalStateOfConcern !== ApprovalState.APPROVED) ||
                            buttonDisabled
                          }
                        >
                          <Text fontSize={16} fontWeight={500}>
                            {validatedSwapText}
                          </Text>
                        </ButtonPrimary>
                      </AutoColumn>
                    </AutoRow>
                  ) : (
                    <ButtonPrimary
                      onClick={() => {
                        if (isExpertMode) {
                          handleSwap()
                        } else {
                          setSwapState({
                            tradeToConfirm: trade,
                            attemptingTxn: false,
                            swapErrorMessage: undefined,
                            showConfirm: true,
                            txHash: undefined,
                          })
                        }
                      }}
                      id="swap-button"
                      disabled={
                        routeIsSyncing || routeIsLoading || priceImpactTooHigh ||
                        buttonDisabled
                      }
                    >
                      <Text fontSize={16} fontWeight={500}>
                        {validatedSwapText}
                      </Text>
                    </ButtonPrimary>
                  )}
                  {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                </div>
              </AutoColumnAdjusted>
            </div>
          </AutoColumnAdjusted>
        </SwapWrapper>
        <NetworkAlert isColumn />
      </PageWrapper>
      <SwitchLocaleLink />
      {
        !swapIsUnsupported ? null : (
          <UnsupportedCurrencyFooter
            show={swapIsUnsupported}
            currencies={[currencies[Field.INPUT], currencies[Field.OUTPUT]]}
          />
        )
      }
    </>
  )
}
