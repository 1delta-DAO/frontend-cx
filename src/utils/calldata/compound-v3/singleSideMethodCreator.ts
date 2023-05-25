import { RouteV3 } from '@uniswap/router-sdk'
import { Currency, MaxUint256, Percent, TradeType } from '@uniswap/sdk-core'
import { CometMarginTrader, CometSweeper } from 'abis/types'
import { encodePath, PositionSides } from 'types/1delta'
import { ContractCallDataWithOptions, ContractCallWithOptions, UniswapTrade } from '../../Types'

export const createSingleSideCalldataComet = (
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  marginTraderContract: CometMarginTrader & CometSweeper,
  side: PositionSides,
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
          cometId: 0
        }

        if (maxIn) {
          method = marginTraderContract.swapCollateralAllIn
          estimate = async () => await marginTraderContract.estimateGas.swapCollateralAllIn(args)
          contractCall = async (opts: any) => await marginTraderContract.swapCollateralAllIn(args, opts)
          return { args, method, estimate, call: contractCall }
        }
        else {
          method = marginTraderContract.swapCollateralExactIn
          estimate = async () => await marginTraderContract.estimateGas.swapCollateralExactIn(args)
          contractCall = async (opts: any) => await marginTraderContract.swapCollateralExactIn(args, opts)
          return { args, method, estimate, call: contractCall }
        }
      } else {
        args = v3Route && {
          path: encodePath(
            v3Route.path.map((p) => p.address),
            v3Route.pools.map((pool) => pool.fee)
          ),
          amountIn: trade.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
          recipient: account, // has to be removed later
          cometId: 0
        }
        if (maxIn) {
          method = marginTraderContract.swapCollateralAllInMulti
          estimate = async () => await marginTraderContract.estimateGas.swapCollateralAllInMulti(args)
          contractCall = async (opts: any) => await marginTraderContract.swapCollateralAllInMulti(args, opts)
          return { args, method, estimate, call: contractCall }
        } else {
          method = marginTraderContract.swapCollateralExactInMulti
          estimate = async () => await marginTraderContract.estimateGas.swapCollateralExactInMulti(args)
          contractCall = async (opts: any) => await marginTraderContract.swapCollateralExactInMulti(args, opts)
          return { args, method, estimate, call: contractCall }
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
          cometId: 0
        }
        method = marginTraderContract.swapCollateralExactOut
        estimate = async () => await marginTraderContract.estimateGas.swapCollateralExactOut(args)
        contractCall = async (opts: any) => await marginTraderContract.swapCollateralExactOut(args, opts)
        return { args, method, estimate, call: contractCall }
      } else {
        const structInp = v3Route && {
          path: encodePath(
            v3Route.path.map((p) => p.address).reverse(),
            v3Route.pools.map((pool) => pool.fee).reverse()
          ),
          amountOut: trade.outputAmount.quotient.toString(),
          amountInMaximum: MaxUint256.toString(),
          cometId: 0
        }
        args = v3Route && [structInp]
        method = marginTraderContract.swapCollateralExactOutMulti
        estimate = async () => await marginTraderContract.estimateGas.swapCollateralExactOutMulti(args)
        contractCall = async (opts: any) => await marginTraderContract.swapCollateralExactOutMulti(structInp, opts)
        return { args, method, estimate, call: contractCall }
      }
    }
  }
  // borrow swaps are not inlcuded with Compound V3


  return { args, method, estimate, call: contractCall }
}
