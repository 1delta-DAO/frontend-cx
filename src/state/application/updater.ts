import { useWeb3React } from '@web3-react/core'
import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useEffect, useState } from 'react'
import { setChainId } from 'state/globalNetwork/actions'
import { useAppDispatch } from 'state/hooks'
import { supportedChainId } from 'utils/supportedChainId'

import { updateChainId } from './reducer'

export default function Updater(): null {
  const { chainId, provider } = useWeb3React()
  const dispatch = useAppDispatch()
  const windowVisible = useIsWindowVisible()

  const [activeChainId, setActiveChainId] = useState(chainId)

  useEffect(() => {
    if (provider && chainId && windowVisible) {
      setActiveChainId(chainId)
    }
  }, [dispatch, chainId, provider, windowVisible])

  const debouncedChainId = useDebounce(activeChainId, 100)

  useEffect(() => {
    if (debouncedChainId && supportedChainId(debouncedChainId)) {
      dispatch(updateChainId({ chainId: debouncedChainId }))
      dispatch(setChainId({ chainId: debouncedChainId }))
    }
  }, [dispatch, debouncedChainId])

  return null
}
