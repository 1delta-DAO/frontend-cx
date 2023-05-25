import { getSupportedAssets } from "constants/1delta"
import { SupportedChainId } from "constants/chains"
import { useEffect } from "react"
import { fetchAAVEReserveDataAsync } from "state/1delta/aave/fetchAAVEPublicData"
import { fetchAAVEUserReserveDataAsync } from "state/1delta/aave/fetchAAVEUserData"
import { LendingProtocol } from "state/1delta/actions"
import { fetchCompoundAccountDataAsync } from "state/1delta/compound/fetchCompoundAccountData"
import { fetchCompoundPublicDataAsync } from "state/1delta/compound/fetchCompoundPublicData"
import { fetch1DeltaUserAccountDataAsync } from "state/1delta/fetch1DeltaAccountData"
import { fetchUserBalances } from "state/1delta/fetchAssetBalances"
import { convertAccountArray } from "state/1delta/hooks"
import { useAppDispatch } from "state/hooks"
import { fetchAAVEAggregatorDataAsync } from "state/oracles/fetchAaveAggregatorData"
import { fetchChainLinkData } from "state/oracles/fetchChainLinkData"


type BaseLoadingState = { userLoaded: boolean, userLoading: boolean, publicLoaded: boolean, publicLoading: boolean }

export const usePollLendingData = (
  account: string | undefined,
  userAccountData: any,
  deltaLoadingState: { userMeta: { loading: boolean } },
  deltaUserMeta: { [cId: number]: { loaded?: boolean } },
  chainId: number,
  connectionIsSupported: boolean,
  aaveLoadingState: BaseLoadingState,
  compoundLoadingState: BaseLoadingState,
  hasAaveView: boolean,
  currentProtocol: LendingProtocol,
  oracleLoadingState: { aave: { publicLoading: boolean, publicLoaded: boolean }, chainLink: { publicLoading: boolean, publicLoaded: boolean } }

) => {


  const dispatch = useAppDispatch()

  useEffect(() => {
    // fetch prices
    if (hasAaveView && !oracleLoadingState.aave.publicLoading && !oracleLoadingState.aave.publicLoaded) {
      dispatch(fetchAAVEAggregatorDataAsync({ chainId }))
    }

    if (!oracleLoadingState.chainLink.publicLoaded && !oracleLoadingState.chainLink.publicLoading) {
      dispatch(fetchChainLinkData({ chainId }))
    }

    if (currentProtocol === LendingProtocol.AAVE) {
      // user info
      if (account && !aaveLoadingState.userLoaded && !aaveLoadingState.userLoading) {
        dispatch(
          fetchAAVEUserReserveDataAsync({
            chainId,
            account,
            assetsToQuery: getSupportedAssets(chainId, LendingProtocol.AAVE),
          })
        )
      }

      if (!aaveLoadingState.publicLoaded && !aaveLoadingState.publicLoading) {
        dispatch(fetchAAVEReserveDataAsync({ chainId, assetsToQuery: getSupportedAssets(chainId, LendingProtocol.AAVE) }))
      }
    }


    if (currentProtocol === LendingProtocol.COMPOUND) {
      if (!compoundLoadingState.publicLoaded && !compoundLoadingState.publicLoading) {
        dispatch(fetchCompoundPublicDataAsync({ chainId }))
      }

      if (connectionIsSupported && account && !deltaUserMeta[chainId]?.loaded && !deltaLoadingState.userMeta.loading) {
        if (chainId !== SupportedChainId.MAINNET)
          dispatch(fetch1DeltaUserAccountDataAsync({ chainId, account }))
      }

      if (
        connectionIsSupported &&
        compoundLoadingState.publicLoaded &&
        deltaUserMeta[chainId]?.loaded &&
        !compoundLoadingState.userLoaded &&
        account
      ) {
        dispatch(
          fetchCompoundAccountDataAsync({
            chainId,
            accounts: convertAccountArray(userAccountData),
            assetIds: getSupportedAssets(chainId, LendingProtocol.COMPOUND),
          })
        )
      }
    }
  }, [account, deltaLoadingState, deltaUserMeta, chainId, connectionIsSupported, aaveLoadingState, compoundLoadingState, hasAaveView, currentProtocol])
}