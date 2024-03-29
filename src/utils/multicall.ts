import { ethers } from 'ethers'
import { getMulticallContract, getMulticallContractSecondaryProvider } from './1delta/contractHelper'

export type MultiCallResponse<T> = T | null

export interface Call {
  address: string // Address of the contract
  name: string // Function name on the contract (example: balanceOf)
  params?: any[] // Function params
}

interface MulticallOptions {
  requireSuccess?: boolean
}

const multicall = async <T = any>(chainId: number, abi: any[], calls: Call[]): Promise<ethers.utils.Result[]> => {
  try {
    const multi = getMulticallContract(chainId)
    const itf = new ethers.utils.Interface(abi)

    const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
    const { returnData } = await multi.callStatic.aggregate(calldata)

    const res = (returnData as any[]).map((call, i) => itf.decodeFunctionResult(calls[i].name, call))

    return res
  } catch (error: any) {
    throw new Error(error)
  }
}

export const multicallSecondary = async <T = any>(chainId: number, abi: any[], calls: Call[]): Promise<ethers.utils.Result[]> => {
  try {
    const multi = getMulticallContractSecondaryProvider(chainId)
    const itf = new ethers.utils.Interface(abi)

    const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
    const { returnData } = await multi.callStatic.aggregate(calldata)

    const res = (returnData as any[]).map((call, i) => itf.decodeFunctionResult(calls[i].name, call))

    return res
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Multicall V2 uses the new "tryAggregate" function. It is different in 2 ways
 *
 * 1. If "requireSuccess" is false multicall will not bail out if one of the calls fails
 * 2. The return includes a boolean whether the call was successful e.g. [wasSuccessful, callResult]
 */
export const multicallv2 = async <T = any>(
  chainId: number,
  abi: any[],
  calls: Call[],
  options: MulticallOptions = { requireSuccess: true }
): Promise<(ethers.utils.Result | null)[]> => {
  const { requireSuccess } = options
  const multi = getMulticallContract(chainId)
  const itf = new ethers.utils.Interface(abi)

  const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
  const returnData = await multi.tryAggregate(requireSuccess, calldata)
  const res = (returnData as any[]).map((call, i) => {
    const [result, data] = call
    return result ? itf.decodeFunctionResult(calls[i].name, data) : null
  })

  return res
}

export default multicall
