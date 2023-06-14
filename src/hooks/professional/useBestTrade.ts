import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { RouterPreference } from 'state/routing/slice'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { useClientSideRouter } from 'state/user/hooks'

import useAutoRouterSupported from '../useAutoRouterSupported'
import { useClientSideV3Professional } from './useClientSideV3Trade'
import useDebounce from '../useDebounce'
import useIsWindowVisible from '../useIsWindowVisible'


const CACHED_TRADE: { [key: string]: InterfaceTrade<Currency, Currency, any> } = {}
/**
 * Returns the best v2+v3 trade for a desired swap.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useBestTradeProfessional(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
} {
  const [debouncedAmount, debouncedOtherCurrency] = useDebounce(
    useMemo(() => [amountSpecified, otherCurrency], [amountSpecified, otherCurrency]),
    200
  )

  // only use client side router if routing api trade failed or is not supported
  const bestV3Trade = useClientSideV3Professional(
    tradeType,
    debouncedAmount,
    debouncedOtherCurrency
  )

  // only return gas estimate from api if routing api trade is used
  return useMemo(
    () => ({
      ...bestV3Trade
    }),
    [bestV3Trade]
  )
}

const getRouteKeyFromCCys = (amount: string, ccyIn: string, ccyOut: string): string => {
  return `${amount}-${ccyIn}-${ccyOut}`
}