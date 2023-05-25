import { useCallback } from 'react'
import { AppState } from 'state'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { Field, MarginTradeState, OneDeltaTradeType } from 'types/1delta'
import { selectProfessionalCurrency, setPosition, setRecipient, setTradeType, typeInput } from './actions'
import { Currency } from '@uniswap/sdk-core'

export function useProfessionalTradeSelectionState(): AppState['professionalTradeSelection'] {
  return useAppSelector((state) => state.professionalTradeSelection)
}

export function useSelectedTradeTypeProfessional(): OneDeltaTradeType {
  return useAppSelector((state) => state.professionalTradeSelection).OneDeltaTradeType
}

export function usePosition() {
  return useAppSelector((state) => state.professionalTradeSelection.position)
}


export function useSetPosition() {
  const dispatch = useAppDispatch()
  return useCallback(
    (position: MarginTradeState) => dispatch(setPosition({ position })),
    [dispatch]
  )
}

export const useTradeTypeSelector = () => {
  const dispatch = useAppDispatch()
  return useCallback((tradeType: OneDeltaTradeType) => {
    dispatch(setTradeType({ tradeType }))
  },
    [dispatch]
  )
}

export function useProfessionalActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  // onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useAppDispatch()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectProfessionalCurrency({
          field,
          currencyId: currency.isToken ? currency.address : currency.isNative ? 'ETH' : '',
        })
      )
    },
    [dispatch]
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  }
}