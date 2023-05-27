import { Trans } from '@lingui/macro'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import CurrencyInputCustomList from 'components/CurrencyInputPanel/CustomListInputPanel/CurrencyInputCustomList'
import GeneralCurrencyInputPanel from 'components/CurrencyInputPanel/GeneralInputPanel/GeneralCurrencyInputPanel'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import PriceImpactWarning from 'components/swap/PriceImpactWarning'
import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { MouseoverTooltip } from 'components/Tooltip'
import { MAINNET_CHAINS, toLenderText, WRAPPED_NATIVE_SYMBOL, ZERO_BN } from 'constants/1delta'
import { isSupportedChain } from 'constants/chains'
import { ethers } from 'ethers'
import { NavBarVariant, useNavBarFlag } from 'featureFlags/flags/navBar'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { filterSupportedAssets, getTokenList } from 'hooks/1delta/tokens'
import { useGetMoneyMarketTradeContracts, useGetTradeContract } from 'hooks/1delta/use1DeltaContract'
import {
  useApproveCallbacFromTradeAbstractAccount,
  useApproveCallbackFromMarginTrade,
  useDelegateBorrowCallback,
  useDelegateBorrowCallbackFromGeneralTrade,
} from 'hooks/use1DeltaMarginSwapCallback'
import JSBI from 'jsbi'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { useIsMobile } from 'hooks/useIsMobile'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, CheckCircle, HelpCircle } from 'react-feather'
import { Text } from 'rebass'
import { fetchAAVEUserReserveDataAsync } from 'state/1delta/aave/fetchAAVEUserData'
import { useCurrentLendingProtocol, useFetchUserData, useGetCurrentAccount } from 'state/1delta/hooks'
import { useToggleWalletModal } from 'state/application/hooks'
import { useAppDispatch } from 'state/hooks'
import { TradeState } from 'state/routing/types'
import styled, { useTheme } from 'styled-components/macro'
import { AaveInterestMode, Asset, MarginTradeType, MappedCurrencyAmounts, PositionSides, SupportedAssets, OneDeltaTradeType } from 'types/1delta'
import AddressInputPanel from 'components/AddressInputPanel'
import { ButtonConfirmed, ButtonLight, ButtonPrimary, ButtonSecondary } from 'components/Button'
import { GreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { AutoRow } from 'components/Row'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, PageWrapper, SwapCallbackError, SwapWrapper } from 'components/swap/styleds'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useCurrencyWithFallback } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useIsArgentWallet from 'hooks/useIsArgentWallet'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { Field } from 'state/swap/actions'
import {
  useMoneyMarketActionHandlers,
  useMoneyMarketState,
} from 'state/moneyMarket/hooks'
import { useExpertModeManager } from 'state/user/hooks'
import { LinkStyledButton, ThemedText } from '../../../../../theme'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { computeRealizedPriceImpact, warningSeverity } from 'utils/prices'
import { ArrowContainer, InputWrapper } from 'components/Wrappers/wrappers'
import { largerPercentValue } from 'utils/1delta/generalFormatters'
import { DepositYield } from 'components/YieldDetails/YieldOptionButtons'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { useDerivedMoneyMarketTradeInfoBroker } from 'state/moneyMarket/hooks'
import { useMoneyMarketValidation } from 'pages/Professional/hooks'
import { LendingProtocol } from 'state/1delta/actions'
import ConfirmSwapModal, { ConfirmDirectInteractionModal } from 'components/swap/ConfirmMoneyMarketModal'
import { AdvancedRiskDetailsMoneyMarket } from 'pages/1delta/components/RiskDetails/AdvancedRiskDetailsMoneyMarket'
import { TransactionType } from 'state/transactions/types'
import { useTransactionAdder } from 'state/transactions/hooks'
import { currencyId } from 'utils/currencyId'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { MarginTradingButtonText, PositionSideKey, SwapPanelContainer } from 'components/Styles'
import { DebtOptionButtonMarginTrade } from 'pages/1delta/components/InterestRateButtons/YieldOptionButtons'
import MoneyMarketTradeHeader from 'pages/1delta/components/Header/MoneyMarketHeader'
import { parseMessage } from 'constants/errors'
import { useCurrencyInfo } from 'pages/Professional/hooks/useCurrencyInfo'
import { useSetSingleInteraction, useSingleInteraction } from 'state/marginTradeSelection/hooks'
import { useCurrencyAmounts } from 'hooks/trade'
import { useYield } from 'hooks/trade/useYields'
import { generateMoneyMarketCalldata, TradeConfig } from 'utils/calldata/generateCall'
import { calculateRiskChange, useGetRiskParameters } from 'hooks/riskParameters/useRiskParameters'

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

export interface MoneyMarketSwapInterface {
  selectedAsset: Token
  assetToInteractWith: Asset
  side: PositionSides
}

export default function GeneralMoneyMarket({
  selectedAsset,
  assetToInteractWith,
  side
}: MoneyMarketSwapInterface) {
  const navBarFlag = useNavBarFlag()
  const navBarFlagEnabled = navBarFlag === NavBarVariant.Enabled
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const { account, chainId } = useChainIdAndAccount()
  const currentProtocol = useCurrentLendingProtocol()
  const baseAsset: SupportedAssets = SupportedAssets.USDC
  const deltaAccount = useGetCurrentAccount(chainId)

  const relevantAccount = currentProtocol === LendingProtocol.COMPOUND ? deltaAccount?.accountAddress : account

  const lendingProtocolInteraction = useSingleInteraction()

  const setInteractionBase = useSetSingleInteraction()

  const hasNoImplementation = useMemo(() => currentProtocol === LendingProtocol.AAVE ?
    MAINNET_CHAINS.includes(chainId) :
    false
    , [chainId])

  const handleSetInteraction = useCallback(() => {
    if (account) return () => null
    if (side === PositionSides.Collateral) {
      if (lendingProtocolInteraction === MarginTradeType.Withdraw)
        return setInteractionBase(MarginTradeType.Supply)
      else return setInteractionBase(MarginTradeType.Withdraw)
    } else {
      if (lendingProtocolInteraction === MarginTradeType.Borrow) return setInteractionBase(MarginTradeType.Repay)
      else return setInteractionBase(MarginTradeType.Borrow)
    }
  }, [lendingProtocolInteraction, account])

  const [fieldTop, fieldBottom] = useMemo(() => {
    if (lendingProtocolInteraction === MarginTradeType.Borrow) return [Field.OUTPUT, Field.INPUT]

    if (lendingProtocolInteraction === MarginTradeType.Supply) return [Field.INPUT, Field.OUTPUT]

    if (lendingProtocolInteraction === MarginTradeType.Withdraw) return [Field.OUTPUT, Field.INPUT]

    // last case is repay
    return [Field.INPUT, Field.OUTPUT]
  }, [lendingProtocolInteraction])



  const restrictedTokenList = useMemo(() => {
    return getTokenList(chainId, currentProtocol)
  }, [chainId, currentProtocol])

  const dispatch = useAppDispatch()

  const [borrowInterestMode, setBorrowInterestMode] = useState(AaveInterestMode.STABLE)

  const theme = useTheme()

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // swap state
  const { independentField, typedValue, recipient } = useMoneyMarketState()

  const [selectedCurrencyOutside, setCurrencyOutside] = useState(selectedAsset.symbol)
  const selectedCurrency = useCurrencyWithFallback(selectedCurrencyOutside, currentProtocol)

  const [isDirect, setIsDirect] = useState(true)

  useEffect(() => {
    if (assetToInteractWith) {
      setCurrencyOutside(selectedAsset?.address)
      setIsDirect(true)
    }
  },
    [assetToInteractWith?.id]
  )


  const handleCcyInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      setCurrencyOutside(
        (inputCurrency.isToken ? inputCurrency.address : inputCurrency.symbol) ??
        assetToInteractWith?.tokenAddress ??
        'ETH'
      )
    },
    [setCurrencyOutside, selectedCurrencyOutside]
  )
  const isMobile = useIsMobile()
  // user balances
  const currencyUserBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [selectedCurrency ?? undefined, selectedAsset ?? undefined], [selectedAsset, selectedCurrency])
  )
  // this is the parametrization of the trade
  const currencyAmounts: MappedCurrencyAmounts = useCurrencyAmounts(
    chainId,
    relevantAccount,
    currentProtocol,
    lendingProtocolInteraction,
    assetToInteractWith as Asset,
    assetToInteractWith as Asset,
    selectedAsset,
    selectedCurrency as Currency,
    borrowInterestMode,
    borrowInterestMode,
    currencyUserBalances?.[0],
    SupportedAssets.USDC
  )

  const { currencies, inIsETH, outIsETH, outsideIsETH, insideIsWETH } = useCurrencyInfo(currencyAmounts, fieldTop, fieldBottom, chainId)

  const wrappedNativeSymbol = useMemo(() => WRAPPED_NATIVE_SYMBOL[chainId], [chainId])

  useEffect(() => {
    const ccyOut = currencies[Field.OUTPUT]
    const ethersWrap =
      Boolean(
        (currencies[Field.INPUT]?.isNative && currencies[Field.OUTPUT]?.symbol === wrappedNativeSymbol) ||
        (currencies[Field.OUTPUT]?.isNative && currencies[Field.INPUT]?.symbol === wrappedNativeSymbol)
      ) ||
      (outsideIsETH && insideIsWETH)
    setIsDirect(Boolean(ccyOut && currencies[Field.INPUT]?.equals(ccyOut)) || ethersWrap)
  }, [currencies, wrappedNativeSymbol])


  const {
    trade: { state: tradeState, trade },
    allowedSlippage,
    parsedAmount,
    inputError: swapInputError,
  } = useDerivedMoneyMarketTradeInfoBroker(
    currencyAmounts,
    isDirect
  )

  const {
    wrapType,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const recipientAddress = recipient

  const parsedAmounts = useMemo(
    () =>
      showWrap || isDirect
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

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useMoneyMarketActionHandlers()

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const [maxTop, setMaxTop] = useState(false)
  const [maxBottom, setMaxBottom] = useState(false)

  const handleTypeFieldTop = useCallback(
    (value: string) => {
      onUserInput(fieldTop, value)
      maxTop && setMaxTop(false)
      maxBottom && setMaxBottom(false)
    },
    [onUserInput, fieldTop, maxTop, maxBottom]
  )
  const handleTypeFieldBottom = useCallback(
    (value: string) => {
      onUserInput(fieldBottom, value)
      maxBottom && setMaxBottom(false)
      maxTop && setMaxTop(false)
    },
    [onUserInput, fieldBottom, maxTop, maxBottom]
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

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: (showWrap || isDirect)
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }),
    [dependentField, independentField, parsedAmounts, showWrap, typedValue, isDirect]
  )

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const [moneyMarketContract, marginTraderContract] = useGetMoneyMarketTradeContracts(
    chainId,
    currentProtocol,
    relevantAccount,
    baseAsset,
    isDirect
  )

  // in case of a direct deposit
  const [approvalStateDirect, approveCallbackDirect] = useApproveCallback(
    (currentProtocol !== LendingProtocol.COMPOUND && isDirect && outsideIsETH) ? undefined : (currentProtocol === LendingProtocol.COMPOUND ? parsedAmounts[fieldTop] :
      (lendingProtocolInteraction === MarginTradeType.Repay || lendingProtocolInteraction === MarginTradeType.Supply) ?
        parsedAmounts[independentField] : undefined),
    isDirect && !outsideIsETH ? moneyMarketContract.address : marginTraderContract.address
  )

  // check whether the user has approved the router on the input token
  const [approvalState, approveCallback] = useApproveCallbackFromMarginTrade(
    currentProtocol,
    relevantAccount,
    trade,
    lendingProtocolInteraction,
    lendingProtocolInteraction === MarginTradeType.Withdraw ? fieldBottom : fieldTop,
    marginTraderContract.address,
    allowedSlippage,
    isDirect ? parsedAmount : undefined,
    baseAsset
  )

  // check whether the user has approved the router on the input token
  const [borrowApprovalState, approveBorrowCallback] = useDelegateBorrowCallback(
    currentProtocol,
    trade,
    lendingProtocolInteraction,
    Field.INPUT,
    marginTraderContract.address,
    allowedSlippage,
    borrowInterestMode,
    isDirect && outIsETH ? parsedAmount : undefined,
    baseAsset
  )

  const checkAbstractAccountApproval = currentProtocol === LendingProtocol.COMPOUND &&
    (lendingProtocolInteraction === MarginTradeType.Supply
      || lendingProtocolInteraction === MarginTradeType.Repay)
  // check whether the user has approved the router on the input token
  const [approvalStateAbstractAccount, approveCallbackAbstractAccount] = useApproveCallbacFromTradeAbstractAccount(
    checkAbstractAccountApproval ? trade : undefined,
    lendingProtocolInteraction,
    relevantAccount,
    allowedSlippage,
    checkAbstractAccountApproval ? (isDirect ? parsedAmount : undefined) : undefined
  )

  const [abstractApproval, setAbstractApproval] = useState(false)

  const [approvalStateOfConcern, approveCallbackOfConcern] = useMemo(() => {
    // dual approval might be required 1) user to account; 2) account to lender
    if (checkAbstractAccountApproval && approvalStateAbstractAccount !== ApprovalState.APPROVED) {
      !abstractApproval && setAbstractApproval(true)
      return [approvalStateAbstractAccount, approveCallbackAbstractAccount]
    } else {
      abstractApproval && setAbstractApproval(false)
    }
    // general non-0borrow case 
    if (lendingProtocolInteraction !== MarginTradeType.Borrow) {
      // direct
      if (isDirect) {
        // supply or repay using ETH
        if (outsideIsETH && lendingProtocolInteraction === MarginTradeType.Repay)
          return [ApprovalState.APPROVED, async () => null]
        // supply or repay using any
        return [approvalStateDirect, approveCallbackDirect]
      }
      // swap - covers swap-in and withdrawals
      return [approvalState, approveCallback]
    }

    if (currentProtocol !== LendingProtocol.COMPOUND) {
      if (isDirect) {
        if (outIsETH) return [borrowApprovalState, approveBorrowCallback]
      }
    }

    if (currentProtocol === LendingProtocol.COMPOUND) {
      return [ApprovalState.APPROVED, async () => null]
    }
    return [borrowApprovalState, approveBorrowCallback]
  }, [
    selectedCurrency,
    lendingProtocolInteraction,
    approvalState,
    borrowApprovalState,
    isDirect,
    outsideIsETH,
    approvalStateDirect,
    borrowInterestMode,
    approvalStateAbstractAccount
  ])


  const [userDebt, userDebtType] = useMemo(() => {
    const stableDebt = ethers.BigNumber.from(assetToInteractWith?.aaveData[chainId].userData?.currentStableDebt ?? '0')
    const variableDebt = ethers.BigNumber.from(
      assetToInteractWith?.aaveData[chainId].userData?.currentVariableDebt ?? '0'
    )
    if (stableDebt.gt(0)) return [stableDebt, AaveInterestMode.STABLE]
    if (variableDebt.gt(0)) return [variableDebt, AaveInterestMode.VARIABLE]

    return [undefined, AaveInterestMode.NONE]
  }, [assetToInteractWith, chainId])

  const handleSelectInterestMode = useCallback(() => {
    if (!assetToInteractWith?.aaveData[chainId].reserveData?.stableBorrowRateEnabled) {
      setBorrowInterestMode(AaveInterestMode.VARIABLE)
      return null // no selections shall be possible
    } else {
      if (borrowInterestMode !== AaveInterestMode.VARIABLE) {
        return setBorrowInterestMode(AaveInterestMode.VARIABLE)
      }
      return setBorrowInterestMode(AaveInterestMode.STABLE)
    }
  }, [borrowInterestMode, lendingProtocolInteraction, assetToInteractWith, chainId])

  const [approvalPending, setApprovalPending] = useState<boolean>(false)
  const handleApprove = useCallback(async () => {
    setApprovalPending(true)
    try {
      await approveCallbackOfConcern()
    } finally {
      setApprovalPending(false)
    }
  }, [approveCallbackOfConcern, trade?.inputAmount?.currency.symbol])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalStateOfConcern === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    } else
      if (approvalStateOfConcern === ApprovalState.NOT_APPROVED) {
        setApprovalSubmitted(false)
      }
  }, [approvalStateOfConcern, approvalSubmitted])

  const maxBottomAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyAmounts[fieldBottom]),
    [currencyAmounts, fieldBottom]
  )

  const maxTopAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyAmounts[fieldTop]),
    [currencyAmounts, fieldTop]
  )

  const handleMaxInput = useCallback(() => {
    maxTopAmount && onUserInput(fieldTop, maxTopAmount.toExact())
    !maxTop && setMaxTop(true)
    maxBottom && setMaxBottom(false)
  }, [maxTopAmount, onUserInput, fieldTop, maxTop, maxBottom])

  const handleMaxOutput = useCallback(() => {
    maxBottomAmount && onUserInput(fieldBottom, maxBottomAmount?.toExact())
    !maxBottom && setMaxBottom(true)
    maxTop && setMaxTop(false)
  }, [maxBottomAmount, onUserInput, fieldBottom, maxTop, maxBottom])

  const showMaxButton = !maxTop && Boolean(maxTopAmount?.greaterThan(0) && !parsedAmounts[fieldTop]?.equalTo(maxTopAmount))
  const showMaxButtonOut = (lendingProtocolInteraction === MarginTradeType.Repay || lendingProtocolInteraction === MarginTradeType.Withdraw) &&
    !maxBottom && Boolean(
      maxBottomAmount?.greaterThan(0) && !parsedAmounts[fieldBottom]?.equalTo(maxBottomAmount)
    )

  const addTransaction = useTransactionAdder()

  const tradeConfig: TradeConfig = {
    trade,
    parsedAmount,
    recipient: account,
    allowedSlippage,
    marginTraderContract,
    moneyMarketContract,
    sourceBorrowInterestMode: borrowInterestMode,
    targetBorrowInterestMode: borrowInterestMode,
    isMaxIn: maxTop,
    isMaxOut: maxBottom,
    inIsETH,
    outIsETH: outsideIsETH,
    walletIsETH: outsideIsETH
  }
  const { call, estimate } = useMemo(() => {
    return generateMoneyMarketCalldata(
      currentProtocol,
      account,
      tradeConfig,
      lendingProtocolInteraction,
      isDirect
    )
  }, [
    tradeConfig,
    currentProtocol,
    parsedAmounts,
    allowedSlippage,
    marginTraderContract,
    maxTop,
    maxBottom,
    inIsETH,
    outIsETH,
    lendingProtocolInteraction,
    borrowInterestMode,
    account,
    parsedAmount,
    trade,
    isDirect,
    selectedAsset.address,
    assetToInteractWith,
    isExpertMode
  ])

  const fetchData = useFetchUserData(currentProtocol, chainId, relevantAccount, [assetToInteractWith.id])

  const handleSwap = useCallback(async () => {
    if (!trade && !isDirect) {
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
        swapErrorMessage: parseMessage(error),
        txHash: undefined,
      })
    }
    const opts = gasEstimate ? { gasLimit: calculateGasMargin(gasEstimate) } : {}

    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    if (call) {
      await call(opts)
        .then((txResponse) => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: txResponse.hash,
          })
          if (isDirect) {
            if (parsedAmount)
              addTransaction(txResponse, {
                protocol: toLenderText(currentProtocol, chainId),
                type: TransactionType.DIRECT_INTERACTION,
                subType: lendingProtocolInteraction,
                currencyId: currencyId(parsedAmount.currency),
                amount: parsedAmount.quotient.toString()
              })
          } else {
            if (trade)
              addTransaction(
                txResponse,
                trade.tradeType === TradeType.EXACT_INPUT
                  ? {
                    protocol: toLenderText(currentProtocol, chainId),
                    type: TransactionType.MONEY_MARKET,
                    subType: lendingProtocolInteraction,
                    tradeType: TradeType.EXACT_INPUT,
                    inputCurrencyId: currencyId(trade.inputAmount.currency),
                    inputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                    expectedOutputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                    outputCurrencyId: currencyId(trade.outputAmount.currency),
                    minimumOutputCurrencyAmountRaw: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
                  }
                  : {
                    protocol: toLenderText(currentProtocol, chainId),
                    type: TransactionType.MONEY_MARKET,
                    subType: lendingProtocolInteraction,
                    tradeType: TradeType.EXACT_OUTPUT,
                    inputCurrencyId: currencyId(trade.inputAmount.currency),
                    maximumInputCurrencyAmountRaw: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
                    outputCurrencyId: currencyId(trade.outputAmount.currency),
                    outputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                    expectedInputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                  }
              )
          }

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
    }
  }, [
    call,
    lendingProtocolInteraction,
    stablecoinPriceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    isDirect,
    recipientAddress,
    account,
    tradeConfig,
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

  const isArgentWallet = useIsArgentWallet()

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !hasNoImplementation &&
    !isArgentWallet &&
    (trade || (!trade && isDirect)) &&
    (approvalStateOfConcern === ApprovalState.NOT_APPROVED ||
      approvalStateOfConcern === ApprovalState.PENDING ||
      (approvalSubmitted && approvalStateOfConcern === ApprovalState.APPROVED))

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

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )

  useEffect(() => {
    if (selectedAsset) handleOutputSelect(selectedAsset)
  }, [])

  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode
  const showPriceImpactWarning = largerPriceImpact && priceImpactSeverity > 3


  const approveTokenButtonDisabled =
    approvalStateOfConcern !== ApprovalState.NOT_APPROVED ||
    approvalSubmitted

  const yields = useYield(chainId, assetToInteractWith as Asset, currentProtocol)

  const hasStableRate = currentProtocol === LendingProtocol.AAVE ?
    Boolean(assetToInteractWith?.aaveData[chainId].reserveData?.stableBorrowRateEnabled)
    : false

  useEffect(() => {
    if (!hasStableRate) {
      setBorrowInterestMode(AaveInterestMode.VARIABLE)
    }
  }, [hasStableRate])

  const riskParameters = useGetRiskParameters(
    chainId,
    currentProtocol,
    relevantAccount,
    baseAsset,
  )

  const riskChange = useMemo(() => {
    const inAm = (isDirect ? parsedAmount?.quotient.toString() : trade?.inputAmount.quotient.toString()) ?? '0'
    const outAm = (isDirect ? parsedAmount?.quotient.toString() : trade?.outputAmount.quotient.toString()) ?? '0'
    // collateral in reduces, collateral out increases
    const deltaIn =
      side === PositionSides.Collateral
        ? lendingProtocolInteraction === MarginTradeType.Supply
          ? ethers.BigNumber.from(outAm)
          : ethers.BigNumber.from(inAm).mul(-1)
        : lendingProtocolInteraction === MarginTradeType.Borrow
          ? ethers.BigNumber.from(inAm)
          : ethers.BigNumber.from(outAm).mul(-1)

    return calculateRiskChange(
      assetToInteractWith,
      undefined,
      currentProtocol,
      riskParameters,
      deltaIn,
      undefined,
      side,
      undefined
    )
  }, [riskParameters, assetToInteractWith, trade])

  const directText = useMemo(() => {
    if (side === PositionSides.Collateral) {
      if (lendingProtocolInteraction === MarginTradeType.Supply) {
        return 'Direct Supply'
      } else return 'Direct Withdraw'
    }

    if (lendingProtocolInteraction === MarginTradeType.Borrow) {
      return 'Direct Borrow'
    } else return 'Direct Repay'
  }, [side, lendingProtocolInteraction])


  const {
    riskValidationMessage,
    hasRiskError,
    hf,
    validatedSwapText,
    buttonDisabled,
  } = useMoneyMarketValidation(
    account,
    lendingProtocolInteraction,
    isDirect,
    parsedAmount,
    currencyAmounts,
    fieldTop,
    fieldBottom,
    typedValue,
    side,
    trade,
    riskChange,
    isExpertMode,
    hasNoImplementation,
    swapInputError,
    routeIsLoading,
    routeIsSyncing,
    priceImpactTooHigh,
    priceImpactSeverity,
    directText,
  )

  return (
    <>
      <PageWrapper redesignFlag={redesignFlagEnabled} navBarFlag={navBarFlagEnabled}>
        <SwapWrapper id="swap-page" redesignFlag={redesignFlagEnabled}>
          {!account && <ButtonSecondary onClick={handleSetInteraction}>
            {side === PositionSides.Collateral
              ? lendingProtocolInteraction === MarginTradeType.Supply
                ? 'Withdraw instead'
                : 'Supply instead'
              : lendingProtocolInteraction === MarginTradeType.Borrow
                ? 'Repay instead'
                : 'Borrow instead'}
          </ButtonSecondary>}
          <MoneyMarketTradeHeader allowedSlippage={allowedSlippage} side={side} interaction={lendingProtocolInteraction} chainId={chainId} isDirect={isDirect} />
          {isDirect ? (
            <ConfirmDirectInteractionModal
              riskMessage={riskValidationMessage}
              hasRiskError={hasRiskError}
              healthFactor={hf}
              isOpen={showConfirm}
              interaction={lendingProtocolInteraction}
              amount={parsedAmount?.toSignificant(18)}
              ccy={(assetToInteractWith && assetToInteractWith.id) ?? SupportedAssets.AAVE}
              attemptingTxn={attemptingTxn}
              txHash={txHash}
              recipient={recipient}
              onConfirm={handleSwap}
              swapErrorMessage={swapErrorMessage}
              onDismiss={handleConfirmDismiss}
            />
          ) : (
            <ConfirmSwapModal
              riskMessage={riskValidationMessage}
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
          )}
          {account && (
            <PanelContainer>
              <AdvancedRiskDetailsMoneyMarket
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
                  <PositionSideKey textAlign={'left'}>

                    <MouseoverTooltip text={
                      lendingProtocolInteraction === MarginTradeType.Borrow ?
                        'Borrow and receive assets in your Wallet' :
                        'Reduce your debt by repaying debt from your wallet'
                    }>
                      {lendingProtocolInteraction === MarginTradeType.Borrow ?
                        isDirect ? 'Borrow to wallet' : 'Swap to Wallet' :
                        isDirect ? 'Repay from wallet' : 'Swap from wallet'}
                    </MouseoverTooltip>
                  </PositionSideKey>
                ) : (
                  <>
                    <PositionSideKey textAlign={'left'}>
                      <MouseoverTooltip text={
                        lendingProtocolInteraction === MarginTradeType.Supply ?
                          'Increase your collateral with the lender by supplying assets from your wallet' :
                          'Reduce your collateral in the lending protocol and send coins to your wallet'
                      }>
                        {lendingProtocolInteraction === MarginTradeType.Supply ?
                          isDirect ? 'Supply from wallet' : 'Swap from wallet' :
                          isDirect ? 'Withdraw to wallet' : 'Swap to wallet'}
                      </MouseoverTooltip>
                    </PositionSideKey>
                  </>
                )}
                <GeneralCurrencyInputPanel
                  label={
                    independentField === fieldBottom && !showWrap ? (
                      <Trans>From (at most)</Trans>
                    ) : (
                      <Trans>From</Trans>
                    )
                  }
                  value={formattedAmounts[fieldTop]}
                  showMaxButton={
                    (lendingProtocolInteraction === MarginTradeType.Supply || lendingProtocolInteraction === MarginTradeType.Repay)
                    && showMaxButton
                  }
                  currency={selectedCurrency ?? currencies[fieldTop] ?? null}
                  onUserInput={handleTypeFieldTop}
                  onMax={handleMaxInput}
                  fiatValue={fiatValueInput ?? undefined}
                  onCurrencySelect={handleCcyInputSelect}
                  otherCurrency={null}
                  showCommonBases={true}
                  id={"CURRENCY_INPUT_PANEL"}
                  loading={independentField === fieldBottom && routeIsSyncing}
                />
              </SwapPanelContainer>
              <ArrowWrapper clickable={isSupportedChain(chainId)} redesignFlag={redesignFlagEnabled}>

                {redesignFlagEnabled ? (
                  <ArrowContainer
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                    color={theme.textPrimary}
                  >
                    {lendingProtocolInteraction === MarginTradeType.Withdraw ||
                      lendingProtocolInteraction === MarginTradeType.Borrow ? (
                      <ArrowUp size="16" color={theme.deprecated_text2} />
                    ) : (
                      <ArrowDown size="16" color={theme.deprecated_text2} />
                    )}
                  </ArrowContainer>
                ) : (
                  <ArrowContainer
                    onClick={() => {
                      handleSetInteraction()
                      setApprovalSubmitted(false)
                    }}
                  >
                    {lendingProtocolInteraction === MarginTradeType.Withdraw ||
                      lendingProtocolInteraction === MarginTradeType.Borrow ? (
                      <ArrowUp size="16" color={theme.deprecated_text2} />
                    ) : (
                      <ArrowDown size="16" color={theme.deprecated_text2} />
                    )}
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
                        <MouseoverTooltip text={
                          lendingProtocolInteraction === MarginTradeType.Borrow ?
                            'The asset configuration for which the debt will be increased' :
                            'The asset configuration for which the debt will be decreased'
                        }>
                          {lendingProtocolInteraction === MarginTradeType.Borrow ? 'Borrow from' : 'Repay to'}
                        </MouseoverTooltip>
                      </PositionSideKey>
                      <DebtOptionButtonMarginTrade
                        handleSelectInterestMode={handleSelectInterestMode}
                        hasStableBorrow={hasStableRate}
                        borrowRateStable={yields.borrowStableYield}
                        borrowRateVariable={yields.borrowYield}
                        selectedBorrowInterestMode={borrowInterestMode}
                        isMobile={isMobile}
                      />
                    </>
                  ) : (
                    <>
                      <PositionSideKey textAlign={'left'}>
                        <MouseoverTooltip text={
                          lendingProtocolInteraction === MarginTradeType.Supply ?
                            'The collateral configuration for which the collateral will be increased' :
                            'The collateral configuration for which the collateral will be decreased'
                        }>
                          {lendingProtocolInteraction === MarginTradeType.Supply ? 'Supply to' : 'Withdraw from'}
                        </MouseoverTooltip>
                      </PositionSideKey>
                      <DepositYield liquidityRate={yields.supplyYield} isMobile={isMobile} />
                    </>
                  )}
                  <InputWrapper redesignFlag={redesignFlagEnabled}>
                    <CurrencyInputCustomList
                      providedTokenList={restrictedTokenList}
                      value={formattedAmounts[fieldBottom]}
                      onUserInput={handleTypeFieldBottom}
                      label={
                        independentField === fieldTop && !showWrap ? <Trans>To (at least)</Trans> : <Trans>To</Trans>
                      }
                      showMaxButton={showMaxButtonOut}
                      hideBalance={false}
                      onMax={handleMaxOutput}
                      fiatValue={fiatValueOutput ?? undefined}
                      priceImpact={stablecoinPriceImpact}
                      currency={selectedAsset}
                      providedCurrencyBalance={currencyAmounts[fieldBottom]}
                      balanceText={
                        side === PositionSides.Borrow
                          ? userDebtType === AaveInterestMode.STABLE
                            ? 'Your stable debt'
                            : userDebtType === AaveInterestMode.VARIABLE
                              ? 'Your variable debt'
                              : ' Your debt'
                          : 'Your deposits'
                      }
                      // onCurrencySelect={null}
                      otherCurrency={null}
                      showCommonBases={true}
                      id={"CURRENCY_OUTPUT_PANEL"}
                      loading={independentField === fieldTop && routeIsSyncing}
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
                  ) : routeNotFound &&
                    userHasSpecifiedInputOutput &&
                    !routeIsLoading &&
                    !routeIsSyncing &&
                    !isDirect ? (
                    <GreyCard style={{ textAlign: 'center' }}>
                      <ThemedText.DeprecatedMain mb="4px">
                        <Trans>Insufficient liquidity for this trade.</Trans>
                      </ThemedText.DeprecatedMain>
                    </GreyCard>
                  ) : showApproveFlow ? (
                    <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
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
                                  {lendingProtocolInteraction === MarginTradeType.Supply ||
                                    lendingProtocolInteraction === MarginTradeType.Repay
                                    ? `You can now trade ${currencies[fieldTop]?.symbol}`
                                    : lendingProtocolInteraction === MarginTradeType.Withdraw
                                      ? `You can now withdraw ${currencies[fieldBottom]?.symbol}`
                                      : lendingProtocolInteraction === MarginTradeType.Borrow
                                        ? `You can now borrow ${currencies[fieldBottom]?.symbol}`
                                        : 'unsupported'}
                                </MarginTradingButtonText>
                              ) : (
                                <MarginTradingButtonText>
                                  {lendingProtocolInteraction === MarginTradeType.Supply ||
                                    lendingProtocolInteraction === MarginTradeType.Repay
                                    ? `Allow ${abstractApproval ? 'your 1delta account' : 'our protocol'} to use your ${currencies[fieldTop]?.symbol}`
                                    : lendingProtocolInteraction === MarginTradeType.Withdraw
                                      ? `Allow withdrawing ${currencies[fieldBottom]?.symbol}`
                                      : lendingProtocolInteraction === MarginTradeType.Borrow
                                        ? `Allow borrowing ${currencies[fieldBottom]?.symbol}`
                                        : 'unsupported'}
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
                            hasNoImplementation ||
                            ((routeIsSyncing ||
                              routeIsLoading) && !isDirect) ||
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
                        hasNoImplementation ||
                        ((routeIsSyncing ||
                          routeIsLoading) && !isDirect) || buttonDisabled}
                    >
                      <Text fontSize={20} fontWeight={500}>
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
      {!swapIsUnsupported ? null : (
        <UnsupportedCurrencyFooter
          show={swapIsUnsupported}
          currencies={[currencies[Field.INPUT], currencies[Field.OUTPUT]]}
        />
      )}
    </>
  )
}
