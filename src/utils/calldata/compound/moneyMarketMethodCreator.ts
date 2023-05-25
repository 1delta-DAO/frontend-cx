import { RouteV3 } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { MoneyMarket, Sweeper } from 'abis/types'
import { BigNumber, Contract } from 'ethers'
import { getCompoundCTokens } from 'hooks/1delta/addressesCompound'
import { getCompoundTokens } from 'hooks/1delta/tokens'
import { compoundAssets, encodePath, MarginTradeType, PositionSides } from 'types/1delta'
import { ContractCall, ContractCallDataWithOptions, ContractCallWithOptions, UniswapTrade } from '../../Types'

export const createAccountMoneyMarketCalldataCompound = (
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  marginTraderContract: MoneyMarket & Sweeper,
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

  switch (interaction) {

    case MarginTradeType.Supply: {
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

    case MarginTradeType.Withdraw: {
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

    case MarginTradeType.Borrow: {
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
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString()
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

    case MarginTradeType.Repay: {
      // repay
      if (tradeType === TradeType.EXACT_INPUT) {
        args = {
          path: encodePath(
            v3Route.path.map((p) => p.address),
            v3Route.pools.map((pool) => pool.fee)
          ),
          amountIn: trade.inputAmount.quotient.toString(),
          amountOutMinimum: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
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
          amountInMaximum: trade.maximumAmountIn(allowedSlippage).quotient.toString()
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

export const createDirectAccountMoneyMarketCalldata = (
  marginTraderContract: MoneyMarket & Sweeper,
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
  const underlying = (parsedAmount.currency as Token).address

  switch (interaction) {
    // simple mint / supply
    case MarginTradeType.Supply: {
      args = [
        underlying, //  underlying, redundant
        amount,
      ]

      // ether supply interactions
      if (isEth) {
        // supply WETH to ETH
        if (!outIsEth) {
          method = marginTraderContract.unwrapAndMintEther
          estimate = async () => await marginTraderContract.estimateGas.unwrapAndMintEther(amount)
          contractCall = async (opts: any) => await marginTraderContract.unwrapAndMintEther(amount, opts)
          return { args, method, estimate, call: contractCall }
        }
        // supply ETH
        else {
          method = marginTraderContract.mintEther
          estimate = async () => await marginTraderContract.estimateGas.mintEther({ value: amount })
          contractCall = async (opts: any) => await marginTraderContract.mintEther({ value: amount, ...opts })
          return { args, method, estimate, call: contractCall }
        }
      }
      // non-ether supply
      else {
        method = marginTraderContract.mint
        estimate = async () => await marginTraderContract.estimateGas.mint(underlying, amount)
        contractCall = async (opts: any) => await marginTraderContract.mint(underlying, amount, opts)
        return { args, method, estimate, call: contractCall }
      }
    }

    case MarginTradeType.Withdraw: {
      // withdraw
      args = [
        underlying, //  underlying, redundant
        amount,
      ]
      // ETH withdrawals
      if (isEth) {
        // wallet asset is WETH
        if (!outIsEth) {
          // max withdrawal sepeatate
          if (isMax) {
            estimate = async () => await marginTraderContract.estimateGas.redeemAllEtherAndWrap(recipient)
            method = marginTraderContract.redeemAllEtherAndWrap
            contractCall = async (opts: any) => await marginTraderContract.redeemAllEtherAndWrap(recipient, opts)
            return { args, method, estimate, call: contractCall }
          } else {
            estimate = async () => await marginTraderContract.estimateGas.redeemUnderlyingEtherAndWrap(recipient, amount)
            method = marginTraderContract.redeemUnderlyingEtherAndWrap
            contractCall = async (opts: any) => await marginTraderContract.redeemUnderlyingEtherAndWrap(recipient, amount, opts)
            return { args, method, estimate, call: contractCall }
          }
        }
        // wallet asset is ETH
        else {
          // max withdrawal sepeatate
          if (isMax) {
            estimate = async () => await marginTraderContract.estimateGas.redeemAllEther(recipient)
            method = marginTraderContract.redeemAllEther
            contractCall = async (opts: any) => await marginTraderContract.redeemAllEther(recipient, opts)
            return { args, method, estimate, call: contractCall }
          } else {
            estimate = async () => await marginTraderContract.estimateGas.redeemUnderlyingEther(recipient, amount)
            method = marginTraderContract.redeemUnderlyingEther
            contractCall = async (opts: any) => await marginTraderContract.redeemUnderlyingEther(recipient, amount, opts)
            return { args, method, estimate, call: contractCall }
          }
        }
      }
      // erc20 withdrawal
      else {
        // max withdrawal sepeatate
        if (isMax) {
          estimate = async () => await marginTraderContract.estimateGas.redeemAll(underlying, recipient)
          method = marginTraderContract.redeemAll
          contractCall = async (opts: any) => await marginTraderContract.redeemAll(underlying, recipient, opts)
          return { args, method, estimate, call: contractCall }
        } else {
          estimate = async () => await marginTraderContract.estimateGas.redeemUnderlying(underlying, recipient, amount)
          method = marginTraderContract.redeemUnderlying
          contractCall = async (opts: any) => await marginTraderContract.redeemUnderlying(underlying, recipient, amount, opts)
          return { args, method, estimate, call: contractCall }
        }
      }
    }

    // borrow related methods
    case MarginTradeType.Borrow: {
      // simple borrow to wallet
      args = [
        underlying, //  underlying, redundant
        amount,
      ]
      // ETH borrows
      if (isEth) {
        // user has WETH selected
        if (!outIsEth) {
          method = marginTraderContract.borrowEtherAndWrap
          estimate = async () => await marginTraderContract.estimateGas.borrowEtherAndWrap(recipient, amount)
          contractCall = async (opts: any) => await marginTraderContract.borrowEtherAndWrap(recipient, amount, opts)
          return { args, method, estimate, call: contractCall }
        }
        // user directly borrows ETH
        else {
          method = marginTraderContract.borrowEther
          estimate = async () => await marginTraderContract.estimateGas.borrowEther(recipient, amount)
          contractCall = async (opts: any) => await marginTraderContract.borrowEther(recipient, amount, opts)
          return { args, method, estimate, call: contractCall }
        }
      }
      // user borrows erc20
      else {
        method = marginTraderContract.borrow
        estimate = async () => await marginTraderContract.estimateGas.borrow(underlying, recipient, amount)
        contractCall = async (opts: any) => await marginTraderContract.borrow(underlying, recipient, amount, opts)
        return { args, method, estimate, call: contractCall }
      }
    }
    // Repay transactions
    case MarginTradeType.Repay: {
      // repay
      args = [
        underlying, //  underlying, redundant
        amount,
      ]

      // ether repays
      if (isEth) {
        // user holds WETH
        if (!outIsEth) {
          // max repay sepeatate
          if (isMax) {
            method = marginTraderContract.unwrapAndRepayBorrowAllEther
            estimate = async () => await marginTraderContract.estimateGas.unwrapAndRepayBorrowAllEther()
            contractCall = async (opts: any) => await marginTraderContract.unwrapAndRepayBorrowAllEther(opts)
            return { args, method, estimate, call: contractCall }
          }
          // unwrap and repay ETH
          else {
            method = marginTraderContract.unwrapAndRepayBorrowEther
            estimate = async () => await marginTraderContract.estimateGas.unwrapAndRepayBorrowEther(amount)
            contractCall = async (opts: any) => await marginTraderContract.unwrapAndRepayBorrowEther(amount, opts)
            return { args, method, estimate, call: contractCall }
          }
        }
        // user holds ETH
        else {
          // max withdrawal sepeatate
          if (isMax) {
            method = marginTraderContract.repayBorrowAllEther
            estimate = async () => await marginTraderContract.estimateGas.repayBorrowAllEther({ value: BigNumber.from(amount).mul(10001).div(10000) })
            contractCall = async (opts: any) => await marginTraderContract.repayBorrowAllEther({ value: BigNumber.from(amount).mul(10001).div(10000), ...opts })
            return { args, method, estimate, call: contractCall }
          } else {
            method = marginTraderContract.repayBorrowEther
            estimate = async () => await marginTraderContract.estimateGas.repayBorrowEther({ value: amount })
            contractCall = async (opts: any) => await marginTraderContract.repayBorrowEther({ value: amount, ...opts })
            return { args, method, estimate, call: contractCall }
          }
        }
      }
      // erc20 repayment
      else {
        // max withdrawal sepeatate
        if (isMax) {
          method = marginTraderContract.repayBorrowAll
          estimate = async () => await marginTraderContract.estimateGas.repayBorrowAll(underlying)
          contractCall = async (opts: any) => await marginTraderContract.repayBorrowAll(underlying, opts)
          return { args, method, estimate, call: contractCall }
        } else {
          method = marginTraderContract.repayBorrow
          estimate = async () => await marginTraderContract.estimateGas.repayBorrow(underlying, amount)
          contractCall = async (opts: any) => await marginTraderContract.repayBorrow(underlying, amount, opts)
          return { args, method, estimate, call: contractCall }
        }
      }
    }
  }

  return { args, method, estimate, call: contractCall }
}