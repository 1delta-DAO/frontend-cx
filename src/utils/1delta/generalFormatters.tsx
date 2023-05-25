import { formatAbbreviatedNumber } from 'utils/tableUtils/format'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import {
  formatPercentInBasisPointsNumber,
  formatToDecimal,
  getDurationFromDateMilliseconds,
  getTokenAddress,
} from 'analytics/utils'
import { LTV_PRECISION, TEN } from 'constants/1delta'
import { BigNumber, BigNumberish, ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
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

export const formatSwapQuoteReceivedEventProperties = (
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

export const formatPercent = (n: number, decs: number) => {
  return `${Math.round(n * 100 * 10 ** decs) / 10 ** decs}%`
}

export const formatPercentagePoints = (n: number, decs: number) => {
  return `${Math.round(n * 100 * 10 ** decs) / 10 ** decs}pp`
}

export const formatNumber = (n: number, decs: number) => {
  return (Math.round(n * 10 ** decs) / 10 ** decs).toLocaleString()
}

export const ltvDataToNumber = (hf?: BigNumber) => {
  if (!hf) return 0
  return Number(formatEther(hf))
}

export const hfToNumber = (hf?: BigNumber) => {
  if (!hf) return 0
  return Number(formatEther(hf))
}

export const healthFactorToNumber = (hf?: BigNumber) => {
  if (!hf || hf.eq(0)) return '-'
  if (hf.gt(ethers.constants.MaxUint256.div(2))) return '\u221e'

  return `${formatAbbreviatedNumber(hfToNumber(hf))}`
}

export const healthFactorDeltaToNumber = (hf?: BigNumber) => {
  if (!hf || hf.eq(0)) return '-'
  if (hf.gt(0)) return `+${healthFactorToNumber(hf)}`

  return `-${healthFactorToNumber(hf.mul(-1))}`
}


export function bigNumberToDecimal(bn?: BigNumberish, decimals?: number, displayDecimals = 4): number {
  if (!bn || !decimals) return 0
  const scalar = Math.pow(10, displayDecimals)
  return Math.round(Number(ethers.utils.formatEther(BigNumber.from(bn).mul(TEN.pow(18 - decimals)))) * scalar) / scalar
}