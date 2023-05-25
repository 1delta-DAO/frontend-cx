import { useEffect, useState, useRef, useMemo } from 'react'
import { Web3Provider, JsonRpcProvider } from '@ethersproject/providers'
import { useNetworkState } from 'state/globalNetwork/hooks'
import { useChainIdHandling } from './useChainIdHandle'
import { simpleRpcProvider } from 'utils/1delta/contractHelper'
import { useWeb3React } from '@web3-react/core'

const POLLING_INTERVAL = 12000;

/**
 * Provides a web3 provider with or without user's signer
 * Recreate web3 instance only if the provider changes
 * Sets account to undefined if user is connected to network with no implementation 
 */
const useActiveWeb3React = () => {
  const { provider: web3Provider, chainId: chainIdWeb3, account: accountWeb3, ...web3React } = useWeb3React()

  useChainIdHandling(chainIdWeb3, accountWeb3)
  const { chainId, account } = useNetworkState()

  const refEth = useRef(web3Provider)

  const [provider, setProvider] = useState<Web3Provider | JsonRpcProvider>(web3Provider || simpleRpcProvider(chainId))

  useEffect(
    () => {
      if (web3Provider !== refEth.current) {
        const providerRpc = simpleRpcProvider(chainId)
        providerRpc.pollingInterval = POLLING_INTERVAL
        setProvider(web3Provider || providerRpc)
        refEth.current = web3Provider
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, web3Provider]
  )

  const isSupported = useMemo(() => chainId === chainIdWeb3, [chainId, chainIdWeb3])

  return { isSupported, provider, chainId, account: isSupported ? account : undefined, ...web3React }
}

export default useActiveWeb3React
