import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { useChainId } from 'state/globalNetwork/hooks'

export default function useAutoRouterSupported(): boolean {
  const chainId = useChainId()
  return isSupportedChainId(chainId)
}
