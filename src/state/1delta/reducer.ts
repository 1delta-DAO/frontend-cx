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
import {
  fetchAAVEPublicDataAsync,
  fetchAAVEReserveConfigDataAsync,
  fetchAAVEReserveDataAsync,
} from './aave/fetchAAVEPublicData'
import { fetchAAVEUserReserveDataAsync } from './aave/fetchAAVEUserData'
import { fetch1DeltaUserAccountDataAsync } from './fetch1DeltaAccountData'
import { fetchCompoundAccountDataAsync } from './compound/fetchCompoundAccountData'
import { addressesAaveTestnetTokens } from 'hooks/1delta/addressesAave'
import { addressesCompoundTestnetTokens } from 'hooks/1delta/addressesCompound'
import { addresses0VixTestnetTokens } from 'hooks/1delta/addresses0Vix'
import { addressesTokens } from 'hooks/1delta/addressesTokens'
import { chainIds, SupportedChainId } from 'constants/chains'
import { fetchUserBalances } from './fetchAssetBalances'
import { fetchCometReserveDataAsync } from './compound-v3/fetchCometPublicData'
import { fetchCometUserDataAsync } from './compound-v3/fetchCometUserData'

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
    aave: {
      configLoading: boolean
      configLoaded: boolean
      publicLoading: boolean
      publicLoaded: boolean
      userLoading: boolean
      userLoaded: boolean
      aggregatorLoaded: boolean
      aggregatorLoading: boolean
    }
    compoundV3: {
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
    },
    aave: {
      configLoading: false,
      configLoaded: false,
      publicLoading: false,
      userLoading: false,
      publicLoaded: false,
      userLoaded: false,
      aggregatorLoaded: false,
      aggregatorLoading: false,
    },
    compoundV3: {
      publicLoading: false,
      userLoading: false,
      publicLoaded: false,
      userLoaded: false,
    },
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
        aave: {
          configLoading: false,
          configLoaded: false,
          publicLoading: false,
          userLoading: false,
          publicLoaded: false,
          userLoaded: false,
          aggregatorLoaded: false,
          aggregatorLoading: false,
        },
        compoundV3: {
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
    // ==== Account Fetch
    .addCase(fetch1DeltaUserAccountDataAsync.pending, (state) => {
      state.loadingState.userMeta.loading = true
    })
    .addCase(fetch1DeltaUserAccountDataAsync.fulfilled, (state, action) => {
      state.userMeta[action.payload.chainId].accounts1Delta = action.payload.accounts
      state.userMeta[action.payload.chainId].loaded = true
      state.loadingState.userMeta.loading = true
    })
    // account advanced data fetch
    .addCase(fetchCompoundAccountDataAsync.pending, (state) => {
      // state.userDataLoading = true
      state.loadingState.compound.userLoading = true
    })
    .addCase(fetchCompoundAccountDataAsync.fulfilled, (state, action) => {
      if (action.payload.data) {
        const chainId = action.payload.chainId
        const assetKeys = Object.keys(action.payload.data)
        for (let i = 0; i < assetKeys.length; i++) {
          const assetKey = assetKeys[i]
          const accountKeys = Object.keys(action.payload.data[assetKey])
          state.assets[assetKey].compoundData[chainId].userData = {}
          for (let k = 0; k < accountKeys.length; k++) {
            state.assets[assetKey].compoundData[chainId].userData[accountKeys[k]] = {
              ...state.assets[assetKey].compoundData[chainId].userData[accountKeys[k]],
              ...action.payload.data[assetKey][accountKeys[k]],
            }
          }
        }

        if (action.payload.summary) {
          const accountKeys = Object.values(action.payload.summary)
          for (let k = 0; k < accountKeys.length; k++) {
            const assetKey = state.userMeta[action.payload.chainId].accounts1Delta[k]?.accountAddress
            if (!assetKey) continue
            state.userMeta[action.payload.chainId].accounts1Delta[k].compoundSummary = action.payload.summary[assetKey]
          }
        }

        state.loadingState.compound.userLoaded = true
        state.loadingState.compound.userLoading = false
      }
    })
    // public data fetch
    .addCase(fetchAAVEPublicDataAsync.pending, (state) => {
      // state.userDataLoading = true
    })
    .addCase(fetchAAVEPublicDataAsync.fulfilled, (state, action) => {
      const assetKeys = Object.keys(action.payload.data)
      for (let i = 0; i < assetKeys.length; i++) {
        state.assets[assetKeys[i]] = {
          ...state.assets[assetKeys[i]],
          ...action.payload.data[assetKeys[i]],
        }
      }
      state.loadingState.publicDataLoaded = true
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
    // new reserve data-fetch using aave data provider
    .addCase(fetchAAVEReserveDataAsync.fulfilled, (state, action) => {
      const assetKeys = Object.keys(action.payload.data)
      const chainId = action.payload.chainId
      for (let i = 0; i < assetKeys.length; i++) {
        state.assets[assetKeys[i]].aaveData[chainId].reserveData = {
          ...state.assets[assetKeys[i]].aaveData[chainId].reserveData,
          ...action.payload.data[assetKeys[i]],
        }
      }
      state.loadingState.aave.publicLoaded = true
      state.loadingState.aave.publicLoading = false


      const assetKeysConfig = Object.keys(action.payload.config)
      for (let i = 0; i < assetKeysConfig.length; i++) {
        state.assets[assetKeysConfig[i]].aaveData[chainId].reserveData = {
          ...state.assets[assetKeysConfig[i]].aaveData[chainId].reserveData,
          ...action.payload.config[assetKeysConfig[i]],
        }
      }
    })
    .addCase(fetchAAVEReserveDataAsync.pending, (state) => {
      state.loadingState.aave.publicLoading = true
      //
    })
    // reserve config data
    .addCase(fetchAAVEReserveConfigDataAsync.fulfilled, (state, action) => {
      const assetKeys = Object.keys(action.payload.data)
      const chainId = action.payload.chainId
      for (let i = 0; i < assetKeys.length; i++) {
        state.assets[assetKeys[i]].aaveData[chainId].reserveData = {
          ...state.assets[assetKeys[i]].aaveData[chainId].reserveData,
          ...action.payload.data[assetKeys[i]],
        }

        state.assets[assetKeys[i]].aaveData[chainId].reserveData = {
          ...state.assets[assetKeys[i]].aaveData[chainId].reserveData,
          ...action.payload.data[assetKeys[i]],
        }
      }
      state.loadingState.aave.configLoaded = true
      state.loadingState.aave.configLoading = false
    })
    .addCase(fetchAAVEReserveConfigDataAsync.pending, (state) => {
      state.loadingState.aave.configLoading = true
      //
    })
    // user data from provider
    .addCase(fetchAAVEUserReserveDataAsync.fulfilled, (state, action) => {
      const assetKeys = Object.keys(action.payload.data)
      const chainId = action.payload.chainId
      for (let i = 0; i < assetKeys.length; i++) {
        state.assets[assetKeys[i]].aaveData[chainId].userData = {
          ...state.assets[assetKeys[i]].aaveData[chainId].userData,
          ...action.payload.data[assetKeys[i]],
        }
      }
      state.userState.aaveTotals[chainId] = action.payload.totals
      state.loadingState.aave.userLoaded = true
      state.loadingState.aave.userLoading = false
    })
    .addCase(fetchAAVEUserReserveDataAsync.pending, (state) => {
      state.loadingState.aave.userLoading = true
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

    // Compound V3
    .addCase(fetchCometReserveDataAsync.fulfilled, (state, action) => {
      const assetKeys = Object.keys(action.payload.data)
      const chainId = action.payload.chainId
      for (let i = 0; i < assetKeys.length; i++) {
        state.assets[assetKeys[i]].compoundV3Data[chainId][SupportedAssets.USDC].reserveData = {
          ...state.assets[assetKeys[i]].compoundV3Data[chainId][SupportedAssets.USDC].reserveData,
          ...action.payload.data[assetKeys[i]][SupportedAssets.USDC],
        }
      }
      state.loadingState.compoundV3.publicLoaded = true
      state.loadingState.compoundV3.publicLoading = false


    })
    .addCase(fetchCometReserveDataAsync.pending, (state) => {
      state.loadingState.compoundV3.publicLoading = true
      //
    })
    // Compound V3
    .addCase(fetchCometUserDataAsync.fulfilled, (state, action) => {
      const assetKeys = Object.keys(action.payload.data)
      const chainId = action.payload.chainId
      for (let i = 0; i < assetKeys.length; i++) {
        state.assets[assetKeys[i]].compoundV3Data[chainId][SupportedAssets.USDC].userData = {
          ...state.assets[assetKeys[i]].compoundV3Data[chainId][SupportedAssets.USDC].userData,
          ...action.payload.data[assetKeys[i]][SupportedAssets.USDC],
        }
      }
      state.loadingState.compoundV3.userLoaded = true
      state.loadingState.compoundV3.userLoading = false


    })
    .addCase(fetchCometUserDataAsync.pending, (state) => {
      state.loadingState.compoundV3.userLoading = true
      //
    })
)
