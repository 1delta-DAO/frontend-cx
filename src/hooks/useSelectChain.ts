import { useWeb3React } from '@web3-react/core'
import { getConnection } from 'connection/utils'
import { SupportedChainId } from 'constants/chains'
import { useCallback } from 'react'
import { setToLoading } from 'state/1delta/actions'
import { addPopup } from 'state/application/reducer'
import { updateConnectionError } from 'state/connection/reducer'
import { setChainId } from 'state/globalNetwork/actions'
import { useAppDispatch } from 'state/hooks'
import { setOraclesToLoading } from 'state/oracles/actions'
import { switchChain } from 'utils/switchChain'

export default function useSelectChain() {
  const dispatch = useAppDispatch()
  const { connector } = useWeb3React()

  return useCallback(
    async (targetChain: SupportedChainId) => {
      if (!connector) return

      const connectionType = getConnection(connector).type

      try {
        dispatch(updateConnectionError({ connectionType, error: undefined }))
        await switchChain(connector, targetChain)
        // set chainId in gloabalNetwork state
        dispatch(setChainId({ chainId: targetChain }))
        // set loading to true to reload data
        dispatch(setToLoading())
        dispatch(setOraclesToLoading())
      } catch (error) {
        console.error('Failed to switch networks', error)

        dispatch(updateConnectionError({ connectionType, error: error.message }))
        dispatch(addPopup({ content: { failedSwitchNetwork: targetChain }, key: `failed-network-switch` }))
      }
    },
    [connector, dispatch]
  )
}
