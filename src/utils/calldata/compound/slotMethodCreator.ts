import { RouteV3 } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { MarginTrader, Sweeper } from 'abis/types'
import { Contract } from 'ethers'
import { encodePath, PositionSides } from 'types/1delta'
import { modules } from './modules'
import { ContractCallDataWithOptions, ContractCallWithOptions, UniswapTrade } from '../../Types'
import { TradeAction } from 'pages/Trading'


export const createMarginTradeCalldataCompound = (
  action: TradeAction,
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  marginTraderContract: MarginTrader & Sweeper,
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

  if (action === TradeAction.OPEN) {

  }

  if (sideIn === PositionSides.Borrow) {
    // Increase or create position
    if (tradeType === TradeType.EXACT_INPUT) {
      if (hasOnePool) {
        args = v3Route && {
          tokenIn: v3Route.input.wrapped.address,
          tokenOut: v3Route.output.wrapped.address,
          fee: v3Route.pools[0].fee,
          amountIn: trade.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
        }
        method = marginTraderContract.openMarginPositionExactIn
        estimate = async () => await marginTraderContract.estimateGas.openMarginPositionExactIn(args)
        contractCall = async (opts: any) => await marginTraderContract.openMarginPositionExactIn(args, opts)
      } else {
        args = v3Route && {
          path: encodePath(
            v3Route.path.map((p) => p.address),
            v3Route.pools.map((pool) => pool.fee)
          ),
          amountIn: trade?.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString()
        }
        method = marginTraderContract.openMarginPositionExactInMulti
        estimate = async () => await marginTraderContract.estimateGas.openMarginPositionExactInMulti(args)
        contractCall = async (opts: any) => await marginTraderContract.openMarginPositionExactInMulti(args, opts)
      }
    } else { // exact out open
      if (hasOnePool) {
        args = v3Route && {
          tokenIn: v3Route.input.wrapped.address,
          tokenOut: v3Route.output.wrapped.address,
          fee: v3Route.pools[0].fee,
          amountOut: trade.outputAmount.quotient.toString(),
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString()
        }
        method = marginTraderContract.openMarginPositionExactOut
        estimate = async () => await marginTraderContract.estimateGas.openMarginPositionExactOut(args)
        contractCall = async (opts: any) => await marginTraderContract.openMarginPositionExactOut(args, opts)
      } else {
        const structInp = v3Route && {
          path: encodePath(
            v3Route.path.map((p) => p.address).reverse(),
            v3Route.pools.map((pool) => pool.fee).reverse()
          ),
          amountOut: trade.outputAmount.quotient.toString(),
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString()
        }
        args = v3Route && [structInp]
        method = marginTraderContract.openMarginPositionExactOutMulti
        estimate = async () => await marginTraderContract.estimateGas.openMarginPositionExactOutMulti(args)
        contractCall = async (opts: any) => await marginTraderContract.openMarginPositionExactOutMulti(structInp, opts)
      }
    }
  }
  // trimming positions
  else {
    if (tradeType === TradeType.EXACT_INPUT) {
      if (hasOnePool) {
        if (isMaxIn) {
          args = v3Route && {
            tokenIn: v3Route.input.wrapped.address,
            tokenOut: v3Route.output.wrapped.address,
            fee: v3Route.pools[0].fee,
            amountIn: trade.inputAmount.quotient.toString(),
            amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
          }
          method = marginTraderContract.trimMarginPositionAllIn
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionAllIn(args)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionAllIn(args, opts)
        } else {
          args = v3Route && {
            tokenIn: v3Route.input.wrapped.address,
            tokenOut: v3Route.output.wrapped.address,
            fee: v3Route.pools[0].fee,
            amountIn: trade.inputAmount.quotient.toString(),
            amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
          }
          method = marginTraderContract.trimMarginPositionExactIn
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionExactIn(args)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionExactIn(args, opts)
        }
      } else {
        if (isMaxIn) {
          args = v3Route && {
            path: encodePath(
              v3Route.path.map((p) => p.address),
              v3Route.pools.map((pool) => pool.fee)
            ),
            amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
          }
          method = marginTraderContract.trimMarginPositionAllInMulti
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionAllInMulti(args)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionAllInMulti(args, opts)
        } else {
          args = v3Route && {
            path: encodePath(
              v3Route.path.map((p) => p.address),
              v3Route.pools.map((pool) => pool.fee)
            ),
            amountIn: trade?.inputAmount.quotient.toString(),
            amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
          }
          method = marginTraderContract.trimMarginPositionExactInMulti
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionExactInMulti(args)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionExactInMulti(args, opts)
        }
      }
    } else { // trim exact out
      if (hasOnePool) {
        if (isMaxOut) {
          args = v3Route && {
            tokenIn: v3Route.input.wrapped.address,
            tokenOut: v3Route.output.wrapped.address,
            fee: v3Route.pools[0].fee,
            amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
          }
          method = marginTraderContract.trimMarginPositionAllOut
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionAllOut(args)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionAllOut(args, opts)
        } else {
          args = v3Route && {
            tokenIn: v3Route.input.wrapped.address,
            tokenOut: v3Route.output.wrapped.address,
            fee: v3Route.pools[0].fee,
            amountOut: trade.outputAmount.quotient.toString(),
            amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
          }
          method = marginTraderContract.trimMarginPositionExactOut
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionExactOut(args)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionExactOut(args, opts)
        }
      } else {
        if (isMaxOut) {
          const structInp = v3Route && {
            path: encodePath(
              v3Route.path.map((p) => p.address).reverse(),
              v3Route.pools.map((pool) => pool.fee).reverse()
            ),
            amountOut: trade.outputAmount.quotient.toString(),
            amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
          }
          args = [structInp]
          method = marginTraderContract.trimMarginPositionAllOutMulti
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionAllOutMulti(args)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionAllOutMulti(structInp, opts)
        } else {
          const structInp = v3Route && {
            path: encodePath(
              v3Route.path.map((p) => p.address).reverse(),
              v3Route.pools.map((pool) => pool.fee).reverse()
            ),
            amountOut: trade.outputAmount.quotient.toString(),
            amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
          }
          args = [structInp]
          method = marginTraderContract.trimMarginPositionExactOutMulti
          estimate = async () => await marginTraderContract.estimateGas.trimMarginPositionExactOutMulti(args)
          contractCall = async (opts: any) => await marginTraderContract.trimMarginPositionExactOutMulti(structInp, opts)
        }
      }
    }
  }

  return { args, method, estimate, call: contractCall }
}
