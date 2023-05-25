import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { setChainId, setAccount } from './actions'

export function useNetworkState(): AppState['globalNetwork'] {
  return useSelector<AppState, AppState['globalNetwork']>((state) => state.globalNetwork)
}

export function useChainId(): number {
  return useSelector<AppState, AppState['globalNetwork']>((state) => state.globalNetwork).chainId
}

export function useAccount(): string | undefined {
  return useSelector<AppState, AppState['globalNetwork']>((state) => state.globalNetwork).account
}

export function useChainIdAndAccount(): { chainId: number, account: string | undefined } {
  const state = useSelector<AppState, AppState['globalNetwork']>((state) => state.globalNetwork)
  return { chainId: state.chainId, account: state.account }
}

export function useIsSupported(): boolean {
  return useSelector<AppState, AppState['globalNetwork']>((state) => state.globalNetwork).connectionIsSupported
}

export function useTimestamp(): string {
  const chainId = useChainId()
  return useSelector<AppState, AppState['globalNetwork']>((state) => state.globalNetwork).networkData[chainId].lastTimestamp
}

export function useNativeBalance(): string | undefined {
  const chainId = useChainId()
  return useSelector<AppState, AppState['globalNetwork']>((state) => state.globalNetwork).networkData[chainId].nativeBalance
}

export function useBlockNumber(): number {
  const chainId = useChainId()
  return useSelector<AppState, AppState['globalNetwork']>((state) => state.globalNetwork).networkData[chainId].blockNumber
}

export function useGlobalNetworkActionHandlers(): {
  onChainChange: (chainId: number) => void
  onAccountChange: (account: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onChainChange = useCallback(
    (chainId: number) => {
      dispatch(setChainId({ chainId }))
    },
    [dispatch]
  )
  const onAccountChange = useCallback(
    (account: string) => {
      dispatch(setAccount({ account }))
    },
    [dispatch]
  )
  return {
    onChainChange,
    onAccountChange,
  }
}
