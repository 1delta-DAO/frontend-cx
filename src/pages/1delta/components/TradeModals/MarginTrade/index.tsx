import { Trans } from '@lingui/macro'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import CurrencyInputCustomListCollateral from 'components/CurrencyInputPanel/CustomListInputPanel/CurrencyInputCustomListLeft'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import PriceImpactWarning from 'components/swap/PriceImpactWarning'
import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { MouseoverTooltip } from 'components/Tooltip'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { getAaveTokens, safeGetToken } from 'hooks/1delta/tokens'
import { useGetTradeContract } from 'hooks/1delta/use1DeltaContract'
import JSBI from 'jsbi'
import { useCallback, useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CheckCircle, HelpCircle } from 'react-feather'
import { Text } from 'rebass'
import { fetchAAVEUserReserveDataAsync } from 'state/1delta/aave/fetchAAVEUserData'
import { useAsset, useCurrentLendingProtocol, useDeltaAssetState, useFetchUserData, useGetCurrentAccount } from 'state/1delta/hooks'
import { useToggleWalletModal } from 'state/application/hooks'
import { useAppDispatch } from 'state/hooks'
import { TradeState } from 'state/routing/types'
import {
  AaveInterestMode,
  Asset,
  MarginTradeType,
  OneDeltaTradeType,
  PositionSides,
  SupportedAssets,
} from 'types/1delta'

import AddressInputPanel from 'components/AddressInputPanel'
import { ButtonConfirmed, ButtonLight, ButtonPrimary } from 'components/Button'
import { GreyCard } from 'components/Card'
import Loader from 'components/Loader'
import { AutoRow } from 'components/Row'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from 'components/swap/ConfirmMarginTradeModal'
import { ArrowWrapper, Dots, SwapCallbackError } from 'components/swap/styleds'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import useWrapCallback, { WrapErrorText, WrapType } from 'hooks/useWrapCallback'
import { Field, switchCurrencies } from 'state/swap/actions'
import {
  useDerivedSwapInfoClientSideV3ProvidedCcyBroker,
  useSwapActionHandlers,
  useSwapState,
} from 'state/swap/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { useExpertModeManager } from 'state/user/hooks'
import { LinkStyledButton, ThemedText } from '../../../../../theme'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { computeRealizedPriceImpact, warningSeverity } from 'utils/prices'
import { InputWrapper } from 'components/Wrappers/wrappers'
import { largerPercentValue } from 'utils/1delta/generalFormatters'
import MarginTradeHeader from '../../Header/MarginTradeHeader'
import CurrencyInputCustomListDebt from 'components/CurrencyInputPanel/CustomListInputPanel/CurrencyInputCustomListRight'
import { YieldDetailsMarginTrade } from 'components/YieldDetails/YieldImpactDetails'
import { useIsMobile } from 'hooks/useIsMobile'
import { DebtOptionButtonMarginTrade, DepositYieldMarginTrade } from '../../InterestRateButtons/YieldOptionButtons'
import { Z_INDEX } from 'theme/zIndex'
import { MAINNET_CHAINS, toLenderText } from 'constants/1delta'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { AdvancedRiskDetails } from 'pages/1delta/components/RiskDetails/AdvancedRiskDetails'
import { useTransactionAdder } from 'state/transactions/hooks'
import { currencyId } from 'utils/currencyId'
import { TransactionType } from 'state/transactions/types'
import { AutoColumnAdjusted, MarginTradeArrowWrapper, MarginTradingButtonText, PanelContainer, PositionSideKey, SwapPanelContainer } from 'components/Styles'
import { parseMessage } from 'constants/errors'
import { useCurrencyAmounts } from 'hooks/trade'
import { useYield } from 'hooks/trade/useYields'
import { useGeneralBalanceValidation } from 'pages/1delta/hooks/balanceValidation'
import { useGeneralRiskValidation } from 'pages/1delta/hooks/riskValidation'
import { LendingProtocol } from 'state/1delta/actions'
import { useGetRiskParameters, useRiskChange } from 'hooks/riskParameters/useRiskParameters'
import { generateCalldata, TradeConfig } from 'utils/calldata/generateCall'
import { useMarginTradeApproval } from 'hooks/approval'


// Mostly copied from `AppBody` but it was getting too hard to maintain backwards compatibility.
export const SwapWrapper = styled.main<{ margin?: string; maxWidth?: string; redesignFlag: boolean }>`
  position: relative;
  background: ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundSurface : theme.deprecated_bg0)};
  border-radius: ${({ redesignFlag }) => (redesignFlag ? '16px' : '24px')};
  border: 1px solid ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundOutline : 'transparent')};
  padding: 8px;
  width: 100%;
  z-index: ${Z_INDEX.deprecated_content};
`


export const YieldRowLeft = styled.div<{ marked: boolean }>`
  margin-right: 10px;
  flex-direction: row;
  display: flex;
  width: 100%;
  justify-content: space-between;
  ${({ marked }) =>
    marked
      ? `

  `
      : ''}
`

export const SelfCenteredText = styled.div`
  align-self: center;
`

export const YieldRowRight = styled.div<{ marked: boolean }>`
  margin-left: 10px;
  flex-direction: row;
  display: flex;
  width: 100%;
  justify-content: space-between;
  ${({ marked }) =>
    marked
      ? `

  `
      : ''}
`


const InputPaneContainer = styled.div`
  width: 50%;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 100%;
`};

`

export const getField = (_marginTradeType: MarginTradeType, _position: PositionSides): Field => {
  if (_marginTradeType === MarginTradeType.Open)
    if (_position === PositionSides.Collateral) {
      return Field.OUTPUT
    } else {
      return Field.INPUT
    }
  else {
    if (_position === PositionSides.Borrow) {
      return Field.OUTPUT
    } else {
      return Field.INPUT
    }
  }
}

export interface MarginTradeInterface {
  selectedAssetCollateral: Token
  selectedAssetBorrow: Token
  assetCollateralSide: Asset
  assetBorrowSide: Asset
}

export default function GeneralMarginTrade({
  selectedAssetCollateral,
  selectedAssetBorrow,
  assetCollateralSide,
  assetBorrowSide
}: MarginTradeInterface) {
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const { account, chainId } = useChainIdAndAccount()

  const baseAsset: SupportedAssets = SupportedAssets.USDC

  const currentProtocol = useCurrentLendingProtocol()

  const deltaAccount = useGetCurrentAccount(chainId)
  const relevantAccount = currentProtocol === LendingProtocol.COMPOUND ? deltaAccount?.accountAddress : account

  const hasNoImplementation = useMemo(() =>
    MAINNET_CHAINS.includes(chainId) ? currentProtocol !== LendingProtocol.COMPOUND : false,
    [chainId, currentProtocol]
  )

  const isMobile = useIsMobile()

  const restrictedTokenList = useMemo(() => {
    return getAaveTokens(chainId)
  }, [chainId])

  const dispatch = useAppDispatch()

  const [selectedBorrowInterestMode, setBorrowInterestMode] = useState(AaveInterestMode.VARIABLE)

  const theme = useTheme()

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  const [marginTradeType, switchMarginTradeType] = useState(MarginTradeType.Open)

  // inverse mapping: trade side to position side
  const [positionState, switchPositions] = useState<{ sideIn: PositionSides; sideOut: PositionSides }>({
    sideIn: PositionSides.Borrow,
    sideOut: PositionSides.Collateral,
  })

  // switches the trade type and reassigns sideIn and sideOut for route calculation
  const handleSwitchMarginTradeType = useCallback(() => {
    dispatch(switchCurrencies())
    if (marginTradeType === MarginTradeType.Open) {
      switchMarginTradeType(MarginTradeType.Trim)
    } else {
      switchMarginTradeType(MarginTradeType.Open)
    }
    switchPositions({ sideIn: positionState.sideOut, sideOut: positionState.sideIn })
  }, [positionState])

  const [fieldCollateral, fieldDebt] = useMemo(() => {
    return [getField(marginTradeType, PositionSides.Collateral), getField(marginTradeType, PositionSides.Borrow)]
  }, [marginTradeType])

  const baseAssetData = useAsset(baseAsset)

  const [assetIn, assetOut, tokenIn, tokenOut] = useMemo(() => {
    if (currentProtocol === LendingProtocol.COMPOUNDV3) {
      if (marginTradeType === MarginTradeType.Open)
        return [baseAssetData, assetCollateralSide, safeGetToken(chainId, baseAssetData.id, currentProtocol), selectedAssetCollateral]
      return [assetCollateralSide, baseAssetData, selectedAssetCollateral, safeGetToken(chainId, baseAssetData.id, currentProtocol)]
    }
    if (marginTradeType === MarginTradeType.Open)
      return [assetBorrowSide, assetCollateralSide, selectedAssetBorrow, selectedAssetCollateral]
    return [assetCollateralSide, assetBorrowSide, selectedAssetCollateral, selectedAssetBorrow]
  },
    [assetBorrowSide, assetCollateralSide, selectedAssetBorrow, selectedAssetCollateral, baseAssetData.id, currentProtocol, chainId]
  )


  const currencyAmounts = useCurrencyAmounts(
    chainId,
    relevantAccount,
    currentProtocol,
    marginTradeType,
    assetCollateralSide,
    currentProtocol === LendingProtocol.COMPOUNDV3 ? baseAssetData : assetBorrowSide,
    selectedAssetCollateral,
    selectedAssetBorrow,
    selectedBorrowInterestMode,
    selectedBorrowInterestMode,
    undefined,
    baseAsset,
    true
  )

  const hasStableBorrow = useMemo(() => {
    return currentProtocol === LendingProtocol.AAVE ?
      assetBorrowSide.aaveData[chainId].reserveData?.stableBorrowRateEnabled ?? false
      : false
  }, [assetBorrowSide, chainId])

  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => {
      return {
        [Field.INPUT]: currencyAmounts[Field.INPUT]?.currency,
        [Field.OUTPUT]: currencyAmounts[Field.OUTPUT]?.currency,
      }
    },
    [currencyAmounts]
  )

  const addTransaction = useTransactionAdder()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    trade: { state: tradeState, trade },
    allowedSlippage,
    parsedAmount,
    inputError: swapInputError,
  } = useDerivedSwapInfoClientSideV3ProvidedCcyBroker(currencyAmounts)

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

  const { onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const [maxDebt, setMaxDebt] = useState(false)
  const [maxCollateral, setMaxCollateral] = useState(false)

  const handleTypeCollateral = useCallback(
    (value: string) => {
      onUserInput(fieldCollateral, value)
      maxCollateral && setMaxCollateral(false)
      maxDebt && setMaxDebt(false)
    },
    [onUserInput, fieldCollateral, maxDebt, maxCollateral]
  )
  const handleTypeDebt = useCallback(
    (value: string) => {
      onUserInput(fieldDebt, value)
      maxDebt && setMaxDebt(false)
      maxCollateral && setMaxCollateral(false)
    },
    [onUserInput, fieldDebt, maxDebt, maxCollateral]
  )

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

  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }
  }, [dependentField, independentField, parsedAmounts, showWrap, typedValue, marginTradeType])

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const marginTraderContract = useGetTradeContract(
    chainId,
    currentProtocol,
    OneDeltaTradeType.MarginSwap,
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
    selectedBorrowInterestMode,
    baseAsset,
    hasNoImplementation
  )

  const handleSelectInterestMode = useCallback(() => {
    if (!hasStableBorrow) {
      setBorrowInterestMode(AaveInterestMode.VARIABLE)
      return null // no selections shall be possible
    }

    if (selectedBorrowInterestMode !== AaveInterestMode.VARIABLE)
      return setBorrowInterestMode(AaveInterestMode.VARIABLE)
    return setBorrowInterestMode(AaveInterestMode.STABLE)
  }, [selectedBorrowInterestMode, hasStableBorrow])


  const { call, estimate } = useMemo(() => {
    const tradeConfig: TradeConfig = {
      trade,
      parsedAmount,
      recipient: relevantAccount,
      allowedSlippage,
      marginTraderContract,
      sourceBorrowInterestMode: selectedBorrowInterestMode,
      targetBorrowInterestMode: selectedBorrowInterestMode,
      isMaxIn: maxCollateral,
      isMaxOut: maxDebt,
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
    parsedAmounts,
    marginTraderContract,
    selectedBorrowInterestMode,
    relevantAccount,
    parsedAmount,
    trade,
    maxCollateral,
    maxDebt,
    isExpertMode
  ])

  const fetchData = useFetchUserData(currentProtocol, chainId, relevantAccount, [assetBorrowSide.id, assetCollateralSide.id])

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
                  protocol: toLenderText(currentProtocol, chainId),
                  type: TransactionType.MARGIN_TRADE,
                  subType: marginTradeType,
                  tradeType: TradeType.EXACT_INPUT,
                  inputCurrencyId: currencyId(trade.inputAmount.currency),
                  inputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                  expectedOutputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                  outputCurrencyId: currencyId(trade.outputAmount.currency),
                  minimumOutputCurrencyAmountRaw: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
                }
                : {
                  protocol: toLenderText(currentProtocol, chainId),
                  type: TransactionType.MARGIN_TRADE,
                  subType: marginTradeType,
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
    account,
    trade?.inputAmount?.currency?.symbol,
    trade?.outputAmount?.currency?.symbol,
  ])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on the greater of fiat value price impact and execution price impact
  const { priceImpactSeverity, largerPriceImpact } = useMemo(() => {
    const marketPriceImpact = trade?.priceImpact ? computeRealizedPriceImpact(trade) : undefined
    const largerPriceImpact = largerPercentValue(marketPriceImpact, stablecoinPriceImpact)
    return { priceImpactSeverity: warningSeverity(largerPriceImpact), largerPriceImpact }
  }, [stablecoinPriceImpact, trade])


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

  const maxCollateralAmount: CurrencyAmount<Currency> | undefined | null = useMemo(
    () => maxAmountSpend(currencyAmounts[fieldCollateral]),
    [currencyAmounts, fieldCollateral]
  )

  const handleMaxCollateral = useCallback(() => {
    maxCollateralAmount && onUserInput(fieldCollateral, maxCollateralAmount.toExact())
    !maxCollateral && setMaxCollateral(true)
    maxDebt && setMaxDebt(false)
  }, [maxCollateralAmount, onUserInput, fieldCollateral, maxCollateral, maxDebt])

  const maxBorrowAmount: CurrencyAmount<Currency> | undefined | null = useMemo(
    () => maxAmountSpend(currencyAmounts[fieldDebt]),
    [currencyAmounts, fieldDebt]
  )

  const handleMaxBorrow = useCallback(() => {
    maxBorrowAmount && onUserInput(fieldDebt, maxBorrowAmount.toExact())
    !maxDebt && setMaxDebt(true)
    maxCollateral && setMaxCollateral(false)
  }, [maxBorrowAmount, onUserInput, fieldDebt, maxDebt, maxDebt])

  const showMaxButtonIn = !maxCollateral && Boolean(maxCollateralAmount?.greaterThan(0) && !parsedAmounts[fieldCollateral]?.equalTo(maxCollateralAmount))
  const showMaxButtonOut = !maxDebt && Boolean(maxBorrowAmount?.greaterThan(0) && !parsedAmounts[fieldDebt]?.equalTo(maxBorrowAmount))

  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  const priceImpactTooHigh = !typedValue //  priceImpactSeverity > 3 && !isExpertMode
  const showPriceImpactWarning = largerPriceImpact && priceImpactSeverity > 3

  const riskParameters = useGetRiskParameters(
    chainId,
    currentProtocol,
    relevantAccount,
    baseAsset,
  )

  const { riskChange, tradeImpact } = useRiskChange(
    assetIn,
    assetOut,
    currentProtocol,
    riskParameters,
    marginTradeType,
    trade,
    selectedBorrowInterestMode,
    selectedBorrowInterestMode
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
        case MarginTradeType.Trim: {
          return ['Trim Position', false]
        }
        case MarginTradeType.Open: {
          return ['Build Position', false]
        }
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
    relevantAccount,
    routeIsLoading,
    routeIsSyncing,
    priceImpactTooHigh,
    priceImpactSeverity,
    riskErrorText,
    balanceErrorText,
    hf,
  ])

  const collateralYields = useYield(chainId, assetCollateralSide, currentProtocol)
  const debtYields = useYield(chainId, currentProtocol === LendingProtocol.COMPOUNDV3 ? baseAssetData : assetBorrowSide, currentProtocol)

  const [collateralAmount, borrowAmount, borrowRate] = useMemo(() => {
    return [
      Number(
        (marginTradeType === MarginTradeType.Trim
          ? trade?.inputAmount?.toSignificant(18)
          : trade?.outputAmount?.toSignificant(18)) ?? 0
      ),
      Number(
        (marginTradeType === MarginTradeType.Open
          ? trade?.inputAmount?.toSignificant(18)
          : trade?.outputAmount?.toSignificant(18)) ?? 0
      ),
      selectedBorrowInterestMode === AaveInterestMode.STABLE ? debtYields.borrowYield : debtYields.borrowStableYield,
    ]
  }, [assetCollateralSide, assetBorrowSide, selectedBorrowInterestMode, parsedAmounts, trade])


  return (
    <>
      <SwapWrapper id="swap-page" redesignFlag={redesignFlagEnabled}>
        <MarginTradeHeader
          tradeType={marginTradeType}
          allowedSlippage={allowedSlippage}
          sideIn={positionState.sideIn}
          onClick={() => {
            handleSwitchMarginTradeType()
            setApprovalSubmitted(false)
          }}
        />
        <ConfirmSwapModal
          riskMessage={riskErrorText}
          hasRiskError={hasRiskError}
          healthFactor={hf}
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
          fiatValueInput={fiatValueInput}
          fiatValueOutput={fiatValueOutput}
        />
        <div>
          <AutoColumnAdjusted isMobile={isMobile}>
            {relevantAccount && (
              <PanelContainer isMobile={isMobile}>
                <AdvancedRiskDetails
                  tradeImpact={riskChange}
                  allowedSlippage={allowedSlippage}
                  marginTradeType={marginTradeType}
                  noTrade={!typedValue}
                  isMobile={isMobile}
                />
              </PanelContainer>
            )}
            <PanelContainer isMobile={isMobile}>
              <YieldDetailsMarginTrade
                protocol={currentProtocol}
                assetCollateral={assetCollateralSide.id}
                assetBorrow={assetBorrowSide.id}
                amountBorrow={borrowAmount}
                amountCollateral={collateralAmount}
                yieldBorrow={borrowRate}
                yieldCollateral={collateralYields.supplyYield}
                allowedSlippage={allowedSlippage}
                marginTradeType={marginTradeType}
                isMobile={isMobile}
              />
            </PanelContainer>
            <PanelContainer isMobile={isMobile}>
              <InputPaneContainer>
                <SwapPanelContainer redesignFlag={redesignFlagEnabled}>
                  <PositionSideKey textAlign={isMobile ? 'left' : 'center'}>
                    <MouseoverTooltip
                      text={
                        marginTradeType === MarginTradeType.Trim ?
                          `Withdraw ${currencyAmounts[fieldCollateral]?.currency.symbol} collateral to repay your debt.` :
                          `Deposit ${currencyAmounts[fieldCollateral]?.currency.symbol} by borrowing funds.`
                      }
                    >
                      {marginTradeType === MarginTradeType.Trim ? 'Withdraw' : 'Deposit'}
                    </MouseoverTooltip>
                  </PositionSideKey>
                  <DepositYieldMarginTrade liquidityRate={collateralYields.supplyYield} isMobile={isMobile} />
                  <CurrencyInputCustomListCollateral
                    providedTokenList={restrictedTokenList}
                    value={formattedAmounts[fieldCollateral]}
                    onUserInput={handleTypeCollateral}
                    label={
                      independentField === fieldDebt && !showWrap ? <Trans>To (at least)</Trans> : <Trans>To</Trans>
                    }
                    showMaxButton={marginTradeType === MarginTradeType.Trim && showMaxButtonIn} // {side !== PositionSides.Collateral}
                    onMax={handleMaxCollateral}
                    hideBalance={false}
                    fiatValue={fiatValueOutput ?? undefined}
                    priceImpact={stablecoinPriceImpact}
                    currency={currencyAmounts[fieldCollateral]?.currency} //{currencies[fieldLeft] ?? null}
                    providedCurrencyBalance={currencyAmounts[fieldCollateral]}
                    balanceText={'Your deposits'}
                    // onCurrencySelect={null}
                    otherCurrency={null}
                    showCommonBases={true}
                    id={"CURRENCY_OUTPUT_PANEL"}
                    loading={independentField === fieldDebt && routeIsSyncing}
                  />
                </SwapPanelContainer>
              </InputPaneContainer>
              <div style={{

                background: 'red',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',

              }}>
                < MarginTradeArrowWrapper
                  onClick={() => {
                    handleSwitchMarginTradeType()
                    setApprovalSubmitted(false)
                  }}
                >
                  {positionState.sideIn === PositionSides.Collateral ? (
                    isMobile ? (
                      <ArrowDown size="16" stroke-width="3" />
                    ) : (
                      <ArrowRight stroke-width="3" size="16" color={theme.deprecated_text2} />
                    )
                  ) : isMobile ? (
                    <ArrowUp size="16" stroke-width="3" />
                  ) : (
                    <ArrowLeft stroke-width="3" size="16" color={theme.deprecated_text2} />
                  )}
                </MarginTradeArrowWrapper>
              </div>
              <InputPaneContainer>
                <SwapPanelContainer redesignFlag={redesignFlagEnabled}>
                  <PositionSideKey textAlign={isMobile ? 'left' : 'center'}>
                    <MouseoverTooltip
                      text={
                        marginTradeType === MarginTradeType.Trim ?
                          `Repay ${currencyAmounts[fieldDebt]?.currency.symbol} debt with the collateral configuration selected.` :
                          `Fund your collateral position by borrowing ${currencyAmounts[fieldDebt]?.currency.symbol}.`
                      }
                    >
                      {marginTradeType === MarginTradeType.Trim ? 'Repay' : 'Borrow'}
                    </MouseoverTooltip>
                  </PositionSideKey>
                  <DebtOptionButtonMarginTrade
                    handleSelectInterestMode={handleSelectInterestMode}
                    hasStableBorrow={hasStableBorrow}
                    borrowRateStable={debtYields.borrowStableYield}
                    borrowRateVariable={debtYields.borrowYield}
                    selectedBorrowInterestMode={selectedBorrowInterestMode}
                    isMobile={isMobile}
                  />
                  <CurrencyInputCustomListDebt
                    providedTokenList={restrictedTokenList}
                    label={
                      independentField === fieldCollateral && !showWrap ? <Trans>From (at most)</Trans> : <Trans>From</Trans>
                    }
                    value={formattedAmounts[fieldDebt]}
                    showMaxButton={marginTradeType === MarginTradeType.Trim && showMaxButtonOut}
                    currency={currencyAmounts[fieldDebt]?.currency}
                    onUserInput={handleTypeDebt}
                    onMax={handleMaxBorrow}
                    fiatValue={fiatValueInput ?? undefined}
                    otherCurrency={null}
                    showCommonBases={true}
                    id={"CURRENCY_INPUT_PANEL"}
                    loading={independentField === fieldCollateral && routeIsSyncing}
                    providedCurrencyBalance={currencyAmounts[fieldDebt]}
                    balanceText={
                      selectedBorrowInterestMode === AaveInterestMode.STABLE
                        ? 'Your stable debt'
                        : selectedBorrowInterestMode === AaveInterestMode.VARIABLE
                          ? 'Your variable debt'
                          : ' No debt selected'
                    }
                  />
                </SwapPanelContainer>
              </InputPaneContainer>
            </PanelContainer>
          </AutoColumnAdjusted>
          {/* <AutoColumn gap={redesignFlagEnabled ? '12px' : '8px'}> */}
          <InputWrapper redesignFlag={redesignFlagEnabled} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              <div style={{ width: '80%', alignSelf: 'center', justifySelf: 'center' }}>
                <SwapDetailsDropdown
                  trade={trade}
                  syncing={routeIsSyncing}
                  loading={routeIsLoading}
                  showInverted={showInverted}
                  setShowInverted={setShowInverted}
                  allowedSlippage={allowedSlippage}
                />
              </div>
            )}
            {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />}
          </InputWrapper>
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
              <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
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
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                      {/* we need to shorten this string on mobile */}
                      {approvalStateOfConcern === ApprovalState.APPROVED ? (
                        <MarginTradingButtonText>
                          {marginTradeType === MarginTradeType.Trim
                            ? `You can now trim your position`
                            : `You can now open your position`}
                        </MarginTradingButtonText>
                      ) : (
                        <MarginTradingButtonText>
                          {marginTradeType === MarginTradeType.Trim
                            ? abstractApproval
                              ? `Allow your 1delta account to repay ${currencyAmounts[fieldDebt]?.currency?.symbol}` :
                              `Allow withdrawing ${currencyAmounts[fieldCollateral]?.currency?.symbol}`
                            :
                            abstractApproval
                              ? `Allow your 1delta account to deposit ${currencyAmounts[fieldCollateral]?.currency?.symbol}` :
                              `Allow borrowing ${currencyAmounts[fieldDebt]?.currency?.symbol} on your behalf`}
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
                            {currencies[marginTradeType === MarginTradeType.Trim ? fieldCollateral : fieldDebt]?.symbol}. You
                            only have to do this once per token.
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
                    hasNoImplementation ||
                    routeIsSyncing ||
                    routeIsLoading ||
                    (approvalStateOfConcern !== ApprovalState.APPROVED) ||
                    priceImpactTooHigh ||
                    buttonDisabled
                  }
                >
                  <Text fontSize={16} fontWeight={500}>
                    {validatedSwapText}
                  </Text>
                </ButtonPrimary>
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
                  hasNoImplementation ||
                  routeIsSyncing || routeIsLoading || priceImpactTooHigh ||
                  buttonDisabled
                }
              >
                <Text fontSize={20} fontWeight={500}>
                  {validatedSwapText}
                </Text>
              </ButtonPrimary>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          </div>
        </div>
      </SwapWrapper>
      <NetworkAlert isColumn={isMobile} />
      <SwitchLocaleLink />
      {!swapIsUnsupported ? null : (
        <UnsupportedCurrencyFooter
          show={swapIsUnsupported}
          currencies={[currencies[Field.INPUT], currencies[Field.OUTPUT]]}
        />
      )}
    </>
  )
}
