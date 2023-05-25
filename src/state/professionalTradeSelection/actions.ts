import { createAction } from '@reduxjs/toolkit'
import { Field, MarginTradeState, OneDeltaTradeType } from 'types/1delta';


export const resetSelectionState = createAction<void>('professionalTradeSelection/resetSelectionState')
export const setPosition = createAction<{ position: MarginTradeState }>('professionalTradeSelection/setPosition')
export const setTradeType = createAction<{ tradeType: OneDeltaTradeType }>('professionalTradeSelection/setTradeType')
export const selectProfessionalCurrency = createAction<{ field: Field; currencyId: string }>('professionalTradeSelection/selectProfessionalCurrency')
export const switchCurrencies = createAction<void>('professionalTradeSelection/switchCurrencies')
export const typeInput = createAction<{ field: Field; typedValue: string }>('professionalTradeSelection/typeInput')
export const setRecipient = createAction<{ recipient: string | null }>('professionalTradeSelection/setRecipient')

export const replaceProfessionalState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
}>('professionalTradeSelection/replaceProfessionalState')