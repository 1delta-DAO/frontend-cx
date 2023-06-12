import { ethers } from 'ethers'
import { uniswapMulticallAddress } from 'hooks/1delta/addresses'
import MultiCallAbi from 'abis/Multicall.json'
import { RPC_PROVIDERS, getSecondaryProvider } from 'constants/providers'
import { SupportedChainId } from 'constants/chains'
import { ALGEBRA_INTERFACE_MULTICALL } from 'constants/algebraAddresses'

export type MultiCallResponse<T> = T | null


export const simpleRpcProvider = (chainId: number) => {
  return RPC_PROVIDERS[chainId]
}

const getContract = (
  chainId: number,
  abi: any,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  const signerOrProvider = signer ?? simpleRpcProvider(chainId)
  return new ethers.Contract(address, abi, signerOrProvider)
}

export const getMulticallContract = (chainId: number) => {
  const multicallAddress = uniswapMulticallAddress[chainId]
  return getContract(chainId, MultiCallAbi, multicallAddress, simpleRpcProvider(chainId))
}


export const getMulticallContractSecondaryProvider = (chainId: number) => {
  const multicallAddress = uniswapMulticallAddress[chainId]
  return getContract(chainId, MultiCallAbi, multicallAddress, getSecondaryProvider(chainId))
}


export const getMulticallContractTradeProvider = (chainId: number) => {
  const multicallAddress = uniswapMulticallAddress[chainId]
  return getContract(chainId, MultiCallAbi, multicallAddress, getSecondaryProvider(chainId))
}

