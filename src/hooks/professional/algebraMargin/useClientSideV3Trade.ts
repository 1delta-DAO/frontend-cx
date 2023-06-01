import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { Route, SwapQuoter } from '@uniswap/v3-sdk'
import { SupportedChainId } from 'constants/chains'
import JSBI from 'jsbi'
import { useSingleContractWithCallData } from 'lib/hooks/multicall'
import { useEffect, useMemo } from 'react'
import { useChainId } from 'state/globalNetwork/hooks'
import { InterfaceTrade, TradeState } from 'state/routing/types'

import { isCelo } from '../../../constants/tokens'
import { useAllV3RoutesAlgebra } from './useAllV3Routes'
import { useAlgebraQuoter, useQuoter } from '../../useContract'
import { DEFAULT_GAS_QUOTE, QUOTE_GAS_OVERRIDES } from 'constants/1delta'
import { AlgebraSwapQuoter } from '../utils/algebraQuoter'


const CACHED_TRADE: { [key: string]: InterfaceTrade<Currency, Currency, any> } = {}
const CACHED_ROUTES: { [key: string]: Route<Currency, Currency>[] } = {}

/**
 * Returns the best v3 trade for a desired swap
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useAlgebraClientSideV3Margin<TTradeType extends TradeType>(
  tradeType: TTradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): { state: TradeState; trade: InterfaceTrade<Currency, Currency, TTradeType> | undefined } {
  const [currencyIn, currencyOut] =
    tradeType === TradeType.EXACT_INPUT
      ? [amountSpecified?.currency, otherCurrency]
      : [otherCurrency, amountSpecified?.currency]

  const { routes: fetchedRoutes, loading: routesLoading } = useAllV3RoutesAlgebra(currencyIn, currencyOut)
  console.log("fetchedRoutesMargin", fetchedRoutes)
  // cache routes and load from cache if known route but not loaded
  const routes = useMemo(() => {
    if (currencyIn && currencyOut) {
      if (fetchedRoutes.length > 0) {
        CACHED_ROUTES[getRouteKeyFromCCys(currencyIn, currencyOut)] = fetchedRoutes
        return fetchedRoutes
      } else return CACHED_ROUTES[getRouteKeyFromCCys(currencyIn, currencyOut)] ?? []
    }
    return []
  }, [currencyIn, currencyOut, fetchedRoutes])

  const chainId = useChainId()
  // Chains deployed using the deploy-v3 script only deploy QuoterV2.
  const useQuoterV2 = useMemo(() => Boolean(chainId && isCelo(chainId)), [chainId])
  const quoter = useAlgebraQuoter(useQuoterV2)
  const callData = useMemo(
    () =>
      amountSpecified
        ? routes.map(
          (route) => AlgebraSwapQuoter.quoteCallParameters(route, amountSpecified, tradeType, { useQuoterV2 }).calldata
        )
        : [],
    [amountSpecified, routes, tradeType, useQuoterV2]
  )

  const quotesResults = useSingleContractWithCallData(quoter, callData, {
    gasRequired: chainId ? QUOTE_GAS_OVERRIDES[chainId] ?? DEFAULT_GAS_QUOTE : undefined,
  })
  return useMemo(() => {
    if (
      !amountSpecified ||
      !currencyIn ||
      !currencyOut ||
      quotesResults.some(({ valid }) => !valid) ||
      // skip when tokens are the same
      (tradeType === TradeType.EXACT_INPUT
        ? amountSpecified.currency.equals(currencyOut)
        : amountSpecified.currency.equals(currencyIn))
    ) {
      return {
        state: TradeState.INVALID,
        trade: undefined,
      }
    }

    if (routesLoading || quotesResults.some(({ loading }) => loading)) {
      return {
        state: TradeState.LOADING,
        trade: undefined,
      }
    }

    const { bestRoute, amountIn, amountOut } = quotesResults.reduce(
      (
        currentBest: {
          bestRoute: Route<Currency, Currency> | null
          amountIn: CurrencyAmount<Currency> | null
          amountOut: CurrencyAmount<Currency> | null
        },
        { result },
        i
      ) => {
        if (!result) return currentBest

        // overwrite the current best if it's not defined or if this route is better
        if (tradeType === TradeType.EXACT_INPUT) {
          const amountOut = CurrencyAmount.fromRawAmount(currencyOut, result.amountOut.toString())
          if (currentBest.amountOut === null || JSBI.lessThan(currentBest.amountOut.quotient, amountOut.quotient)) {
            return {
              bestRoute: routes[i],
              amountIn: amountSpecified,
              amountOut,
            }
          }
        } else {
          const amountIn = CurrencyAmount.fromRawAmount(currencyIn, result.amountIn.toString())
          if (currentBest.amountIn === null || JSBI.greaterThan(currentBest.amountIn.quotient, amountIn.quotient)) {
            return {
              bestRoute: routes[i],
              amountIn,
              amountOut: amountSpecified,
            }
          }
        }

        return currentBest
      },
      {
        bestRoute: null,
        amountIn: null,
        amountOut: null,
      }
    )

    if (!amountIn || !amountOut) {
      return {
        state: TradeState.LOADING,
        trade: undefined,
      }
    }

    const routeKey = getRouteKeyFromCCys(currencyIn, currencyOut)
    if (!bestRoute) {
      return {
        state: TradeState.LOADING,
        trade: undefined,
      }

    }

    const trade = new InterfaceTrade({
      v2Routes: [],
      v3Routes: [
        {
          routev3: bestRoute,
          inputAmount: amountIn,
          outputAmount: amountOut,
        },
      ],
      tradeType,
    })

    // we cache the trade
    CACHED_TRADE[routeKey] = trade

    return {
      state: TradeState.VALID,
      trade,
    }
  }, [amountSpecified, currencyIn, currencyOut, quotesResults, routes, routesLoading, tradeType])
}


const getRouteKeyFromCCys = (ccyIn: Currency, ccyOut: Currency): string => {
  return `${ccyIn.symbol}-${ccyOut.symbol}`
}