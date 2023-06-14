import ORACLE_ABI from 'abis/aave/AAVEOracle.json'
import COMPOUND_LENS_CLASSIC_ABI from 'abis/compound-v2/CompoundLens.json'
import OVIX_LENS_CLASSIC_ABI from 'abis/compound-v2/OVixLens.json'
import COMPOUND_COMPTROLLER_ABI from 'abis/compound-v2/Comptroller.json'
import { getContract } from 'utils'
import { Contract } from 'ethers'
import { RPC_PROVIDERS } from '../../constants/providers'
import { SupportedChainId } from 'constants/chains'
import { slotFactoryAddresses } from './addresses1Delta'
import { addressesAaveCore } from './addressesAave'
import { compoundAddresses } from './addressesCompound'
import { oVixAddresses } from './addresses0Vix'
import { ETHEREUM_CHAINS, POLYGON_CHAINS } from 'constants/1delta'
import { useWeb3React } from '@web3-react/core'
import { DeltaSlot, SlotFactory, SlotLens } from 'abis/types'
import SLOT_FACTORY_ABI from 'abis/SlotFactory.json'
import SLOT_LENS_ABI from 'abis/SlotLens.json'
import SLOT_ABI from 'abis/DeltaSlot.json'

const defaultAddress = '0xBA4e9BbEa023AcaE6b9De0322A5b274414e4705C'


export function getAaveOracleContract(chainId: number, account?: string): Contract {
  return getContract(
    addressesAaveCore.AaveOracle[chainId] ?? defaultAddress,
    ORACLE_ABI,
    RPC_PROVIDERS[chainId as SupportedChainId],
    account
  )
}



export function getCompoundLensContract(chainId: number, account?: string): Contract {
  return getContract(
    (ETHEREUM_CHAINS.includes(chainId)
      ? compoundAddresses.CompoundLens[chainId]
      : oVixAddresses.CompoundLens[chainId]) ?? defaultAddress,
    ETHEREUM_CHAINS.includes(chainId) ? COMPOUND_LENS_CLASSIC_ABI : OVIX_LENS_CLASSIC_ABI,
    RPC_PROVIDERS[chainId as SupportedChainId],
    account
  )
}

// account is not optional
export function getCompoundComptrollerContract(chainId: number, library?: any, account?: string): Contract {
  return getContract(
    chainId === SupportedChainId.GOERLI
      ? compoundAddresses.Unitroller[chainId]
      : POLYGON_CHAINS.includes(chainId)
        ? oVixAddresses.Unitroller[chainId]
        : defaultAddress,
    COMPOUND_COMPTROLLER_ABI,
    library ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  )
}


export function useGetSlotFactoryContract(chainId: number): SlotFactory {
  const { provider, account } = useWeb3React()
  return getContract(
    slotFactoryAddresses[chainId] ?? defaultAddress,
    SLOT_FACTORY_ABI,
    provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  ) as SlotFactory
}


export function getSlotLensContract(chainId: number, account?: string): SlotLens & Contract {
  return getContract(
    oVixAddresses.CompoundLens[chainId] ?? defaultAddress,
    SLOT_LENS_ABI,
    RPC_PROVIDERS[chainId as SupportedChainId],
    account
  ) as SlotLens
}

export function useGetSlotContract(chainId: number, slotAddress: string): DeltaSlot {
  const { provider, account } = useWeb3React()
  return getContract(
    slotAddress,
    SLOT_ABI,
    provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  ) as DeltaSlot
}
