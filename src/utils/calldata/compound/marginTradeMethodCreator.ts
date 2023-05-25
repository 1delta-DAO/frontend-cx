import { RouteV3 } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { MarginTrader, Sweeper } from 'abis/types'
import { Contract } from 'ethers'
import { encodePath, PositionSides } from 'types/1delta'
import { modules } from './modules'
import { ContractCallDataWithOptions, ContractCallWithOptions, UniswapTrade } from '../../Types'


export const createMarginTradeCalldataCompound = (
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

export const createMarginTradeCalldataFromTradeCompound = (
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  marginTraderContract: MarginTrader & Sweeper,
  accountMulticall: Contract,
  sideIn: PositionSides,
  account?: string,
  isMaxIn?: boolean,
  isMaxOut?: boolean
): ContractCallDataWithOptions => {
  const args: any = {}
  let estimate: any
  let contractCall: ContractCallWithOptions | undefined = undefined
  const tradeType = trade?.tradeType

  if (!trade || tradeType === undefined || !account)
    return {
      args: {},
      method: undefined,
      estimate: undefined,
    }

  if (trade.routes.length === 1) return createMarginTradeCalldataCompound(
    trade,
    allowedSlippage,
    marginTraderContract,
    sideIn,
    account,
    isMaxIn,
    isMaxOut
  )


  const method = accountMulticall.multicallSingleModule

  if (sideIn === PositionSides.Borrow) {
    // Increase or create position
    if (tradeType === TradeType.EXACT_INPUT) {
      estimate = async () => await accountMulticall.estimateGas.multicallSingleModule(args)
      contractCall = async (opts: any) => await accountMulticall.multicallSingleModule(
        modules.marginTrader[trade.inputAmount.currency.chainId],
        openMarginPositionExactInParams(marginTraderContract, trade, allowedSlippage)
      )
    } else {
      estimate = async () => await accountMulticall.estimateGas.multicallSingleModule(args)
      contractCall = async (opts: any) => await accountMulticall.multicallSingleModule(
        modules.marginTrader[trade.inputAmount.currency.chainId],
        openMarginPositionExactOutParams(marginTraderContract, trade)
      )
    }
  }
  // trimming positions
  else {
    if (tradeType === TradeType.EXACT_INPUT) {
      estimate = async () => await accountMulticall.estimateGas.multicallSingleModule(args)
      contractCall = async (opts: any) => await accountMulticall.multicallSingleModule(
        modules.marginTrader[trade.inputAmount.currency.chainId],
        trimMarginPositionExactInParams(marginTraderContract, trade, allowedSlippage, Boolean(isMaxIn))
      )
    } else {
      estimate = async () => await accountMulticall.estimateGas.multicallSingleModule(args)
      contractCall = async (opts: any) => await accountMulticall.multicallSingleModule(
        modules.marginTrader[trade.inputAmount.currency.chainId],
        trimMarginPositionExactOutParams(marginTraderContract, trade, allowedSlippage, Boolean(isMaxOut))
      )
    }
  }

  return { args, method, estimate, call: contractCall }
}


// parameter creators

const openMarginPositionExactInParams = (contract: Contract, trade: UniswapTrade, allowedSlippage: Percent) => {
  return trade?.swaps.map(swap => {
    const route = swap.route
    const hasOnePool = route.pools.length === 1
    if (hasOnePool) {
      const args = {
        tokenIn: route.input.wrapped.address,
        tokenOut: route.output.wrapped.address,
        fee: (route.pools[0] as Pool).fee,
        amountIn: swap.inputAmount.quotient.toString(),
        amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
      }
      return contract.interface.encodeFunctionData(
        'openMarginPositionExactIn', [args]
      )
    } else {

      const args = {
        path: encodePath(
          route.path.map((p) => p.address),
          route.pools.map((pool) => (pool as Pool).fee)
        ),
        amountIn: swap.inputAmount.quotient.toString(),
        amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
      }
      return contract.interface.encodeFunctionData(
        'openMarginPositionExactInMulti', [args]
      )
    }
  })
}

const openMarginPositionExactOutParams = (contract: Contract, trade: UniswapTrade) => {
  return trade?.swaps.map(swap => {
    const route = swap.route
    const hasOnePool = route.pools.length === 1
    if (hasOnePool) {
      const args = {
        tokenIn: route.input.wrapped.address,
        tokenOut: route.output.wrapped.address,
        fee: (route.pools[0] as Pool).fee,
        amountOut: swap.outputAmount.quotient.toString(),
      }
      return contract.interface.encodeFunctionData(
        'openMarginPositionExactOut', [args]
      )
    } else {
      const args = {
        path: encodePath(
          route.path.map((p) => p.address).reverse(),
          route.pools.map((pool) => (pool as Pool).fee).reverse()
        ),
        amountOut: swap.outputAmount.quotient.toString(),
      }
      return contract.interface.encodeFunctionData(
        'openMarginPositionExactInMulti', [args]
      )
    }
  })
}

const trimMarginPositionExactInParams = (contract: Contract, trade: UniswapTrade, allowedSlippage: Percent, isMaxIn: boolean) => {
  return trade?.swaps.map(swap => {
    const route = swap.route
    const hasOnePool = route.pools.length === 1
    if (hasOnePool) {
      if (isMaxIn) {
        const args = {
          tokenIn: route.input.wrapped.address,
          tokenOut: route.output.wrapped.address,
          fee: (route.pools[0] as Pool).fee,
          amountIn: swap.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
        }
        return contract.interface.encodeFunctionData(
          'trimMarginPositionAllIn', [args]
        )
      }
      // general case
      const args = {
        tokenIn: route.input.wrapped.address,
        tokenOut: route.output.wrapped.address,
        fee: (route.pools[0] as Pool).fee,
        amountIn: trade.inputAmount.quotient.toString(),
        amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
      }
      return contract.interface.encodeFunctionData(
        'trimMarginPositionExactIn', [args]
      )
    } else {
      if (isMaxIn) {
        const args = {
          path: encodePath(
            route.path.map((p) => p.address),
            route.pools.map((pool) => (pool as Pool).fee)
          ),
          amountIn: trade.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
        }
        return contract.interface.encodeFunctionData(
          'trimMarginPositionAllInMulti', [args]
        )
      }
      // general case
      const args = {
        path: encodePath(
          route.path.map((p) => p.address),
          route.pools.map((pool) => (pool as Pool).fee)
        ),
        amountIn: swap.inputAmount.quotient.toString(),
        amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
      }
      return contract.interface.encodeFunctionData(
        'trimMarginPositionExactInMulti', [args]
      )
    }
  })
}

const trimMarginPositionExactOutParams = (contract: Contract, trade: UniswapTrade, allowedSlippage: Percent, isMaxOut: boolean) => {
  const lastIndex = trade.swaps.length - 1
  return trade?.swaps.map((swap, index) => {
    const isLast = index === lastIndex
    const route = swap.route
    const hasOnePool = route.pools.length === 1
    if (hasOnePool) {
      if (isMaxOut && isLast) {
        const args = {
          tokenIn: route.input.wrapped.address,
          tokenOut: route.output.wrapped.address,
          fee: (route.pools[0] as Pool).fee,
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
        }
        return contract.interface.encodeFunctionData(
          'trimMarginPositionAllOut', [args]
        )
      }
      const args = {
        tokenIn: route.input.wrapped.address,
        tokenOut: route.output.wrapped.address,
        fee: (route.pools[0] as Pool).fee,
        amountOut: swap.outputAmount.quotient.toString(),
        amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
      }
      return contract.interface.encodeFunctionData(
        'trimMarginPositionExactOut', [args]
      )
    } else {
      if (isMaxOut && isLast) {
        const args = {
          path: encodePath(
            route.path.map((p) => p.address).reverse(),
            route.pools.map((pool) => (pool as Pool).fee).reverse()
          ),
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
        }

        return contract.interface.encodeFunctionData(
          'trimMarginPositionAllOutMulti', [args]
        )
      }
      const args = {
        path: encodePath(
          route.path.map((p) => p.address).reverse(),
          route.pools.map((pool) => (pool as Pool).fee).reverse()
        ),
        amountOut: swap.outputAmount.quotient.toString(),
        amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),

      }
      return contract.interface.encodeFunctionData(
        'trimMarginPositionExactOutMulti', [args]
      )
    }
  })
}