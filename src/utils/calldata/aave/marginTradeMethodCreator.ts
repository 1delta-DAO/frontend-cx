import { ContractCallDataWithOptions, ContractCallWithOptions, UniswapTrade } from 'utils/Types'
import { RouteV3 } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { AaveMarginTrader, AaveSweeper } from 'abis/types'
import { AaveInterestMode, encodePath, PositionSides } from 'types/1delta'

export const createMarginTradeCalldata = (
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  marginTraderContract: AaveMarginTrader & AaveSweeper,
  borrowInterestMode: AaveInterestMode,
  sideIn: PositionSides,
  account?: string,
  isMaxIn?: boolean,
  isMaxOut?: boolean
): ContractCallDataWithOptions => {
  let args: any = {}
  let method: any
  let estimate: any
  let contractCall: ContractCallWithOptions | undefined = undefined
  const v3Route = trade?.routes[0] as RouteV3<Currency, Currency>
  const tradeType = trade?.tradeType
  if (!trade || !v3Route || tradeType === undefined || !account)
    return {
      args: {},
      method: undefined,
      estimate: undefined,
    }

  const hasOnePool = v3Route.pools.length === 1

  if (sideIn === PositionSides.Borrow) {
    // Increase or create position
    if (tradeType === TradeType.EXACT_INPUT) {
      if (hasOnePool) {
        const structInp = {
          tokenIn: v3Route.input.wrapped.address,
          tokenOut: v3Route.output.wrapped.address,
          fee: v3Route.pools[0].fee,
          amountIn: trade.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
          interestRateMode: borrowInterestMode
        }
        args = [structInp]
        method = marginTraderContract.openMarginPositionExactIn
        estimate = async () => await marginTraderContract.estimateGas.openMarginPositionExactIn(structInp)
        contractCall = async (opts: any) => await marginTraderContract.openMarginPositionExactIn(structInp, opts)
      } else {
        const structInp = {
          path: encodePath(
            v3Route.path.map((p) => p.address),
            v3Route.pools.map((pool) => pool.fee)
          ),
          amountIn: trade?.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
          interestRateMode: borrowInterestMode
        }
        args = [structInp]
        method = marginTraderContract.openMarginPositionExactInMulti
        estimate = async () => await marginTraderContract.estimateGas.openMarginPositionExactInMulti(structInp)
        contractCall = async (opts: any) => await marginTraderContract.openMarginPositionExactInMulti(structInp, opts)
      }
    } else { // exact out open
      if (hasOnePool) {
        const structInp = {
          tokenIn: v3Route.input.wrapped.address,
          tokenOut: v3Route.output.wrapped.address,
          fee: v3Route.pools[0].fee,
          amountOut: trade.outputAmount.quotient.toString(),
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
          interestRateMode: borrowInterestMode
        }
        args = [structInp]
        method = marginTraderContract.openMarginPositionExactOut
        estimate = async () => await marginTraderContract.estimateGas.openMarginPositionExactOut(structInp)
        contractCall = async (opts: any) => await marginTraderContract.openMarginPositionExactOut(structInp, opts)
      } else {
        const structInp = {
          path: encodePath(
            v3Route.path.map((p) => p.address).reverse(),
            v3Route.pools.map((pool) => pool.fee).reverse()
          ),
          amountOut: trade.outputAmount.quotient.toString(),
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
          interestRateMode: borrowInterestMode
        }
        args = [structInp]
        method = marginTraderContract.openMarginPositionExactOutMulti
        estimate = async () => await marginTraderContract.estimateGas.openMarginPositionExactOutMulti(structInp)
        contractCall = async (opts: any) => await marginTraderContract.openMarginPositionExactOutMulti(structInp, opts)
      }
    }
  }
  // trimming positions
  else {
    if (tradeType === TradeType.EXACT_INPUT) {
      if (hasOnePool) {
        if (isMaxIn) {
          const structInp = {
            tokenIn: v3Route.input.wrapped.address,
            tokenOut: v3Route.output.wrapped.address,
            fee: v3Route.pools[0].fee,
            amountIn: trade.inputAmount.quotient.toString(),
            amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
            interestRateMode: borrowInterestMode
          }
          args = [structInp]
          method = marginTraderContract.trimMarginPositionAllIn
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionAllIn(structInp)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionAllIn(structInp, opts)
        } else {
          const structInp = {
            tokenIn: v3Route.input.wrapped.address,
            tokenOut: v3Route.output.wrapped.address,
            fee: v3Route.pools[0].fee,
            amountIn: trade.inputAmount.quotient.toString(),
            amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
            interestRateMode: borrowInterestMode
          }
          args = [structInp]
          method = marginTraderContract.trimMarginPositionExactIn
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionExactIn(structInp)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionExactIn(structInp, opts)
        }
      } else {
        if (isMaxIn) {
          const structInp = {
            path: encodePath(
              v3Route.path.map((p) => p.address),
              v3Route.pools.map((pool) => pool.fee)
            ),
            amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
            interestRateMode: borrowInterestMode
          }
          args = [structInp]
          method = marginTraderContract.trimMarginPositionAllInMulti
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionAllInMulti(structInp)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionAllInMulti(structInp, opts)
        } else {
          const structInp = {
            path: encodePath(
              v3Route.path.map((p) => p.address),
              v3Route.pools.map((pool) => pool.fee)
            ),
            amountIn: trade?.inputAmount.quotient.toString(),
            amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
            interestRateMode: borrowInterestMode
          }
          args = [structInp]
          method = marginTraderContract.trimMarginPositionExactInMulti
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionExactInMulti(structInp)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionExactInMulti(structInp, opts)
        }
      }
    } else { // trim exact out
      if (hasOnePool) {
        if (isMaxOut) {
          const structInp = {
            tokenIn: v3Route.input.wrapped.address,
            tokenOut: v3Route.output.wrapped.address,
            fee: v3Route.pools[0].fee,
            amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
            interestRateMode: borrowInterestMode
          }
          args = [structInp]
          method = marginTraderContract.trimMarginPositionAllOut
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionAllOut(structInp)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionAllOut(structInp, opts)
        } else {
          const structInp = {
            tokenIn: v3Route.input.wrapped.address,
            tokenOut: v3Route.output.wrapped.address,
            fee: v3Route.pools[0].fee,
            amountOut: trade.outputAmount.quotient.toString(),
            amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
            interestRateMode: borrowInterestMode
          }
          args = [structInp]
          method = marginTraderContract.trimMarginPositionExactOut
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionExactOut(structInp)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionExactOut(structInp, opts)
        }
      } else {
        if (isMaxOut) {
          const structInp = {
            path: encodePath(
              v3Route.path.map((p) => p.address).reverse(),
              v3Route.pools.map((pool) => pool.fee).reverse()
            ),
            amountOut: trade.outputAmount.quotient.toString(),
            amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
            interestRateMode: borrowInterestMode
          }
          args = [structInp]
          method = marginTraderContract.trimMarginPositionAllOutMulti
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionAllOutMulti(structInp)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionAllOutMulti(structInp, opts)
        } else {
          const structInp = {
            path: encodePath(
              v3Route.path.map((p) => p.address).reverse(),
              v3Route.pools.map((pool) => pool.fee).reverse()
            ),
            amountOut: trade.outputAmount.quotient.toString(),
            amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
            interestRateMode: borrowInterestMode
          }
          args = [structInp]
          method = marginTraderContract.trimMarginPositionExactOutMulti
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionExactOutMulti(structInp)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionExactOutMulti(structInp, opts)
        }
      }
    }
  }

  return { args, method, estimate, call: contractCall }
}