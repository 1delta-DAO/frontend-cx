import { createReducer } from '@reduxjs/toolkit'
import { SupportedAssets } from 'types/1delta'
import { selectChart } from './actions'

export interface ChartState {
  userChart: { chartShown: SupportedAssets | undefined }
}

export const initialState: ChartState = {
  userChart: {
    chartShown: undefined,
  }
}

export default createReducer<ChartState>(initialState, (builder) =>
  builder
    .addCase(selectChart, (state, action) => {
      state.userChart = action.payload
    })
)
