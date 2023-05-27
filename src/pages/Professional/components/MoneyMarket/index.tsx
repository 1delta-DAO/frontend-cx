import { formatAaveYield, formatAaveYieldToNumber } from 'utils/tableUtils/format'
import { Trans } from '@lingui/macro'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import PriceImpactWarning from 'components/swap/PriceImpactWarning'
import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { MouseoverTooltip } from 'components/Tooltip'
import { MAINNET_CHAINS, getSupportedAssets } from 'constants/1delta'
import { isSupportedChain } from 'constants/chains'
import { ethers } from 'ethers'
import { NavBarVariant, useNavBarFlag } from 'featureFlags/flags/navBar'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { filterSupportedAssets, getAaveTokens, safeGetToken } from 'hooks/1delta/tokens'
import { useGetAavePoolContractWithUserProvider, useGetMoneyMarketOperatorContract } from 'hooks/1delta/use1DeltaContract'
import {
  useApproveCallbackFromGeneralTrade,
  useDelegateBorrowCallbackFromGeneralTrade,
} from 'hooks/use1DeltaMarginSwapCallback'
import JSBI from 'jsbi'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { useIsMobile } from 'hooks/useIsMobile'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, CheckCircle, HelpCircle } from 'react-feather'
import { Text } from 'rebass'
import { fetchAAVEUserReserveDataAsync } from 'state/1delta/aave/fetchAAVEUserData'
import { useCurrentLendingProtocol, useGetSingleAsset } from 'state/1delta/hooks'
import { useToggleWalletModal } from 'state/application/hooks'
import { useAppDispatch } from 'state/hooks'
import { TradeState } from 'state/routing/types'
import styled, { css, useTheme } from 'styled-components/macro'
import { AaveInterestMode, MarginTradeType, MappedCurrencyAmounts, PositionSides, SupportedAssets } from 'types/1delta'
import AddressInputPanel from 'components/AddressInputPanel'
import { BaseButton, ButtonConfirmed, ButtonLight, ButtonPrimary, ButtonSecondary } from 'components/Button'
import { GreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { AutoRow } from 'components/Row'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { PageWrapper, SwapCallbackError, SwapWrapper } from 'components/swap/styleds'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useCurrencyWithFallback } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useIsArgentWallet from 'hooks/useIsArgentWallet'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import useWrapCallback, { WrapErrorText, WrapType } from 'hooks/useWrapCallback'
import { Field } from 'state/swap/actions'
import {
  useMoneyMarketActionHandlers,
  useMoneyMarketState,
} from 'state/moneyMarket/hooks'
import { useExpertModeManager } from 'state/user/hooks'
import { LinkStyledButton, ThemedText } from 'theme'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { computeRealizedPriceImpact, warningSeverity } from 'utils/prices'
import { ArrowContainer, InputWrapper } from 'components/Wrappers/wrappers'
import { largerPercentValue } from 'utils/1delta/generalFormatters'
import { createAaveMoneyMarketCalldata, createMoneyMarketDirectCalldata } from 'utils/calldata/aave/moneyMarketMethodCreator'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { calculateAaveRiskChange, useGetAaveRiskParameters } from 'hooks/riskParameters/useAaveParameters'
import { useDerivedMoneyMarketTradeInfoBroker } from 'state/moneyMarket/hooks'
import { AaveMoneyMarket, AaveSweeper } from 'abis/types'
import { useMoneyMarketValidation } from 'pages/Professional/hooks'
import { LendingProtocol } from 'state/1delta/actions'
import ConfirmSwapModal, { ConfirmDirectInteractionModal } from 'components/swap/ConfirmMoneyMarketModal'
import { AdvancedRiskDetailsMoneyMarket } from 'pages/1delta/components/RiskDetails/AdvancedRiskDetailsMoneyMarket'
import { TransactionType } from 'state/transactions/types'
import { useTransactionAdder } from 'state/transactions/hooks'
import { currencyId } from 'utils/currencyId'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { MarginTradingButtonText, PositionSideKey } from 'components/Styles'
import { DebtOptionButtonMarginTrade, DepositYieldMarginTrade } from 'pages/1delta/components/InterestRateButtons/YieldOptionButtons'
import MoneyMarketTradeHeader from 'pages/1delta/components/Header/MoneyMarketHeader'
import { parseMessage } from 'constants/errors'
import { useCurrencyInfo } from 'pages/Professional/hooks/useCurrencyInfo'
import CurrencyInputPro from 'components/CurrencyInputPanel/CustomListInputPanel/CurrencyInputPro'
import { PreparedAssetData } from 'hooks/asset/useAssetData'
import ExpandableTable from './SelectionTable'
import MoneyMarketPanel from 'components/CurrencyInputPanel/GeneralInputPanel/MoneyMarketPanel'
import { ArrowDotted } from '../Arrow'


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

const Container = styled.div`
display: flex;
flex-direction: row;
justify-content: space-around;
`

const ContainerCol = styled.div`
display: flex;
min-width: 300px;
flex-direction: Column;
`

export const SwapPanelContainer = styled.div<{ redesignFlag: boolean }>`
  min-height: ${({ redesignFlag }) => redesignFlag && '69px'};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_bg0)};
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_bg2)};
  width: initial;
  ${({ theme, redesignFlag }) =>
    !redesignFlag &&
    `
    :focus,
    :hover {
      border: 1px solid  ${theme.deprecated_bg3};
    }
  `}
`

export const ArrowWrapper = styled.div<{ clickable: boolean; redesignFlag: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 4px;
  border-radius: 7px;
  height: 32px;
  width: 32px;
  position: relative;
  margin-top: 2px;
  margin-bottom: 2px;
  left: calc(50% - 16px);
  /* transform: rotate(90deg); */
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundInteractive : theme.deprecated_bg1)};
  border: 2px solid;
  border-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundSurface : theme.deprecated_bg0)};

  z-index: 2;
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`

const ButtonRow = styled.div`
display: flex;
flex-direction: row;
align-items:center;
justify-content: space:between;
margin-bottom: 5px;
width: 100%;
`


export const ButtonLightBoring = styled(BaseButton) <{ redesignFlag?: boolean }>`
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentAction : theme.deprecated_primaryText1)};
  font-size: ${({ redesignFlag }) => (redesignFlag ? '20px' : '16px')};
  font-weight: ${({ redesignFlag }) => (redesignFlag ? '600' : '500')};

  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_primary5)};
      box-shadow: none;
      outline: none;
    }
  }
`


const TypeButton = styled(ButtonLightBoring) <{ selected: boolean }>`
border-radius: 0px;
font-size: 14px;
width: 25%;
&:first-child {
  border-top-left-radius: 10px;
  padding-left: 10px;
}
&:last-child {
  border-top-right-radius: 10px;
  padding-right: 10px;
}
height: 40px;
${({ theme, selected }) =>
    selected ?
      `
  border: 1px solid ${({ theme }) => theme.backgroundInteractive};
  border-bottom: none;
  background-color: ${theme.deprecated_bg0};
  font-weight: bold;
  `: `
  opacity: 0.5;
  background-color: ${theme.deprecated_bg3};
  `
  }
`

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 14px;
  padding:0px;
  border: 1px solid;
  padding-bottom: 3px;
  border-color: ${({ theme }) => theme.backgroundInteractive};
`


export interface GeneralMoneyMarketSwapInterface {
  initInteraction: MarginTradeType
  assetData: PreparedAssetData[]
}

export default function GeneralMoneyMarketPanel({ assetData, initInteraction }: GeneralMoneyMarketSwapInterface) {
  const navBarFlag = useNavBarFlag()
  const navBarFlagEnabled = navBarFlag === NavBarVariant.Enabled
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const { account, chainId } = useChainIdAndAccount()

  const [side, setSide] = useState(
    initInteraction === MarginTradeType.Borrow
      || initInteraction === MarginTradeType.Repay
      ? PositionSides.Borrow : PositionSides.Collateral
  )
  const handleSetSide = useCallback(() => {
    setSide(side === PositionSides.Borrow ? PositionSides.Collateral : PositionSides.Borrow)
  },
    [side]
  )
  const [currencyLender, selectCurrencyLender] = useState(SupportedAssets.USDC)

  const lender = useCurrentLendingProtocol()
  const selectableAssets = getSupportedAssets(chainId, lender)


  const selectedAsset = safeGetToken(chainId, currencyLender, lender)

  const [poolInteraction, setInteractionBase] = useState(initInteraction)

  // const setInteractionBase = useSetSingleInteraction()

  const hasNoImplementation = useMemo(() => MAINNET_CHAINS.includes(chainId), [chainId])

  const handleSetInteraction = useCallback(() => {
    if (side === PositionSides.Collateral) {
      if (poolInteraction === MarginTradeType.Withdraw)
        return setInteractionBase(MarginTradeType.Supply)
      else return setInteractionBase(MarginTradeType.Withdraw)
    } else {
      if (poolInteraction === MarginTradeType.Borrow) return setInteractionBase(MarginTradeType.Repay)
      else return setInteractionBase(MarginTradeType.Borrow)
    }
  }, [poolInteraction, account])


  const handleSetInteractionDirect = useCallback((i: MarginTradeType) => {
    if (i === MarginTradeType.Withdraw || i === MarginTradeType.Supply) {
      setInteractionBase(i)
      setSide(PositionSides.Collateral)
    }
    if (i === MarginTradeType.Borrow || i === MarginTradeType.Repay) {
      setInteractionBase(i)
      setSide(PositionSides.Borrow)
    }
  }, [poolInteraction, account])


  const [fieldTop, fieldBottom] = useMemo(() => {
    if (poolInteraction === MarginTradeType.Borrow) return [Field.OUTPUT, Field.INPUT]

    if (poolInteraction === MarginTradeType.Supply) return [Field.INPUT, Field.OUTPUT]

    if (poolInteraction === MarginTradeType.Withdraw) return [Field.OUTPUT, Field.INPUT]

    // last case is repay
    return [Field.INPUT, Field.OUTPUT]
  }, [poolInteraction])

  const restrictedTokenList = useMemo(() => {
    return getAaveTokens(chainId)
  }, [chainId])

  const dispatch = useAppDispatch()

  const [borrowInterestMode, setBorrowInterestMode] = useState(AaveInterestMode.STABLE)

  const theme = useTheme()

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // swap state
  const { independentField, typedValue, recipient } = useMoneyMarketState()

  const { asset: assetToInteractWith } = useGetSingleAsset(chainId, selectedAsset)
  const [selectedCurrencyOutside, setCurrencyOutside] = useState(selectedAsset.symbol)
  const selectedCurrency = useCurrencyWithFallback(selectedCurrencyOutside, LendingProtocol.AAVE)

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
  const currencyAmounts: MappedCurrencyAmounts = useMemo(() => {
    try {
      const selectedCurrencyAmount = account
        ? currencyUserBalances?.[0]
        : selectedCurrency
          ? CurrencyAmount.fromRawAmount(selectedCurrency, '0')
          : undefined

      if (poolInteraction === MarginTradeType.Borrow) {
        // the input is the borrowed amount, the output the received amount
        return {
          [Field.INPUT]: CurrencyAmount.fromRawAmount(
            selectedAsset,
            (borrowInterestMode === AaveInterestMode.STABLE
              ? assetToInteractWith?.aaveData[chainId].userData?.currentStableDebt
              : assetToInteractWith?.aaveData[chainId].userData?.currentVariableDebt) ?? '0'
          ),
          [Field.OUTPUT]: selectedCurrencyAmount,
        }
      }

      if (poolInteraction === MarginTradeType.Supply) {
        // the input is the user-selected currency and amount
        return {
          [Field.INPUT]: selectedCurrencyAmount,
          [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
            selectedAsset,
            assetToInteractWith?.aaveData[chainId].userData?.currentATokenBalance ?? '0'
          ),
        }
      }

      if (poolInteraction === MarginTradeType.Withdraw) {
        // the input is the deposited currency amount
        return {
          [Field.INPUT]: CurrencyAmount.fromRawAmount(
            selectedAsset,
            assetToInteractWith?.aaveData[chainId].userData?.currentATokenBalance ?? '0'
          ),
          [Field.OUTPUT]: selectedCurrencyAmount,
        }
      }

      // poolInteraction === MarginTradeType.Repay
      // input is user token amount, output is debt to be repaid
      return {
        [Field.INPUT]: selectedCurrencyAmount,
        [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
          selectedAsset,
          (borrowInterestMode === AaveInterestMode.STABLE
            ? assetToInteractWith?.aaveData[chainId].userData?.currentStableDebt
            : assetToInteractWith?.aaveData[chainId].userData?.currentVariableDebt) ?? '0'
        ),
      }
    } catch (error) {
      return {
        [Field.INPUT]: undefined,
        [Field.OUTPUT]: undefined
      }
    }
  }, [
    chainId,
    assetToInteractWith,
    selectedCurrency,
    borrowInterestMode,
    currencyUserBalances,
    selectedAsset,
    borrowInterestMode,
    account,
  ])

  const { currencies, inIsETH, outIsETH } = useCurrencyInfo(currencyAmounts, fieldTop, fieldBottom, chainId)

  useEffect(() => {
    const ccyOut = currencies[Field.OUTPUT]
    setIsDirect(Boolean(ccyOut && currencies[Field.INPUT]?.equals(ccyOut)))
  }, [currencies])

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
    execute: onWrap,
    inputError: wrapInputError,
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

  const aavePoolContract = useGetAavePoolContractWithUserProvider(chainId, account)
  const moneyMarketContract = useGetMoneyMarketOperatorContract(chainId, account)

  const marginTraderContract = useMemo(() => {
    if (isDirect) {
      return aavePoolContract
    }
    return moneyMarketContract
  }, [isDirect, account, chainId, moneyMarketContract, aavePoolContract])
  // in case of a direct deposit
  const [approvalStateDirect, approveCallbackDirect] = useApproveCallback(
    (poolInteraction === MarginTradeType.Repay || poolInteraction === MarginTradeType.Supply) ? parsedAmounts[independentField] : undefined,
    marginTraderContract.address
  )

  // check whether the user has approved the router on the input token
  const [approvalState, approveCallback] = useApproveCallbackFromGeneralTrade(
    trade,
    poolInteraction,
    poolInteraction === MarginTradeType.Withdraw ? fieldBottom : fieldTop,
    marginTraderContract.address,
    allowedSlippage
  )

  // check whether the user has approved the router on the input token
  const [borrowApprovalState, approveBorrowCallback] = useDelegateBorrowCallbackFromGeneralTrade(
    LendingProtocol.AAVE,
    trade,
    poolInteraction,
    Field.INPUT,
    marginTraderContract.address,
    allowedSlippage,
    borrowInterestMode
  )

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
  }, [borrowInterestMode, poolInteraction, assetToInteractWith, chainId])

  const [approvalStateOfConcern, approveCallbackOfConcern] = useMemo(() => {
    if (poolInteraction !== MarginTradeType.Borrow) {
      // direct
      if (isDirect) {
        return [approvalStateDirect, approveCallbackDirect]
      }
      // swap - covers swap-in and withdrawals
      return [approvalState, approveCallback]
    }
    // covers borrowing
    return [borrowApprovalState, approveBorrowCallback]
  }, [
    selectedCurrency,
    poolInteraction,
    approvalState,
    borrowApprovalState,
    isDirect,
    approvalStateDirect,
    borrowInterestMode
  ])


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
  const showMaxButtonOut = (poolInteraction === MarginTradeType.Repay || poolInteraction === MarginTradeType.Withdraw) &&
    !maxBottom && Boolean(
      maxBottomAmount?.greaterThan(0) && !parsedAmounts[fieldBottom]?.equalTo(maxBottomAmount)
    )

  const addTransaction = useTransactionAdder()

  const { contractCall, method, estimate, args } = useMemo(() => {
    if (isDirect) {
      const { args, method, estimate, call } = createMoneyMarketDirectCalldata(
        marginTraderContract as any,
        poolInteraction,
        borrowInterestMode,
        parsedAmount,
        account,
        selectedAsset.address
      )
      return { contractCall: call, method, args }
    }
    const { args, method, estimate, call } = createAaveMoneyMarketCalldata(
      trade,
      allowedSlippage,
      marginTraderContract as AaveMoneyMarket & AaveSweeper,
      borrowInterestMode,
      poolInteraction,
      inIsETH,
      account,
      account,
      !showMaxButtonOut
    )
    return { contractCall: call, method, args, estimate }
  }, [
    parsedAmounts,
    marginTraderContract,
    side,
    poolInteraction,
    borrowInterestMode,
    account,
    parsedAmount,
    trade,
    isDirect,
    selectedAsset.address,
    assetToInteractWith,
    isExpertMode
  ])

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
        swapErrorMessage: error.message,
        txHash: undefined,
      })
    }
    const opts = gasEstimate ? { gasLimit: calculateGasMargin(gasEstimate) } : {}

    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    if (contractCall) {
      await contractCall(opts)
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
                protocol: 'AAVE',
                type: TransactionType.DIRECT_INTERACTION,
                subType: poolInteraction,
                currencyId: currencyId(parsedAmount.currency),
                amount: parsedAmount.quotient.toString()
              })
          } else {
            if (trade)
              addTransaction(
                txResponse,
                trade.tradeType === TradeType.EXACT_INPUT
                  ? {
                    protocol: 'AAVE',
                    type: TransactionType.MONEY_MARKET,
                    subType: poolInteraction,
                    tradeType: TradeType.EXACT_INPUT,
                    inputCurrencyId: currencyId(trade.inputAmount.currency),
                    inputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                    expectedOutputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                    outputCurrencyId: currencyId(trade.outputAmount.currency),
                    minimumOutputCurrencyAmountRaw: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
                  }
                  : {
                    protocol: 'AAVE',
                    type: TransactionType.MONEY_MARKET,
                    subType: poolInteraction,
                    tradeType: TradeType.EXACT_OUTPUT,
                    inputCurrencyId: currencyId(trade.inputAmount.currency),
                    maximumInputCurrencyAmountRaw: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
                    outputCurrencyId: currencyId(trade.outputAmount.currency),
                    outputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                    expectedInputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                  }
              )
          }

          dispatch(
            fetchAAVEUserReserveDataAsync({
              chainId,
              account: account ?? '',
              assetsToQuery: filterSupportedAssets(trade?.inputAmount?.currency, trade?.outputAmount?.currency),
            })
          )
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
    contractCall,
    poolInteraction,
    stablecoinPriceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    isDirect,
    recipientAddress,
    account,
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

  const [hasStableRate, borrowRateStable, borrowRateVariable, supplyRate] = useMemo(() => {
    return [
      assetToInteractWith?.aaveData[chainId].reserveData?.stableBorrowRateEnabled ?? false,
      formatAaveYieldToNumber(assetToInteractWith?.aaveData[chainId].reserveData?.stableBorrowRate ?? '0'),
      formatAaveYieldToNumber(assetToInteractWith?.aaveData[chainId].reserveData?.variableBorrowRate ?? '0'),
      formatAaveYieldToNumber(assetToInteractWith?.aaveData[chainId].reserveData?.liquidityRate ?? '0'),
    ]
  }, [assetToInteractWith])

  useEffect(() => {
    if (!hasStableRate) {
      setBorrowInterestMode(AaveInterestMode.VARIABLE)
    }
  }, [hasStableRate])

  const riskParameters = useGetAaveRiskParameters(chainId, account)

  const riskChange = useMemo(() => {
    const inAm = (isDirect ? parsedAmount?.quotient.toString() : trade?.inputAmount.quotient.toString()) ?? '0'
    const outAm = (isDirect ? parsedAmount?.quotient.toString() : trade?.outputAmount.quotient.toString()) ?? '0'
    // collateral in reduces, collateral out increases
    const deltaIn =
      side === PositionSides.Collateral
        ? poolInteraction === MarginTradeType.Supply
          ? ethers.BigNumber.from(outAm)
          : ethers.BigNumber.from(inAm).mul(-1)
        : poolInteraction === MarginTradeType.Borrow
          ? ethers.BigNumber.from(inAm)
          : ethers.BigNumber.from(outAm).mul(-1)

    return calculateAaveRiskChange(
      {
        asset: assetToInteractWith?.id as SupportedAssets,
        delta: ethers.BigNumber.from(deltaIn),
        side
      },
      undefined,
      riskParameters
    )
  }, [riskParameters, assetToInteractWith, trade])

  const directText = useMemo(() => {
    if (side === PositionSides.Collateral) {
      if (poolInteraction === MarginTradeType.Supply) {
        return 'Direct Supply'
      } else return 'Direct Withdraw'
    }

    if (poolInteraction === MarginTradeType.Borrow) {
      return 'Direct Borrow'
    } else return 'Direct Repay'
  }, [side, poolInteraction])


  const {
    riskValidationMessage,
    hasRiskError,
    hf,
    validatedSwapText,
    buttonDisabled,
  } = useMoneyMarketValidation(
    account,
    poolInteraction,
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
    <Container>
      <PageWrapper redesignFlag={redesignFlagEnabled} navBarFlag={navBarFlagEnabled} style={{ maxWidth: '400px' }}>
        <SwapWrapper id="swap-page" redesignFlag={redesignFlagEnabled}>
          <TabContainer>
            <ButtonRow>
              <TypeButton
                onClick={() => handleSetInteractionDirect(MarginTradeType.Supply)}
                selected={poolInteraction === MarginTradeType.Supply}>
                Supply
              </TypeButton>
              <TypeButton
                onClick={() => handleSetInteractionDirect(MarginTradeType.Withdraw)}
                selected={poolInteraction === MarginTradeType.Withdraw}
                disabled={false}
              >
                Withdraw
              </TypeButton>
              <TypeButton
                onClick={() => handleSetInteractionDirect(MarginTradeType.Borrow)}
                selected={poolInteraction === MarginTradeType.Borrow}
                disabled={false}
              >
                Borrow
              </TypeButton>
              <TypeButton
                onClick={() => handleSetInteractionDirect(MarginTradeType.Repay)}
                selected={poolInteraction === MarginTradeType.Repay}
                disabled={false}
              >
                Repay
              </TypeButton>
            </ButtonRow>
            <MoneyMarketTradeHeader allowedSlippage={allowedSlippage} side={side} interaction={poolInteraction} chainId={chainId} isDirect={isDirect} />
            {isDirect ? (
              <ConfirmDirectInteractionModal
                riskMessage={riskValidationMessage}
                hasRiskError={hasRiskError}
                healthFactor={hf}
                isOpen={showConfirm}
                interaction={poolInteraction}
                amount={parsedAmount?.toSignificant(18)}
                ccy={(assetToInteractWith && assetToInteractWith.id) ?? SupportedAssets.AAVE}
                attemptingTxn={attemptingTxn}
                txHash={txHash}
                recipient={recipient}
                onConfirm={handleSwap}
                swapErrorMessage={swapErrorMessage}
                onDismiss={handleConfirmDismiss}
                swapQuoteReceivedDate={swapQuoteReceivedDate}
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
                swapQuoteReceivedDate={swapQuoteReceivedDate}
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
                        poolInteraction === MarginTradeType.Borrow ?
                          'Borrow and receive assets in your Wallet' :
                          'Reduce your debt by repaying debt from your wallet'
                      }>
                        {poolInteraction === MarginTradeType.Borrow ?
                          isDirect ? 'Borrow to wallet' : 'Swap to Wallet' :
                          isDirect ? 'Repay from wallet' : 'Swap from wallet'}
                      </MouseoverTooltip>
                    </PositionSideKey>
                  ) : (
                    <>
                      <PositionSideKey textAlign={'left'}>
                        <MouseoverTooltip text={
                          poolInteraction === MarginTradeType.Supply ?
                            'Increase your collateral with the lender by supplying assets from your wallet' :
                            'Reduce your collateral in the lending protocol and send coins to your wallet'
                        }>
                          {poolInteraction === MarginTradeType.Supply ?
                            isDirect ? 'Supply from wallet' : 'Swap from wallet' :
                            isDirect ? 'Withdraw to wallet' : 'Swap to wallet'}
                        </MouseoverTooltip>
                      </PositionSideKey>
                    </>
                  )}
                  <MoneyMarketPanel
                    isPlus={[MarginTradeType.Borrow, MarginTradeType.Withdraw].includes(poolInteraction)}
                    balanceSignIsPlus
                    hideInput={false}
                    label={
                      independentField === fieldBottom && !showWrap ? (
                        <Trans>From (at most)</Trans>
                      ) : (
                        <Trans>From</Trans>
                      )
                    }
                    value={formattedAmounts[fieldTop]}
                    showMaxButton={
                      (poolInteraction === MarginTradeType.Supply || poolInteraction === MarginTradeType.Repay)
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
                <ArrowWrapper
                  clickable={isSupportedChain(chainId)}
                  redesignFlag={redesignFlagEnabled}
                  onClick={handleSetInteraction}
                >
                  <ArrowContainer
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                    color={theme.textPrimary}
                  >

                    <ArrowDotted size={20} isUp={
                      poolInteraction === MarginTradeType.Withdraw ||
                      poolInteraction === MarginTradeType.Borrow} />

                  </ArrowContainer>
                </ArrowWrapper>
              </div>
              <div>
                <AutoColumnAdjusted gap={redesignFlagEnabled ? '12px' : '8px'} isMobile={isMobile}>
                  <SwapPanelContainer redesignFlag={redesignFlagEnabled}>
                    {side === PositionSides.Borrow ? (
                      <>
                        <PositionSideKey textAlign={'left'}>
                          <MouseoverTooltip text={
                            poolInteraction === MarginTradeType.Borrow ?
                              'The asset configuration for which the debt will be increased' :
                              'The asset configuration for which the debt will be decreased'
                          }>
                            {poolInteraction === MarginTradeType.Borrow ? 'Borrow from' : 'Repay to'}
                          </MouseoverTooltip>
                        </PositionSideKey>
                        <DebtOptionButtonMarginTrade
                          handleSelectInterestMode={handleSelectInterestMode}
                          hasStableBorrow={hasStableRate}
                          borrowRateStable={borrowRateStable}
                          borrowRateVariable={borrowRateVariable}
                          selectedBorrowInterestMode={borrowInterestMode}
                          isMobile={isMobile}
                        />
                      </>
                    ) : (
                      <>
                        <PositionSideKey textAlign={'left'}>
                          <MouseoverTooltip text={
                            poolInteraction === MarginTradeType.Supply ?
                              'The collateral configuration for which the collateral will be increased' :
                              'The collateral configuration for which the collateral will be decreased'
                          }>
                            {poolInteraction === MarginTradeType.Supply ? 'Supply to' : 'Withdraw from'}
                          </MouseoverTooltip>
                        </PositionSideKey>
                        <DepositYieldMarginTrade liquidityRate={supplyRate} isMobile={isMobile} />
                      </>
                    )}
                    <InputWrapper redesignFlag={redesignFlagEnabled}>
                      <CurrencyInputPro
                        assetList={selectableAssets}
                        onAssetSelect={selectCurrencyLender}
                        placeholder={currencyLender}
                        asset={currencyLender}
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
                                : ' No debt of any kind'
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
                                    {poolInteraction === MarginTradeType.Supply ||
                                      poolInteraction === MarginTradeType.Repay
                                      ? `You can now trade ${currencies[fieldTop]?.symbol}`
                                      : poolInteraction === MarginTradeType.Withdraw
                                        ? `You can now withdraw ${currencies[fieldBottom]?.symbol}`
                                        : poolInteraction === MarginTradeType.Borrow
                                          ? `You can now borrow ${currencies[fieldBottom]?.symbol}`
                                          : 'unsupported'}
                                  </MarginTradingButtonText>
                                ) : (
                                  <MarginTradingButtonText>
                                    {poolInteraction === MarginTradeType.Supply ||
                                      poolInteraction === MarginTradeType.Repay
                                      ? `Allow our protocol to use your ${currencies[fieldTop]?.symbol}`
                                      : poolInteraction === MarginTradeType.Withdraw
                                        ? `Allow withdrawing ${currencies[fieldBottom]?.symbol}`
                                        : poolInteraction === MarginTradeType.Borrow
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
          </TabContainer>
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
      <ContainerCol>
        {/* <ThemedText.BodyPrimary> Select An Asset</ThemedText.BodyPrimary> */}
        {!isMobile && <ExpandableTable assetData={assetData} onAssetSelect={selectCurrencyLender} />}
      </ContainerCol>
    </Container>
  )
}
