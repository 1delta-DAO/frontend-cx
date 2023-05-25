import { createReducer } from '@reduxjs/toolkit'
import {
  Field,
  MarginTradeType,
  MarginTradeState,
  OneDeltaTradeType,
  PositionDirection,
  SupportedAssets
} from 'types/1delta'
import {
  replaceProfessionalState,
  resetSelectionState,
  selectProfessionalCurrency,
  setPosition,
  setRecipient,
  setTradeType,
  typeInput,
} from './actions'


const defaultState: MarginTradeState = {
  [PositionDirection.To]: undefined,
  [PositionDirection.From]: undefined,
  isSingle: false,
  interaction: MarginTradeType.Borrow,
  baseCurrency: SupportedAssets.USDC
}


export interface ProfessionalTradeSelection {
  // MarginTradeType: MarginTradeType
  independentField: Field,
  position: MarginTradeState
  OneDeltaTradeType: OneDeltaTradeType
  recipient: string | null
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined | null
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined | null
  }

}

export const initialState: ProfessionalTradeSelection = {
  // MarginTradeType: MarginTradeType.Borrow,
  independentField: Field.OUTPUT,
  position: defaultState,
  OneDeltaTradeType: OneDeltaTradeType.MarginSwap,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: undefined
  },
  [Field.OUTPUT]: {
    currencyId: undefined
  },
  recipient: null
}

export default createReducer<ProfessionalTradeSelection>(initialState, (builder) =>
  builder
    .addCase(resetSelectionState, () => initialState)
    .addCase(setPosition, (state, action) => {
      state.position = action.payload.position
    })
    .addCase(setTradeType, (state, action) => {
      state.OneDeltaTradeType = action.payload.tradeType
    })
    .addCase(selectProfessionalCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        }
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId },
        }
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
    .addCase(
      replaceProfessionalState,
      (state, { payload: { typedValue, recipient, field, inputCurrencyId, outputCurrencyId } }) => {
        return {
          ...initialState,
          [Field.INPUT]: {
            currencyId: inputCurrencyId ?? null,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId ?? null,
          },
          independentField: field,
          typedValue,
          recipient,
        }
      }
    )
)
