import { Filter, FilterActive } from 'utils/tableUtils/filters'
import { createReducer } from '@reduxjs/toolkit'
import { getSupportedAssets } from 'constants/1delta'
import { LendingProtocol } from 'state/1delta/actions'
import { SupportedAssets } from 'types/1delta'
import {
  setCollateralFilterList,
  setCollateralFilterState,
  setDebtFilterList,
  setDebtFilterState,
  setFilterCollateral,
  setFilterDebt,
  unInitCollateral,
  unInitDebt
} from './actions'

interface SingleFilter {
  filter: Filter
  isActive: boolean
}

export interface AaveDebtFilter {
  initialized: boolean
  aprStable: SingleFilter
  apr: SingleFilter
  liquidity: SingleFilter
  userBorrow: SingleFilter
  setting: {
    filter: FilterActive;
    mode: Filter;
  },
  list: SupportedAssets[]
}


export interface FilterState {
  aaveFilterState: {
    collateral: {
      initialized: boolean
      apr: SingleFilter
      totalSupply: SingleFilter
      userDeposit: SingleFilter
      setting: {
        filter: FilterActive;
        mode: Filter;
      },
      list: SupportedAssets[]
    },
    debt: AaveDebtFilter
  }
  compoundV2FilterState: {
    collateral: {
      initialized: boolean
      apr: SingleFilter
      totalSupply: SingleFilter
      userDeposit: SingleFilter
      setting: {
        filter: FilterActive;
        mode: Filter;
      },
      list: SupportedAssets[]
    },
    debt: {
      initialized: boolean
      apr: SingleFilter
      liquidity: SingleFilter
      userBorrow: SingleFilter
      setting: {
        filter: FilterActive;
        mode: Filter;
      },
      list: SupportedAssets[]
    }
  }
  compoundV3FilterState: any
}

const defaultSingeFilter = {
  filter: Filter.NONE,
  isActive: false
}

const defaultSetting = { filter: FilterActive.NONE, mode: Filter.NONE }

const defaultList = getSupportedAssets(137, LendingProtocol.COMPOUND)


export const initialState: FilterState = {
  aaveFilterState: {
    collateral: {
      initialized: false,
      apr: defaultSingeFilter,
      totalSupply: defaultSingeFilter,
      userDeposit: defaultSingeFilter,
      setting: defaultSetting,
      list: defaultList
    },
    debt: {
      initialized: false,
      apr: defaultSingeFilter,
      aprStable: defaultSingeFilter,
      liquidity: defaultSingeFilter,
      userBorrow: defaultSingeFilter,
      setting: defaultSetting,
      list: defaultList
    }
  },
  compoundV2FilterState: {
    collateral: {
      initialized: false,
      apr: defaultSingeFilter,
      totalSupply: defaultSingeFilter,
      userDeposit: defaultSingeFilter,
      setting: defaultSetting,
      list: defaultList
    },
    debt: {
      initialized: false,
      apr: defaultSingeFilter,
      liquidity: defaultSingeFilter,
      userBorrow: defaultSingeFilter,
      setting: defaultSetting,
      list: defaultList
    }
  },
  compoundV3FilterState: {}
}

export default createReducer<FilterState>(initialState, (builder) =>
  builder
    // ANY
    //  collateral
    .addCase(setFilterCollateral, (state, action) => {
      switch (action.payload.protocol) {
        case LendingProtocol.AAVE:
          switch (action.payload.filter) {
            case FilterActive.APR:
              state.aaveFilterState.collateral.apr.filter = action.payload.filterState
              state.aaveFilterState.collateral.apr.isActive = true
              state.aaveFilterState.collateral.userDeposit.isActive = false
              state.aaveFilterState.collateral.totalSupply.isActive = false
              state.aaveFilterState.collateral.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            case FilterActive.TOTAL:
              state.aaveFilterState.collateral.totalSupply.filter = action.payload.filterState
              state.aaveFilterState.collateral.totalSupply.isActive = true
              state.aaveFilterState.collateral.apr.isActive = false
              state.aaveFilterState.collateral.userDeposit.isActive = false
              state.aaveFilterState.collateral.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            case FilterActive.USER:
              state.aaveFilterState.collateral.userDeposit.filter = action.payload.filterState
              state.aaveFilterState.collateral.userDeposit.isActive = true
              state.aaveFilterState.collateral.apr.isActive = false
              state.aaveFilterState.collateral.totalSupply.isActive = false
              state.aaveFilterState.collateral.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            default:
              break;
          }
          break;

        case LendingProtocol.COMPOUND:
          switch (action.payload.filter) {
            case FilterActive.APR:
              state.compoundV2FilterState.collateral.apr.filter = action.payload.filterState
              state.compoundV2FilterState.collateral.apr.isActive = true
              state.compoundV2FilterState.collateral.userDeposit.isActive = false
              state.compoundV2FilterState.collateral.totalSupply.isActive = false
              state.compoundV2FilterState.collateral.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            case FilterActive.TOTAL:
              state.compoundV2FilterState.collateral.totalSupply.filter = action.payload.filterState
              state.compoundV2FilterState.collateral.totalSupply.isActive = true
              state.compoundV2FilterState.collateral.apr.isActive = false
              state.compoundV2FilterState.collateral.userDeposit.isActive = false
              state.compoundV2FilterState.collateral.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            case FilterActive.USER:
              state.compoundV2FilterState.collateral.userDeposit.filter = action.payload.filterState
              state.compoundV2FilterState.collateral.userDeposit.isActive = true
              state.compoundV2FilterState.collateral.apr.isActive = false
              state.compoundV2FilterState.collateral.totalSupply.isActive = false
              state.compoundV2FilterState.collateral.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
    })
    .addCase(setCollateralFilterState, (state, action) => {
      switch (action.payload.protocol) {
        case LendingProtocol.AAVE:
          state.aaveFilterState.collateral.setting = action.payload
          break;
        case LendingProtocol.COMPOUND:
          state.aaveFilterState.collateral.setting = action.payload
      }
    })
    .addCase(setCollateralFilterList, (state, action) => {
      switch (action.payload.protocol) {
        case LendingProtocol.AAVE:
          state.aaveFilterState.collateral.list = action.payload.list
          state.aaveFilterState.collateral.initialized = true
          break;
        case LendingProtocol.COMPOUND:
          state.compoundV2FilterState.collateral.list = action.payload.list
          state.compoundV2FilterState.collateral.initialized = true
      }
    })
    //  debt
    .addCase(setFilterDebt, (state, action) => {
      switch (action.payload.protocol) {
        case LendingProtocol.AAVE:
          switch (action.payload.filter) {
            case FilterActive.APR:
              state.aaveFilterState.debt.apr.filter = action.payload.filterState
              state.aaveFilterState.debt.apr.isActive = true
              state.aaveFilterState.debt.aprStable.isActive = false
              state.aaveFilterState.debt.userBorrow.isActive = false
              state.aaveFilterState.debt.liquidity.isActive = false
              state.aaveFilterState.debt.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;

            case FilterActive.APR_STABLE:
              state.aaveFilterState.debt.aprStable.filter = action.payload.filterState
              state.aaveFilterState.debt.aprStable.isActive = true
              state.aaveFilterState.debt.apr.isActive = false
              state.aaveFilterState.debt.userBorrow.isActive = false
              state.aaveFilterState.debt.liquidity.isActive = false
              state.aaveFilterState.debt.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            case FilterActive.TOTAL:
              state.aaveFilterState.debt.liquidity.filter = action.payload.filterState
              state.aaveFilterState.debt.liquidity.isActive = true
              state.aaveFilterState.debt.aprStable.isActive = false
              state.aaveFilterState.debt.apr.isActive = false
              state.aaveFilterState.debt.userBorrow.isActive = false
              state.aaveFilterState.debt.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            case FilterActive.USER:
              state.aaveFilterState.debt.userBorrow.filter = action.payload.filterState
              state.aaveFilterState.debt.userBorrow.isActive = true
              state.aaveFilterState.debt.aprStable.isActive = false
              state.aaveFilterState.debt.apr.isActive = false
              state.aaveFilterState.debt.liquidity.isActive = false
              state.aaveFilterState.debt.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            default:
              break;
          }
          break;
        case LendingProtocol.COMPOUND:
          switch (action.payload.filter) {
            case FilterActive.APR:
              state.compoundV2FilterState.debt.apr.filter = action.payload.filterState
              state.compoundV2FilterState.debt.apr.isActive = true
              state.compoundV2FilterState.debt.userBorrow.isActive = false
              state.compoundV2FilterState.debt.liquidity.isActive = false
              state.compoundV2FilterState.debt.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            case FilterActive.TOTAL:
              state.compoundV2FilterState.debt.liquidity.filter = action.payload.filterState
              state.compoundV2FilterState.debt.liquidity.isActive = true
              state.compoundV2FilterState.debt.apr.isActive = false
              state.compoundV2FilterState.debt.userBorrow.isActive = false
              state.compoundV2FilterState.debt.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            case FilterActive.USER:
              state.compoundV2FilterState.debt.userBorrow.filter = action.payload.filterState
              state.compoundV2FilterState.debt.userBorrow.isActive = true
              state.compoundV2FilterState.debt.apr.isActive = false
              state.compoundV2FilterState.debt.liquidity.isActive = false
              state.compoundV2FilterState.debt.setting = { filter: action.payload.filter, mode: action.payload.filterState }
              break;
            default:
              break;
          }
          break;
      }
    })
    .addCase(setDebtFilterState, (state, action) => {
      switch (action.payload.protocol) {
        case LendingProtocol.AAVE:
          state.aaveFilterState.debt.setting = action.payload
          break;
        case LendingProtocol.COMPOUND:
          state.aaveFilterState.debt.setting = action.payload
          break;
      }
    })
    .addCase(setDebtFilterList, (state, action) => {
      switch (action.payload.protocol) {
        case LendingProtocol.AAVE:
          state.aaveFilterState.debt.list = action.payload.list
          state.aaveFilterState.debt.initialized = true
          break;
        case LendingProtocol.COMPOUND:
          state.compoundV2FilterState.debt.list = action.payload.list
          state.compoundV2FilterState.debt.initialized = true
          break;
      }
    })
    .addCase(unInitCollateral, (state, action) => {
      switch (action.payload.protocol) {
        case LendingProtocol.AAVE:
          state.aaveFilterState.collateral = initialState.aaveFilterState.collateral
          break;
        case LendingProtocol.COMPOUND:
          state.compoundV2FilterState.collateral = initialState.compoundV2FilterState.collateral
          break;
      }
    })
    .addCase(unInitDebt, (state, action) => {
      switch (action.payload.protocol) {
        case LendingProtocol.AAVE:
          state.aaveFilterState.debt = initialState.aaveFilterState.debt
          break;
        case LendingProtocol.COMPOUND:
          state.compoundV2FilterState.debt = initialState.compoundV2FilterState.debt
          break;
      }
    })
)
