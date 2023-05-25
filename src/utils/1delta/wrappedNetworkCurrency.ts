import { Token, WETH9 } from '@uniswap/sdk-core'
import { WMATIC_POLYGON, WMATIC_POLYGON_MUMBAI } from '@uniswap/smart-order-router'
import { SupportedChainId } from 'constants/chains'

export const getWrappedNetworkCurrency = (chainId: number): Token => {
  switch (chainId as SupportedChainId) {
    case SupportedChainId.POLYGON: {
      return WMATIC_POLYGON
    }
    case SupportedChainId.POLYGON_MUMBAI: {
      return WMATIC_POLYGON_MUMBAI
    }
    default: {
      break
    }
  }
  return WETH9[chainId]
}
