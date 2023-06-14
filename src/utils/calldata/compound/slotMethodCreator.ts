import { RouteV3 } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { DeltaSlot, SlotFactory } from 'abis/types'
import { ethers } from 'ethers'
import { ContractCallDataWithOptions, ContractCallWithOptions, UniswapTrade } from '../../Types'
import { TradeAction } from 'pages/Trading'

const typeSliceSimple = ['address', 'uint8',]

export function encodeAlgebraPathEthersSimple(path: string[], flags: number[], flag: number): string {
  if (path.length != flags.length + 1) {
    throw new Error('path/fee lengths do not match')
  }
  let types: string[] = []
  let data: string[] = []
  for (let i = 0; i < flags.length; i++) {
    const p = path[i]
    types = [...types, ...typeSliceSimple]
    data = [...data, p, String(flags[i])]
  }
  // add last address and flag
  types.push('address')
  types.push('uint8')
  data.push(path[path.length - 1])
  data.push(String(flag))
  // console.log(data)
  // console.log(types)
  return ethers.utils.solidityPack(types, data)
}

export function encodeAddress(path: string): string {
  return ethers.utils.solidityPack(['address'], [path])
}

export const createSlotFactoryCalldata = (
  inIsNative: boolean,
  action: TradeAction,
  parsedAmountIn: CurrencyAmount<Currency> | undefined,
  tradeIn: UniswapTrade | undefined,
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  slotFactoryContract: SlotFactory,
  account?: string,
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

  const v3RouteIn = tradeIn?.routes[0] as RouteV3<Currency, Currency>

  if (action === TradeAction.OPEN) {
    // console.log("params pathIn", v3RouteIn.path.map((p) => p.address), new Array(v3RouteIn.path.length - 1).fill(3), 0)
    const pathIn = tradeIn ?
      encodeAlgebraPathEthersSimple(v3RouteIn.path.map((p) => p.address), new Array(v3RouteIn.path.length - 1).fill(3), 0) :
      parsedAmountIn ? encodeAddress(parsedAmountIn.currency.wrapped.address) :
        '0x' // - should fail
    // console.log("params path amrgin", v3Route.path.map((p) => p.address), v3Route.path.length === 1 ? [0] : [0, ...new Array(v3Route.path.length - 2).fill(3)], 0)
    const pathMargin = trade ?
      encodeAlgebraPathEthersSimple(v3Route.path.map((p) => p.address), v3Route.path.length === 1 ? [0] : [0, ...new Array(v3Route.path.length - 2).fill(3)], 0) :
      '0x' // - should fail


    // console.log("PathIn", pathIn)
    // console.log("pathMargin", pathMargin)

    args = {
      amountDeposited: tradeIn ? tradeIn.inputAmount.quotient.toString() : parsedAmountIn?.quotient.toString(),
      minimumAmountDeposited: tradeIn?.minimumAmountOut(allowedSlippage).quotient.toString() ?? '0',
      borrowAmount: trade.inputAmount.quotient.toString(),
      minimumMarginReceived: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
      // path to deposit - can be empty if depo ccy = collateral
      swapPath: pathIn,
      // path for margin trade
      marginPath: pathMargin
    }
    // console.log("ARGS", args)
    method = undefined // slotFactoryContract.createSlot(args)
    if (inIsNative) {
      estimate = async () => await slotFactoryContract.estimateGas.createSlot(args, { value: args.amountDeposited })
      contractCall = async (opts: any) => await slotFactoryContract.createSlot(args, { ...opts, value: args.amountDeposited })
    } else {

      estimate = async () => await slotFactoryContract.estimateGas.createSlot(args)
      contractCall = async (opts: any) => await slotFactoryContract.createSlot(args, opts)
    }
  } else {

  }
  return { args, method, estimate, call: contractCall }
}



export const createSlotCalldata = (
  action: TradeAction,
  amountToRepay: CurrencyAmount<Currency> | undefined,
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  slotContract: DeltaSlot,
  account?: string,
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


  if (action === TradeAction.CLOSE) {

    const amountRepay = 0 // repay all
    const pathMargin = trade ?
      encodeAlgebraPathEthersSimple(v3Route.path.map((p) => p.address).reverse(), v3Route.path.length === 1 ? [0] : [1, ...new Array(v3Route.path.length - 2).fill(1)], 0) :
      '0x' // - should fail

    const maxIn = trade.maximumAmountIn(allowedSlippage).quotient.toString()
    method = undefined
    estimate = async () => await slotContract.estimateGas.close(amountRepay, maxIn, pathMargin)
    contractCall = async (opts: any) => await slotContract.close(amountRepay, maxIn, pathMargin, opts)
    args = {
      amountRepay, maxIn, pathMargin
    }
  } else {

  }
  return { args, method, estimate, call: contractCall }
}
