import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import invariant from 'tiny-invariant'

export type SerializedBigNumber = string
export type SerializedNumber = string

export interface TokenMeta {
  symbol: string
  decimals: number
  name: string
}

export interface AaveTokenMetadata {
  // this will only make a difference on testnets
  underlyingAddress: string
  // reserve market data
  unbacked?: SerializedBigNumber
  accruedToTreasuryScaled?: SerializedBigNumber
  totalAToken?: SerializedBigNumber
  totalStableDebt?: SerializedBigNumber
  totalVariableDebt?: SerializedBigNumber
  liquidityRate?: SerializedBigNumber
  variableBorrowRate?: SerializedBigNumber
  stableBorrowRate?: SerializedBigNumber
  averageStableBorrowRate?: SerializedBigNumber
  liquidityIndex?: SerializedBigNumber
  variableBorrowIndex?: SerializedBigNumber
  lastUpdateTimestamp?: number
  // reserve config
  decimals?: number
  ltv?: SerializedBigNumber
  liquidationThreshold?: SerializedBigNumber
  liquidationBonus?: SerializedBigNumber
  reserveFactor?: SerializedBigNumber
  usageAsCollateralEnabled?: boolean
  borrowingEnabled?: boolean
  stableBorrowRateEnabled?: boolean
  isActive?: boolean
  isFrozen?: boolean
}

export interface AaveTokenUserData {
  // new from provider
  currentATokenBalance?: SerializedBigNumber
  currentStableDebt?: SerializedBigNumber
  currentVariableDebt?: SerializedBigNumber
  principalStableDebt?: SerializedBigNumber
  scaledVariableDebt?: SerializedBigNumber
  stableBorrowRate?: SerializedBigNumber
  liquidityRate?: SerializedBigNumber
  stableRateLastUpdated?: number
  usageAsCollateralEnabled?: boolean
}

export interface AaveData {
  underlyingAddress: string
  userData: AaveTokenUserData
  reserveData: AaveTokenMetadata
}

export interface CTokenMetadata {
  // this is what the lens provides
  cToken?: string
  exchangeRateCurrent?: SerializedBigNumber
  supplyRatePerBlock?: SerializedBigNumber
  borrowRatePerBlock?: SerializedBigNumber
  reserveFactorMantissa?: SerializedBigNumber
  totalBorrows?: SerializedBigNumber
  totalReserves?: SerializedBigNumber
  totalSupply?: SerializedBigNumber
  totalCash?: SerializedBigNumber
  isListed?: boolean
  collateralFactorMantissa?: SerializedBigNumber
  // underlyingAssetAddress?: string;
  cTokenDecimals?: SerializedBigNumber
  underlyingDecimals?: SerializedBigNumber
  compSupplySpeed?: SerializedBigNumber
  compBorrowSpeed?: SerializedBigNumber
  borrowCap?: SerializedBigNumber
}

export interface User1DeltaAccountData {
  accountAddress: string
  compound: {
    balanceOf?: SerializedBigNumber
    borrowBalanceCurrent?: SerializedBigNumber
    balanceOfUnderlying?: SerializedBigNumber
    tokenBalance?: SerializedBigNumber
    tokenAllowance?: SerializedBigNumber
  }
}

export interface CTokenBalances {
  balanceOf: SerializedBigNumber
  borrowBalanceCurrent: SerializedBigNumber
  balanceOfUnderlying: SerializedBigNumber
  tokenBalance: SerializedBigNumber
  tokenAllowance: SerializedBigNumber
}

export interface CompoundData {
  underlyingAddress: string
  reserveData: CTokenMetadata
  userData: { [accountAddress: string]: CTokenBalances }
}
export interface PriceHistAave {
  price: number
  time: number
}

export interface CompoundV3ReservesData {
  offset: string;
  asset: string;
  priceFeed: string;
  scale: SerializedBigNumber;
  borrowCollateralFactor: SerializedBigNumber;
  liquidateCollateralFactor: SerializedBigNumber;
  liquidationFactor: SerializedBigNumber;
  supplyCap: SerializedBigNumber;
  // additional
  isBase: boolean;
  price: SerializedBigNumber;
  reserves: SerializedBigNumber;
  // base only
  borrowRate: SerializedBigNumber;
  supplyRate: SerializedBigNumber;
  utilization: SerializedBigNumber;
  totalSupplyAsset: SerializedBigNumber;
  totalBorrow: SerializedBigNumber;
}

export interface CompoundV3UserReserves {
  isAllowed: boolean;
  borrowBalance: SerializedBigNumber;
  supplyBalance: SerializedBigNumber;
  principal: SerializedBigNumber;
  baseTrackingIndex: SerializedBigNumber;
  baseTrackingAccrued: SerializedBigNumber;
  assetsIn: SerializedBigNumber;
  // user collateral
  balance: SerializedBigNumber;
}

export interface CompoundV3Data {
  reserveData: CompoundV3ReservesData
  userData: CompoundV3UserReserves
}


export interface Asset extends TokenMeta {
  id: SupportedAssets
  walletBalance?: SerializedBigNumber
  tokenAddress?: string
  // core token data
  aaveData: { [chainId: number]: AaveData }
  compoundData: { [chainId: number]: CompoundData }
  compoundV3Data: { [chainId: number]: { [comet: string]: CompoundV3Data } }
  // 1delta account data
  user1DeltaAccountData: { [accountAddress: string]: User1DeltaAccountData }
}

export enum SupportedAssets {
  UNI = 'UNI',
  WETH = 'WETH',
  DAI = 'DAI',
  LINK = 'LINK',
  USDC = 'USDC',
  WBTC = 'WBTC',
  USDT = 'USDT',
  AAVE = 'AAVE',
  EURS = 'EURS',
  WMATIC = 'WMATIC',
  AGEUR = 'AGEUR',
  BAL = 'BAL',
  CRV = 'CRV',
  DPI = 'DPI',
  GHST = 'GHST',
  JEUR = 'JEUR',
  SUSHI = 'SUSHI',
  ETH = 'ETH',
  MATIC = 'MATIC',
  COMP = 'COMP',
  BAT = 'BAT',
  FEI = 'FEI',
  MKR = 'MKR',
  ZRX = 'ZRX',
  YFI = 'YFI',
  WBTC2 = 'WBTC2',
  USDP = 'USDP',
  TUSD = 'TUSD',
  SAI = 'SAI',
  REP = 'REP',
  MATICX = 'MATICX',
  MIMATIC = 'MIMATIC',
  STMATIC = 'STMATIC',
  WSTETH = 'WSTETH',
  GDAI = 'GDAI',
  VGHST = 'VGHST',
  GHO = 'GHO'
}

export const toErc20Asset = (asset: SupportedAssets): SupportedAssets => {
  if (asset === SupportedAssets.MATIC) return SupportedAssets.WMATIC
  if (asset === SupportedAssets.ETH) return SupportedAssets.WETH
  return asset
}

export const hasChainLinkFeed = [
  SupportedAssets.WBTC,
  SupportedAssets.WBTC2,
  SupportedAssets.WETH,
  SupportedAssets.ETH,
  SupportedAssets.DAI,
  SupportedAssets.MATIC,
  SupportedAssets.LINK,
  SupportedAssets.USDC
]


export const compoundAssets = [
  SupportedAssets.ETH,
  SupportedAssets.WBTC,
  SupportedAssets.USDC,
  SupportedAssets.USDT,
  SupportedAssets.DAI,
  SupportedAssets.UNI,
  SupportedAssets.COMP,
]

export const aaveAssets = [
  SupportedAssets.WETH,
  SupportedAssets.DAI,
  SupportedAssets.LINK,
  SupportedAssets.USDC,
  SupportedAssets.AAVE,
  SupportedAssets.GHO
]

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export enum PositionDirection {
  To = 'To',
  From = 'From',
}

export enum PositionSides {
  Collateral = 'Collateral',
  Borrow = 'Borrow',
}

export enum MarginTradeType {
  Open = 'Open',
  Trim = 'Trim',
  Collateral = 'Collateral',
  Debt = 'Debt',
  Supply = 'Supply',
  Withdraw = 'Withdraw',
  Borrow = 'Borrow',
  Repay = 'Repay',
}

export enum AaveInterestMode {
  NONE = 0,
  STABLE = 1,
  VARIABLE = 2,
}

export interface PositionEntry {
  asset: SupportedAssets
  side: PositionSides
}
export interface MarginTradeState {
  [PositionDirection.To]?: PositionEntry
  [PositionDirection.From]?: PositionEntry
  isSingle?: boolean
  interaction: MarginTradeType
  baseCurrency: SupportedAssets
}

export interface HistData {
  price: number
  time: number
}

export interface PriceWithHist {
  price: number
  hist: HistData[]
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

export enum FeeAmount {
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}

const FEE_SIZE = 3

export function encodePath(path: string[], fees: number[]): string {
  if (path.length !== fees.length + 1) {
    throw new Error('path/fee lengths do not match')
  }

  let encoded = '0x'
  for (let i = 0; i < fees.length; i++) {
    // 20 byte encoding of the address
    encoded += path[i].slice(2)
    // 3 byte encoding of the fee
    encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0')
  }
  // encode the final token
  encoded += path[path.length - 1].slice(2)

  return encoded.toLowerCase()
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

export enum OneDeltaTradeType {
  None = 'None',
  Single = 'Single',
  SingleSide = 'SingleSide',
  MarginSwap = 'MarginSwap',
  Professional = 'Professional',
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


export type MappedCurrencyAmounts = { [field in Field]: CurrencyAmount<Currency> | undefined | null }

export type MappedCurrencies = { [field in Field]: Currency | undefined | null }
