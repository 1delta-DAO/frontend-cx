import { RouteV3 } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { SlotFactory } from 'abis/types'
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

  return ethers.utils.solidityPack(types, data)
}


export function encodeAddress(path: string): string {
  return ethers.utils.solidityPack(['address'], [path])
}


export const createSlotCalldata = (
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
  const hasOnePool = v3Route.pools.length === 1

  if (action === TradeAction.OPEN) {
    const pathIn = tradeIn ?
      encodeAlgebraPathEthersSimple(v3RouteIn.path.map((p) => p.address), new Array(v3RouteIn.path.length - 1).fill(3), 0) :
      parsedAmountIn ? encodeAddress(parsedAmountIn.currency.wrapped.address) :
        '0x' // - should fail

    const pathMargin = tradeIn ?
      encodeAlgebraPathEthersSimple(v3Route.path.map((p) => p.address), v3Route.path.length === 1 ? [0] : [0, ...new Array(v3Route.path.length - 2).fill(3)], 0) :
      '0x' // - should fail

    args = {
      amountDeposited: tradeIn ? tradeIn.inputAmount.quotient.toString() : parsedAmountIn?.quotient.toString(),
      minimumAmountDeposited: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
      borrowAmount: trade.inputAmount.quotient.toString(),
      minimumMarginReceived: trade.minimumAmountOut(allowedSlippage),
      // path to deposit - can be empty if depo ccy = collateral
      swapPath: pathIn,
      // path for margin trade
      marginPath: pathMargin
    }

    method = slotFactoryContract.createSlot(args)
    estimate = async () => await slotFactoryContract.estimateGas.createSlot(args)
    contractCall = async (opts: any) => await slotFactoryContract.createSlot(args, opts)
  } else {

  }
  return { args, method, estimate, call: contractCall }
}
