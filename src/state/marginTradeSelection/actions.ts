import { createAction } from '@reduxjs/toolkit'
import { MarginTradeType, MarginTradeState, OneDeltaTradeType, SupportedAssets } from 'types/1delta';

export const resetSelectionState = createAction<void>('marginTradeSelection/resetSelectionState')
export const setPosition = createAction<{ position: MarginTradeState }>('marginTradeSelection/setPosition')
export const setTradeType = createAction<{ tradeType: OneDeltaTradeType }>('marginTradeSelection/setTradeType')
export const setSingleInteraction = createAction<{ interaction: MarginTradeType }>('marginTradeSelection/setSingleInteraction')
export const setBaseCurrency = createAction<{ asset: SupportedAssets }>('marginTradeSelection/setBaseCurrency')