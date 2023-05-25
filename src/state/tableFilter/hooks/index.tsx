import { useCallback, useEffect } from "react";
import { LendingProtocol } from "state/1delta/actions";
import { useAppDispatch, useAppSelector } from "state/hooks";
import { SupportedAssets } from "types/1delta";
import {
  compareDataAprAsc,
  compareDataAprDesc,
  compareDataBorrowAprAsc,
  compareDataBorrowAprDesc,
  compareDataStableAprAsc,
  compareDataStableAprDesc,
  compareDataUserBalanceAsc,
  compareDataUserBalanceDesc,
  compareDataUserBorrowAsc,
  compareDataUserBorrowDesc,
  compareDataUserTotalBorrowAsc,
  compareDataUserTotalBorrowDesc,
  compareLiquidityAsc,
  compareLiquidityDesc,
  compareTotalSupplyAsc,
  compareTotalSupplyDesc,
  Filter,
  FilterActive,
  MarketCollateralProps,
  MarketTableBorrowProps,
} from 'utils/tableUtils/filters'
import { setCollateralFilterList, setDebtFilterList, setFilterCollateral, setFilterDebt, unInitCollateral, unInitDebt } from "../actions";
import { AaveDebtFilter } from "../reducer";

type filterKeys = 'aaveFilterState' | 'compoundV2FilterState'

const protocolToKey: { [key: string]: filterKeys } = {
  [LendingProtocol.AAVE]: 'aaveFilterState',
  [LendingProtocol.COMPOUND]: 'compoundV2FilterState',
  [LendingProtocol.COMPOUNDV3]: 'compoundV2FilterState'
}

// Collateral filters

export const useCollateralFilter = (protocol: LendingProtocol): FilterActive => {
  return useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.collateral.setting.filter)
}

export const useCollateralFilterList = (protocol: LendingProtocol) => {
  return useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.collateral.list)
}

export const useCollateralFilterInitialized = (protocol: LendingProtocol): boolean => {
  return useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.collateral.initialized)
}

export const useCurrentCollateralFilters = (
  protocol: LendingProtocol,) => {
  const filters = useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.collateral)

  return {
    aprFilter: filters.apr.filter,
    totalSupplyFilter: filters.totalSupply.filter,
    userDepositFilter: filters.userDeposit.filter
  }
}

export const useCurrentCollateralFilterFlags = (
  protocol: LendingProtocol,) => {
  const filters = useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.collateral)

  return {
    filterApr: filters.apr.isActive,
    filterTotalSupply: filters.totalSupply.isActive,
    filterUserDeposit: filters.userDeposit.isActive
  }
}

export const useHandleCollateralFilter = (
  protocol: LendingProtocol,
  assetData: MarketCollateralProps[]
) => {
  const dispatch = useAppDispatch()

  const { aprFilter, userDepositFilter, totalSupplyFilter } = useCurrentCollateralFilters(protocol)
  const { filterApr, filterTotalSupply, filterUserDeposit } = useCurrentCollateralFilterFlags(protocol)
  // handles change to sorted items
  useEffect(() => {
    if (filterApr && aprFilter !== Filter.NONE) {
      dispatch(setCollateralFilterList({
        protocol,
        list:
          assetData?.sort(aprFilter === Filter.ASC ? compareDataAprAsc : compareDataAprDesc).map((a) => a.assetId)
      }
      ))
    }
  }, [aprFilter, filterApr, protocol])

  useEffect(() => {
    if (filterUserDeposit && userDepositFilter !== Filter.NONE) {
      dispatch(setCollateralFilterList({
        protocol,
        list:
          assetData?.sort(userDepositFilter === Filter.ASC ? compareDataUserBalanceAsc : compareDataUserBalanceDesc)
            .map((a) => a.assetId)
      }))
    }
  }, [userDepositFilter, filterUserDeposit, protocol])

  useEffect(() => {
    if (filterTotalSupply && totalSupplyFilter !== Filter.NONE) {
      dispatch(setCollateralFilterList({
        protocol,
        list:
          assetData?.sort(totalSupplyFilter === Filter.ASC ? compareTotalSupplyAsc : compareTotalSupplyDesc)
            .map((a) => a.assetId)
      }))
    }

  }, [totalSupplyFilter, filterTotalSupply, protocol])
}

export const useCollateralFilterHandlers = (protocol: LendingProtocol) => {
  const dispatch = useAppDispatch()
  const { aprFilter, userDepositFilter, totalSupplyFilter } = useCurrentCollateralFilters(protocol)

  const handleUnInit = useCallback(() => {
    return dispatch(unInitCollateral({ protocol }))
  }, [protocol])

  const handleAprFilter = useCallback(() => {
    const filter = FilterActive.APR
    if (aprFilter === Filter.DESC) {
      return dispatch(setFilterCollateral({ protocol, filter, filterState: Filter.ASC }))
    }
    return dispatch(setFilterCollateral({ protocol, filter, filterState: Filter.DESC }))
  }, [aprFilter, protocol])

  const handleUserBalanceFilter = useCallback(() => {
    const filter = FilterActive.USER
    if (userDepositFilter === Filter.DESC) {
      return dispatch(setFilterCollateral({ protocol, filter, filterState: Filter.ASC }))
    }
    return dispatch(setFilterCollateral({ protocol, filter, filterState: Filter.DESC }))
  }, [userDepositFilter, protocol])

  const handleTotalSupplyFilter = useCallback(() => {
    const filter = FilterActive.TOTAL
    if (totalSupplyFilter === Filter.DESC) {
      return dispatch(setFilterCollateral({ protocol, filter, filterState: Filter.ASC }))
    }
    return dispatch(setFilterCollateral({ protocol, filter, filterState: Filter.DESC }))
  }, [totalSupplyFilter, protocol])

  return {
    handleUnInit,
    handleAprFilter,
    handleUserBalanceFilter,
    handleTotalSupplyFilter
  }
}


export const useDebtFilter = (protocol: LendingProtocol): FilterActive => {
  return useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.debt.setting.filter)
}

export const useDebtFilterInitialized = (protocol: LendingProtocol): boolean => {
  return useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.debt.initialized)
}

export const useDebtFilterList = (protocol: LendingProtocol) => {
  return useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.debt.list)
}


export const useCurrentDebtFilters = (protocol: LendingProtocol) => {
  const filters = useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.debt)
  if (protocol === LendingProtocol.COMPOUND || protocol === LendingProtocol.COMPOUNDV3)
    return {
      aprStableFilter: Filter.NONE,
      aprFilter: filters.apr.filter,
      liquidityFilter: filters.liquidity.filter,
      userBorrowFilter: filters.userBorrow.filter
    }

  if (protocol === LendingProtocol.AAVE)
    return {
      aprStableFilter: (filters as AaveDebtFilter).aprStable.filter,
      aprFilter: filters.apr.filter,
      liquidityFilter: filters.liquidity.filter,
      userBorrowFilter: filters.userBorrow.filter
    }

  return {
    aprStableFilter: Filter.NONE,
    aprFilter: Filter.NONE,
    liquidityFilter: Filter.NONE,
    userBorrowFilter: Filter.NONE
  }
}

export const useCurrentDebtFilterFlags = (protocol: LendingProtocol) => {
  const filters = useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.debt)
  if (protocol === LendingProtocol.COMPOUND || protocol === LendingProtocol.COMPOUNDV3)
    return {
      filterApr: filters.apr.isActive,
      filterAprStable: false,
      filterTotalSupply: filters.liquidity.isActive,
      filterUserBorrow: filters.userBorrow.isActive
    }

  if (protocol === LendingProtocol.AAVE)
    return {
      filterAprStable: (filters as AaveDebtFilter).aprStable.isActive,
      filterApr: filters.apr.isActive,
      filterTotalSupply: filters.liquidity.isActive,
      filterUserBorrow: filters.userBorrow.isActive
    }

  return {
    filterApr: false,
    filterAprStable: false,
    filterTotalSupply: false,
    filterUserBorrow: false
  }
}

export const useHandleDebtFilter = (
  protocol: LendingProtocol,
  assetData: MarketTableBorrowProps[]
) => {
  const dispatch = useAppDispatch()

  const { aprFilter, aprStableFilter, userBorrowFilter, liquidityFilter } = useCurrentDebtFilters(protocol)
  const { filterApr, filterAprStable, filterTotalSupply, filterUserBorrow } = useCurrentDebtFilterFlags(protocol)

  // handles change to sorted items
  useEffect(() => {
    if (filterApr && aprFilter !== Filter.NONE) {
      dispatch(setDebtFilterList({
        protocol,
        list:
          assetData.sort(aprFilter === Filter.ASC ? compareDataBorrowAprAsc : compareDataBorrowAprDesc).map((a) => a.assetId)
      }
      ))
    }
  }, [aprFilter, filterApr, protocol])

  useEffect(() => {
    if (protocol === LendingProtocol.AAVE && filterAprStable && aprStableFilter !== Filter.NONE) {
      dispatch(setDebtFilterList({
        protocol,
        list:
          assetData.sort(aprStableFilter === Filter.ASC ? compareDataStableAprAsc : compareDataStableAprDesc).map((a) => a.assetId)
      }
      ))
    }
  }, [aprStableFilter, filterAprStable, protocol])

  useEffect(() => {
    if (filterUserBorrow && userBorrowFilter !== Filter.NONE) {
      switch (protocol) {
        case LendingProtocol.COMPOUNDV3:
        case LendingProtocol.COMPOUND:
          dispatch(setDebtFilterList({
            protocol,
            list:
              assetData
                .sort(userBorrowFilter === Filter.ASC ? compareDataUserBorrowAsc : compareDataUserBorrowDesc)
                .map((a) => a.assetId)
          }))
          break;
        case LendingProtocol.AAVE:
          dispatch(setDebtFilterList({
            protocol,
            list:
              assetData
                .sort(userBorrowFilter === Filter.ASC ? compareDataUserTotalBorrowAsc : compareDataUserTotalBorrowDesc)
                .map((a) => a.assetId)
          }))
          break;
      }
    }
  }, [userBorrowFilter, filterUserBorrow, protocol])

  useEffect(() => {
    if (filterTotalSupply && liquidityFilter !== Filter.NONE) {
      dispatch(setDebtFilterList({
        protocol,
        list:
          assetData
            .sort(liquidityFilter === Filter.ASC ? compareLiquidityAsc : compareLiquidityDesc)
            .map((a) => a.assetId)
      }))
    }

  }, [liquidityFilter, filterTotalSupply, protocol])
}


export const useInitializeCollateralFilter = (protocol: LendingProtocol, assets: SupportedAssets[]) => {
  const dispatch = useAppDispatch()
  const initialized = useCollateralFilterInitialized(protocol)
  useEffect(() => {
    if (!initialized) {
      dispatch(setCollateralFilterList({ protocol, list: assets }))
    }
  }, [initialized])
}

export const useInitializeDebtFilter = (protocol: LendingProtocol, assets: SupportedAssets[]) => {

  const dispatch = useAppDispatch()
  const initialized = useDebtFilterInitialized(protocol)
  useEffect(() => {
    if (!initialized) {
      dispatch(setDebtFilterList({ protocol, list: assets }))
    }
  }, [initialized])
}


export const useCollateralFilterSetting = (protocol: LendingProtocol) => {
  return useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.collateral.setting)
}

export const useDebtFilterSetting = (protocol: LendingProtocol) => {
  return useAppSelector(state => state.tableFilter[protocolToKey[protocol]]?.debt.setting)
}


export const useDebtFilterHandlers = (protocol: LendingProtocol) => {
  const dispatch = useAppDispatch()
  const { aprStableFilter, aprFilter, userBorrowFilter, liquidityFilter } = useCurrentDebtFilters(protocol)

  const handleUnInit = useCallback(() => {
    return dispatch(unInitDebt({ protocol }))
  }, [protocol])

  const handleAprFilter = useCallback(() => {
    const filter = FilterActive.APR
    if (aprFilter === Filter.DESC) {
      return dispatch(setFilterDebt({ protocol, filter, filterState: Filter.ASC }))
    }
    return dispatch(setFilterDebt({ protocol, filter, filterState: Filter.DESC }))
  }, [aprFilter, protocol])

  const handleStableAprFilter = useCallback(() => {
    if (protocol != LendingProtocol.AAVE) return () => null
    const filter = FilterActive.APR_STABLE
    if (aprStableFilter === Filter.DESC) {
      return dispatch(setFilterDebt({ protocol, filter, filterState: Filter.ASC }))
    }
    return dispatch(setFilterDebt({ protocol, filter, filterState: Filter.DESC }))
  }, [aprStableFilter, protocol])


  const handleUserBorrowFilter = useCallback(() => {
    const filter = FilterActive.USER
    if (userBorrowFilter === Filter.DESC) {
      return dispatch(setFilterDebt({ protocol, filter, filterState: Filter.ASC }))
    }
    return dispatch(setFilterDebt({ protocol, filter, filterState: Filter.DESC }))
  }, [userBorrowFilter, protocol])

  const handleLiquidityFilter = useCallback(() => {
    const filter = FilterActive.TOTAL
    if (liquidityFilter === Filter.DESC) {
      return dispatch(setFilterDebt({ protocol, filter, filterState: Filter.ASC }))
    }
    return dispatch(setFilterDebt({ protocol, filter, filterState: Filter.DESC }))
  }, [liquidityFilter, protocol])

  return {
    handleUnInit,
    handleAprFilter,
    handleStableAprFilter,
    handleUserBorrowFilter,
    handleLiquidityFilter
  }
}
