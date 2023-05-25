import { createAction } from '@reduxjs/toolkit'
import { Field } from 'types/1delta';



export const selectMoneyMarketCurrency = createAction<{ field: Field; currencyId: string }>('moneyMarket/selectMoneyMarketCurrency')
export const switchCurrencies = createAction<void>('moneyMarket/switchCurrencies')
export const typeInput = createAction<{ field: Field; typedValue: string }>('moneyMarket/typeInput')
export const replaceMoneyMarketState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
}>('moneyMarket/replaceMoneyMarketState')
export const setRecipient = createAction<{ recipient: string | null }>('moneyMarket/setRecipient')
