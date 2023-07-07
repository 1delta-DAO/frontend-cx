import { SupportedChainId } from './chains'

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY
if (typeof INFURA_KEY === 'undefined') {
  console.warn(`REACT_APP_INFURA_KEY must be a defined environment variable`)
}

const QUICKNODE_RPC_URL = process.env.REACT_APP_QUICKNODE_RPC_URL
if (typeof QUICKNODE_RPC_URL === 'undefined') {
  console.warn(`REACT_APP_QUICKNODE_RPC_URL must be a defined environment variable`)
}


/**
 * Fallback JSON-RPC endpoints.
 * These are used if the integrator does not provide an endpoint, or if the endpoint does not work.
 *
 * MetaMask allows switching to any URL, but displays a warning if it is not on the "Safe" list:
 * https://github.com/MetaMask/metamask-mobile/blob/bdb7f37c90e4fc923881a07fca38d4e77c73a579/app/core/RPCMethods/wallet_addEthereumChain.js#L228-L235
 * https://chainid.network/chains.json
 *
 * These "Safe" URLs are listed first, followed by other fallback URLs, which are taken from chainlist.org.
 */
export const FALLBACK_URLS: { [chainId: number]: string[] } = {
  [SupportedChainId.MAINNET]: [
    // "Fallback" URLs
    'https://rpc.ankr.com/eth',
  ],
  [SupportedChainId.GOERLI]: [
    'https://rpc.ankr.com/eth_goerli',

  ],
  [SupportedChainId.POLYGON]: [
    // "Safe" URLs
    'https://polygon-mainnet.public.blastapi.io',
    'https://polygon.llamarpc.com',
    'https://1rpc.io/matic',
    'https://rpc.ankr.com/polygon',
  ],
  [SupportedChainId.POLYGON_ZK_EVM]: [
    // "Safe" URLs
    typeof QUICKNODE_RPC_URL === 'undefined' ? 'https://zkevm-rpc.com' : QUICKNODE_RPC_URL,
    'https://zkevm-rpc.com',
    // 'https://1rpc.io/zkevm' -> currenctly not working
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    // "Safe" URLs
    'https://polygon-testnet.public.blastapi.io',
    'https://rpc.ankr.com/polygon_mumbai',

  ],
}

/**
 * Known JSON-RPC endpoints.
 * These are the URLs used by the interface when there is not another available source of chain data.
 */
export const RPC_URLS: { [chainId: number]: string[] } = FALLBACK_URLS 