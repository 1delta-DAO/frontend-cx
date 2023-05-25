import { directTextType, useGeneralSwapValidation, useMarginTradeSwapValidation, useMoneyMarketSwapValidation, useSingleSideSwapValidation, validation } from "./swapValidation"
import { Currency, CurrencyAmount, TradeType } from "@uniswap/sdk-core"
import { InterfaceTrade } from "state/routing/types"
import { Field, MarginTradeType, MappedCurrencyAmounts, PositionSides } from 'types/1delta'
import { TradeImpact } from "hooks/riskParameters/types"
import { useGeneralRiskValidation, useMarginTradeRiskValidation, useMoneyMarketRiskValidation, useSingleSideRiskValidation } from "./riskValidation"
import { useGeneralBalanceValidation, useMarginTradeBalanceValidation, useMoneyMarketBalanceValidation, useSingleSideBalanceValidation as useSingleSideBalanceValidation } from "./balanceValidation"
import { WarningSeverity } from "utils/prices"


interface TransactionValidation {
  riskValidationMessage: string
  hasRiskError: boolean
  hf: number
  balanceErrorText: string
  hasBalanceError: boolean
  validatedSwapText: validation
  buttonDisabled: boolean
}

export const useMarginTradeValidation = (
  selectedAccountAddress: string | undefined,
  currencyAmounts: { [field: string]: CurrencyAmount<Currency> | undefined | null; },
  parsedAmount: CurrencyAmount<Currency> | undefined,
  typedValue: string,
  marginTradeType: MarginTradeType,
  fieldCollateral: Field,
  fieldDebt: Field,
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  riskChange: TradeImpact,
  swapInputError: React.ReactNode,
  hasNoImplementation: boolean,
  isExpertMode: boolean,
  routeIsLoading: boolean,
  routeIsSyncing: boolean,
  priceImpactTooHigh: boolean,
  priceImpactSeverity: WarningSeverity,
): TransactionValidation => {

  // risk validation
  const [riskValidationMessage, hasRiskError, hf] = useMarginTradeRiskValidation(
    riskChange,
    marginTradeType,
    isExpertMode
  )

  const [balanceErrorText, hasBalanceError] = useMarginTradeBalanceValidation(
    selectedAccountAddress,
    currencyAmounts,
    parsedAmount,
    typedValue,
    marginTradeType,
    fieldCollateral,
    fieldDebt,
    trade
  )

  const [validatedSwapText, buttonDisabled] = useMarginTradeSwapValidation(
    hasNoImplementation,
    selectedAccountAddress,
    marginTradeType,
    routeIsLoading,
    routeIsSyncing,
    swapInputError,
    priceImpactTooHigh,
    priceImpactSeverity,
    hasRiskError,
    riskValidationMessage,
    hasBalanceError,
    currencyAmounts,
    balanceErrorText,
    hf,
  )

  return {
    riskValidationMessage,
    hasRiskError,
    hf,
    balanceErrorText,
    hasBalanceError,
    validatedSwapText,
    buttonDisabled,
  }
}



export const useSingleSideValidation = (
  selectedAccountAddress: string | undefined,
  currencyAmounts: MappedCurrencyAmounts,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  typedValue: string,
  side: PositionSides,
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  riskChange: TradeImpact,
  hasNoImplementation: boolean,
  isExpertMode: boolean,
  routeIsLoading: boolean,
  routeIsSyncing: boolean,
  priceImpactTooHigh: boolean,
  priceImpactSeverity: WarningSeverity,
): TransactionValidation => {

  // risk validation
  const [riskValidationMessage, hasRiskError, hf] = useSingleSideRiskValidation(
    riskChange,
    isExpertMode
  )

  const [balanceErrorText, hasBalanceError] = useSingleSideBalanceValidation(
    selectedAccountAddress,
    currencyAmounts,
    parsedAmount,
    typedValue,
    side,
    trade
  )

  const [validatedSwapText, buttonDisabled] = useSingleSideSwapValidation(
    hasNoImplementation,
    selectedAccountAddress,
    routeIsLoading,
    routeIsSyncing,
    priceImpactTooHigh,
    priceImpactSeverity,
    hasRiskError,
    riskValidationMessage,
    hasBalanceError,
    currencyAmounts,
    balanceErrorText,
    hf,
  )

  return {
    riskValidationMessage,
    hasRiskError,
    hf,
    balanceErrorText,
    hasBalanceError,
    validatedSwapText,
    buttonDisabled,
  }
}


export const useMoneyMarketValidation = (
  selectedAccountAddress: string | undefined,
  poolInteraction: MarginTradeType,
  isDirect: boolean,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  currencyAmounts: MappedCurrencyAmounts,
  fieldTop: Field,
  fieldBottom: Field,
  typedValue: string,
  side: PositionSides,
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  riskChange: TradeImpact,
  isExpertMode: boolean,
  hasNoImplementation: boolean,
  swapInputError: React.ReactNode,
  routeIsLoading: boolean,
  routeIsSyncing: boolean,
  priceImpactTooHigh: boolean,
  priceImpactSeverity: WarningSeverity,
  directText: directTextType,
): TransactionValidation => {

  // risk validation
  const [riskValidationMessage, hasRiskError, hf] = useMoneyMarketRiskValidation(
    riskChange,
    poolInteraction,
    isExpertMode
  )

  const [balanceErrorText, hasBalanceError] = useMoneyMarketBalanceValidation(
    selectedAccountAddress,
    poolInteraction,
    isDirect,
    parsedAmount,
    currencyAmounts,
    fieldTop,
    fieldBottom,
    typedValue,
    side,
    trade
  )

  const [validatedSwapText, buttonDisabled] = useMoneyMarketSwapValidation(
    hasNoImplementation,
    selectedAccountAddress,
    isDirect,
    swapInputError,
    routeIsLoading,
    routeIsSyncing,
    priceImpactTooHigh,
    priceImpactSeverity,
    hasRiskError,
    riskValidationMessage,
    hasBalanceError,
    currencyAmounts,
    balanceErrorText,
    hf,
    directText,
  )


  return {
    riskValidationMessage,
    hasRiskError,
    hf,
    balanceErrorText,
    hasBalanceError: Boolean(hasBalanceError),
    validatedSwapText,
    buttonDisabled,
  }
}
