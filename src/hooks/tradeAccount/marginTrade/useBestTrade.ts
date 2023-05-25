import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { RouterPreference } from 'state/routing/slice'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { useRoutingAPITrade } from 'state/routing/useRoutingAPITrade'
import { useClientSideRouter } from 'state/user/hooks'

import useAutoRouterSupported from '../../useAutoRouterSupported'
import { useClientSideV3MarginTrade } from './useClientSideV3Trade'
import useDebounce from '../../useDebounce'
import useIsWindowVisible from '../../useIsWindowVisible'


const CACHED_TRADE: { [key: string]: InterfaceTrade<Currency, Currency, any> } = {}
/**
 * Returns the best v2+v3 trade for a desired swap.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useBestMarginTradeAccount(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
} {
  const autoRouterSupported = useAutoRouterSupported()
  const isWindowVisible = useIsWindowVisible()

  const [debouncedAmount, debouncedOtherCurrency] = useDebounce(
    useMemo(() => [amountSpecified, otherCurrency], [amountSpecified, otherCurrency]),
    200
  )

  const [clientSideRouter] = useClientSideRouter()
  const routingAPITrade = useRoutingAPITrade(
    tradeType,
    autoRouterSupported && isWindowVisible ? debouncedAmount : undefined,
    debouncedOtherCurrency,
    clientSideRouter ? RouterPreference.CLIENT : RouterPreference.API
  )

  const [currencyIn, currencyOut]: [string | undefined, string | undefined] = useMemo(
    () =>
      tradeType === TradeType.EXACT_INPUT
        ? [amountSpecified?.currency.symbol, otherCurrency?.symbol]
        : [otherCurrency?.symbol, amountSpecified?.currency.symbol],
    [amountSpecified, otherCurrency, tradeType]
  )

  const validatedAPITrade = useMemo(() => {
    if (amountSpecified && currencyIn && currencyOut && routingAPITrade.state !== TradeState.LOADING) {
      if (routingAPITrade.trade) {
        CACHED_TRADE[getRouteKeyFromCCys(amountSpecified.quotient.toString(), currencyIn, currencyOut)] = routingAPITrade.trade
        return routingAPITrade.trade
      }
      if (routingAPITrade.state === TradeState.NO_ROUTE_FOUND)
        return CACHED_TRADE[getRouteKeyFromCCys(amountSpecified.quotient.toString(), currencyIn, currencyOut)]

      return undefined
    }
    return routingAPITrade.trade
  }, [routingAPITrade, amountSpecified, otherCurrency])

  const isLoading = routingAPITrade.state === TradeState.LOADING
  const useFallback = !autoRouterSupported || routingAPITrade.state === TradeState.NO_ROUTE_FOUND

  // only use client side router if routing api trade failed or is not supported
  const bestV3Trade = useClientSideV3MarginTrade(
    tradeType,
    useFallback ? debouncedAmount : undefined,
    useFallback ? debouncedOtherCurrency : undefined
  )

  // only return gas estimate from api if routing api trade is used
  return useMemo(
    () => ({
      ...(validatedAPITrade ? { trade: isLoading ? undefined : validatedAPITrade, state: routingAPITrade.state } : useFallback ? bestV3Trade : routingAPITrade),
      ...(isLoading ? { state: TradeState.LOADING } : {}),
    }),
    [bestV3Trade, isLoading, routingAPITrade, useFallback]
  )
}


const getRouteKeyFromCCys = (amount: string, ccyIn: string, ccyOut: string): string => {
  return `${amount}-${ccyIn}-${ccyOut}`
}