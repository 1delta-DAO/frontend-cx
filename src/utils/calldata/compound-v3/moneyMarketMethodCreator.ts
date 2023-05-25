import { RouteV3 } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { Comet, CometMoneyMarket, CometSweeper } from 'abis/types'
import { Contract, ethers } from 'ethers'
import { getCompoundCTokens } from 'hooks/1delta/addressesCompound'
import { getCompoundTokens } from 'hooks/1delta/tokens'
import { compoundAssets, encodePath, MarginTradeType } from 'types/1delta'
import { ContractCall, ContractCallDataWithOptions, ContractCallWithOptions, UniswapTrade } from '../../Types'

export const createAccountMoneyMarketCalldataComet = (
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  marginTraderContract: CometMoneyMarket & CometSweeper,
  interaction: MarginTradeType,
  inIsETH: boolean,
  outIsETH: boolean,
  account?: string,
  outAddress?: string,
  isMax?: boolean
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
  const tradeType = trade.tradeType
  if (interaction === MarginTradeType.Supply) {
    if (tradeType === TradeType.EXACT_INPUT) {
      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address),
          v3Route.pools.map((pool) => pool.fee)
        ),
        amountIn: trade.inputAmount.quotient.toString(),
        amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
        cometId: 0
      }

      if (inIsETH) {
        method = marginTraderContract.swapETHAndSupplyExactIn
        estimate = async () => await marginTraderContract.estimateGas.swapETHAndSupplyExactIn(args, { value: args.amountIn })
        contractCall = async (opts: any) => await marginTraderContract.swapETHAndSupplyExactIn(args, { value: args.amountIn, ...opts })
        return { args, method, estimate, call: contractCall }
      } else {
        method = marginTraderContract.swapAndSupplyExactIn
        estimate = async () => await marginTraderContract.estimateGas.swapAndSupplyExactIn(args)
        contractCall = async (opts: any) => await marginTraderContract.swapAndSupplyExactIn(args, opts)
        return { args, method, estimate, call: contractCall }
      }
    } else {

      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address).reverse(),
          v3Route.pools.map((pool) => pool.fee).reverse()
        ),
        amountOut: trade.outputAmount.quotient.toString(),
        amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
        recipient: account,
        cometId: 0
      }

      if (inIsETH) {
        method = marginTraderContract.swapETHAndSupplyExactOut
        estimate = async () => await marginTraderContract.estimateGas.swapETHAndSupplyExactOut(args, { value: args.amountInMaximum })
        contractCall = async (opts: any) => await marginTraderContract.swapETHAndSupplyExactOut(args, { value: args.amountInMaximum, ...opts })
        return { args, method, estimate, call: contractCall }
      } else {
        method = marginTraderContract.swapAndSupplyExactOut
        estimate = async () => await marginTraderContract.estimateGas.swapAndSupplyExactOut(args)
        contractCall = async (opts: any) => await marginTraderContract.swapAndSupplyExactOut(args, opts)
        return { args, method, estimate, call: contractCall }
      }
    }
  }
  if (interaction === MarginTradeType.Withdraw) {
    // withdraw and then swap
    if (tradeType === TradeType.EXACT_INPUT) {
      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address),
          v3Route.pools.map((pool) => pool.fee)
        ),
        amountIn: trade.inputAmount.quotient.toString(),
        amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
        recipient: account,
        cometId: 0
      }

      if (outIsETH) {
        if (isMax) {
          method = marginTraderContract.withdrawAndSwapAllInToETH
          estimate = async () => await marginTraderContract.estimateGas.withdrawAndSwapAllInToETH(args)
          contractCall = async (opts: any) => await marginTraderContract.withdrawAndSwapAllInToETH(args, opts)
          return { args, method, estimate, call: contractCall }
        } else {
          method = marginTraderContract.withdrawAndSwapExactInToETH
          estimate = async () => await marginTraderContract.estimateGas.withdrawAndSwapExactInToETH(args)
          contractCall = async (opts: any) => await marginTraderContract.withdrawAndSwapExactInToETH(args, opts)
          return { args, method, estimate, call: contractCall }
        }
      } else {
        if (isMax) {
          method = marginTraderContract.withdrawAndSwapAllIn
          estimate = async () => await marginTraderContract.estimateGas.withdrawAndSwapAllIn(args)
          contractCall = async (opts: any) => await marginTraderContract.withdrawAndSwapAllIn(args, opts)
          return { args, method, estimate, call: contractCall }
        } else {
          method = marginTraderContract.withdrawAndSwapExactIn
          estimate = async () => await marginTraderContract.estimateGas.withdrawAndSwapExactIn(args)
          contractCall = async (opts: any) => await marginTraderContract.withdrawAndSwapExactIn(args, opts)
          return { args, method, estimate, call: contractCall }
        }
      }
    } else {
      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address).reverse(),
          v3Route.pools.map((pool) => pool.fee).reverse()
        ),
        amountOut: trade.outputAmount.quotient.toString(),
        amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
        recipient: account,
        cometId: 0
      }

      if (outIsETH) {
        method = marginTraderContract.withdrawAndSwapExactOutToETH
        estimate = async () => await marginTraderContract.estimateGas.withdrawAndSwapExactOutToETH(args)
        contractCall = async (opts: any) => await marginTraderContract.withdrawAndSwapExactOutToETH(args, opts)
        return { args, method, estimate, call: contractCall }
      } else {
        method = marginTraderContract.withdrawAndSwapExactOut
        estimate = async () => await marginTraderContract.estimateGas.withdrawAndSwapExactOut(args)
        contractCall = async (opts: any) => await marginTraderContract.withdrawAndSwapExactOut(args, opts)
        return { args, method, estimate, call: contractCall }
      }
    }
  }

  // borrow related methods

  if (interaction === MarginTradeType.Borrow) {
    // this means that the lower value is provided, hence exact out
    if (tradeType === TradeType.EXACT_INPUT) {
      // note that the interest mode is already pre-defined if the user already has debt
      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address),
          v3Route.pools.map((pool) => pool.fee)
        ),
        amountIn: trade.inputAmount.quotient.toString(),
        amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
        recipient: account,
        cometId: 0
      }

      if (outIsETH) {
        method = marginTraderContract.borrowAndSwapExactInToETH
        estimate = async () => await marginTraderContract.estimateGas.borrowAndSwapExactInToETH(args)
        contractCall = async (opts: any) => await marginTraderContract.borrowAndSwapExactInToETH(args, opts)
        return { args, method, estimate, call: contractCall }
      } else {
        method = marginTraderContract.borrowAndSwapExactIn
        estimate = async () => await marginTraderContract.estimateGas.borrowAndSwapExactIn(args)
        contractCall = async (opts: any) => await marginTraderContract.borrowAndSwapExactIn(args, opts)
        return { args, method, estimate, call: contractCall }
      }
    } else {
      // users only have one type, the interest mode should not matter here
      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address).reverse(),
          v3Route.pools.map((pool) => pool.fee).reverse()
        ),
        amountOut: trade.outputAmount.quotient.toString(),
        amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
        cometId: 0
      }

      if (outIsETH) {
        method = marginTraderContract.borrowAndSwapExactOutToETH
        estimate = async () => await marginTraderContract.estimateGas.borrowAndSwapExactOutToETH(args)
        contractCall = async (opts: any) => await marginTraderContract.borrowAndSwapExactOutToETH(args, opts)
        return { args, method, estimate, call: contractCall }
      } else {
        method = marginTraderContract.borrowAndSwapExactOut
        estimate = async () => await marginTraderContract.estimateGas.borrowAndSwapExactOut(args)
        contractCall = async (opts: any) => await marginTraderContract.borrowAndSwapExactOut(args, opts)
        return { args, method, estimate, call: contractCall }
      }
    }
  }

  if (interaction === MarginTradeType.Repay) {
    // repay
    if (tradeType === TradeType.EXACT_INPUT) {
      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address),
          v3Route.pools.map((pool) => pool.fee)
        ),
        amountIn: trade.inputAmount.quotient.toString(),
        amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString,
        cometId: 0
      }
      if (inIsETH) {
        method = marginTraderContract.swapETHAndRepayExactIn
        estimate = async () => await marginTraderContract.estimateGas.swapETHAndRepayExactIn(args)
        contractCall = async (opts: any) =>
          await marginTraderContract.swapETHAndRepayExactIn(args, { value: args.amountIn, ...opts })
        return { args, method, estimate, call: contractCall }
      } else {
        method = marginTraderContract.swapAndRepayExactIn
        estimate = async () => await marginTraderContract.estimateGas.swapAndRepayExactIn(args)
        contractCall = async (opts: any) => await marginTraderContract.swapAndRepayExactIn(args, opts)
        return { args, method, estimate, call: contractCall }
      }
    } else { // exact output
      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address).reverse(),
          v3Route.pools.map((pool) => pool.fee).reverse()
        ),
        amountOut: trade.outputAmount.quotient.toString(),
        recipient: account,
        amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
        cometId: 0
      }

      if (inIsETH) {
        if (isMax) {
          method = marginTraderContract.swapETHAndRepayAllOut
          estimate = async () => await marginTraderContract.estimateGas.swapETHAndRepayAllOut(args)
          contractCall = async (opts: any) => await marginTraderContract.swapETHAndRepayAllOut(args, { value: args.amountInMaximum, ...opts })
          return { args, method, estimate, call: contractCall }
        } else {
          method = marginTraderContract.swapETHAndRepayExactOut
          estimate = async () => await marginTraderContract.estimateGas.swapETHAndRepayExactOut(args)
          contractCall = async (opts: any) => await marginTraderContract.swapETHAndRepayExactOut(args, { value: args.amountInMaximum, ...opts })
          return { args, method, estimate, call: contractCall }
        }
      } else {
        if (isMax) {
          method = marginTraderContract.swapAndRepayAllOut
          estimate = async () => await marginTraderContract.estimateGas.swapAndRepayAllOut(args)
          contractCall = async (opts: any) => await marginTraderContract.swapAndRepayAllOut(args, opts)
          return { args, method, estimate, call: contractCall }
        } else {
          method = marginTraderContract.swapAndRepayExactOut
          estimate = async () => await marginTraderContract.estimateGas.swapAndRepayExactOut(args)
          contractCall = async (opts: any) => await marginTraderContract.swapAndRepayExactOut(args, opts)
          return { args, method, estimate, call: contractCall }
        }
      }
    }
  }

  return { args, method, estimate, call: contractCall }
}

export interface BaseCalls {
  enterMarkets?: ContractCall | undefined
  approveUnderlyings?: ContractCall | undefined
}

export const createBaseCalls = (chainId: number, marginTraderContract: Contract) => {
  return {
    enterMarkets: async () =>
      await marginTraderContract.enterMarkets(Object.values(getCompoundCTokens(chainId, compoundAssets))),
    approveUnderlyings: async () =>
      await marginTraderContract.approveUnderlyings(Object.values(getCompoundTokens(chainId)).map((t) => t.address)),
  }
}

export const createDirectMoneyMarketCalldataComet = (
  marginTraderContract: Comet & CometMoneyMarket,
  interaction: MarginTradeType,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  isEth: boolean,
  outIsEth: boolean,
  account?: string,
  outAddress?: string,
  isMax?: boolean
): ContractCallDataWithOptions => {
  let args: any = {}
  let method: any
  let estimate: any
  let contractCall: ContractCallWithOptions | undefined = undefined
  if (!account || !parsedAmount || !outAddress)
    return {
      args: {},
      method: undefined,
      estimate: undefined,
    }

  const recipient = account

  const amount = parsedAmount?.quotient.toString()
  const underlying = (parsedAmount.currency as Token).address ?? outAddress
  // simple mint / supply
  if (interaction === MarginTradeType.Supply) {
    args = [
      underlying, //  underlying, redundant
      amount,
    ]

    if (isEth) {
      // ETH TO WETH
      method = marginTraderContract.wrapAndSupply
      estimate = async () => await marginTraderContract.estimateGas.wrapAndSupply(0, { value: amount })
      contractCall = async (opts: any) => await marginTraderContract.wrapAndSupply(0, { value: amount, ...opts })
      return { args, method, estimate, call: contractCall }

    }
    // ERC20 to ERC20
    else {
      method = marginTraderContract.supply
      estimate = async () => await marginTraderContract.estimateGas.supply(underlying, amount)
      contractCall = async (opts: any) => await marginTraderContract.supply(underlying, amount, opts)
      return { args, method, estimate, call: contractCall }
    }
  }

  if (interaction === MarginTradeType.Withdraw) {
    // withdraw
    args = [
      underlying, //  underlying, redundant
      amount,
    ]
    if (isEth) {
      if (isMax) {
        estimate = async () => await marginTraderContract.estimateGas.withdrawAndUnwrap(ethers.constants.MaxUint256, recipient, 0)
        method = marginTraderContract.withdrawAndUnwrap
        contractCall = async (opts: any) => await marginTraderContract.withdrawAndUnwrap(ethers.constants.MaxUint256, recipient, 0, opts)
        return { args, method, estimate, call: contractCall }
      } else {
        estimate = async () => await marginTraderContract.estimateGas.withdrawAndUnwrap(amount, recipient, 0)
        method = marginTraderContract.withdrawAndUnwrap
        contractCall = async (opts: any) => await marginTraderContract.withdrawAndUnwrap(amount, recipient, 0, opts)
        return { args, method, estimate, call: contractCall }
      }

    } else {
      if (isMax) {
        estimate = async () => await marginTraderContract.estimateGas.withdrawTo(recipient, underlying, ethers.constants.MaxUint256)
        method = marginTraderContract.withdrawTo
        contractCall = async (opts: any) => await marginTraderContract.withdrawTo(recipient, underlying, ethers.constants.MaxUint256, opts)
        return { args, method, estimate, call: contractCall }
      } else {
        estimate = async () => await marginTraderContract.estimateGas.withdrawTo(recipient, underlying, amount)
        method = marginTraderContract.withdrawTo
        contractCall = async (opts: any) => await marginTraderContract.withdrawTo(recipient, underlying, amount, opts)
        return { args, method, estimate, call: contractCall }
      }
    }
  }

  // borrow related methods
  if (interaction === MarginTradeType.Borrow) {
    // simple borrow to wallet
    args = [
      underlying, //  underlying, redundant
      amount,
    ]

    if (isEth) {
      if (!outIsEth) {
        if (isMax) {
          estimate = async () => await marginTraderContract.estimateGas.withdrawAndUnwrap(ethers.constants.MaxUint256, recipient, 0)
          method = marginTraderContract.withdrawAndUnwrap
          contractCall = async (opts: any) => await marginTraderContract.withdrawAndUnwrap(ethers.constants.MaxUint256, recipient, 0, opts)
          return { args, method, estimate, call: contractCall }
        } else {
          estimate = async () => await marginTraderContract.estimateGas.withdrawAndUnwrap(ethers.constants.MaxUint256, recipient, 0)
          method = marginTraderContract.withdrawAndUnwrap
          contractCall = async (opts: any) => await marginTraderContract.withdrawAndUnwrap(ethers.constants.MaxUint256, recipient, 0, opts)
          return { args, method, estimate, call: contractCall }
        }
      } else {
        if (isMax) {
          estimate = async () => await marginTraderContract.estimateGas.withdrawTo(recipient, underlying, ethers.constants.MaxUint256)
          method = marginTraderContract.withdrawTo
          contractCall = async (opts: any) => await marginTraderContract.withdrawTo(recipient, underlying, ethers.constants.MaxUint256, opts)
          return { args, method, estimate, call: contractCall }
        } else {
          estimate = async () => await marginTraderContract.estimateGas.withdrawTo(recipient, underlying, amount)
          method = marginTraderContract.withdrawTo
          contractCall = async (opts: any) => await marginTraderContract.withdrawTo(recipient, underlying, amount, opts)
          return { args, method, estimate, call: contractCall }
        }
      }
    } else {
      estimate = async () => await marginTraderContract.estimateGas.withdrawTo(recipient, underlying, amount)
      method = marginTraderContract.withdrawTo
      contractCall = async (opts: any) => await marginTraderContract.withdrawTo(recipient, underlying, amount, opts)
      return { args, method, estimate, call: contractCall }
    }
  }

  if (interaction === MarginTradeType.Repay) {
    // repay
    args = [
      underlying, //  underlying, redundant
      amount,
    ]

    if (isEth) {
      if (!outIsEth) {
        method = marginTraderContract.supply
        estimate = async () => await marginTraderContract.estimateGas.supply(underlying, amount)
        contractCall = async (opts: any) => await marginTraderContract.supply(underlying, amount, opts)
        return { args, method, estimate, call: contractCall }
      }
      // ETH TO WETH
      else {
        method = marginTraderContract.wrapAndSupply
        estimate = async () => await marginTraderContract.estimateGas.wrapAndSupply(0, { value: amount })
        contractCall = async (opts: any) => await marginTraderContract.wrapAndSupply(0, { value: amount, ...opts })
        return { args, method, estimate, call: contractCall }
      }
    } else {
      if (isMax) {
        method = marginTraderContract.supply
        estimate = async () => await marginTraderContract.estimateGas.supply(underlying, ethers.constants.MaxUint256)
        contractCall = async (opts: any) => await marginTraderContract.supply(underlying, ethers.constants.MaxUint256, opts)
        return { args, method, estimate, call: contractCall }
      } else {
        method = marginTraderContract.supply
        estimate = async () => await marginTraderContract.estimateGas.supply(underlying, amount)
        contractCall = async (opts: any) => await marginTraderContract.supply(underlying, amount, opts)
        return { args, method, estimate, call: contractCall }
      }
    }
  }

  return { args, method, estimate, call: contractCall }
}
