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
    // 'https://eth-mainnet.public.blastapi.io',
  ],
  // [SupportedChainId.ROPSTEN]: [
  //   // "Fallback" URLs
  //   'https://rpc.ankr.com/eth_ropsten',
  // ],
  // [SupportedChainId.RINKEBY]: [
  //   // "Fallback" URLs
  //   'https://rinkeby-light.eth.linkpool.io/',
  // ],
  [SupportedChainId.GOERLI]: [
    'https://rpc.ankr.com/eth_goerli',
    // "Safe" URLs
    // 'https://rpc.goerli.mudit.blog/',
    // "Fallback" URLs

  ],
  // [SupportedChainId.KOVAN]: [
  //   // "Fallback" URLs
  //   'https://eth-kovan.public.blastapi.io',
  // ],
  [SupportedChainId.POLYGON]: [
    // "Safe" URLs
    // typeof QUICKNODE_RPC_URL === 'undefined' ? 'https://polygon-rpc.com/' : QUICKNODE_RPC_URL,
    // 'https://rpc.ankr.com/polygon',
    'https://polygon-mainnet.public.blastapi.io',
    'https://polygon.llamarpc.com',
    'https://1rpc.io/matic',
    'https://rpc.ankr.com/polygon',
    // typeof INFURA_KEY === 'undefined' ?
    //   'https://rpc.ankr.com/polygon' : `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    // 'https://rpc.ankr.com/polygon',
    // 'https://rpc-mainnet.matic.network',
    // 'https://matic-mainnet.chainstacklabs.com',
    // 'https://rpc-mainnet.maticvigil.com',
    // 'https://rpc-mainnet.matic.quiknode.pro',
    // 'https://matic-mainnet-full-rpc.bwarelabs.com',
  ],
  [SupportedChainId.POLYGON_ZK_EVM]: [
    // "Safe" URLs
    'https://zkevm-rpc.com',
    'https://rpc.ankr.com/polygon_zkevm',
    'https://rpc.polygon-zkevm.gateway.fm',
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    // "Safe" URLs
    'https://polygon-testnet.public.blastapi.io', // too many requests
    // typeof INFURA_KEY === 'undefined' ?
    //   'https://rpc.ankr.com/polygon_mumbai' : `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
    // 'https://matic-mumbai.chainstacklabs.com',
    'https://rpc.ankr.com/polygon_mumbai',
    // typeof INFURA_KEY === 'undefined' ?
    //   'https://rpc.ankr.com/polygon' : `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,

    // 'https://matic-testnet-archive-rpc.bwarelabs.com',

  ],
  // [SupportedChainId.ARBITRUM_ONE]: [
  //   // "Safe" URLs
  //   'https://arb1.arbitrum.io/rpc',
  //   // "Fallback" URLs
  //   'https://arbitrum.public-rpc.com',
  // ],
  // [SupportedChainId.ARBITRUM_RINKEBY]: [
  //   // "Safe" URLs
  //   'https://rinkeby.arbitrum.io/rpc',
  // ],
  // [SupportedChainId.OPTIMISM]: [
  //   // "Safe" URLs
  //   'https://mainnet.optimism.io/',
  //   // "Fallback" URLs
  //   'https://rpc.ankr.com/optimism',
  // ],
  // [SupportedChainId.OPTIMISM_GOERLI]: [
  //   // "Safe" URLs
  //   'https://goerli.optimism.io',
  // ],
  // [SupportedChainId.CELO]: [
  //   // "Safe" URLs
  //   `https://forno.celo.org`,
  // ],
  // [SupportedChainId.CELO_ALFAJORES]: [
  //   // "Safe" URLs
  //   `https://alfajores-forno.celo-testnet.org`,
  // ],
}

/**
 * Known JSON-RPC endpoints.
 * These are the URLs used by the interface when there is not another available source of chain data.
 */
export const RPC_URLS: { [chainId: number]: string[] } = FALLBACK_URLS /* {
  [SupportedChainId.MAINNET]: [
    `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.MAINNET],
  ],
  [SupportedChainId.RINKEBY]: [
    `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.RINKEBY],
  ],
  [SupportedChainId.ROPSTEN]: [
    `https://ropsten.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.ROPSTEN],
  ],
  [SupportedChainId.GOERLI]: [`https://goerli.infura.io/v3/${INFURA_KEY}`, ...FALLBACK_URLS[SupportedChainId.GOERLI]],
  [SupportedChainId.KOVAN]: [`https://kovan.infura.io/v3/${INFURA_KEY}`, ...FALLBACK_URLS[SupportedChainId.KOVAN]],
  [SupportedChainId.OPTIMISM]: [
    `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.OPTIMISM],
  ],
  [SupportedChainId.OPTIMISM_GOERLI]: [
    `https://optimism-goerli.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.OPTIMISM_GOERLI],
  ],
  [SupportedChainId.ARBITRUM_ONE]: [
    `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.ARBITRUM_ONE],
  ],
  [SupportedChainId.ARBITRUM_RINKEBY]: [
    `https://arbitrum-rinkeby.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.ARBITRUM_RINKEBY],
  ],
  [SupportedChainId.POLYGON]: [
    `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.POLYGON],
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.POLYGON_MUMBAI],
  ],
  [SupportedChainId.CELO]: FALLBACK_URLS[SupportedChainId.CELO],
  [SupportedChainId.CELO_ALFAJORES]: FALLBACK_URLS[SupportedChainId.CELO_ALFAJORES],
}
*/