import { Contract } from '@ethersproject/contracts'
import QuoterV2Json from '@uniswap/swap-router-contracts/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
import IUniswapV2PairJson from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import IUniswapV2Router02Json from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import QuoterJson from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import TickLensJson from '@uniswap/v3-periphery/artifacts/contracts/lens/TickLens.sol/TickLens.json'
import UniswapInterfaceMulticallJson from '@uniswap/v3-periphery/artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import V3MigratorJson from '@uniswap/v3-periphery/artifacts/contracts/V3Migrator.sol/V3Migrator.json'
import ARGENT_WALLET_DETECTOR_ABI from 'abis/argent-wallet-detector.json'
import EIP_2612 from 'abis/eip_2612.json'
import ENS_PUBLIC_RESOLVER_ABI from 'abis/ens-public-resolver.json'
import ERC20_ABI from 'abis/erc20.json'
import ERC20_BYTES32_ABI from 'abis/erc20_bytes32.json'
import ERC721_ABI from 'abis/erc721.json'
import ERC1155_ABI from 'abis/erc1155.json'
import { ArgentWalletDetector, EnsPublicResolver, Erc20, Erc721, Erc1155, Weth } from 'abis/types'
import WETH_ABI from 'abis/weth.json'
import AlgebraMulticallAbi from 'abis/algebra/AlgebraMulticall.json'
import {
  ARGENT_WALLET_DETECTOR_ADDRESS,
  MULTICALL_ADDRESS,
  QUOTER_ADDRESSES,
  TICK_LENS_ADDRESSES,
  V2_ROUTER_ADDRESS,
  V3_MIGRATOR_ADDRESSES,
} from 'constants/addresses'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useMemo } from 'react'
import { Quoter, QuoterV2, TickLens, UniswapInterfaceMulticall } from 'types/v3'
import { V3Migrator } from 'types/v3/V3Migrator'
import AlgebraQuoterABI from 'abis/algebra/AlgebraQuoter.json'
import { getContract } from '../utils'
import { useWeb3React } from '@web3-react/core'
import { useChainId, useNetworkState } from 'state/globalNetwork/hooks'
import { simpleRpcProvider } from 'utils/1delta/contractHelper'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { getSecondaryProvider, getThirdProvider } from 'constants/providers'
import { SupportedChainId } from 'constants/chains'
const { abi: IUniswapV2PairABI } = IUniswapV2PairJson
const { abi: IUniswapV2Router02ABI } = IUniswapV2Router02Json
const { abi: QuoterABI } = QuoterJson
const { abi: QuoterV2ABI } = QuoterV2Json
const { abi: TickLensABI } = TickLensJson
const { abi: MulticallABI } = UniswapInterfaceMulticallJson
const { abi: V2MigratorABI } = V3MigratorJson

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true,
  secondary = false
): T | null {
  const { provider } = useWeb3React()
  const { account, chainId, connectionIsSupported } = useNetworkState()
  let _currentProvider: JsonRpcProvider | Web3Provider | undefined = provider
  if (!provider || !connectionIsSupported || secondary)
    _currentProvider = getThirdProvider(chainId)

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !_currentProvider || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(address, ABI, _currentProvider, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, _currentProvider, chainId, withSignerIfPossible, account]) as T
}


// returns null on errors
export function useContractMultiProvider<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true,
  id = 0
): T | null {
  const { provider } = useWeb3React()
  const { chainId } = useNetworkState()
  let _currentProvider: JsonRpcProvider | Web3Provider | undefined = provider
  if (id === 0) {
    _currentProvider = simpleRpcProvider(chainId)
  } else if (id === 1) {
    _currentProvider = getSecondaryProvider(chainId)
  } else {
    _currentProvider = getThirdProvider(chainId)
  }
  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !_currentProvider || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(address, ABI, _currentProvider, undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, _currentProvider, chainId, withSignerIfPossible, id]) as T
}


export function useV2MigratorContract() {
  return useContract<V3Migrator>(V3_MIGRATOR_ADDRESSES, V2MigratorABI, true)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useERC721Contract(nftAddress?: string) {
  return useContract<Erc721>(nftAddress, ERC721_ABI, false)
}

export function useERC1155Contract(nftAddress?: string) {
  return useContract<Erc1155>(nftAddress, ERC1155_ABI, false)
}

export function useArgentWalletDetectorContract() {
  return useContract<ArgentWalletDetector>(ARGENT_WALLET_DETECTOR_ADDRESS, ARGENT_WALLET_DETECTOR_ABI, false)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean) {
  return useContract<EnsPublicResolver>(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, EIP_2612, false)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useV2RouterContract(): Contract | null {
  return useContract(V2_ROUTER_ADDRESS, IUniswapV2Router02ABI, true)
}

export function useInterfaceMulticall(id = 0, chainId: number) {
  return useContractMultiProvider<UniswapInterfaceMulticall>(MULTICALL_ADDRESS,
    chainId === SupportedChainId.POLYGON_ZK_EVM ? MulticallABI : AlgebraMulticallAbi, false, id) as UniswapInterfaceMulticall
}

export function useQuoter(useQuoterV2: boolean) {
  return useContract<Quoter | QuoterV2>(QUOTER_ADDRESSES, useQuoterV2 ? QuoterV2ABI : QuoterABI)
}

export function useAlgebraQuoter(useQuoterV2: boolean) {
  return useContract<Quoter | QuoterV2>(QUOTER_ADDRESSES, AlgebraQuoterABI)
}

export function useTickLens(): TickLens | null {
  const chainId = useChainId()
  const address = chainId ? TICK_LENS_ADDRESSES[chainId] : undefined
  return useContract(address, TickLensABI) as TickLens | null
}
