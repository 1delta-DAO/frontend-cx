import { Currency, Token, WETH9 } from '@uniswap/sdk-core'
import { WMATIC_POLYGON, WMATIC_POLYGON_MUMBAI } from '@uniswap/smart-order-router'
import {
  ETHEREUM_CHAINS,
  getSupportedAssets,
  MAINNET_CHAINS,
  NATIVE_SYMBOL,
  TOKEN_META,
  WRAPPED_NATIVE_SYMBOL,
} from 'constants/1delta'
import { DEFAULT_CHAINID, SupportedChainId } from 'constants/chains'
import { LendingProtocol } from 'state/1delta/actions'
import { AaveInterestMode, SupportedAssets, toErc20Asset } from 'types/1delta'
import { addresses0VixOTokens } from './addresses0Vix'
import {
  addressesAaveATokens,
  addressesAaveSTokens,
  addressesAaveTestnetTokens,
  addressesAaveVTokens,
} from './addressesAave'
import { addressesCompoundCTokens, addressesCompoundTestnetTokens } from './addressesCompound'
import { addressesCompoundV3TestnetTokens } from './addressesCompoundV3'
import { addressesTokens } from './addressesTokens'

export const getAaveTokens = (chainId: number): { [assetKey: string]: Token } => {
  return Object.assign(
    {},
    ...getSupportedAssets(chainId).map((asset) => {
      return {
        [asset]: safeGetToken(chainId, asset),
      }
    })
  )
}

export const getTokenList = (chainId: number, lendingProtocol = LendingProtocol.AAVE): { [assetKey: string]: Token } => {
  return Object.assign(
    {},
    ...getSupportedAssets(chainId, lendingProtocol).map((asset) => {
      return {
        [asset]: safeGetToken(chainId, asset, lendingProtocol),
      }
    })
  )
}

export const getCompoundTokens = (chainId: number): { [assetKey: string]: Token } => {
  return Object.assign(
    {},
    ...getSupportedAssets(chainId, LendingProtocol.COMPOUND)
      .filter((x) => Object.keys(x)[0] !== NATIVE_SYMBOL[chainId])
      .map((asset) => {
        return {
          [asset]: safeGetToken(chainId, asset, LendingProtocol.COMPOUND),
        }
      })
  )
}

export const getCompoundV3Tokens = (chainId: number): { [assetKey: string]: Token } => {
  return Object.assign(
    {},
    ...getSupportedAssets(chainId, LendingProtocol.COMPOUNDV3)
      .filter((x) => Object.keys(x)[0] !== NATIVE_SYMBOL[chainId])
      .map((asset) => {
        return {
          [asset]: safeGetToken(chainId, asset, LendingProtocol.COMPOUNDV3),
        }
      })
  )
}

export const getAaveTokensByAddress = (chainId: number): { [address: string]: Token } => {
  return Object.assign(
    {},
    ...getSupportedAssets(chainId).map((asset) => {
      const token = safeGetToken(chainId, asset)
      return {
        [token.address]: token,
      }
    })
  )
}

export const getTokensByAddress = (
  chainId: number,
  lendingProtocol = LendingProtocol.AAVE
): { [address: string]: Token } => {
  return Object.assign(
    {},
    ...getSupportedAssets(chainId).map((asset) => {
      return {
        [safeGetToken(chainId, asset, lendingProtocol).address.toLowerCase()]: safeGetToken(
          chainId,
          asset,
          lendingProtocol
        ),
      }
    })
  )
}

export const safeGetToken = (
  chainId: number,
  asset: SupportedAssets,
  lendingProtocol = LendingProtocol.AAVE
): Token => {
  const safeChainId = chainId ?? DEFAULT_CHAINID
  if (asset === SupportedAssets.ETH) {
    return WETH9[chainId]
  }

  if (asset === SupportedAssets.MATIC) {
    return chainId === SupportedChainId.POLYGON_MUMBAI ? WMATIC_POLYGON_MUMBAI : WMATIC_POLYGON
  }

  let tokenAddress = ''
  if (MAINNET_CHAINS.includes(chainId)) {
    tokenAddress = addressesTokens[asset]?.[safeChainId] ?? '0x2e3A2fb8473316A02b8A297B982498E661E1f6f5'
  } else {
    // testet case - different addresses for each protocol
    tokenAddress =
      (lendingProtocol === LendingProtocol.AAVE
        ? addressesAaveTestnetTokens[asset]?.[safeChainId] :
        lendingProtocol === LendingProtocol.COMPOUNDV3
          ? addressesCompoundV3TestnetTokens[asset]?.[safeChainId] :
          addressesCompoundTestnetTokens[asset]?.[safeChainId]) ?? '0x2e3A2fb8473316A02b8A297B982498E661E1f6f5'
  }
  try {
    return new Token(
      safeChainId,
      tokenAddress, // defaults to WETH
      TOKEN_META[asset].decimals,
      TOKEN_META[asset].symbol,
      TOKEN_META[asset].name
    )
  } catch (e) {
    console.log("Error getting token from asset:", e)
    return new Token(
      safeChainId,
      tokenAddress, // defaults to WETH
      TOKEN_META[SupportedAssets.WETH].decimals,
      TOKEN_META[SupportedAssets.WETH].symbol,
      TOKEN_META[SupportedAssets.WETH].name
    )
  }
}

export const safeGetCompoundCToken = (chainId: number, asset: SupportedAssets): Token => {
  if (ETHEREUM_CHAINS.includes(chainId))
    return new Token(
      chainId,
      addressesCompoundCTokens[asset]?.[chainId] ?? '0x27B4692C93959048833f40702b22FE3578E77759',
      8,
      TOKEN_META[asset].symbol,
      TOKEN_META[asset].name
    )

  return new Token(
    chainId ?? DEFAULT_CHAINID,
    addresses0VixOTokens[asset]?.[chainId ?? DEFAULT_CHAINID] ?? '0x27B4692C93959048833f40702b22FE3578E77759',
    8,
    TOKEN_META[asset].symbol,
    TOKEN_META[asset].name
  )
}

export const safeGetAToken = (chainId?: number, asset?: SupportedAssets): Token => {
  const _asset = asset ?? SupportedAssets.USDC
  return new Token(
    chainId ?? DEFAULT_CHAINID,
    addressesAaveATokens[_asset]?.[chainId ?? DEFAULT_CHAINID] ?? '0x27B4692C93959048833f40702b22FE3578E77759',
    TOKEN_META[_asset].decimals,
    TOKEN_META[_asset].symbol,
    TOKEN_META[_asset].name
  )
}

export const safeGetBorrowToken = (
  chainId: number,
  asset: SupportedAssets,
  interestMode: AaveInterestMode
): Token | undefined => {
  const erc20Asset = toErc20Asset(asset)
  if (interestMode === AaveInterestMode.STABLE) {
    return new Token(
      chainId ?? DEFAULT_CHAINID,
      addressesAaveSTokens[erc20Asset][chainId ?? DEFAULT_CHAINID] ?? '0xCAF956bD3B3113Db89C0584Ef3B562153faB87D5',
      TOKEN_META[erc20Asset].decimals,
      TOKEN_META[erc20Asset].symbol,
      TOKEN_META[erc20Asset].name
    )
  }

  if (interestMode === AaveInterestMode.VARIABLE) {
    return new Token(
      chainId ?? DEFAULT_CHAINID,
      addressesAaveVTokens[erc20Asset][chainId ?? DEFAULT_CHAINID] ?? '0x2b848bA14583fA79519Ee71E7038D0d1061cd0F1',
      TOKEN_META[erc20Asset].decimals,
      TOKEN_META[erc20Asset].symbol,
      TOKEN_META[erc20Asset].name
    )
  }

  return undefined
}

export const filterSupportedAssets = (token0?: Currency, token1?: Currency): SupportedAssets[] => {
  const chainId = token0?.chainId ?? DEFAULT_CHAINID
  const arr: SupportedAssets[] = []
  if (token0 && safeGetToken(chainId, token0?.symbol as SupportedAssets).equals(token0))
    arr.push(token0?.symbol as SupportedAssets)

  if (token1 && safeGetToken(chainId, token1?.symbol as SupportedAssets).equals(token1))
    arr.push(token1?.symbol as SupportedAssets)

  return arr
}

export const isSupportedAsset = (chainId?: number, currency?: Currency | null | undefined): boolean => {
  if (!chainId || !currency) return false
  try {
    safeGetToken(chainId, currency.symbol as SupportedAssets)
    return true
  } catch (err) {
    console.log('Error in getting asset', err)
    return false
  }
}

export const getCompoundTokensByAddress = (chainId: number): { [assetKey: string]: Token } => {
  return Object.assign(
    {},
    ...getSupportedAssets(chainId, LendingProtocol.COMPOUND)
      // compound v2 has ETH
      .filter((x) => x !== NATIVE_SYMBOL[chainId])
      .map((asset) => {
        const token = safeGetToken(chainId, asset, LendingProtocol.COMPOUND)
        return {
          [token.address]: token,
        }
      })
  )
}


export const getCompoundV3TokensByAddress = (chainId: number): { [assetKey: string]: Token } => {
  return Object.assign(
    {},
    ...getSupportedAssets(chainId, LendingProtocol.COMPOUNDV3)
      .map((asset) => {
        const token = safeGetToken(chainId, toErc20Asset(asset), LendingProtocol.COMPOUNDV3)
        return {
          [token.address]: token,
        }
      })
  )
}