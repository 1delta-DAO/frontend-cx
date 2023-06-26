import { createReducer } from '@reduxjs/toolkit'
import { fetchUserSlots } from './fetchUserSlots';

export interface Slot {
  slot: string;
  owner: string;
  collateralSymbol: string;
  collateral: string;
  collateralDecimals: number;
  cCollateral: string;
  debtSymbol: string;
  debt: string;
  debtDecimals: number;
  cDebt: string;
  collateralBalance: string;
  debtBalance: string;
  creationTime: number;
  closeTime: number;
  collateralSwapped: number;
  debtSwapped: number;
  feeDenominator: number;
}

interface SlotState {
  slots: Slot[]
  loading: boolean
}

const initialState = { slots: [], loading: false }

export default createReducer<SlotState>(initialState, (builder) =>
  builder
    .addCase(fetchUserSlots.pending, (state,) => {
      state.loading = true
      //
    })
    .addCase(fetchUserSlots.fulfilled, (state, action) => {
      state.slots = action.payload.slots
      state.loading = false
    })
)
