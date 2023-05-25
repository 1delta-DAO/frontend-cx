import { SupportedAssets } from 'types/1delta'

export enum Filter {
  NONE = 'NONE',
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum FilterActive {
  NONE = 'NONE',
  APR = 'APR',
  APR_STABLE = 'APR_STABLE',
  USER = 'USER',
  TOTAL = 'TOTAL',
}

export interface MarketCollateralProps {
  apr: number
  totalSupply: number
  totalSupplyUsd: number
  userBalance: number
  userBalanceUsd: number
  assetId: SupportedAssets
}


export interface MarketTableBorrowProps {
  userBorrow: number
  userBorrowUsd: number
  userBorrowStableUsd: number
  liquidity: number
  liquidityUsd: number
  borrowApr: number
  borrowAprStable: number
  price: number
  assetId: SupportedAssets
}

export interface BorrowAprHolder {
  borrowApr: number
}

export interface BorrowAprStableHolder {
  borrowAprStable: number
}

export interface AprHolder {
  apr: number
}



export function compareDataAprAsc(
  a: AprHolder,
  b: AprHolder
) {
  if (a.apr < b.apr) {
    return -1
  }
  if (a.apr > b.apr) {
    return 1
  }
  return 0
}

export function compareDataAprDesc(
  a: AprHolder,
  b: AprHolder
) {
  if (a.apr < b.apr) {
    return 1
  }
  if (a.apr > b.apr) {
    return -1
  }
  return 0
}


export function compareDataBorrowAprAsc(
  a: BorrowAprHolder,
  b: BorrowAprHolder
) {
  if (a.borrowApr < b.borrowApr) {
    return -1
  }
  if (a.borrowApr > b.borrowApr) {
    return 1
  }
  return 0
}

export function compareDataBorrowAprDesc(
  a: BorrowAprHolder,
  b: BorrowAprHolder
) {
  if (a.borrowApr < b.borrowApr) {
    return 1
  }
  if (a.borrowApr > b.borrowApr) {
    return -1
  }
  return 0
}


export function compareDataStableAprAsc(
  a: BorrowAprStableHolder,
  b: BorrowAprStableHolder
) {
  if (a.borrowAprStable < b.borrowAprStable) {
    return -1
  }
  if (a.borrowAprStable > b.borrowAprStable) {
    return 1
  }
  return 0
}

export function compareDataStableAprDesc(
  a: BorrowAprStableHolder,
  b: BorrowAprStableHolder
) {
  if (a.borrowAprStable < b.borrowAprStable) {
    return 1
  }
  if (a.borrowAprStable > b.borrowAprStable) {
    return -1
  }
  return 0
}


export function compareDataUserBalanceAsc(a: MarketCollateralProps, b: MarketCollateralProps) {
  if (a?.userBalanceUsd < b?.userBalanceUsd) {
    return -1
  }
  if (a?.userBalanceUsd > b?.userBalanceUsd) {
    return 1
  }
  return 0
}

export function compareDataUserBalanceDesc(a: MarketCollateralProps, b: MarketCollateralProps) {
  if (a?.userBalanceUsd < b?.userBalanceUsd) {
    return 1
  }
  if (a?.userBalanceUsd > b?.userBalanceUsd) {
    return -1
  }
  return 0
}

export function compareTotalSupplyAsc(a: MarketCollateralProps, b: MarketCollateralProps) {
  if (a?.totalSupplyUsd < b?.totalSupplyUsd) {
    return -1
  }
  if (a?.totalSupplyUsd > b?.totalSupplyUsd) {
    return 1
  }
  return 0
}

export function compareTotalSupplyDesc(a: MarketCollateralProps, b: MarketCollateralProps) {
  if (a?.totalSupplyUsd < b?.totalSupplyUsd) {
    return 1
  }
  if (a?.totalSupplyUsd > b?.totalSupplyUsd) {
    return -1
  }
  return 0
}

export function compareDataUserBorrowAsc(a: MarketTableBorrowProps, b: MarketTableBorrowProps) {
  if (a?.userBorrowUsd < b?.userBorrowUsd) {
    return -1
  }
  if (a?.userBorrowUsd > b?.userBorrowUsd) {
    return 1
  }
  return 0
}

export function compareDataUserBorrowDesc(a: MarketTableBorrowProps, b: MarketTableBorrowProps) {
  if (a?.userBorrowUsd < b?.userBorrowUsd) {
    return 1
  }
  if (a?.userBorrowUsd > b?.userBorrowUsd) {
    return -1
  }
  return 0
}

export function compareDataUserTotalBorrowAsc(a: MarketTableBorrowProps, b: MarketTableBorrowProps) {
  if (a?.userBorrowUsd + a?.userBorrowStableUsd < b?.userBorrowUsd + b?.userBorrowStableUsd) {
    return -1
  }
  if (a?.userBorrowUsd + a?.userBorrowStableUsd > b?.userBorrowUsd + b?.userBorrowStableUsd) {
    return 1
  }
  return 0
}

export function compareDataUserTotalBorrowDesc(a: MarketTableBorrowProps, b: MarketTableBorrowProps) {
  if (a?.userBorrowUsd + a?.userBorrowStableUsd < b?.userBorrowUsd + b?.userBorrowStableUsd) {
    return 1
  }
  if (a?.userBorrowUsd + a?.userBorrowStableUsd > b?.userBorrowUsd + b?.userBorrowStableUsd) {
    return -1
  }
  return 0
}

export function compareLiquidityAsc(a: MarketTableBorrowProps, b: MarketTableBorrowProps) {
  if (a?.liquidityUsd < b?.liquidityUsd) {
    return -1
  }
  if (a?.liquidityUsd > b?.liquidityUsd) {
    return 1
  }
  return 0
}

export function compareLiquidityDesc(a: MarketTableBorrowProps, b: MarketTableBorrowProps) {
  if (a?.liquidityUsd < b?.liquidityUsd) {
    return 1
  }
  if (a?.liquidityUsd > b?.liquidityUsd) {
    return -1
  }
  return 0
}
