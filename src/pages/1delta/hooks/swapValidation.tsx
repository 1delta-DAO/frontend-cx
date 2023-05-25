import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { Dots } from 'components/swap/styleds';
import React, { useMemo } from 'react'
import { MarginTradeType } from 'types/1delta';
import { WarningSeverity } from 'utils/prices';

export const Loader = (): React.ReactNode => {

  return (
    <Dots key={'loadingMM'} >
      Calculating Trade
    </Dots>
  )
}

export type validation = string | number | true | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | JSX.Element

export type directTextType = "Direct Supply" | "Direct Withdraw" | "Direct Borrow" | "Direct Repay"

export const useMoneyMarketSwapValidation = (
  hasNoImplementation: boolean,
  selectedAccountAddress: string | undefined,
  isDirect: boolean,
  swapInputError: React.ReactNode,
  routeIsLoading: boolean,
  routeIsSyncing: boolean,
  priceImpactTooHigh: boolean,
  priceImpactSeverity: WarningSeverity,
  hasRiskError: boolean,
  riskValidationMessage: any,
  hasBalanceError: boolean | undefined,
  currencyAmounts: { [field: string]: CurrencyAmount<Currency> | undefined | null; },
  balanceErrorText: string,
  hf: number,
  directText: directTextType,
): [validation, boolean] => {
  return useMemo(() => {

    if (hasNoImplementation) return ['Coming Soon!', true]

    if (Boolean(selectedAccountAddress)) {
      if (hasBalanceError) return [balanceErrorText, true]

      if (!isDirect && swapInputError) return [swapInputError, true]
      if (riskValidationMessage && hf < 1.05) {
        if (hf >= 1) {
          return [riskValidationMessage, false]
        }
        // for a critical violation we disable the button
        return [riskValidationMessage, true]
      }
      if (isDirect) return [directText, false]

      if (routeIsSyncing || routeIsLoading) return [Loader(), true]

      if (priceImpactSeverity > 2) return ['Swap Anyway', false]

      if (priceImpactTooHigh) return ['Price Impact Too High', true]

      return ['Swap', false]
    }

    return ['Create a 1delta Account to trade!', true]
  }, [
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
  ])
}


export const useSingleSideSwapValidation = (
  hasNoImplementation: boolean,
  selectedAccountAddress: string | undefined,
  routeIsLoading: boolean,
  routeIsSyncing: boolean,
  priceImpactTooHigh: boolean,
  priceImpactSeverity: WarningSeverity,
  hasRiskError: boolean,
  riskValidationMessage: any,
  hasBalanceError: boolean | undefined,
  currencyAmounts: { [field: string]: CurrencyAmount<Currency> | undefined | null; },
  balanceErrorText: string,
  hf: number,
): [validation, boolean] => {

  return useMemo(() => {

    if (hasNoImplementation) return ['Coming Soon!', true]

    if (Boolean(selectedAccountAddress)) {
      if (hasBalanceError) return [balanceErrorText, true]

      if (riskValidationMessage && hf < 1.05) {
        if (hf >= 1) {
          return [riskValidationMessage, false]
        }
        // for a critical violation we disable the button
        return [riskValidationMessage, true]
      }

      if (routeIsSyncing || routeIsLoading) return [Loader(), true]

      if (priceImpactSeverity > 2) return ['Swap Anyway', false]

      if (priceImpactTooHigh) return ['Price Impact Too High', true]

      return ['Swap', false]
    }

    return ['Create a 1delta Account to trade!', true]
  }, [
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
  ])
}



export const useMarginTradeSwapValidation = (
  hasNoImplementation: boolean,
  selectedAccountAddress: string | undefined,
  marginTradeType: MarginTradeType,
  routeIsLoading: boolean,
  routeIsSyncing: boolean,
  swapInputError: React.ReactNode,
  priceImpactTooHigh: boolean,
  priceImpactSeverity: WarningSeverity,
  hasRiskError: boolean,
  riskValidationMessage: any,
  hasBalanceError: boolean | undefined,
  currencyAmounts: { [field: string]: CurrencyAmount<Currency> | undefined | null; },
  balanceErrorText: string,
  hf: number,
): [validation, boolean] => {

  return useMemo(() => {
    if (hasNoImplementation) return ['Coming Soon!', true]

    if (Boolean(selectedAccountAddress)) {

      if (hasBalanceError) return [balanceErrorText, true]
      if (swapInputError) return [swapInputError, true]
      if (riskValidationMessage && hf < 1.05) {
        if (hf >= 1) {
          return [riskValidationMessage, false]
        }
        // for a critical violation we disable the button
        return [riskValidationMessage, true]
      }
      if (routeIsSyncing || routeIsLoading) return [<Dots key={'loadingMS'}>Calculating Trade</Dots>, true]

      if (priceImpactSeverity > 2) return ['Swap Anyway', false]

      if (priceImpactTooHigh) return ['Price Impact Too High', true]

      return [marginTradeType === MarginTradeType.Trim ? 'Trim Position' : 'Build Position', false]
    }

    return ['Create a 1delta Account to trade!', true]
  }, [
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
  ])
}




export const useGeneralSwapValidation = (
  hasNoImplementation: boolean,
  selectedAccountAddress: string | undefined,
  marginTradeType: MarginTradeType,
  routeIsLoading: boolean,
  routeIsSyncing: boolean,
  swapInputError: React.ReactNode,
  priceImpactTooHigh: boolean,
  priceImpactSeverity: WarningSeverity,
  riskValidationMessage: any,
  balanceErrorText: string,
  hf: number,
): [validation, boolean] => {

  return useMemo(() => {
    if (hasNoImplementation) return ['Coming Soon!', true]

    if (Boolean(selectedAccountAddress)) {

      if (balanceErrorText) return [balanceErrorText, true]
      if (swapInputError) return [swapInputError, true]
      if (riskValidationMessage && hf < 1.05) {
        if (hf >= 1) {
          return [riskValidationMessage, false]
        }
        // for a critical violation we disable the button
        return [riskValidationMessage, true]
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
    routeIsLoading,
    routeIsSyncing,
    priceImpactTooHigh,
    priceImpactSeverity,
    riskValidationMessage,
    balanceErrorText,
    hf,
  ])
}