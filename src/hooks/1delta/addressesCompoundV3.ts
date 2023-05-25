import { SupportedChainId } from 'constants/chains'
import { SupportedAssets } from 'types/1delta'
import { AddressDictionary } from './addresses'

export const addressesCompoundV3Core: any = {
  // each comet has a separate address for the respective base currency
  comet: {
    [SupportedChainId.POLYGON_MUMBAI]: {
      [SupportedAssets.USDC]: '0xF09F0369aB0a875254fB565E52226c88f10Bc839'
    },
    [SupportedChainId.MAINNET]: {
      [SupportedAssets.WETH]: '',
      [SupportedAssets.USDC]: ''
    }
  },
  cometExt: {
    [SupportedChainId.POLYGON_MUMBAI]: {
      [SupportedAssets.USDC]: '0x1c3080d7fd5c97A58E0F2EA19e9Eec4745dC4BDe'
    }
  },
  lens: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x934E7212656df04E3526f6481277bDA92f082053',
  }
}

export const addressesCompoundV3TestnetTokens: AddressDictionary = {
  [SupportedAssets.DAI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x4DAFE12E1293D889221B1980672FE260Ac9dDd28',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xDB3cB4f2688daAB3BFf59C24cC42D4B6285828e9',
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x4B5A0F4E00bC0d6F16A593Cae27338972614E713',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xE1e67212B1A4BF629Bdf828e08A3745307537ccE',
  },
  [SupportedAssets.WMATIC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xfec23a9E1DBA805ADCF55E0338Bf5E03488FC7Fb',
  },
}