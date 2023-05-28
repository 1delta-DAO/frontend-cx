import { answerToPrice, formatAavePrice } from 'utils/tableUtils/prices'
import { allSupportedAssets, CHAINLINK_PRICE_PRECISION, getSupportedAssets, TEN } from 'constants/1delta'
import { AAVE_ORACLE_PREFERENCE } from 'constants/chains'
import { BigNumber, ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { AppState } from 'state'
import { useAppSelector } from 'state/hooks'
import { PriceWithHist, SupportedAssets } from 'types/1delta'
import { ChainLinkData, OracleState } from './reducer'
import { LendingProtocol } from 'state/1delta/actions'

export function useOracleState(): AppState['oracles'] {
  return useAppSelector((state) => state.oracles)
}

export function useOracleStateChainLink(chainId: number) {
  return useAppSelector((state) => state.oracles.data)[chainId].chainLink
}

export function useOracleStateAave(chainId: number) {
  return useAppSelector((state) => state.oracles.data)[chainId].aave
}

export function useOracleStateChainLinkForAsset(chainId: number, asset: SupportedAssets) {
  return useAppSelector((state) => state.oracles.data)[chainId].chainLink[toChainLinkKeySafe(asset) ?? '']
}

export function useOracleStateAaveForAsset(chainId: number, asset: SupportedAssets) {
  return useAppSelector((state) => state.oracles.data)[chainId].aave[asset]
}

export function useOracleLoadingState() {
  return useAppSelector((state) => state.oracles.loadingState)
}


export function usePriceWithHist(chainId: number, asset?: SupportedAssets): PriceWithHist {
  const data = useAppSelector((state) => state.oracles.data)[chainId].chainLink[toChainLinkKey(asset) ?? '']
  const aave = useAppSelector((state) => state.oracles.data)[chainId].aave[asset ?? '']
  return useMemo(() => {
    if (aave && AAVE_ORACLE_PREFERENCE.includes(chainId)) {
      return {
        price: formatAavePrice(aave?.price ?? '0'),
        hist: aave?.priceHist
      }
    }

    if (data)
      return {
        price: answerToPrice(data?.price, data?.decimals),
        hist: data?.priceHist ?? []
      }
    return { price: formatAavePrice(aave?.price ?? '0'), hist: aave?.priceHist ?? [] }

  }, [data, aave, asset, chainId])
}

export function useAllPricesWithHist(chainId: number): { [asset: string]: PriceWithHist } {
  const data = useAppSelector((state) => state.oracles.data)[chainId].chainLink
  const aave = useAppSelector((state) => state.oracles.data)[chainId].aave
  if (!allSupportedAssets[chainId]) return {}

  return Object.assign({}, ...allSupportedAssets[chainId].map(asset => {
    const cLinkKey = toChainLinkKeySafe(asset)
    if (data[cLinkKey])
      return {
        [asset]: {
          price: answerToPrice(data[cLinkKey]?.price, data[cLinkKey]?.decimals),
          hist: data[cLinkKey]?.priceHist
        }
      }

    if (aave[asset])
      return {
        [asset]: {
          price: formatAavePrice(aave[asset]?.price ?? '0'),
          hist: aave[asset]?.priceHist
        }
      }

    return { price: formatAavePrice(aave[asset]?.price ?? '0'), hist: aave[asset]?.priceHist ?? [] }

  }))
}

export function useChainLinkOracle(chainId: number, asset?: SupportedAssets | undefined): PriceWithHist | undefined {
  const data = useAppSelector((state) => state.oracles).data[chainId]?.chainLink[toChainLinkKey(asset) ?? '']
  if (!asset || !data) return undefined
  return {
    price: answerToPrice(data?.price, data?.decimals),
    hist: data.priceHist ?? []
  }
}

export function useChainLinkUsdPrice(asset: string, chainId: number): number {
  const state = useAppSelector((state) => state.oracles.data[chainId].chainLink)
  if (asset.toLowerCase() === 'weth') {
    return Number(formatEther(BigNumber.from(state['ETH'].price).mul(TEN.pow(18 - state['ETH-USD'].decimals))))
  }

  if (asset.toLowerCase() === 'wbtc') {
    return Number(formatEther(BigNumber.from(state['ETH'].price).mul(TEN.pow(18 - state['BTC-USD'].decimals))))
  }
  const data = state[`${asset}-USD`]
  if (!data) return 0

  return Number(formatEther(BigNumber.from(data.price).mul(TEN.pow(18 - data.decimals))))
}

export function getFormattedChainLinkPrices(
  oracleData: OracleState,
  assets: string[],
  chainId: number
): { [asset: string]: number } {
  const state = oracleData?.data[chainId]?.chainLink
  if (assets.length === 0 || !state) return {}
  return Object.assign(
    {},
    ...assets.map((asset) => {
      return {
        [asset]: getPrice(state, asset),
      }
    })
  )
}

export function getFormattedChainLinkPricesWithHist(
  oracleData: OracleState,
  assets: string[],
  chainId: number
): { [asset: string]: PriceWithHist } {
  const state = oracleData?.data[chainId]?.chainLink
  if (assets.length === 0 || !state) return {}
  return Object.assign(
    {},
    ...assets.map((asset) => {
      return {
        [asset]: getPriceWithHist(state, asset),
      }
    })
  )
}

const getPrice = (state: { [key: string]: ChainLinkData }, asset: string) => {
  if (asset.toLowerCase() === 'weth') {
    if (!state['ETH-USD']) return 0
    return Number(
      formatEther(BigNumber.from(state['ETH-USD'].price ?? '0').mul(TEN.pow(18 - state['ETH-USD'].decimals)))
    )
  }

  if (asset.toLowerCase() === 'wbtc' || asset.toLowerCase() === 'wbtc2') {
    if (!state['BTC-USD']) return 0
    return Number(
      formatEther(BigNumber.from(state['BTC-USD'].price ?? '0').mul(TEN.pow(18 - state['BTC-USD'].decimals)))
    )
  }

  if (asset.toLowerCase() === 'wmatic') {
    if (!state['MATIC-USD']) return 0
    return Number(
      formatEther(
        BigNumber.from(state['MATIC-USD'].price ?? '0').mul(TEN.pow(18 - state['MATIC-USD'].decimals))
      )
    )
  }

  const data = state[`${asset}-USD`]
  if (!data) {
    const dataEth = state[`${asset}-ETH`]
    if (dataEth) {
      const priceAsset = Number(
        formatEther(BigNumber.from(dataEth.price ?? '0').mul(TEN.pow(18 - dataEth.decimals)))
      )
      return priceAsset * (getEthPrice(state) ?? 0)
    } else {
      return 0
    }
  }
  return Number(formatEther(BigNumber.from(data.price ?? '0').mul(TEN.pow(18 - data.decimals))))
}

const defaultReturn = { price: 0, hist: [] }
const getPriceWithHist = (state: { [key: string]: ChainLinkData }, asset: string): PriceWithHist => {
  if (asset.toLowerCase() === 'weth') {
    if (!state['ETH-USD']) return defaultReturn
    const data = state['ETH-USD']
    return chainLinkDataToNumbers(data)
  }

  if (asset.toLowerCase() === 'wbtc' || asset.toLowerCase() === 'wbtc2') {
    if (!state['BTC-USD']) return defaultReturn
    const data = state['BTC-USD']
    return chainLinkDataToNumbers(data)
  }

  if (asset.toLowerCase() === 'wmatic') {
    if (!state['MATIC-USD']) return defaultReturn
    const data = state['MATIC-USD']
    return chainLinkDataToNumbers(data)
  }

  const data = state[`${asset}-USD`]
  if (!data) {
    const dataEth = state[`${asset}-ETH`]
    if (dataEth) {
      const priceAsset = Number(
        formatEther(BigNumber.from(dataEth.price ?? '0').mul(TEN.pow(18 - dataEth.decimals)))
      )
      return { price: priceAsset * (getEthPrice(state) ?? 0), hist: [] }
    } else {
      return defaultReturn
    }
  }
  return chainLinkDataToNumbers(data)
}

export interface PriceParams {
  price: BigNumber
  decimals: number
}

export const getPriceParams = (state: { [key: string]: ChainLinkData }, asset: string): PriceParams => {
  if (asset.toLowerCase() === 'weth') {
    if (!state['ETH-USD']) return { price: CHAINLINK_PRICE_PRECISION, decimals: 18 }
    return {
      price: BigNumber.from(state['ETH-USD'].price ?? '0'),
      decimals: state['ETH-USD'].decimals,
    }
  }

  if (asset.toLowerCase() === 'wbtc' || asset.toLowerCase() === 'wbtc2') {
    if (!state['BTC-USD']) return { price: CHAINLINK_PRICE_PRECISION, decimals: 8 }
    return {
      price: BigNumber.from(state['BTC-USD'].price ?? '0'),
      decimals: state['BTC-USD'].decimals,
    }
  }

  if (asset.toLowerCase() === 'wmatic') {
    if (!state['MATIC-USD']) return { price: CHAINLINK_PRICE_PRECISION, decimals: 18 }
    return {
      price: BigNumber.from(state['MATIC-USD'].price ?? '0'),
      decimals: state['MATIC-USD'].decimals,
    }
  }

  const data = state[`${asset}-USD`]
  if (!data) return { price: CHAINLINK_PRICE_PRECISION, decimals: 8 }
  return {
    price: BigNumber.from(data.price ?? '0'),
    decimals: data.decimals,
  }
}

const getEthPrice = (state: { [key: string]: ChainLinkData }) => {
  if (!state['ETH-USD']) return 0
  return Number(
    formatEther(BigNumber.from(state['ETH-USD'].price ?? '0').mul(TEN.pow(18 - state['ETH-USD'].decimals)))
  )
}


const chainLinkDataToNumbers = (data: ChainLinkData): PriceWithHist => {
  if (!data) return defaultReturn
  return {
    price: answerToPrice(data.price, data.decimals),
    hist: data.priceHist ?? []
  }

}

export function useHistPricesAave(asset: SupportedAssets, chainId: number): PriceWithHist {
  return {
    price: formatAavePrice(useAppSelector((state) => state.oracles.data[chainId].aave[asset].price) ?? '0'),
    hist: useAppSelector((state) => state.oracles.data[chainId].aave[asset].priceHist) ?? []
  }
}

const toChainLinkKey = (asset: SupportedAssets | undefined): string | undefined => {
  if (!asset) return undefined
  switch (asset) {
    case 'WETH': return 'ETH-USD'
    case 'WBTC': case 'WBTC2': return 'BTC-USD'
    case 'WMATIC': return 'MATIC-USD'
    default: return `${asset.toUpperCase()}-USD`
  }
}

const toChainLinkKeySafe = (asset: SupportedAssets): string => {
  switch (asset) {
    case 'WETH': return 'ETH-USD'
    case 'WBTC': case 'WBTC2': return 'BTC-USD'
    case 'WMATIC': return 'MATIC-USD'
    default: return `${asset}-USD`
  }
}

export function usePrices(assets: SupportedAssets[], chainId: number): number[] {
  const chainLink = useOracleStateChainLink(chainId)
  const aave = useOracleStateAave(chainId)
  return useMemo(() => {
    const prices: number[] = []
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i]
      let price = chainLink[toChainLinkKey(asset) ?? '']?.price ?? '0'
      if (price !== '0') {
        price = chainLink[toChainLinkKey(asset) ?? '']?.price ?? 0
        const decs = chainLink[toChainLinkKey(asset) ?? '']?.decimals ?? 18
        prices.push(answerToPrice(price, decs))
      }

      if (Number(price) === 0) {
        price = aave[asset]?.price ?? '0'
        prices.push(formatAavePrice(price))
      }
    }
    return prices
  }, [aave, chainLink, assets])
}


export function useAavePrices(assets: SupportedAssets[], chainId: number): { [asset: string]: BigNumber } {
  const aave = useOracleStateAave(chainId)
  return useMemo(() => Object.assign({}, ...assets.map(asset => { return { [asset]: BigNumber.from(aave[asset]?.price) } })), [aave])
}

export function useSinglePrice(asset: SupportedAssets, chainId: number): number {
  const chainLink = useOracleStateChainLinkForAsset(chainId, asset)
  const aave = useOracleStateAaveForAsset(chainId, asset)
  return useMemo(() => {
    let price = chainLink?.price ?? '0'
    if (price !== '0') {
      const decs = chainLink?.decimals ?? 18
      return answerToPrice(price, decs)
    }

    if (Number(price) === 0) {
      price = aave.price ?? '0'
      return formatAavePrice(price)
    }

    return 0
  }, [aave?.price, chainLink?.price])
}

export function usePriceAndRef(chainId: number, asset: SupportedAssets): { price: number, refPrice: number } {
  let price = 0
  let refPrice = 0
  let histLength: number | undefined = 0
  const priceWithHist = usePriceWithHist(chainId, asset)
  if (priceWithHist.price > 0) {
    price = priceWithHist?.price
    histLength = priceWithHist?.hist.length
    if (histLength && histLength > 2)
      refPrice = priceWithHist.hist[histLength - 2].price
  }
  return { price, refPrice }
}


export function useChainLinkPrice(asset: SupportedAssets, chainId: number): number {
  const chainLink = useChainLinkOracle(chainId, asset)
  return useMemo(() => {
    const price = chainLink?.price
    if (!price) return 1
    return price
  }, [chainLink])
}


export function useIsOracleLoaded(): boolean {
  const chainLinkLoaded = useAppSelector((state) => state.oracles.loadingState.chainLink.publicLoaded)
  const aaveLoaded = useAppSelector((state) => state.oracles.loadingState.aave.publicLoaded)
  return chainLinkLoaded && aaveLoaded
}



const ProtocolToOracle: { [k: string]: string } = {
  [LendingProtocol.AAVE]: 'aave',
  [LendingProtocol.COMPOUND]: 'chainLink',
  [LendingProtocol.COMPOUNDV3]: 'chainLink'
}

export const usePriceParams = (
  chainId: number,
  assets: SupportedAssets[],
  lendingProtocol: LendingProtocol
): { [k: string]: PriceParams } => {

  const data = useAppSelector((state) => state.oracles?.data?.[chainId])
  if (lendingProtocol == LendingProtocol.AAVE)
    return Object.assign(
      {},
      ...assets.map(a => {
        return {
          [a]: {
            price: BigNumber.from(data?.[ProtocolToOracle[lendingProtocol]]?.[a].price ?? '0'),
            decimals: data?.[ProtocolToOracle[lendingProtocol]]?.[a].decimals ?? 8
          }
        }
      })
    )

  return Object.assign(
    {},
    ...assets.map(a => {
      const key = toChainLinkKeySafe(a)
      if (data?.[ProtocolToOracle[lendingProtocol]]?.[key])
        return {
          [a]: {
            price: BigNumber.from(data[ProtocolToOracle[lendingProtocol]][key].price ?? '0'),
            decimals: data[ProtocolToOracle[lendingProtocol]][key].decimals
          }
        }
      else {
        return {
          [a]: {
            price: BigNumber.from(data?.[ProtocolToOracle[LendingProtocol.AAVE]]?.[a]?.price ?? '0'),
            decimals: data?.[ProtocolToOracle[LendingProtocol.AAVE]]?.[a]?.decimals ?? 8
          }
        }
      }
    })
  )

}

