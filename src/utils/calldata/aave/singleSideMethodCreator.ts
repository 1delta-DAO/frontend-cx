import { ContractCallDataWithOptions, ContractCallWithOptions, UniswapTrade } from 'utils/Types'
import { RouteV3 } from '@uniswap/router-sdk'
import { Currency, MaxUint256, Percent, TradeType } from '@uniswap/sdk-core'
import { AaveMarginTrader, AaveSweeper } from 'abis/types'
import { AaveInterestMode, encodePath, PositionSides } from 'types/1delta'

export const createSingleSideCalldata = (
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  marginTraderContract: AaveMarginTrader & AaveSweeper,
  side: PositionSides,
  sourceInterestMode: AaveInterestMode,
  targetInterestMode: AaveInterestMode,
  account?: string,
  maxIn?: boolean,
  maxOut?: boolean
): ContractCallDataWithOptions => {
  let args: any = {}
  let method: any
  let estimate: any
  let contractCall: ContractCallWithOptions | undefined = undefined

  if (!trade || !account)
    return {
      args: {},
      method: undefined,
      estimate: undefined,
    }
  const v3Route = trade.routes[0] as RouteV3<Currency, Currency>
  const hasOnePool = v3Route.pools.length === 1
  const tradeType = trade.tradeType

  if (side === PositionSides.Collateral) {
    // collateral swaps
    if (tradeType === TradeType.EXACT_INPUT) {
      if (hasOnePool) {
        args = v3Route && {
          tokenIn: v3Route.input.wrapped.address,
          tokenOut: v3Route.output.wrapped.address,
          fee: v3Route.pools[0].fee,
          amountIn: trade.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
        }

        if (maxIn) {
          method = marginTraderContract.swapCollateralAllIn
          estimate = async () => await marginTraderContract.estimateGas.swapCollateralAllIn(args)
          contractCall = async (opts: any) => await marginTraderContract.swapCollateralAllIn(args, opts)
        }
        else {
          method = marginTraderContract.swapCollateralExactIn
          estimate = async () => await marginTraderContract.estimateGas.swapCollateralExactIn(args)
          contractCall = async (opts: any) => await marginTraderContract.swapCollateralExactIn(args, opts)
        }
      } else {
        args = v3Route && {
          path: encodePath(
            v3Route.path.map((p) => p.address),
            v3Route.pools.map((pool) => pool.fee)
          ),
          amountIn: trade.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
        }
        if (maxIn) {
          method = marginTraderContract.swapCollateralAllInMulti
          estimate = async () => await marginTraderContract.estimateGas.swapCollateralAllInMulti(args)
          contractCall = async (opts: any) => await marginTraderContract.swapCollateralAllInMulti(args, opts)
        } else {
          method = marginTraderContract.swapCollateralExactInMulti
          estimate = async () => await marginTraderContract.estimateGas.swapCollateralExactInMulti(args)
          contractCall = async (opts: any) => await marginTraderContract.swapCollateralExactInMulti(args, opts)
        }
      }
    } else {
      if (hasOnePool) {
        args = v3Route && {
          tokenIn: v3Route.input.wrapped.address,
          tokenOut: v3Route.output.wrapped.address,
          fee: v3Route.pools[0].fee,
          amountOut: trade.outputAmount.quotient.toString(),
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
        }
        method = marginTraderContract.swapCollateralExactOut
        estimate = async () => await marginTraderContract.estimateGas.swapCollateralExactOut(args)
        contractCall = async (opts: any) => await marginTraderContract.swapCollateralExactOut(args, opts)
      } else {
        const structInp = v3Route && {
          path: encodePath(
            v3Route.path.map((p) => p.address).reverse(),
            v3Route.pools.map((pool) => pool.fee).reverse()
          ),
          amountOut: trade.outputAmount.quotient.toString(),
          amountInMaximum: MaxUint256.toString(),
          interestRateMode: sourceInterestMode * 10 + targetInterestMode,
        }
        args = v3Route && [structInp]
        method = marginTraderContract.swapCollateralExactOutMulti
        estimate = async () => await marginTraderContract.estimateGas.swapCollateralExactOutMulti(args)
        contractCall = async (opts: any) => await marginTraderContract.swapCollateralExactOutMulti(structInp, opts)
      }
    }
  }
  // borrow swaps
  else {
    const composedInterestRateMode = sourceInterestMode * 10 + targetInterestMode

    if (tradeType === TradeType.EXACT_INPUT) {
      if (hasOnePool) {
        args = v3Route && {
          tokenIn: v3Route.input.wrapped.address,
          tokenOut: v3Route.output.wrapped.address,
          fee: v3Route.pools[0].fee,
          amountIn: trade.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
          interestRateMode: composedInterestRateMode,
        }
        method = marginTraderContract.swapBorrowExactIn
        estimate = async () => await marginTraderContract.estimateGas.swapBorrowExactIn(args)
        contractCall = async (opts: any) => await marginTraderContract.swapBorrowExactIn(args, opts)
      } else {
        args = v3Route && {
          path: encodePath(
            v3Route.path.map((p) => p.address),
            v3Route.pools.map((pool) => pool.fee)
          ),
          amountIn: trade.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
          interestRateMode: composedInterestRateMode,
        }
        method = marginTraderContract.swapBorrowExactInMulti
        estimate = async () => await marginTraderContract.estimateGas.swapBorrowExactInMulti(args)
        contractCall = async (opts: any) => await marginTraderContract.swapBorrowExactInMulti(args, opts)
      }
    } else {
      if (hasOnePool) {
        args = v3Route && {
          tokenIn: v3Route.input.wrapped.address,
          tokenOut: v3Route.output.wrapped.address,
          fee: v3Route.pools[0].fee,
          amountOut: trade.outputAmount.quotient.toString(),
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
          interestRateMode: composedInterestRateMode,
        }
        if (maxOut) {
          method = marginTraderContract.swapBorrowAllOut
          estimate = async () => await marginTraderContract.estimateGas.swapBorrowAllOut(args)
          contractCall = async (opts: any) => await marginTraderContract.swapBorrowAllOut(args, opts)
        } else {
          method = marginTraderContract.swapBorrowExactOut
          estimate = async () => await marginTraderContract.estimateGas.swapBorrowExactOut(args)
          contractCall = async (opts: any) => await marginTraderContract.swapBorrowExactOut(args, opts)
        }
      } else {
        const structInp = v3Route && {
          path: encodePath(
            v3Route.path.map((p) => p.address).reverse(),
            v3Route.pools.map((pool) => pool.fee).reverse()
          ),
          amountOut: trade.outputAmount.quotient.toString(),
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
          interestRateMode: composedInterestRateMode,
        }
        args = [structInp]
        if (maxOut) {
          method = marginTraderContract.swapBorrowAllOutMulti
          estimate = async () => await marginTraderContract.estimateGas.swapBorrowAllOutMulti(args)
          contractCall = async (opts: any) => await marginTraderContract.swapBorrowAllOutMulti(structInp, opts)
        } else {
          method = marginTraderContract.swapBorrowExactOutMulti
          estimate = async () => await marginTraderContract.estimateGas.swapBorrowExactOutMulti(args)
          contractCall = async (opts: any) => await marginTraderContract.swapBorrowExactOutMulti(structInp, opts)
        }
      }
    }
  }

  return { args, method, estimate, call: contractCall }
}
