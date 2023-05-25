import { createReducer } from '@reduxjs/toolkit'
import {
  MarginTradeType,
  MarginTradeState,
  OneDeltaTradeType,
  PositionDirection,
  SupportedAssets
} from 'types/1delta'
import {
  resetSelectionState,
  setBaseCurrency,
  setPosition,
  setSingleInteraction,
  setTradeType,
} from './actions'


const defaultState: MarginTradeState = {
  [PositionDirection.To]: undefined,
  [PositionDirection.From]: undefined,
  isSingle: false,
  interaction: MarginTradeType.Supply,
  baseCurrency: SupportedAssets.USDC // only relevant for Compound V3
}


export interface MarginTradeSelection {
  // MarginTradeType: MarginTradeType
  position: MarginTradeState
  marginTradeType: OneDeltaTradeType
}

export const initialState: MarginTradeSelection = {
  // MarginTradeType: MarginTradeType.Borrow,
  position: defaultState,
  marginTradeType: OneDeltaTradeType.None
}

export default createReducer<MarginTradeSelection>(initialState, (builder) =>
  builder
    .addCase(resetSelectionState, () => initialState)
    .addCase(setPosition, (state, action) => {
      state.position = action.payload.position
    })
    .addCase(setTradeType, (state, action) => {
      state.marginTradeType = action.payload.tradeType
    })
    .addCase(setSingleInteraction, (state, action) => {
      state.position.interaction = action.payload.interaction
    })
    .addCase(setBaseCurrency, (state, action) => {
      state.position.baseCurrency = action.payload.asset
    })
)
