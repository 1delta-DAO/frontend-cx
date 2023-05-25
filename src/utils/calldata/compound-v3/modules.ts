import { SupportedChainId } from "constants/chains";



export const modules: { [key: string]: { [chainId: number]: string } } = {
  marginTrader: {
    [SupportedChainId.GOERLI]: '0x1Cc4919ff9C63a17F87F881d41687721326ac120',
    [SupportedChainId.POLYGON_MUMBAI]: '0xEd61752b468f45ca7eB60DF2A9A50A015451a9F9',
    [SupportedChainId.POLYGON]: '0x77153Be7be41F2F18ec5a7663E48788dDD374B71',
    [SupportedChainId.MAINNET]: ''
  },
  moneyMarket: {
    [SupportedChainId.GOERLI]: '0x448180D63631BEB77f2F40d97074f958AeA7Ad61',
    [SupportedChainId.POLYGON_MUMBAI]: '0xa1ac22F1c89B6859737977ECce046A48c202383f',
    [SupportedChainId.POLYGON]: '0xca33E059B41f971F81b271E634c3b11c97743649'
    ,
    [SupportedChainId.MAINNET]: ''
  },
  uniswapCallback: {
    [SupportedChainId.GOERLI]: '0xda4993Ca9c2fa2Ef56d823e37f9cb38943C6aD2f',
    [SupportedChainId.POLYGON_MUMBAI]: '0x74DfB594E064221573b6273110cf25B6b4792dc4',
    [SupportedChainId.POLYGON]: '0x23805D6bf36734DE94A1e31BE47bB3f1a47dc9A9'
    ,
    [SupportedChainId.MAINNET]: ''
  },
  sweeper: {
    [SupportedChainId.GOERLI]: '0x845a961b456Ab4da8461d1AA86694946110019b5',
    [SupportedChainId.POLYGON_MUMBAI]: '0x67E16f350a4E0Dc67bf5981b1c18015FA4C247ec',
    [SupportedChainId.POLYGON]: '0x9b75B9f1811e1446ebFB47C17e31439e248EAdE5'
    ,
    [SupportedChainId.MAINNET]: ''
  },
}
