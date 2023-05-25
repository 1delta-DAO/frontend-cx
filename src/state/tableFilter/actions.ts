import { Filter, FilterActive } from 'utils/tableUtils/filters'
import { createAction } from '@reduxjs/toolkit'
import { LendingProtocol } from 'state/1delta/actions'
import { SupportedAssets } from 'types/1delta'

// General FILTERS

// collateral

export const setFilterCollateral = createAction<{ protocol: LendingProtocol, filter: FilterActive, filterState: Filter }>('tableFilter/setFilterCollateral')

export const setCollateralFilterState = createAction<{ protocol: LendingProtocol, filter: FilterActive, mode: Filter }>('tableFilter/setCollateralFilterState')

export const setCollateralFilterList = createAction<{ protocol: LendingProtocol, list: SupportedAssets[] }>('tableFilter/setCollateralFilterList')

export const unInitCollateral = createAction<{ protocol: LendingProtocol }>('tableFilter/unInitCollateral')

// debt

export const setFilterDebt = createAction<{ protocol: LendingProtocol, filter: FilterActive, filterState: Filter }>('tableFilter/setFilterDebt')

export const setDebtFilterState = createAction<{ protocol: LendingProtocol, filter: FilterActive, mode: Filter }>('tableFilter/setDebtFilterState')

export const setDebtFilterList = createAction<{ protocol: LendingProtocol, list: SupportedAssets[] }>('tableFilter/setDebtFilterList')

export const unInitDebt = createAction<{ protocol: LendingProtocol }>('tableFilter/unInitDebt')