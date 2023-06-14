import { Currency, CurrencyAmount, Price, Token, TradeType } from '@uniswap/sdk-core'
import { parseUnits } from 'ethers/lib/utils'
import JSBI from 'jsbi'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useMemo, useRef } from 'react'
import { useChainId } from 'state/globalNetwork/hooks'
import { usePrices } from 'state/oracles/hooks'
import { RouterPreference } from 'state/routing/slice'
import { useRoutingAPITrade } from 'state/routing/useRoutingAPITrade'
import { SupportedAssets } from 'types/1delta'

import { SupportedChainId } from '../constants/chains'
import { CUSD_CELO, DAI_OPTIMISM, USDC_ARBITRUM, USDC_MAINNET, USDC_POLYGON } from '../constants/tokens'


export const getVirtualUSD = (chainId: number): Token => {
  return new Token(chainId, '0x00006F5b9430bDB1C305452b27C64695445f23C2', 18, 'USD', 'Dollar')
}

// Stablecoin amounts used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
export const STABLECOIN_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Token> } = {
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC_MAINNET, 100_000e6),
  [SupportedChainId.ARBITRUM_ONE]: CurrencyAmount.fromRawAmount(USDC_ARBITRUM, 10_000e6),
  [SupportedChainId.OPTIMISM]: CurrencyAmount.fromRawAmount(DAI_OPTIMISM, 10_000e18),
  [SupportedChainId.POLYGON]: CurrencyAmount.fromRawAmount(USDC_POLYGON, 10_000e6),
  [SupportedChainId.CELO]: CurrencyAmount.fromRawAmount(CUSD_CELO, 10_000e18),
}

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export function useDollarPriceViaOracles(currency?: Currency): Price<Currency, Token> | undefined {
  const chainId = SupportedChainId.POLYGON

  const priceFromOracle = usePrices(currency?.symbol ? [currency.symbol as SupportedAssets] : [], Number(chainId))
  const price = useMemo(() => {
    if (!currency || !chainId) {
      return undefined
    }

    if (priceFromOracle?.[0]) {
      try {
        const priceRaw = parseUnits(String(priceFromOracle[0]), 18)
        return new Price(currency, getVirtualUSD(chainId), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currency.decimals)), priceRaw.toString())
      }
      catch (e) {
        console.log("Error calculationg oracle rates:", e)
      }
    }

    return undefined
  }, [currency, chainId, priceFromOracle])

  const lastPrice = useRef(price)
  if (!price || !lastPrice.current || !price.equalTo(lastPrice.current)) {
    lastPrice.current = price
  }
  return lastPrice.current
}

export function useStablecoinDollarValue(currencyAmount: CurrencyAmount<Currency> | undefined | null) {
  const price = useDollarPriceViaOracles(currencyAmount?.currency)

  return useMemo(() => {
    if (!price || !currencyAmount) return null
    try {
      return price.quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, price])
}

/**
 *
 * @param fiatValue string representation of a USD amount
 * @returns CurrencyAmount where currency is stablecoin on active chain
 */
export function useStablecoinAmountFromFiatValue(fiatValue: string | null | undefined) {
  const chainId = useChainId()
  const stablecoin = chainId ? STABLECOIN_AMOUNT_OUT[chainId]?.currency : undefined

  return useMemo(() => {
    if (fiatValue === null || fiatValue === undefined || !chainId || !stablecoin) {
      return undefined
    }

    // trim for decimal precision when parsing
    const parsedForDecimals = parseFloat(fiatValue).toFixed(stablecoin.decimals).toString()
    try {
      // parse USD string into CurrencyAmount based on stablecoin decimals
      return tryParseCurrencyAmount(parsedForDecimals, stablecoin)
    } catch (error) {
      return undefined
    }
  }, [chainId, fiatValue, stablecoin])
}
