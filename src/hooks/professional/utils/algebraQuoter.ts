import { Interface } from '@ethersproject/abi'
import { BigintIsh, Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import IQuoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import IQuoterV2 from '@uniswap/swap-router-contracts/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
import invariant from 'tiny-invariant'
import { Pool, Route, toHex } from '@uniswap/v3-sdk'
import { pack } from '@ethersproject/solidity'
import AlgebraQuoterABI from 'abis/algebra/AlgebraQuoter.json'
import { ethers } from 'ethers'
import { reverse } from 'dns'


/**
 * Converts a route to a hex encoded path
 * @param route the v3 path to convert to an encoded path
 * @param exactOutput whether the route should be encoded in reverse, for making exact output swaps
 */
export function encodeRouteToPath(route: Route<Currency, Currency>, exactOutput: boolean): string {
  const firstInputToken: Token = route.input.wrapped

  const { path, types } = route.pools.reduce(
    (
      { inputToken, path, types }: { inputToken: Token; path: (string | number)[]; types: string[] },
      pool: Pool,
      index
    ): { inputToken: Token; path: (string | number)[]; types: string[] } => {
      const outputToken: Token = pool.token0.equals(inputToken) ? pool.token1 : pool.token0
      if (index === 0) {
        return {
          inputToken: outputToken,
          types: ['address', 'address'],
          path: [inputToken.address, outputToken.address]
        }
      } else {
        return {
          inputToken: outputToken,
          types: [...types, 'address'],
          path: [...path, outputToken.address]
        }
      }
    },
    { inputToken: firstInputToken, path: [], types: [] }
  )

  return exactOutput ? pack(types.reverse(), path.reverse()) : pack(types, path)
}

/**
 * Generated method parameters for executing a call.
 */
export interface MethodParameters {
  /**
   * The hex encoded calldata to perform the given operation
   */
  calldata: string
  /**
   * The amount of ether (wei) to send in hex.
   */
  value: string
}


export function encodePath(path: string[]): string {
  let encoded = '0x'
  for (let i = 0; i < path.length; i++) {
    // 20 byte encoding of the address
    encoded += path[i].slice(2)
  }

  return encoded.toLowerCase()
}


/**
 * Optional arguments to send to the quoter.
 */
export interface QuoteOptions {
  /**
   * The optional price limit for the trade.
   */
  sqrtPriceLimitX96?: BigintIsh

  /**
   * The optional quoter interface to use
   */
  useQuoterV2?: boolean
}

interface BaseQuoteParams {
  sqrtPriceLimitX96: string
  tokenIn: string
  tokenOut: string
}

/**
 * Represents the Uniswap V3 QuoterV1 contract with a method for returning the formatted
 * calldata needed to call the quoter contract.
 */
export abstract class AlgebraSwapQuoter {
  public static V1INTERFACE: Interface = new Interface(IQuoter.abi)
  public static V2INTERFACE: Interface = new Interface(IQuoterV2.abi)

  /**
   * Produces the on-chain method name of the appropriate function within QuoterV2,
   * and the relevant hex encoded parameters.
   * @template TInput The input token, either Ether or an ERC-20
   * @template TOutput The output token, either Ether or an ERC-20
   * @param route The swap route, a list of pools through which a swap can occur
   * @param amount The amount of the quote, either an amount in, or an amount out
   * @param tradeType The trade type, either exact input or exact output
   * @param options The optional params including price limit and Quoter contract switch
   * @returns The formatted calldata
   */
  public static quoteCallParameters<TInput extends Currency, TOutput extends Currency>(
    route: Route<TInput, TOutput>,
    amount: CurrencyAmount<TInput | TOutput>,
    tradeType: TradeType,
    options: QuoteOptions = {}
  ): MethodParameters {
    const singleHop = route.pools.length === 1
    const quoteAmount: string = toHex(amount.quotient)
    let calldata: string
    const swapInterface: Interface = options.useQuoterV2 ? new ethers.utils.Interface(AlgebraQuoterABI) : new ethers.utils.Interface(AlgebraQuoterABI)

    if (singleHop) {
      const baseQuoteParams: BaseQuoteParams = {
        tokenIn: route.tokenPath[0].address,
        tokenOut: route.tokenPath[1].address,
        sqrtPriceLimitX96: toHex(options?.sqrtPriceLimitX96 ?? 0)
      }

      const v2QuoteParams = {
        ...baseQuoteParams,
        ...(tradeType == TradeType.EXACT_INPUT ? { amountIn: quoteAmount } : { amount: quoteAmount })
      }

      const v1QuoteParams = [
        baseQuoteParams.tokenIn,
        baseQuoteParams.tokenOut,
        quoteAmount,
        baseQuoteParams.sqrtPriceLimitX96
      ]

      const tradeTypeFunctionName =
        tradeType === TradeType.EXACT_INPUT ? 'quoteExactInputSingle' : 'quoteExactOutputSingle'
      calldata = swapInterface.encodeFunctionData(
        tradeTypeFunctionName,
        options.useQuoterV2 ? [v2QuoteParams] : v1QuoteParams
      )
    } else {
      invariant(options?.sqrtPriceLimitX96 === undefined, 'MULTIHOP_PRICE_LIMIT')
      const path: string = tradeType === TradeType.EXACT_INPUT ? encodePath(route.tokenPath.map(t => t.address))
        : encodePath(route.tokenPath.map(t => t.address).reverse())
      const tradeTypeFunctionName = tradeType === TradeType.EXACT_INPUT ? 'quoteExactInput' : 'quoteExactOutput'
      calldata = swapInterface.encodeFunctionData(tradeTypeFunctionName, [path, quoteAmount])
    }
    return {
      calldata,
      value: toHex(0)
    }
  }
}
