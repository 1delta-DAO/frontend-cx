import { IRoute, Protocol, RouteV3 } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { Pool } from '@uniswap/v3-sdk'
import {
  formatPercentInBasisPointsNumber,
  formatToDecimal,
  getDurationFromDateMilliseconds,
  getTokenAddress,
} from 'analytics/utils'
import { ReactNode } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { computeRealizedPriceImpact } from 'utils/prices'

export function getIsValidSwapQuote(
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode
): boolean {
  return !!swapInputError && !!trade && (tradeState === TradeState.VALID || tradeState === TradeState.SYNCING)
}

export function largerPercentValue(a?: Percent, b?: Percent) {
  if (a && b) {
    return a.greaterThan(b) ? a : b
  } else if (a) {
    return a
  } else if (b) {
    return b
  }
  return undefined
}

const formatSwapQuoteReceivedEventProperties = (
  trade: InterfaceTrade<Currency, Currency, TradeType>,
  fetchingSwapQuoteStartTime: Date | undefined
) => {
  return {
    token_in_symbol: trade.inputAmount.currency.symbol,
    token_out_symbol: trade.outputAmount.currency.symbol,
    token_in_address: getTokenAddress(trade.inputAmount.currency),
    token_out_address: getTokenAddress(trade.outputAmount.currency),
    price_impact_basis_points: trade ? formatPercentInBasisPointsNumber(computeRealizedPriceImpact(trade)) : undefined,
    estimated_network_fee_usd: trade.gasUseEstimateUSD ? formatToDecimal(trade.gasUseEstimateUSD, 2) : undefined,
    chain_id:
      trade.inputAmount.currency.chainId === trade.outputAmount.currency.chainId
        ? trade.inputAmount.currency.chainId
        : undefined,
    token_in_amount: formatToDecimal(trade.inputAmount, trade.inputAmount.currency.decimals),
    token_out_amount: formatToDecimal(trade.outputAmount, trade.outputAmount.currency.decimals),
    quote_latency_milliseconds: fetchingSwapQuoteStartTime
      ? getDurationFromDateMilliseconds(fetchingSwapQuoteStartTime)
      : undefined,
  }
}

export const cherryPickTrade = (
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
): InterfaceTrade<Currency, Currency, TradeType> | undefined => {
  if (!trade) return undefined
  const v3Routes: (IRoute<Currency, Currency, Pair | Pool> | undefined)[] = trade?.routes.filter(
    (x) => x.protocol === Protocol.V3
  )
  if (v3Routes.length === 0) return undefined
  let index = 0
  if (v3Routes.length > 1)
    if (trade.tradeType === TradeType.EXACT_INPUT) {
      index = indexOfMax(trade.swaps)
    } else {
      index = indexOfMin(trade.swaps)
    }

  const newTrade = new InterfaceTrade({
    ...trade,
    gasUseEstimateUSD: trade.gasUseEstimateUSD,
    v3Routes: [
      {
        routev3: v3Routes[index] as RouteV3<Currency, Currency>,
        inputAmount: trade.inputAmount,
        outputAmount: trade.outputAmount,
      },
    ],
    blockNumber: trade?.blockNumber,
    v2Routes: [],
    mixedRoutes: [],
    tradeType: trade.tradeType,
  })

  return newTrade
}

function indexOfMax(
  arr: {
    route: IRoute<Currency, Currency, Pair | Pool>
    inputAmount: CurrencyAmount<Currency>
    outputAmount: CurrencyAmount<Currency>
  }[]
) {
  if (arr.length === 0) {
    return -1
  }

  let max = arr[0].outputAmount.quotient
  let maxIndex = 0

  for (let i = 1; i < arr.length; i++) {
    if (arr[i].outputAmount.greaterThan(max)) {
      maxIndex = i
      max = arr[i].outputAmount.quotient
    }
  }

  return maxIndex
}

function indexOfMin(
  arr: {
    route: IRoute<Currency, Currency, Pair | Pool>
    inputAmount: CurrencyAmount<Currency>
    outputAmount: CurrencyAmount<Currency>
  }[]
) {
  if (arr.length === 0) {
    return -1
  }

  let min = arr[0].inputAmount.quotient
  let minIndex = 0

  for (let i = 1; i < arr.length; i++) {
    if (arr[i].inputAmount.lessThan(min)) {
      minIndex = i
      min = arr[i].inputAmount.quotient
    }
  }

  return minIndex
}
