import { createAction } from '@reduxjs/toolkit'
import { Field } from 'types/1delta';



export const selectSingleSideCurrency = createAction<{ field: Field; currencyId: string }>('singleSide/selectSingleSideCurrency')
export const switchCurrencies = createAction<void>('singleSide/switchCurrencies')
export const typeInput = createAction<{ field: Field; typedValue: string }>('singleSide/typeInput')
export const replaceSingleSideState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
}>('singleSide/replaceSingleSideState')
export const setRecipient = createAction<{ recipient: string | null }>('singleSide/setRecipient')
