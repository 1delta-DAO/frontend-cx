import { formatAavePrice, getAavePriceWithHist } from 'utils/tableUtils/prices'
import { Currency } from '@uniswap/sdk-core'
import {
  AAVE_PRICE_PRECISION,
  BPS_BN,
  LTV_PRECISION,
  NATIVE_SYMBOL,
  TEN,
  TOKEN_META,
  WRAPPED_NATIVE_SYMBOL,
  ZERO_BN,
} from 'constants/1delta'
import { DEFAULT_CHAINID, SupportedChainId } from 'constants/chains'
import { ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { isSupportedAsset } from 'hooks/1delta/tokens'
import { useCallback } from 'react'
import { AppState } from 'state'
import { useChainId } from 'state/globalNetwork/hooks'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { Asset, SupportedAssets } from 'types/1delta'
import { LendingProtocol, set1DeltaAccountMetaLoading, switchLendingProtocol } from './actions'
import { OneDeltaAccount } from './reducer'
import { useWeb3React } from '@web3-react/core'
import { fetchAAVEUserReserveDataAsync } from './aave/fetchAAVEUserData'
import { fetchCompoundAccountDataAsync } from './compound/fetchCompoundAccountData'
import { fetchCometUserDataAsync } from './compound-v3/fetchCometUserData'

export function useDeltaState(): AppState['delta'] {
  return useAppSelector((state) => state.delta)
}

export function useCurrentLendingProtocol(): LendingProtocol {
  return useAppSelector((state) => state.delta).userState.selectedLendingProtocol
}

export const useSelectLendingProtocol = () => {

  const dispatch = useAppDispatch()

  return useCallback((lender: LendingProtocol) => {
    dispatch(switchLendingProtocol({ targetProtocol: lender }))
  },
    [dispatch]
  )
}


export function useGetMoneyMarketAssetData(
  chainId?: number,
  currencyOutside?: Currency | null | undefined,
  currencyInside?: Currency | null | undefined
): { assetInside?: Asset; assetOutside?: Asset } {
  const assetData = useAppSelector((state) => state.delta.assets)
  let assetInside: Asset | undefined = undefined
  let assetOutside: Asset | undefined = undefined
  if (isSupportedAsset(chainId, currencyInside)) assetInside = assetData[currencyInside?.symbol as SupportedAssets]

  if (isSupportedAsset(chainId, currencyOutside)) assetOutside = assetData[currencyOutside?.symbol as SupportedAssets]
  return { assetInside, assetOutside }
}

export function useGetAssetData(
  chainId?: number,
  currency0?: Currency | null | undefined,
  currency1?: Currency | null | undefined
): { asset0?: Asset; asset1?: Asset } {
  const assetData = useAppSelector((state) => state.delta.assets)
  let asset0: Asset | undefined = undefined
  let asset1: Asset | undefined = undefined
  if (isSupportedAsset(chainId, currency0)) asset0 = assetData[currency0?.symbol as SupportedAssets]

  if (isSupportedAsset(chainId, currency1)) asset1 = assetData[currency1?.symbol as SupportedAssets]
  return { asset0, asset1 }
}

export function useGetCurrentAccount(chainId: number) {
  return useAppSelector((state) => state.delta).userMeta[chainId]?.selectedAccountData?.account
}

export function useGetCurrentAccountSummary(chainId: number) {
  const index = useAppSelector((state) => state.delta).userMeta[chainId].selectedAccountData.index
  return useAppSelector((state) => state.delta.userMeta[chainId].accounts1Delta)[index]
}

export function useGetSingleAsset(
  chainId?: number,
  currency?: Currency | null | undefined,
  protocol = LendingProtocol.AAVE
): { asset?: Asset } {
  const assetData = useAppSelector((state) => state.delta.assets)
  let asset: Asset | undefined = undefined

  if (protocol === LendingProtocol.AAVE) {
    asset = assetData[currency?.symbol as SupportedAssets]
  } else {
    if (currency?.symbol === WRAPPED_NATIVE_SYMBOL[chainId ?? DEFAULT_CHAINID]) {
      asset = assetData[NATIVE_SYMBOL[chainId ?? DEFAULT_CHAINID]]
    } else {
      asset = assetData[currency?.symbol?.toUpperCase() as SupportedAssets]
    }
  }
  return { asset }
}

export function useSortAssets(
  assetInKey: SupportedAssets,
  assetOutKey: SupportedAssets
): { assetIn?: Asset; assetOut?: Asset } {
  const assetData = useAppSelector((state) => state.delta.assets)
  return { assetIn: assetData[assetInKey], assetOut: assetData[assetOutKey] }
}

export function useDeltaAssetState(): {
  [key: string]: Asset
} {
  return useAppSelector((state) => state.delta.assets)
}

export function useLiquidationThreshold(assets: SupportedAssets[], chainId: number, protocol = LendingProtocol.AAVE): number[] {
  const assetsFromState = useAppSelector((state) => state.delta.assets)
  return assets.map((a) => assetsFromState[a]).map((a) => {
    if (protocol === LendingProtocol.AAVE)
      return getLiquidationThreshold(a, chainId)
    if (protocol === LendingProtocol.COMPOUND)
      return getCompoundLiquidationThreshold(a, chainId)

    return getCompoundV3LiquidationThreshold(a, chainId)
  })
}

export function useCompoundLiquidationThreshold(assets: SupportedAssets[], chainId: number): number[] {
  const assetsFromState = useAppSelector((state) => state.delta.assets)
  return assets.map((a) => assetsFromState[a]).map((a) => getCompoundLiquidationThreshold(a, chainId))
}


const getLiquidationThreshold = (asset: Asset, chainId: number): number => {
  return Number(asset?.aaveData[chainId]?.reserveData?.liquidationThreshold ?? 0) / 1e4
}

const getCompoundLiquidationThreshold = (asset: Asset, chainId: number): number => {
  return Number(formatEther(asset?.compoundData[chainId]?.reserveData?.collateralFactorMantissa ?? '0'))
}

const getCompoundV3LiquidationThreshold = (asset: Asset, chainId: number, baseAsset = SupportedAssets.USDC): number => {
  return Number(formatEther(asset?.compoundV3Data[chainId]?.[baseAsset]?.reserveData.liquidateCollateralFactor ?? '0'))
}

export const useGetCompoundAllowance = (chainId: number, account: string, asset: SupportedAssets): string => {
  const assetsFromState = useAppSelector((state) => state.delta.assets)
  if (!chainId || !account || !asset) return '0'
  return assetsFromState[asset].compoundData[chainId].userData[account].tokenAllowance
}

export const useSetAccountMetaLoading = () => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const setAccountMetaLoading = useCallback(
    (state: boolean) => {
      dispatch(set1DeltaAccountMetaLoading({ chainId, state }))
    },
    [dispatch, chainId]
  )
  return {
    setAccountMetaLoading,
  }
}

export const convertAccountArray = (accountData: { [a: number]: OneDeltaAccount }): { [a: number]: string } => {
  if (!accountData) return {}
  return Object.assign(
    {},
    ...Object.values(accountData).map((x, i) => {
      return { [i]: x.accountAddress }
    })
  )
}

export const useGetSelectedAccount = (chainId?: number, account?: string): string | undefined => {
  const deltaState = useAppSelector((state) => state.delta)
  if (!chainId || !account) return undefined
  return deltaState.userMeta[chainId]?.selectedAccountData?.account?.accountAddress
}

export function useHasDeltaAccount(chainId: number): boolean {
  const accounts = useAppSelector((state) => state.delta.userMeta[chainId].accounts1Delta)
  return accounts ? Object.values(accounts).length > 0 : false
}

type keyType = 'aave' | 'compound'

export const protocolToKey: { [l in LendingProtocol]: keyType } = {
  [LendingProtocol.AAVE]: 'aave',
  [LendingProtocol.COMPOUND]: 'compound',
  [LendingProtocol.COMPOUNDV3]: 'compound'
}

export function useIsUserLoaded(protocol: LendingProtocol): boolean {
  const user = useAppSelector((state) => state.delta.loadingState[protocolToKey[protocol]].userLoaded)
  const pb = useAppSelector((state) => state.delta.loadingState[protocolToKey[protocol]].publicLoaded)
  return user && pb
}


export function useAssetIds(chainId: number): { assetsLong: SupportedAssets[], assetsShort: SupportedAssets[] } {
  const assets = Object.values(useAppSelector((state) => state.delta.assets))
  const assetsLong = assets.filter(a => a.aaveData[chainId].userData.currentATokenBalance !== '0').map(a => a.id)
  const assetsShort = assets.filter(a => a.aaveData[chainId].userData.currentStableDebt !== '0' || a.aaveData[chainId].userData.currentVariableDebt !== '0').map(a => a.id)

  return { assetsLong, assetsShort }

}

export function useAsset(asset: SupportedAssets): Asset {
  return useAppSelector((state) => state.delta.assets[asset])
}

export const useHasPosition = (chainId: number, asset: SupportedAssets): {
  hasCollateral: boolean,
  hasDebt: boolean
} => {
  const account = useWeb3React()
  const protocol = useCurrentLendingProtocol()
  const assetData = useAppSelector((state) => state.delta.assets)[asset]

  const deltaAccount = useGetCurrentAccount(chainId)

  if (!assetData) return { hasCollateral: false, hasDebt: false }

  // this allows a user that is not connected check out all available options
  if (!account) return { hasCollateral: true, hasDebt: true }

  if (protocol === LendingProtocol.AAVE) {
    return {
      hasCollateral: assetData.aaveData[chainId]?.userData?.currentATokenBalance !== '0',
      hasDebt: assetData.aaveData[chainId]?.userData?.currentStableDebt !== '0' ||
        assetData.aaveData[chainId]?.userData?.currentVariableDebt !== '0'
    }
  }
  if (protocol === LendingProtocol.COMPOUND) {
    if (!deltaAccount?.accountAddress) return { hasCollateral: true, hasDebt: true }
    return {
      hasCollateral: assetData.compoundData[chainId]?.userData[deltaAccount?.accountAddress ?? '']?.balanceOfUnderlying !== '0',
      hasDebt: assetData.compoundData[chainId]?.userData[deltaAccount?.accountAddress ?? '']?.borrowBalanceCurrent !== '0'
    }
  }

  return { hasCollateral: true, hasDebt: true }

}


export const useAaveTotals = () => {
  return useAppSelector((state) => state.delta.userState.aaveTotals)
}


export const useCometIsAllowed = (chainId: number, asset: SupportedAssets, baseAsset: SupportedAssets): boolean => {
  const isAllowed = useAppSelector((state) => state.delta.assets[asset]?.compoundV3Data?.[chainId]?.[baseAsset]?.userData?.isAllowed)
  return Boolean(
    isAllowed
  )
}

export const useFetchUserData = (lendingProtocol: LendingProtocol, chainId: number, account: string | undefined, assets: SupportedAssets[]) => {
  const dispatch = useAppDispatch()
  return useCallback(() => {

    switch (lendingProtocol) {
      case LendingProtocol.AAVE: {

        dispatch(
          fetchAAVEUserReserveDataAsync({
            chainId,
            account: account ?? '',
            assetsToQuery: assets,
          }))
        break;
      }
      case LendingProtocol.COMPOUND: {
        dispatch(
          fetchCompoundAccountDataAsync({
            chainId,
            accounts: account ? [account] : [],
            assetIds: assets,
          })
        )
        break;
      }
      case LendingProtocol.COMPOUNDV3: {
        dispatch(
          fetchCometUserDataAsync({
            chainId,
            account
          })
        )
        break;
      }
    }
  },
    [lendingProtocol, assets, account, chainId])
}

export const useFetchCometData = (chainId: number, account: string | undefined, baseAsset: SupportedAssets) => {
  const dispatch = useAppDispatch()
  return useCallback(() => {
    dispatch(
      fetchCometUserDataAsync({
        chainId,
        account
      })
    )
  },
    [account, chainId])
}