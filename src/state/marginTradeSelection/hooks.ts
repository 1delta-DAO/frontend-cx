import { useCallback, useEffect, useMemo } from 'react'
import { AppState } from 'state'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import invariant from 'tiny-invariant'
import {
  MarginTradeType,
  MarginTradeState,
  OneDeltaTradeType,
  PositionDirection,
  PositionEntry,
  PositionSides,
  SupportedAssets
} from 'types/1delta'
import { setBaseCurrency, setPosition, setSingleInteraction, setTradeType } from './actions'

export function useMarginTradeSelectionState(): AppState['marginTradeSelection'] {
  return useAppSelector((state) => state.marginTradeSelection)
}

export function useSelectedTradeType(): OneDeltaTradeType {
  return useAppSelector((state) => state.marginTradeSelection).marginTradeType
}

export function usePosition() {
  return useAppSelector((state) => state.marginTradeSelection.position)
}


export function useSetPosition() {
  const dispatch = useAppDispatch()
  return useCallback(
    (position: MarginTradeState) => dispatch(setPosition({ position })),
    [dispatch]
  )
}

export const handleSelectNewAsset = (
  state: MarginTradeState,
  newAsset: SupportedAssets,
  newSide: PositionSides
): MarginTradeState => {
  const newState = { ...state }
  const newPositionEntry = { asset: newAsset, side: newSide }
  const { [PositionDirection.To]: toEntry, [PositionDirection.From]: fromEntry } = state

  // unset single flag
  if (newState.isSingle) {
    newState.isSingle = false
  }

  // the new selection will always be stored in the "To" entry
  newState[PositionDirection.To] = newPositionEntry

  // case for first selection
  if (!toEntry) {
    newState[PositionDirection.From] = undefined
    newState.isSingle = true
    return newState
  }

  // We have the case that the user selects an asset already selected, but on the other side
  // the 1st case is that toEntry matches selection
  if (newPositionEntry.asset === toEntry?.asset && newPositionEntry.side !== toEntry?.side) {
    // then the from entry remains as is and we return the state
    return newState
  } else {
    // all other cases will move the toEntry to the new from entry
    // that also covers the match of the new selection with the fromEntry
    newState[PositionDirection.From] = toEntry
    return newState
  }
}

export const handleUnSelectAsset = (
  state: MarginTradeState,
  asset: SupportedAssets,
  assetSide: PositionSides
): MarginTradeState => {
  const newState = { ...state }
  const { [PositionDirection.To]: toEntry, [PositionDirection.From]: fromEntry } = state
  newState.isSingle = true
  if (toEntry?.asset === asset && toEntry?.side === assetSide) {
    newState[PositionDirection.To] = undefined
  }
  if (fromEntry?.asset === asset && fromEntry?.side === assetSide) {
    newState[PositionDirection.From] = undefined
  }

  return newState
}

export const getSingleAsset = (state: MarginTradeState): SupportedAssets => {
  invariant(state.isSingle, 'NOT SINGLE')

  const { [PositionDirection.To]: toEntry, [PositionDirection.From]: fromEntry } = state

  if (toEntry?.asset) {
    return toEntry.asset
  }

  if (fromEntry?.asset) {
    return fromEntry.asset
  }

  invariant(false, 'NO SELECTION')
}

export const getSinglePositionEntry = (state: MarginTradeState): PositionEntry | undefined => {
  const { [PositionDirection.To]: toEntry, [PositionDirection.From]: fromEntry } = state

  if (toEntry?.asset) {
    return toEntry
  }

  if (fromEntry?.asset) {
    return fromEntry
  }
  return undefined
}

export const getAssetsOnSide = (state: MarginTradeState, side: PositionSides): SupportedAssets[] => {
  const assetList: SupportedAssets[] = []
  const { [PositionDirection.To]: toEntry, [PositionDirection.From]: fromEntry } = state
  if (toEntry?.asset) {
    if (toEntry?.side === side) assetList.push(toEntry.asset)
  }
  if (fromEntry?.asset) {
    if (fromEntry?.side === side) assetList.push(fromEntry.asset)
  }

  return assetList
}

export const positionEntriesAreMatching = (entry0: PositionEntry, entry1?: PositionEntry): boolean => {
  return entry0?.asset === entry1?.asset && entry0.side === entry1.side
}

export const getTradeTypeDescription = (state: MarginTradeState): string => {
  const { [PositionDirection.To]: toEntry, [PositionDirection.From]: fromEntry } = state

  if (fromEntry?.asset && toEntry?.asset) {
    if (fromEntry.side === PositionSides.Borrow && toEntry.side === PositionSides.Borrow) {
      return 'Swap Your Debt'
    }
    if (fromEntry.side === PositionSides.Collateral && toEntry.side === PositionSides.Borrow) {
      return 'Trade On Margin'
    }
    if (fromEntry.side === PositionSides.Borrow && toEntry.side === PositionSides.Collateral) {
      return 'Trade On Margin'
    }
    if (fromEntry.side === PositionSides.Collateral && toEntry.side === PositionSides.Collateral) {
      return 'Trade Your Collaterals'
    }
  }

  if (fromEntry?.asset && !toEntry?.asset) {
    if (fromEntry.side === PositionSides.Collateral) {
      return ' Trade To Supply Or Withdraw Collateral'
    }
    if (fromEntry.side === PositionSides.Borrow) {
      return 'Trade From Borrow Or To Repay'
    }
  }

  if (toEntry?.asset && !fromEntry?.asset) {
    if (toEntry.side === PositionSides.Collateral) {
      return ' Trade To Supply Or Withdraw Collateral'
    }
    if (toEntry.side === PositionSides.Borrow) {
      return 'Trade From Borrow Or To Repay'
    }
  }

  return 'Pick A Position to Open A Trade'
}

export const getMarginTradeType = (state: MarginTradeState): OneDeltaTradeType => {
  const { [PositionDirection.To]: toEntry, [PositionDirection.From]: fromEntry } = state

  if (!fromEntry?.asset && !toEntry?.asset) return OneDeltaTradeType.None

  if (!fromEntry?.asset || !toEntry?.asset) return OneDeltaTradeType.Single

  if (fromEntry?.asset && toEntry?.asset) {
    if (
      (fromEntry.side === PositionSides.Collateral && toEntry.side === PositionSides.Borrow) ||
      (fromEntry.side === PositionSides.Borrow && toEntry.side === PositionSides.Collateral)
    ) {
      return OneDeltaTradeType.MarginSwap
    }
    return OneDeltaTradeType.SingleSide
  }
  return OneDeltaTradeType.None
}



export const useHandleToggleAsset = (position: MarginTradeState) => {
  const dispatch = useAppDispatch()
  const handleToggleAsset = useCallback((type: PositionSides, asset: SupportedAssets) => {
    let newPos: MarginTradeState
    if (
      positionEntriesAreMatching({ asset, side: type }, position[PositionDirection.From]) ||
      positionEntriesAreMatching({ asset, side: type }, position[PositionDirection.To])
    ) {
      newPos = handleUnSelectAsset(position, asset, type)
    } else {
      newPos = handleSelectNewAsset(position, asset, type)
    }
    dispatch(setPosition({ position: newPos }))
  }, [position])

  return handleToggleAsset

}


export const useHandleMarginTradeType = (position: MarginTradeState) => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setTradeType({ tradeType: getMarginTradeType(position) }))
  },
    [position]
  )

  return useSelectedTradeType()
}

export const useGetMarginTradeSelection = (): {
  marginTradeType: OneDeltaTradeType,
  entryFrom: PositionEntry;
  entryTo: PositionEntry;
} => {

  const position = usePosition()
  useHandleMarginTradeType(position)
  const dispatch = useAppDispatch()

  const [marginTradeType, entryFrom, entryTo] = useMemo(() => {
    const tradeType = getMarginTradeType(position)
    dispatch(setTradeType({ tradeType }))
    if (tradeType === OneDeltaTradeType.None) {
      return [OneDeltaTradeType.None, {} as PositionEntry, {} as PositionEntry]
    }
    if (tradeType === OneDeltaTradeType.Single) {
      const singleEntry = getSinglePositionEntry(position)
      return [OneDeltaTradeType.Single, singleEntry as PositionEntry, singleEntry as PositionEntry]
    }
    const { [PositionDirection.To]: toEntry, [PositionDirection.From]: fromEntry } = position
    if (tradeType === OneDeltaTradeType.SingleSide) {
      return [OneDeltaTradeType.SingleSide, fromEntry as PositionEntry, toEntry as PositionEntry]
    }

    return [OneDeltaTradeType.MarginSwap, fromEntry as PositionEntry, toEntry as PositionEntry]
  }, [position])


  return { marginTradeType, entryFrom, entryTo }
}


export const useSingleInteraction = (): MarginTradeType => {
  return useAppSelector(state => state.marginTradeSelection.position.interaction)
}

export const useSetSingleInteraction = () => {
  const dispatch = useAppDispatch()
  return useCallback((interaction: MarginTradeType) => {
    dispatch(setSingleInteraction({ interaction }))
  }, [dispatch])
}

export const useSetBaseAsset = () => {
  const dispatch = useAppDispatch()
  return useCallback((asset: SupportedAssets) => {
    dispatch(setBaseCurrency({ asset }))
  }, [dispatch])
}


export const useBaseAsset = (): SupportedAssets => {
  return useAppSelector(state => state.marginTradeSelection.position.baseCurrency)
}

export const useSetTradeType = () => {
  const dispatch = useAppDispatch()
  return useCallback((tradeType: OneDeltaTradeType) => {
    dispatch(setTradeType({ tradeType }))
  }, [dispatch])
}