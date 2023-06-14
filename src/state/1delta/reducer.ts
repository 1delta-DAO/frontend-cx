import { createReducer } from '@reduxjs/toolkit'
import { getSupportedAssets, TOKEN_META } from 'constants/1delta'
import { Asset, SerializedBigNumber, SupportedAssets } from 'types/1delta'
import {
  flushAccount,
  LendingProtocol,
  resetState,
  set1DeltaAccount,
  set1DeltaAccountMetaLoading,
  setToLoading,
  switchLendingProtocol,
} from './actions'
import { fetchCompoundPublicDataAsync } from './compound/fetchCompoundPublicData'
import { addressesAaveTestnetTokens } from 'hooks/1delta/addressesAave'
import { addressesCompoundTestnetTokens } from 'hooks/1delta/addressesCompound'
import { addresses0VixTestnetTokens } from 'hooks/1delta/addresses0Vix'
import { addressesTokens } from 'hooks/1delta/addressesTokens'
import { chainIds, SupportedChainId } from 'constants/chains'
import { fetchUserBalances } from './fetchAssetBalances'

export interface OneDeltaAccount {
  accountAddress: string
  accountOwner: string
  accountName: string
  creationTimestamp: number
  compoundSummary?: {
    markets: string[]
    liquidity: SerializedBigNumber
    shortfall: SerializedBigNumber
  }
}
export interface AaveTotals {
  [chainId: number]: {
    totalCollateralBase: SerializedBigNumber
    totalDebtBase: SerializedBigNumber
    availableBorrowsBase: SerializedBigNumber
    currentLiquidationThreshold: SerializedBigNumber
    ltv: SerializedBigNumber
    healthFactor: SerializedBigNumber
    data: SerializedBigNumber
  }
}

export interface DeltaState {
  userMeta: {
    [chainId: number]: {
      loaded: boolean
      accounts1Delta: { [index: number]: OneDeltaAccount }
      selectedAccountData: { index: number; account: OneDeltaAccount | undefined }
    }
  }
  loadingState: {
    userDataLoaded: boolean
    publicDataLoaded: boolean
    liquidityLoaded: boolean
    pricesLoaded: boolean
    configLoaded: boolean
    reservesLoaded: boolean
    userMeta: {
      loading: boolean
    }
    compound: {
      publicLoading: boolean
      publicLoaded: boolean
      userLoading: boolean
      userLoaded: boolean
    }
  }
  readonly userState: {
    selectedLendingProtocol: LendingProtocol
    aaveTotals: AaveTotals
    suppliedBalance: SerializedBigNumber
    borrowBalance: SerializedBigNumber
    borrowLimit: number
    healthFactor: number
  }
  readonly assets: { [key: string]: Asset }
}
const dummyCompoundData = {
  underlyingAddress: '',
  userData: {},
  reserveData: {
    // this is what the lens provides
    cToken: '',
    exchangeRateCurrent: '0',
    supplyRatePerBlock: '0',
    borrowRatePerBlock: '0',
    reserveFactorMantissa: '0',
    totalBorrows: '0',
    totalReserves: '0',
    totalSupply: '0',
    totalCash: '0',
    isListed: false,
    collateralFactorMantissa: '0',
    cTokenDecimals: '0',
    underlyingDecimals: '0',
    compSupplySpeed: '0',
    compBorrowSpeed: '0',
    borrowCap: '0',
  },
}

const dummyAaveData = {
  underlyingAddress: '',
  userData: {
    // fetched from provider
    currentATokenBalance: '0',
    currentStableDebt: '0',
    currentVariableDebt: '0',
    principalStableDebt: '0',
    scaledVariableDebt: '0',
    stableBorrowRate: '0',
    liquidityRate: '0',
    stableRateLastUpdated: 0,
    usageAsCollateralEnabled: false,
  },
  reserveData: {
    unbacked: '0',
    accruedToTreasuryScaled: '0',
    totalAToken: '0',
    totalStableDebt: '0',
    totalVariableDebt: '0',
    liquidityRate: '0',
    variableBorrowRate: '0',
    stableBorrowRate: '0',
    averageStableBorrowRate: '0',
    liquidityIndex: '0',
    variableBorrowIndex: '0',
    lastUpdateTimestamp: 0,
    // config
    decimals: '0',
    ltv: '0',
    liquidationThreshold: '0',
    liquidationBonus: '0',
    reserveFactor: '0',
    usageAsCollateralEnabled: false,
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    isActive: false,
    isFrozen: false,
  },
}

const dummyCompoundV3Data = {
  userData: {
    // fetched from provider
    isAllowed: false,
    borrowBalance: '0',
    supplyBalance: '0',
    principal: '0',
    baseTrackingIndex: '0',
    baseTrackingAccrued: '0',
    assetsIn: '0',
    // user collateral
    balance: '0',
  },
  reserveData: {
    offset: '0',
    asset: '0',
    priceFeed: '',
    scale: '0',
    borrowCollateralFactor: '0',
    liquidateCollateralFactor: '0',
    liquidationFactor: '0',
    supplyCap: '0',
    // additional
    isBase: false,
    price: '0',
    reserves: '0',
    // base only
    borrowRate: '0',
    supplyRate: '0',
    utilization: '0',
    totalSupplyAsset: '0',
  },
}

const dummyAssetBase = {
  walletBalance: '0',
  currentStableBorrowRate: '0',
  currentLiquidityRate: '0',
  currentVariableBorrowRate: '0',
  aTokenAddress: '',
  stableDebtTokenAddress: '',
  variableDebtTokenAddress: '',
  interestRateStrategyAddress: '',
  user1DeltaAccountData: {},
  priceHist: [],
  aaveData: Object.assign(
    {},
    ...chainIds.map((x) => {
      return { [x]: dummyAaveData }
    })
  ),
  compoundData: Object.assign(
    {},
    ...chainIds.map((x) => {
      return { [x]: dummyCompoundData }
    })
  ),
  compoundV3Data: Object.assign(
    {},
    ...chainIds.map((x) => {
      return { [x]: { [SupportedAssets.USDC]: dummyCompoundV3Data } }
    })
  ),
}

const dummyAaveTotals = {
  totalCollateralBase: '0',
  totalDebtBase: '0',
  availableBorrowsBase: '0',
  currentLiquidationThreshold: '0',
  ltv: '0',
  healthFactor: '0',
  data: '0',
}

const userMetaDummy = {
  loaded: false,
  selectedAccountData: { account: undefined, index: -1 },
  accounts1Delta: {},
}

export const initialState: DeltaState = {
  userMeta: Object.assign(
    {},
    ...chainIds.map((x) => {
      return { [x]: userMetaDummy }
    })
  ),
  loadingState: {
    reservesLoaded: false,
    userDataLoaded: false,
    publicDataLoaded: false,
    liquidityLoaded: false,
    pricesLoaded: false,
    configLoaded: false,
    userMeta: {
      loading: false,
    },
    compound: {
      publicLoading: false,
      userLoading: false,
      publicLoaded: false,
      userLoaded: false,
    }
  },
  userState: {
    selectedLendingProtocol: LendingProtocol.AAVE,
    aaveTotals: Object.assign(
      {},
      ...chainIds.map((x) => {
        return { [x]: dummyAaveTotals }
      })
    ),
    suppliedBalance: '0',
    borrowBalance: '0',
    borrowLimit: 0.0,
    healthFactor: 2.0,
  },
  assets: Object.assign(
    {},
    ...Object.values(SupportedAssets).map((x) => {
      const asset = dummyAssetBase
      // add addresses (they differ on testnets)
      asset.compoundData[SupportedChainId.GOERLI].underlyingAddress = getSupportedAssets(
        SupportedChainId.GOERLI,
        LendingProtocol.COMPOUND
      ).includes(x)
        ? addressesCompoundTestnetTokens[x]?.[SupportedChainId.GOERLI]
        : {}
      asset.aaveData[SupportedChainId.GOERLI].underlyingAddress = getSupportedAssets(
        SupportedChainId.GOERLI,
        LendingProtocol.AAVE
      ).includes(x)
        ? addressesAaveTestnetTokens[x][SupportedChainId.GOERLI]
        : {}
      asset.compoundData[SupportedChainId.POLYGON_MUMBAI].underlyingAddress = getSupportedAssets(
        SupportedChainId.POLYGON_MUMBAI,
        LendingProtocol.COMPOUND
      ).includes(x)
        ? addresses0VixTestnetTokens[x]?.[SupportedChainId.POLYGON_MUMBAI]
        : {}
      asset.aaveData[SupportedChainId.POLYGON_MUMBAI].underlyingAddress = getSupportedAssets(
        SupportedChainId.POLYGON_MUMBAI,
        LendingProtocol.AAVE
      ).includes(x)
        ? addressesAaveTestnetTokens[x]?.[SupportedChainId.POLYGON_MUMBAI]
        : {}
      asset.compoundData[SupportedChainId.MAINNET].underlyingAddress = getSupportedAssets(
        1,
        LendingProtocol.COMPOUND
      ).includes(x)
        ? addressesTokens[x]?.[SupportedChainId.MAINNET]
        : {}
      asset.aaveData[SupportedChainId.POLYGON].underlyingAddress = getSupportedAssets(
        SupportedChainId.POLYGON,
        LendingProtocol.AAVE
      ).includes(x)
        ? addressesTokens[x]?.[SupportedChainId.POLYGON]
        : {}
      return {
        [x]: { id: x, ...dummyAssetBase, ...TOKEN_META[x] },
      }
    })
  ),
}

export default createReducer<DeltaState>(initialState, (builder) =>
  builder
    .addCase(resetState, () => initialState)
    // ==== 1Delta User Account =====
    .addCase(set1DeltaAccount, (state, action) => {
      state.userMeta[action.payload.chainId].selectedAccountData = {
        account: state.userMeta[action.payload.chainId].accounts1Delta[action.payload.index],
        index: action.payload.index,
      }
    })
    .addCase(flushAccount, (state) => {
      state.userMeta = Object.assign(
        {},
        ...chainIds.map((x) => {
          return { [x]: userMetaDummy }
        })
      )
    })
    .addCase(setToLoading, (state) => {
      state.userMeta[1].loaded = false
      state.userMeta[5].loaded = false
      state.userMeta[80001].loaded = false
      state.userMeta[137].loaded = false
      state.loadingState = {
        userDataLoaded: false,
        publicDataLoaded: false,
        liquidityLoaded: false,
        pricesLoaded: false,
        configLoaded: false,
        reservesLoaded: false,
        userMeta: {
          loading: false,
        },
        compound: {
          publicLoading: false,
          userLoading: false,
          publicLoaded: false,
          userLoaded: false,
        },
      }
    })
    .addCase(set1DeltaAccountMetaLoading, (state, action) => {
      state.userMeta[action.payload.chainId].loaded = action.payload.state
    })
    .addCase(switchLendingProtocol, (state, action) => {
      state.userState.selectedLendingProtocol = action.payload.targetProtocol
    })
    // public data fetch
    .addCase(fetchCompoundPublicDataAsync.pending, (state) => {
      // state.userDataLoading = true
      state.loadingState.compound.publicLoading = true
    })
    .addCase(fetchCompoundPublicDataAsync.fulfilled, (state, action) => {
      const assetKeys = Object.keys(action.payload.data)
      const chainId = action.payload.chainId
      for (let i = 0; i < assetKeys.length; i++) {
        state.assets[assetKeys[i]].compoundData[chainId].reserveData = {
          ...state.assets[assetKeys[i]].compoundData[chainId].reserveData,
          ...action.payload.data[assetKeys[i]],
        }
      }
      state.loadingState.compound.publicLoaded = true
      state.loadingState.compound.publicLoading = false
    })


    // user data from provider
    .addCase(fetchUserBalances.fulfilled, (state, action) => {
      const assetKeys = Object.keys(action.payload.balances)
      for (let i = 0; i < assetKeys.length; i++)
        state.assets[assetKeys[i]].walletBalance = action.payload.balances[assetKeys[i]]
    })
    .addCase(fetchUserBalances.pending, (state) => {
      //
    })
)
