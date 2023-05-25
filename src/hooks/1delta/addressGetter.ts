import { getSupportedAssets, MAINNET_CHAINS, POLYGON_CHAINS } from 'constants/1delta'
import { SupportedChainId } from 'constants/chains'
import { LendingProtocol } from 'state/1delta/actions'
import { SupportedAssets } from 'types/1delta'
import { FlatAddressDictionary } from './addresses'
import { addresses0VixOTokens, addresses0VixTestnetTokens } from './addresses0Vix'
import { addressesAaveTestnetTokens } from './addressesAave'
import { addressesCompoundCTokens, addressesCompoundTestnetTokens } from './addressesCompound'
import { addressesTokens } from './addressesTokens'
import { addressesCompoundV3TestnetTokens } from './addressesCompoundV3'

export const getTokenAddresses = (chainId: number, protocol = LendingProtocol.AAVE): FlatAddressDictionary => {
  if (MAINNET_CHAINS.includes(chainId)) {
    return Object.assign(
      {},
      ...getSupportedAssets(chainId, protocol).filter(a => a !== SupportedAssets.ETH).map((asset) => {
        return { [asset]: addressesTokens[asset][chainId] }
      })
    )
  }
  if (chainId === SupportedChainId.POLYGON_MUMBAI) {
    if (protocol === LendingProtocol.AAVE)
      return Object.assign(
        {},
        ...getSupportedAssets(chainId, protocol).map((asset) => {
          return { [asset]: addressesAaveTestnetTokens[asset][chainId] }
        })
      )

    if (protocol === LendingProtocol.COMPOUNDV3)
      return Object.assign(
        {},
        ...getSupportedAssets(chainId, LendingProtocol.COMPOUNDV3).map((asset) => {
          return { [asset]: addressesCompoundV3TestnetTokens[asset][chainId] }
        })
      )

    return Object.assign(
      {},
      ...getSupportedAssets(chainId, protocol).filter(a => a !== SupportedAssets.MATIC).map((asset) => {
        return { [asset]: addresses0VixTestnetTokens[asset][chainId] }
      })
    )
  }

  if (protocol === LendingProtocol.AAVE)
    return Object.assign(
      {},
      ...getSupportedAssets(SupportedChainId.GOERLI, protocol).map((asset) => {
        return { [asset]: addressesAaveTestnetTokens[asset][SupportedChainId.GOERLI] }
      })
    )

  return Object.assign(
    {},
    ...getSupportedAssets(SupportedChainId.GOERLI, protocol).map((asset) => {
      return { [asset]: addressesCompoundTestnetTokens[asset][SupportedChainId.GOERLI] }
    })
  )
}

export const getAAVETokenAddresses = (chainId: number): FlatAddressDictionary => {
  if (MAINNET_CHAINS.includes(chainId)) {
    return Object.assign(
      {},
      ...getSupportedAssets(chainId, LendingProtocol.AAVE).map((asset) => {
        return { [asset]: addressesTokens[asset][chainId] }
      })
    )
  }

  if (chainId === SupportedChainId.POLYGON_MUMBAI)
    return Object.assign(
      {},
      ...getSupportedAssets(chainId, LendingProtocol.AAVE).map((asset) => {
        return { [asset]: addressesAaveTestnetTokens[asset][chainId] }
      })
    )

  return Object.assign(
    {},
    ...getSupportedAssets(SupportedChainId.GOERLI, LendingProtocol.AAVE).map((asset) => {
      return { [asset]: addressesAaveTestnetTokens[asset][SupportedChainId.GOERLI] }
    })
  )
}

export const getCompoundV3TokenAddresses = (chainId: number): FlatAddressDictionary => {

  if (chainId === SupportedChainId.POLYGON_MUMBAI)
    return Object.assign(
      {},
      ...getSupportedAssets(chainId, LendingProtocol.COMPOUNDV3).map((asset) => {
        return { [asset]: addressesCompoundV3TestnetTokens[asset][chainId] }
      })
    )

  return {}
}


export const getCompoundTokenAddresses = (chainId: number): FlatAddressDictionary => {
  if (MAINNET_CHAINS.includes(chainId)) {
    return Object.assign(
      {},
      ...getSupportedAssets(chainId, LendingProtocol.COMPOUND).map((asset) => {
        return { [asset]: addressesTokens[asset][chainId] }
      })
    )
  }

  if (chainId === SupportedChainId.POLYGON_MUMBAI)
    return Object.assign(
      {},
      ...getSupportedAssets(chainId, LendingProtocol.COMPOUND).map((asset) => {
        return { [asset]: addressesCompoundTestnetTokens[asset][chainId] }
      })
    )

  return Object.assign(
    {},
    ...getSupportedAssets(SupportedChainId.GOERLI, LendingProtocol.COMPOUND).map((asset) => {
      return { [asset]: addressesCompoundTestnetTokens[asset][SupportedChainId.GOERLI] }
    })
  )
}

export const getCompoundCTokenAddress = (chainId?: number, asset?: SupportedAssets): string | undefined => {
  if (!chainId || !asset) return undefined
  if (POLYGON_CHAINS.includes(chainId)) return addresses0VixOTokens[asset]?.[chainId]

  return addressesCompoundCTokens[asset]?.[chainId]
}

export const getAssetAddress = (chainId: number, asset: SupportedAssets): string | undefined => {
  if (!chainId || !asset) return undefined

  if (MAINNET_CHAINS.includes(chainId)) return addressesTokens[asset]?.[chainId]

  if (chainId === SupportedChainId.POLYGON_MUMBAI) return addresses0VixTestnetTokens[asset]?.[chainId]

  return addressesCompoundTestnetTokens[asset]?.[chainId]
}
