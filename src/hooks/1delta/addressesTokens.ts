import { SupportedChainId } from 'constants/chains'
import { SupportedAssets } from 'types/1delta'
import { AddressDictionary } from './addresses'

export const addressesTokens: AddressDictionary = {
  [SupportedAssets.DAI]: {
    [SupportedChainId.MAINNET]: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    [SupportedChainId.POLYGON]: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
  [SupportedAssets.UNI]: {
    [SupportedChainId.MAINNET]: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.MAINNET]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    [SupportedChainId.POLYGON]: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  },
  [SupportedAssets.USDT]: {
    [SupportedChainId.MAINNET]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    [SupportedChainId.POLYGON]: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.MAINNET]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    [SupportedChainId.POLYGON]: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
  },
  [SupportedAssets.COMP]: {
    [SupportedChainId.MAINNET]: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  },
  [SupportedAssets.ZRX]: {
    [SupportedChainId.MAINNET]: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
  },
  [SupportedAssets.YFI]: {
    [SupportedChainId.MAINNET]: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  },
  [SupportedAssets.WBTC2]: {
    [SupportedChainId.MAINNET]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },
  [SupportedAssets.USDP]: {
    [SupportedChainId.MAINNET]: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
  },
  [SupportedAssets.FEI]: {
    [SupportedChainId.MAINNET]: '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
  },
  [SupportedAssets.LINK]: {
    [SupportedChainId.MAINNET]: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    [SupportedChainId.POLYGON]: '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39',
  },
  [SupportedAssets.MKR]: {
    [SupportedChainId.MAINNET]: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  },
  [SupportedAssets.REP]: {
    [SupportedChainId.MAINNET]: '0x1985365e9f78359a9B6AD760e32412f4a445E862',
  },
  [SupportedAssets.AAVE]: {
    [SupportedChainId.MAINNET]: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    [SupportedChainId.POLYGON]: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
  },
  [SupportedAssets.BAT]: {
    [SupportedChainId.MAINNET]: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
  },
  [SupportedAssets.AGEUR]: {
    [SupportedChainId.POLYGON]: '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4',
  },
  [SupportedAssets.EURS]: {
    [SupportedChainId.POLYGON]: '0xe111178a87a3bff0c8d18decba5798827539ae99',
  },
  [SupportedAssets.JEUR]: {
    [SupportedChainId.POLYGON]: '0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c',
  },
  [SupportedAssets.MAI]: {
    [SupportedChainId.POLYGON]: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
  },
  [SupportedAssets.BAL]: {
    [SupportedChainId.POLYGON]: '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3',
  },
  [SupportedAssets.CRV]: {
    [SupportedChainId.POLYGON]: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
  },
  [SupportedAssets.DPI]: {
    [SupportedChainId.POLYGON]: '0x85955046df4668e1dd369d2de9f3aeb98dd2a369',
  },
  [SupportedAssets.GHST]: {
    [SupportedChainId.POLYGON]: '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
  },
  [SupportedAssets.MATICX]: {
    [SupportedChainId.POLYGON]: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
  },
  [SupportedAssets.STMATIC]: {
    [SupportedChainId.POLYGON]: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
  },
  [SupportedAssets.SUSHI]: {
    [SupportedChainId.POLYGON]: '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.POLYGON]: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  },
  [SupportedAssets.WMATIC]: {
    [SupportedChainId.POLYGON]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  },
  [SupportedAssets.VGHST]: {
    [SupportedChainId.POLYGON]: '0x51195e21BDaE8722B29919db56d95Ef51FaecA6C'
  },
  [SupportedAssets.GDAI]: {
    [SupportedChainId.POLYGON]: '0x91993f2101cc758D0dEB7279d41e880F7dEFe827'
  },
  [SupportedAssets.WSTETH]: {
    [SupportedChainId.POLYGON]: '0x03b54A6e9a984069379fae1a4fC4dBAE93B3bCCD'
  }
}
