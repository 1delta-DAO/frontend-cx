import { deepCopy } from '@ethersproject/properties'
// This is the only file which should instantiate new Providers.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { isPlain } from '@reduxjs/toolkit'
import { CHAIN_IDS_TO_NAMES, SupportedChainId } from './chains'
import { RPC_URLS } from './networks'
import ms from 'ms.macro'

export const AVERAGE_L1_BLOCK_TIME = ms`12s`

export class AppJsonRpcProvider extends StaticJsonRpcProvider {
  private _blockCache = new Map<string, Promise<any>>()
  get blockCache() {
    // If the blockCache has not yet been initialized this block, do so by
    // setting a listener to clear it on the next block.
    if (!this._blockCache.size) {
      this.once('block', () => this._blockCache.clear())
    }
    return this._blockCache
  }

  constructor(chainId: SupportedChainId, providerIndex: number) {
    // Including networkish allows ethers to skip the initial detectNetwork call.
    super(RPC_URLS[chainId][providerIndex], /* networkish= */ { chainId, name: CHAIN_IDS_TO_NAMES[chainId] })

    // NB: Third-party providers (eg MetaMask) will have their own polling intervals,
    // which should be left as-is to allow operations (eg transaction confirmation) to resolve faster.
    // Network providers (eg AppJsonRpcProvider) need to update less frequently to be considered responsive.
    this.pollingInterval = AVERAGE_L1_BLOCK_TIME
  }

  send(method: string, params: Array<any>): Promise<any> {
    // Only cache eth_call's.
    if (method !== 'eth_call') return super.send(method, params)

    // Only cache if params are serializable.
    if (!isPlain(params)) return super.send(method, params)

    const key = `call:${JSON.stringify(params)}`
    const cached = this.blockCache.get(key)
    if (cached) {
      this.emit('debug', {
        action: 'request',
        request: deepCopy({ method, params, id: 'cache' }),
        provider: this,
      })
      return cached
    }

    const result = super.send(method, params)
    this.blockCache.set(key, result)
    return result
  }
}

/**
 * These are the only JsonRpcProviders used directly by the interface.
 */
export const RPC_PROVIDERS: { [chainId: number]: StaticJsonRpcProvider } = {
  [SupportedChainId.MAINNET]: new AppJsonRpcProvider(SupportedChainId.MAINNET, 0),
  // [SupportedChainId.RINKEBY]: new AppJsonRpcProvider(SupportedChainId.RINKEBY,0),
  // [SupportedChainId.ROPSTEN]: new AppJsonRpcProvider(SupportedChainId.ROPSTEN,0),
  [SupportedChainId.GOERLI]: new AppJsonRpcProvider(SupportedChainId.GOERLI, 0),
  // [SupportedChainId.KOVAN]: new AppJsonRpcProvider(SupportedChainId.KOVAN,0),
  // [SupportedChainId.OPTIMISM]: new AppJsonRpcProvider(SupportedChainId.OPTIMISM,0),
  // [SupportedChainId.OPTIMISM_GOERLI]: new AppJsonRpcProvider(SupportedChainId.OPTIMISM_GOERLI,0),
  // [SupportedChainId.ARBITRUM_ONE]: new AppJsonRpcProvider(SupportedChainId.ARBITRUM_ONE,0),
  // [SupportedChainId.ARBITRUM_RINKEBY]: new AppJsonRpcProvider(SupportedChainId.ARBITRUM_RINKEBY,0),
  [SupportedChainId.POLYGON]: new AppJsonRpcProvider(SupportedChainId.POLYGON, 0),
  [SupportedChainId.POLYGON_MUMBAI]: new AppJsonRpcProvider(SupportedChainId.POLYGON_MUMBAI, 0),
  // [SupportedChainId.CELO]: new AppJsonRpcProvider(SupportedChainId.CELO,0),
  // [SupportedChainId.CELO_ALFAJORES]: new AppJsonRpcProvider(SupportedChainId.CELO_ALFAJORES,0),
}


// get second provider if exists
export const getSecondaryProvider = (chainId: number) => {
  if (!RPC_URLS[chainId][1]) return new AppJsonRpcProvider(chainId, 0)
  return new AppJsonRpcProvider(chainId, 1)

}

// get 3rd provider if exists
export const getThirdProvider = (chainId: number) => {
  if (!RPC_URLS[chainId][2]) return getSecondaryProvider(chainId)
  return new AppJsonRpcProvider(chainId, 2)

}