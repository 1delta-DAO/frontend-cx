import { RouteV3 } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { BigNumber, Contract, ethers } from 'ethers'
import { AAVEPoolV3, AaveMoneyMarket, AaveSweeper } from 'abis/types'
import { getCompoundCTokens } from 'hooks/1delta/addressesCompound'
import { getCompoundTokens } from 'hooks/1delta/tokens'
import { AaveInterestMode, compoundAssets, encodePath, MarginTradeType, PositionSides } from 'types/1delta'
import { ContractCall, ContractCallDataWithOptions, ContractCallWithOptions, UniswapTrade } from '../../Types'

export const createMoneyMarketDirectCalldata = (
  marginTraderContract: AaveMoneyMarket & AAVEPoolV3 & Contract,
  interaction: MarginTradeType,
  userInterestMode: AaveInterestMode,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  account?: string,
  outAddress?: string,
  isEth?: boolean,
  isMax?: boolean
): ContractCallDataWithOptions => {
  let args: any = {}
  let method: any
  let estimate: any
  let contractCall: ContractCallWithOptions | undefined = undefined

  if (!account)
    return {
      args: {},
      method: undefined,
      estimate: undefined,
    }

  const amount = parsedAmount?.quotient.toString()
  const underlying = (parsedAmount?.currency as Token)?.address ?? outAddress

  if (!underlying || !amount)
    return {
      args: {},
      method: undefined,
      estimate: undefined,
    }

  if (interaction === MarginTradeType.Supply) {
    args = [underlying, amount, account, 0]
    // ETH methods using broker
    if (isEth) {
      method = marginTraderContract.wrapAndSupply
      estimate = async () => await marginTraderContract.estimateGas.wrapAndSupply({ value: amount })
      contractCall = async (opts: any) => await marginTraderContract.wrapAndSupply({ value: amount, ...opts })
      return { args, method, estimate, call: contractCall }
    } else {
      method = marginTraderContract.supply
      estimate = async () => await marginTraderContract.estimateGas.supply(underlying, amount, account, 0)
      contractCall = async (opts: any) => await marginTraderContract.supply(underlying, amount, account, 0, opts)
      return { args, method, estimate, call: contractCall }
    }
  }

  if (interaction === MarginTradeType.Withdraw) {
    // ETH methods using broker contract
    if (isEth) {
      if (isMax) {
        args = [underlying, amount, account]
        method = marginTraderContract.withdrawAllAndUnwrap
        estimate = async () => await marginTraderContract.estimateGas.withdrawAllAndUnwrap(account)
        contractCall = async (opts: any) => await marginTraderContract.withdrawAllAndUnwrap(account, opts)
        return { args, method, estimate, call: contractCall }
      } else {
        args = [underlying, amount, account]
        method = marginTraderContract.withdrawAndUnwrap
        estimate = async () => await marginTraderContract.estimateGas.withdrawAndUnwrap(amount, account)
        contractCall = async (opts: any) => await marginTraderContract.withdrawAndUnwrap(amount, account, opts)
        return { args, method, estimate, call: contractCall }
      }
    }
    else {
      if (isMax) {
        method = marginTraderContract.withdraw
        estimate = async () => await marginTraderContract.estimateGas.withdraw(underlying, ethers.constants.MaxUint256, account)
        contractCall = async (opts: any) => await marginTraderContract.withdraw(underlying, ethers.constants.MaxUint256, account, opts)
        return { args, method, estimate, call: contractCall }
      } else {
        args = [underlying, amount, account]
        method = marginTraderContract.withdraw
        estimate = async () => await marginTraderContract.estimateGas.withdraw(underlying, amount, account)
        contractCall = async (opts: any) => await marginTraderContract.withdraw(underlying, amount, account, opts)
        return { args, method, estimate, call: contractCall }
      }
    }
  }

  // borrow related methods

  if (interaction === MarginTradeType.Borrow) {
    // users only have one type, the interest mode should not matter here
    const interestRateMode = userInterestMode
    // borrow and unwrap WETH to ETH
    if (isEth) {
      if (isMax) {
        args = [underlying, amount, interestRateMode, 0, account]
        method = marginTraderContract.borrowAndUnwrap
        estimate = async () => await marginTraderContract.estimateGas.borrowAndUnwrap(amount, account, interestRateMode)
        contractCall = async (opts: any) => await marginTraderContract.borrowAndUnwrap(amount, account, interestRateMode, opts)
        return { args, method, estimate, call: contractCall }
      } else {
        args = [underlying, amount, interestRateMode, 0, account]
        method = marginTraderContract.borrowAndUnwrap
        estimate = async () => await marginTraderContract.estimateGas.borrowAndUnwrap(amount, account, interestRateMode)
        contractCall = async (opts: any) => await marginTraderContract.borrowAndUnwrap(amount, account, interestRateMode, opts)
        return { args, method, estimate, call: contractCall }
      }
    }
    else {
      args = [underlying, amount, interestRateMode, 0, account]
      method = marginTraderContract.borrow
      estimate = async () => await marginTraderContract.estimateGas.borrow(underlying, amount, interestRateMode, 0, account)
      contractCall = async (opts: any) => await marginTraderContract.borrow(underlying, amount, interestRateMode, 0, account, opts)
      return { args, method, estimate, call: contractCall }
    }
  }

  if (interaction === MarginTradeType.Repay) {
    // repay
    const interestRateMode = userInterestMode
    if (isEth) {
      if (isMax) {
        // 1bp safety margin
        const optAmount = BigNumber.from(amount).mul(10001).div(10000)
        args = [underlying, amount, interestRateMode, account]
        method = marginTraderContract.wrapAndRepay
        estimate = async () => await marginTraderContract.estimateGas.wrapAndRepayAll(interestRateMode, { value: optAmount })
        contractCall = async (opts: any) => await marginTraderContract.wrapAndRepayAll(interestRateMode, { value: optAmount, ...opts })
        return { args, method, estimate, call: contractCall }
      } else {
        args = [underlying, amount, interestRateMode, account]
        method = marginTraderContract.wrapAndRepay
        estimate = async () => await marginTraderContract.estimateGas.wrapAndRepay(interestRateMode, { value: amount })
        contractCall = async (opts: any) => await marginTraderContract.wrapAndRepay(interestRateMode, { value: amount, ...opts })
        return { args, method, estimate, call: contractCall }
      }
    } else {
      args = [underlying, amount, interestRateMode, account]
      method = marginTraderContract.repay
      estimate = async () => await marginTraderContract.estimateGas.repay(underlying, isMax ? ethers.constants.MaxUint256 : amount, interestRateMode, account)
      contractCall = async (opts: any) => await marginTraderContract.repay(underlying, isMax ? ethers.constants.MaxUint256 : amount, interestRateMode, account, opts)
      return { args, method, estimate, call: contractCall }
    }
  }

  return { args, method, estimate, call: contractCall }
}

// new calldata using trade as input

export const createAaveMoneyMarketCalldata = (
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  marginTraderContract: AaveMoneyMarket & AaveSweeper,
  borrowInterestMode: AaveInterestMode,
  interaction: MarginTradeType,
  inIsETH: boolean,
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
        amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString()
      }

      if (inIsETH) {
        method = marginTraderContract.swapETHAndSupplyExactIn
        estimate = async () => await marginTraderContract.estimateGas.swapETHAndSupplyExactIn(args, { value: args.amountIn })
        contractCall = async (opts: any) => await marginTraderContract.swapETHAndSupplyExactIn(args, { value: args.amountIn, ...opts })
      } else {
        method = marginTraderContract.swapAndSupplyExactIn
        estimate = async () => await marginTraderContract.estimateGas.swapAndSupplyExactIn(args)
        contractCall = async (opts: any) => await marginTraderContract.swapAndSupplyExactIn(args, opts)
      }
    } else {

      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address).reverse(),
          v3Route.pools.map((pool) => pool.fee).reverse()
        ),
        amountOut: trade.outputAmount.quotient.toString(),
        amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
      }

      if (inIsETH) {
        method = marginTraderContract.swapETHAndSupplyExactOut
        estimate = async () => await marginTraderContract.estimateGas.swapETHAndSupplyExactOut(args, { value: args.amountInMaximum })
        contractCall = async (opts: any) => await marginTraderContract.swapETHAndSupplyExactOut(args, { value: args.amountInMaximum, ...opts })
      } else {
        method = marginTraderContract.swapAndSupplyExactOut
        estimate = async () => await marginTraderContract.estimateGas.swapAndSupplyExactOut(args)
        contractCall = async (opts: any) => await marginTraderContract.swapAndSupplyExactOut(args, opts)
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
      }


      if (isMax) {
        method = marginTraderContract.withdrawAndSwapAllIn
        estimate = async () => await marginTraderContract.estimateGas.withdrawAndSwapAllIn(args)
        contractCall = async (opts: any) => await marginTraderContract.withdrawAndSwapAllIn(args, opts)
      } else {
        method = marginTraderContract.withdrawAndSwapExactIn
        estimate = async () => await marginTraderContract.estimateGas.withdrawAndSwapExactIn(args)
        contractCall = async (opts: any) => await marginTraderContract.withdrawAndSwapExactIn(args, opts)
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
      }

      method = marginTraderContract.withdrawAndSwapExactOut
      estimate = async () => await marginTraderContract.estimateGas.withdrawAndSwapExactOut(args)
      contractCall = async (opts: any) => await marginTraderContract.withdrawAndSwapExactOut(args, opts)

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
        interestRateMode: borrowInterestMode
      }


      method = marginTraderContract.borrowAndSwapExactIn
      estimate = async () => await marginTraderContract.estimateGas.borrowAndSwapExactIn(args)
      contractCall = async (opts: any) => await marginTraderContract.borrowAndSwapExactIn(args, opts)

    } else {
      // users only have one type, the interest mode should not matter here
      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address).reverse(),
          v3Route.pools.map((pool) => pool.fee).reverse()
        ),
        amountOut: trade.outputAmount.quotient.toString(),
        amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
        interestRateMode: borrowInterestMode
      }

      method = marginTraderContract.borrowAndSwapExactOut
      estimate = async () => await marginTraderContract.estimateGas.borrowAndSwapExactOut(args)
      contractCall = async (opts: any) => await marginTraderContract.borrowAndSwapExactOut(args, opts)

    }
  } else {
    // repay
    if (tradeType === TradeType.EXACT_INPUT) {
      args = {
        path: encodePath(
          v3Route.path.map((p) => p.address),
          v3Route.pools.map((pool) => pool.fee)
        ),
        amountIn: trade.inputAmount.quotient.toString(),
        amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
        interestRateMode: borrowInterestMode,
        recipient: account
      }
      if (inIsETH) {
        method = marginTraderContract.swapETHAndRepayExactIn
        estimate = async () => await marginTraderContract.estimateGas.swapETHAndRepayExactIn(args, { value: args.amountIn })
        contractCall = async (opts: any) =>
          await marginTraderContract.swapETHAndRepayExactIn(args, { value: args.amountIn, ...opts })
      } else {
        method = marginTraderContract.swapAndRepayExactIn
        estimate = async () => await marginTraderContract.estimateGas.swapAndRepayExactIn(args)
        contractCall = async (opts: any) => await marginTraderContract.swapAndRepayExactIn(args, opts)
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
        interestRateMode: borrowInterestMode
      }

      if (inIsETH) {
        if (isMax) {
          method = marginTraderContract.swapETHAndRepayAllOut
          estimate = async () => await marginTraderContract.estimateGas.swapETHAndRepayAllOut(args, { value: args.amountInMaximum })
          contractCall = async (opts: any) => await marginTraderContract.swapETHAndRepayAllOut(args, { value: args.amountInMaximum, ...opts })
        } else {
          method = marginTraderContract.swapETHAndRepayExactOut
          estimate = async () => await marginTraderContract.estimateGas.swapETHAndRepayExactOut(args, { value: args.amountInMaximum })
          contractCall = async (opts: any) => await marginTraderContract.swapETHAndRepayExactOut(args, { value: args.amountInMaximum, ...opts })
        }
      } else {
        args.interestRateMode = borrowInterestMode
        if (isMax) {
          method = marginTraderContract.swapAndRepayAllOut
          estimate = async () => await marginTraderContract.estimateGas.swapAndRepayAllOut(args)
          contractCall = async (opts: any) => await marginTraderContract.swapAndRepayAllOut(args, opts)
        } else {
          method = marginTraderContract.swapAndRepayExactOut
          estimate = async () => await marginTraderContract.estimateGas.swapAndRepayExactOut(args)
          contractCall = async (opts: any) => await marginTraderContract.swapAndRepayExactOut(args, opts)
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
