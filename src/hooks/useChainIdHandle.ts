import { chainIds, SupportedChainId } from 'constants/chains'
import { useEffect } from 'react'
import { flushAccount, setToLoading } from 'state/1delta/actions'
import { setAccount, setBlockNumber, setChainId, setIsSupported } from 'state/globalNetwork/actions'
import { useNetworkState } from 'state/globalNetwork/hooks'
import { useAppDispatch } from 'state/hooks'
import { setOraclesToLoading } from 'state/oracles/actions'

// sets the chainId and account if provided by web3
// in case of a change, everything is set to loading for a state refresh
export function useChainIdHandling(chainIdWeb3: number | undefined, accountFromWeb3: string | undefined) {
  const { chainId, account: accountFromState } = useNetworkState()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (chainIdWeb3 && chainId !== chainIdWeb3 && chainId === SupportedChainId.POLYGON_ZK_EVM && accountFromWeb3) {
      dispatch(setChainId({ chainId: chainIdWeb3 }))
      dispatch(setToLoading())
      dispatch(setOraclesToLoading())
    }
    if (accountFromWeb3 !== accountFromState) {
      dispatch(setAccount({ account: accountFromWeb3 }))
      dispatch(flushAccount())
      dispatch(setToLoading())
    }
  }, [dispatch, chainId, chainIdWeb3, accountFromWeb3])

  useEffect(() => {
    dispatch(setIsSupported({ isSupported: SupportedChainId.POLYGON_ZK_EVM === Number(chainIdWeb3) }))
  }, [chainIdWeb3])
}
