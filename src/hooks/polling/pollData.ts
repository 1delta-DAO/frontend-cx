import { SupportedChainId } from "constants/chains"
import { useEffect } from "react"
import { LendingProtocol } from "state/1delta/actions"
import { fetchCompoundPublicDataAsync } from "state/1delta/compound/fetchCompoundPublicData"
import { useAppDispatch } from "state/hooks"
import { fetchAAVEAggregatorDataAsync } from "state/oracles/fetchAaveAggregatorData"
import { fetchChainLinkData } from "state/oracles/fetchChainLinkData"


type BaseLoadingState = { userLoaded: boolean, userLoading: boolean, publicLoaded: boolean, publicLoading: boolean }

export const usePollLendingData = (
  account: string | undefined,
  chainId: number,
  connectionIsSupported: boolean,
  compoundLoadingState: BaseLoadingState,
  currentProtocol: LendingProtocol,
  oracleLoadingState: { aave: { publicLoading: boolean, publicLoaded: boolean }, chainLink: { publicLoading: boolean, publicLoaded: boolean } }

) => {


  const dispatch = useAppDispatch()

  useEffect(() => {
    // fetch prices
    if (!oracleLoadingState.aave.publicLoading && !oracleLoadingState.aave.publicLoaded) {
      dispatch(fetchAAVEAggregatorDataAsync({ chainId: SupportedChainId.POLYGON }))
    }

    if (!oracleLoadingState.chainLink.publicLoaded && !oracleLoadingState.chainLink.publicLoading) {
      dispatch(fetchChainLinkData({ chainId }))
    }



    if (currentProtocol === LendingProtocol.COMPOUND) {
      if (!compoundLoadingState.publicLoaded && !compoundLoadingState.publicLoading) {
        dispatch(fetchCompoundPublicDataAsync({ chainId }))
      }
    }
  }, [account, chainId, connectionIsSupported, compoundLoadingState, currentProtocol])
}