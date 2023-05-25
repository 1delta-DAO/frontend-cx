import { Currency, CurrencyAmount, TradeType } from "@uniswap/sdk-core"
import { useMemo } from "react"
import { InterfaceTrade } from "state/routing/types"
import { Field, MarginTradeType, PositionSides } from 'types/1delta'

export const useMoneyMarketBalanceValidation = (
  selectedAccountAddress: string | undefined,
  poolInteraction: MarginTradeType,
  isDirect: boolean,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  currencyAmounts: { [field: string]: CurrencyAmount<Currency> | undefined | null; },
  fieldTop: Field,
  fieldBottom: Field,
  typedValue: string,
  side: PositionSides,
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
): [string, boolean | undefined] => {
  return useMemo(() => {

    if (!Boolean(selectedAccountAddress)) return ['', false]

    if (poolInteraction === MarginTradeType.Supply) {
      if (isDirect) {
        const hasTooLittle = parsedAmount?.greaterThan(currencyAmounts[fieldTop] ?? '0')
        return ['Insufficient balance', hasTooLittle]
      } else {
        if (!trade) return ['', false]
        const hasTooLittle = currencyAmounts[fieldTop]?.lessThan(trade.inputAmount)
        return ['Insufficient balance', hasTooLittle]
      }
    }

    if (poolInteraction === MarginTradeType.Withdraw) {
      if (isDirect) {
        if (!currencyAmounts[fieldBottom]) return ['', false]
        const hasTooLittle = parsedAmount?.greaterThan(currencyAmounts[fieldBottom] ?? '0')
        return ['Insufficient supply', hasTooLittle]
      } else {
        if (!trade) return ['', false]
        const hasTooLittle = currencyAmounts[fieldBottom]?.lessThan(trade.inputAmount)
        return ['Insufficient supply', hasTooLittle]
      }
    }

    if (poolInteraction === MarginTradeType.Repay) {
      if (isDirect) {
        if (!currencyAmounts[fieldBottom] || !parsedAmount) return ['', false]
        const hasTooLittle = parsedAmount?.greaterThan(currencyAmounts[fieldTop] ?? '0')
        if (hasTooLittle) return ['Insufficient balance', hasTooLittle]

        const tooMuchRepay = currencyAmounts[fieldBottom]?.lessThan(parsedAmount)
        return ['Too much to repay', tooMuchRepay]
      } else {
        if (!trade) return ['', false]
        const hasTooLittle = currencyAmounts[fieldTop]?.lessThan(trade.inputAmount)
        if (hasTooLittle) return ['Insufficient balance', hasTooLittle]

        const tooMuchRepay = currencyAmounts[fieldBottom]?.lessThan(trade.outputAmount)
        return ['Too much to repay', tooMuchRepay]
      }
    } else {
      // borrowing has no hard restrictions
      return ['', false]
    }
  }, [trade, parsedAmount, currencyAmounts, side, poolInteraction, isDirect, fieldTop, fieldBottom, typedValue])
}


export const useSingleSideBalanceValidation = (
  selectedAccountAddress: string | undefined,
  currencyAmounts: { [field: string]: CurrencyAmount<Currency> | undefined | null; },
  parsedAmount: CurrencyAmount<Currency> | undefined,
  typedValue: string,
  side: PositionSides,
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
): [string, boolean] => {
  return useMemo(() => {

    if (!Boolean(selectedAccountAddress)) return ['', false]

    if (side === PositionSides.Collateral) {
      if (!trade) return ['', false]
      const hasTooLittle = currencyAmounts[Field.INPUT]?.lessThan(trade.inputAmount)
      return ['Insufficient supply', Boolean(hasTooLittle)]
    }

    if (!trade) return ['', false]
    const tooMuchRepay = currencyAmounts[Field.OUTPUT]?.lessThan(trade.outputAmount)
    return ['Too much to repay', Boolean(tooMuchRepay)]

    // }
  }, [trade, parsedAmount, currencyAmounts, side, typedValue])
}


export const useMarginTradeBalanceValidation = (
  selectedAccountAddress: string | undefined,
  currencyAmounts: { [field: string]: CurrencyAmount<Currency> | undefined | null; },
  parsedAmount: CurrencyAmount<Currency> | undefined,
  typedValue: string,
  marginTradeType: MarginTradeType,
  fieldLeft: Field,
  fieldRight: Field,
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
): [string, boolean] => {

  return useMemo(() => {
    if (!Boolean(selectedAccountAddress)) return ['', false]

    if (marginTradeType === MarginTradeType.Trim) {
      if (!trade) return ['', false]
      const hasTooLittle = currencyAmounts[fieldLeft]?.lessThan(trade.inputAmount)
      if (hasTooLittle) return ['Insufficient supply', hasTooLittle]

      const repaysTooMuch = currencyAmounts[fieldRight]?.lessThan(trade.outputAmount)
      if (repaysTooMuch) return ['Too much to repay', repaysTooMuch]
    }
    return ['', false]
  }, [trade, parsedAmount, currencyAmounts, fieldLeft, marginTradeType, typedValue])
}



export const useGeneralBalanceValidation = (
  selectedAccountAddress: string | undefined,
  currencyAmounts: { [field: string]: CurrencyAmount<Currency> | undefined | null; },
  parsedAmount: CurrencyAmount<Currency> | undefined,
  marginTradeType: MarginTradeType,
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
): [string, boolean] => {

  return useMemo(() => {
    if (!Boolean(selectedAccountAddress)) return ['', false]

    if (!trade) return ['', false]
    switch (marginTradeType) {
      case MarginTradeType.Trim: {
        const hasTooLittle = currencyAmounts[Field.INPUT]?.lessThan(trade.inputAmount)
        if (hasTooLittle) return ['Insufficient supply', hasTooLittle]

        const repaysTooMuch = currencyAmounts[Field.OUTPUT]?.lessThan(trade.outputAmount)
        if (repaysTooMuch) return ['Too much to repay', repaysTooMuch]

        break;
      }
      case MarginTradeType.Collateral: {
        const hasTooLittle = currencyAmounts[Field.INPUT]?.lessThan(trade.inputAmount)
        if (hasTooLittle) return ['Insufficient supply', true]
        break;
      }
      case MarginTradeType.Debt: {
        const tooMuchRepay = currencyAmounts[Field.OUTPUT]?.lessThan(trade.outputAmount)
        if (tooMuchRepay) return ['Too much to repay', true]
        break;
      }
    }
    return ['', false]
  }, [trade, parsedAmount, currencyAmounts, marginTradeType])
}