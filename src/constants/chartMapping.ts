import { SupportedAssets } from "types/1delta"

export enum VENUES {
  UNISWAP3POLYGON = 'UNISWAP3POLYGON',
  COINBASE = 'COINBASE',
  UNISWAP3ETH = 'UNISWAP3ETH',
  BINANCE = 'BINANCE',
  KRAKEN = 'KRAKEN',
  BITFINEX = 'BITFINEX',
  BITSTAMP = 'BITSTAMP',
}


const filteredArray = (array1: any[], array2: any[]) => array1.filter(value => array2.includes(value)).length > 0;
const filteredArray2 = (array1: any[], array2: any[]) => array1.filter(value => array2.includes(value)).length > 1;


const STABLECOINS = [SupportedAssets.USDT, SupportedAssets.DAI, SupportedAssets.USDC]
const EURO_COINS = [SupportedAssets.JEUR, SupportedAssets.AGEUR, SupportedAssets.EURS]
const STANDARD_COINS = [SupportedAssets.WETH, SupportedAssets.WBTC, SupportedAssets.WBTC2, SupportedAssets.WMATIC, SupportedAssets.CRV, SupportedAssets.LINK, SupportedAssets.AAVE]

const handleEurPair = (ccy: SupportedAssets) => {
  if (ccy === SupportedAssets.AAVE) return `${VENUES.BITSTAMP}:${ccy}${'EUR'}`
  if (ccy === SupportedAssets.CRV) return `${VENUES.BITSTAMP}:${ccy}${'EUR'}`
  if (ccy === SupportedAssets.GHST) return `${VENUES.KRAKEN}:${ccy}${'EUR'}`
  if (ccy === SupportedAssets.MATIC) return `${VENUES.BINANCE}:${ccy}${'EUR'}`
  if (ccy === SupportedAssets.WMATIC) return `${VENUES.BINANCE}:${'MATIC'}${'EUR'}`
  if (ccy === SupportedAssets.SUSHI) return `${VENUES.BITSTAMP}:${ccy}${'EUR'}`
  if (ccy === SupportedAssets.WBTC) return `${VENUES.BINANCE}:${'BTC'}${'EUR'}`
  if (ccy === SupportedAssets.WBTC2) return `${VENUES.BINANCE}:${'BTC'}${'EUR'}`
  if (ccy === SupportedAssets.LINK) return `${VENUES.BINANCE}:${ccy}${'EUR'}`
  if (ccy === SupportedAssets.BAL) return `${VENUES.KRAKEN}:${ccy}${'EUR'}`
  if (ccy === SupportedAssets.DPI) return `${VENUES.UNISWAP3POLYGON}:${ccy}${SupportedAssets.USDC}`
  if (ccy === SupportedAssets.COMP) return `${VENUES.BITSTAMP}:${ccy}${'EUR'}`

  return `${VENUES.BINANCE}:${ccy}${'EUR'}`
}



const handleUsdPair = (ccy: SupportedAssets) => {
  if (ccy === SupportedAssets.AAVE) return `${VENUES.BITSTAMP}:${ccy}${'USD'}`
  if (ccy === SupportedAssets.CRV) return `${VENUES.BITSTAMP}:${ccy}${'USD'}`
  if (ccy === SupportedAssets.GHST) return `${VENUES.KRAKEN}:${ccy}${'USD'}`
  if (ccy === SupportedAssets.MATIC) return `${VENUES.BINANCE}:${ccy}${'USD'}`
  if (ccy === SupportedAssets.WMATIC) return `${VENUES.BINANCE}:${'MATIC'}${'USD'}`
  if (ccy === SupportedAssets.SUSHI) return `${VENUES.BITSTAMP}:${ccy}${'USD'}`
  if (ccy === SupportedAssets.WBTC) return `${VENUES.BINANCE}:${'BTC'}${'USD'}`
  if (ccy === SupportedAssets.WBTC2) return `${VENUES.BINANCE}:${'BTC'}${'USD'}`
  if (ccy === SupportedAssets.LINK) return `${VENUES.UNISWAP3ETH}:${ccy}${SupportedAssets.USDC}`
  if (ccy === SupportedAssets.BAL) return `${VENUES.UNISWAP3POLYGON}:${ccy}${SupportedAssets.USDC}`
  if (ccy === SupportedAssets.DPI) return `${VENUES.UNISWAP3POLYGON}:${ccy}${SupportedAssets.USDC}`
  if (ccy === SupportedAssets.COMP) return `${VENUES.BITSTAMP}:${ccy}${'USD'}`

  return `${VENUES.BINANCE}:${ccy}${'EUR'}`
}

const handleBTCPair = (ccy: SupportedAssets) => {
  if (ccy === SupportedAssets.AAVE) return `${VENUES.BITSTAMP}:${ccy}${'BTC'}`
  if (ccy === SupportedAssets.CRV) return `${VENUES.COINBASE}:${ccy}${'BTC'}`
  if (ccy === SupportedAssets.GHST) return `${VENUES.KRAKEN}:${ccy}${'BTC'}`
  if (ccy === SupportedAssets.MATIC) return `${VENUES.BINANCE}:${ccy}${'BTC'}`
  if (ccy === SupportedAssets.SUSHI) return `${VENUES.COINBASE}:${ccy}${'BTC'}`
  if (ccy === SupportedAssets.WBTC) return `${VENUES.BINANCE}:${'BTC'}${'USD'}`
  if (ccy === SupportedAssets.WBTC2) return `${VENUES.BINANCE}:${'BTC'}${'USD'}`
  if (ccy === SupportedAssets.LINK) return `${VENUES.UNISWAP3ETH}:${ccy}${SupportedAssets.WBTC}`
  if (ccy === SupportedAssets.BAL) return `${VENUES.KRAKEN}:${ccy}${'BTC'}`
  if (ccy === SupportedAssets.DPI) return `${VENUES.UNISWAP3POLYGON}:${ccy}${SupportedAssets.WBTC}`
  if (ccy === SupportedAssets.COMP) return `${VENUES.BITSTAMP}:${ccy}${'BTC'}`
  if (ccy === SupportedAssets.USDC) return `${VENUES.BINANCE}:${'BTC'}${ccy}`
  if (ccy === SupportedAssets.USDT) return `${VENUES.BINANCE}:${'BTC'}${ccy}`
  if (ccy === SupportedAssets.DAI) return `${VENUES.COINBASE}:${'BTC'}${ccy}`

  return `${VENUES.BINANCE}:${ccy}${'USD'}`
}


export const getTradingViewSymbol = (ccy1: SupportedAssets, ccy2: SupportedAssets): string => {

  const pair = [ccy1, ccy2]

  if ((pair[0] === SupportedAssets.WETH || pair[0] === SupportedAssets.ETH) && pair[1] === SupportedAssets.USDC)
    return `${VENUES.BINANCE}:${SupportedAssets.ETH}${SupportedAssets.USDC}`


  // standard ccys like network currencies should have uniswap pools
  if (pair.includes(SupportedAssets.WETH)) return `${VENUES.UNISWAP3POLYGON}:${ccy1}${ccy2}`
  if (pair.includes(SupportedAssets.WMATIC) && !pair.includes(SupportedAssets.AGEUR)) return `${VENUES.UNISWAP3POLYGON}:${ccy1}${ccy2}`

  if (pair.includes(SupportedAssets.GHST)) {
    if (filteredArray(pair, STABLECOINS))
      return `${VENUES.BINANCE}:${SupportedAssets.GHST}${SupportedAssets.USDT}`
    if (pair.includes(SupportedAssets.WBTC))
      return `${VENUES.KRAKEN}:${SupportedAssets.GHST}${'BTC'}`
  }

  if (pair.includes(SupportedAssets.CRV)) {
    if (filteredArray(pair, STABLECOINS))
      return `${VENUES.BINANCE}:${SupportedAssets.CRV}${SupportedAssets.USDT}`
    if (pair.includes(SupportedAssets.WBTC))
      return `${VENUES.BITFINEX}:${SupportedAssets.CRV}${'BTC'}`
  }

  if (pair.includes(SupportedAssets.JEUR)) {
    if (filteredArray(pair, STABLECOINS) || filteredArray2(pair, EURO_COINS)) {
      if (pair[0] === SupportedAssets.JEUR)
        return `${VENUES.UNISWAP3POLYGON}:${ccy1}${SupportedAssets.USDC}`
      return `${VENUES.UNISWAP3POLYGON}:${SupportedAssets.USDC}${ccy2}`
    }
    return handleEurPair(pair.filter(a => !EURO_COINS.includes(a))[0])
  }

  if (pair.includes(SupportedAssets.AGEUR)) {
    if (filteredArray(pair, STABLECOINS) || filteredArray2(pair, EURO_COINS)) {
      if (pair[0] === SupportedAssets.AGEUR)
        return `${VENUES.UNISWAP3ETH}:${ccy1}${SupportedAssets.USDC}`
      return `${VENUES.UNISWAP3ETH}:${SupportedAssets.USDC}${ccy2}`
    }
    return handleEurPair(pair.filter(a => !EURO_COINS.includes(a))[0])
  }

  if (pair.includes(SupportedAssets.EURS)) {
    if (pair.includes(SupportedAssets.WBTC))
      return `${VENUES.BITFINEX}:${'EUS'}${'BTC'}`
    if (filteredArray(pair, STABLECOINS) || filteredArray2(pair, EURO_COINS))
      return `${VENUES.BITFINEX}:${'EUS'}${'USD'}`
    return handleEurPair(pair.filter(a => !EURO_COINS.includes(a))[0])
  }

  if (pair.includes(SupportedAssets.DPI)) {
    const other = pair.filter(a => a !== SupportedAssets.DPI)[0]
    if (STABLECOINS.includes(other))
      return `${VENUES.UNISWAP3POLYGON}:${ccy1}${ccy1}`
  }

  if (pair.includes(SupportedAssets.BAL)) {
    const other = pair.filter(a => a !== SupportedAssets.BAL)[0]
    if (other === SupportedAssets.WBTC)
      return `${VENUES.COINBASE}:${SupportedAssets.BAL}${'BTC'}`
    if (other === SupportedAssets.USDT)
      return `${VENUES.COINBASE}:${SupportedAssets.BAL}${other}`
  }

  if (pair.includes(SupportedAssets.LINK) && pair.includes(SupportedAssets.AAVE)) {
    return `${VENUES.UNISWAP3ETH}:${ccy1}${ccy2}`
  }

  if (pair.includes(SupportedAssets.WBTC)) {
    const other = pair.filter(a => a !== SupportedAssets.WBTC)[0]
    return handleBTCPair(other)
  }


  if (pair[0] === SupportedAssets.LINK) {
    return handleUsdPair(SupportedAssets.LINK)
  }

  if (pair.includes(SupportedAssets.AAVE)) {
    const other = pair.filter(a => a !== SupportedAssets.AAVE)[0]
    if (STABLECOINS.includes(other) && !pair.includes(SupportedAssets.USDT))
      return `${VENUES.UNISWAP3POLYGON}:${ccy1}${ccy2}`
    if (pair.includes(SupportedAssets.USDT))
      return `${VENUES.BINANCE}:${SupportedAssets.AAVE}${SupportedAssets.USDT}`
  }

  if (pair[0] === SupportedAssets.CRV) {
    return handleUsdPair(SupportedAssets.CRV)
  }

  if (pair[0] === SupportedAssets.AAVE) {
    return handleUsdPair(SupportedAssets.AAVE)
  }

  if (pair[0] === SupportedAssets.BAL) {
    return handleUsdPair(SupportedAssets.BAL)
  }

  if (pair[0] === SupportedAssets.DPI) {
    return handleUsdPair(SupportedAssets.DPI)
  }

  return `${VENUES.UNISWAP3ETH}:${ccy1}${ccy2}`

}
