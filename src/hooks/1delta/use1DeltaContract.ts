import AAVE_POOL_ABI from 'abis/aave/AAVEPoolV3.json'
import COMET_ABI from 'abis/compound-v3/Comet.json'
import COMET_EXT_ABI from 'abis/compound-v3/CometExt.json'
import COMET_LENS_ABI from 'abis/compound-v3/CometLens.json'
import ORACLE_ABI from 'abis/aave/AAVEOracle.json'
import GHO_ORACLE from 'abis/aave/ghoOracle.json'
import COMPOUND_LENS_CLASSIC_ABI from 'abis/compound-v2/CompoundLens.json'
import OVIX_LENS_CLASSIC_ABI from 'abis/compound-v2/OVixLens.json'
import COMPOUND_COMPTROLLER_ABI from 'abis/compound-v2/Comptroller.json'
import AAVE_POOL_DATA_PROVIDER_ABI from 'abis/aave/AAVEProtocolDataProvider.json'
import MARGIN_TRADER_ABI from 'abis/aave/AaveMarginTrader.json'
import COMET_MARGIN_TRADER_ABI from 'abis/compound-v3/CometMarginTrader.json'
import COMET_SWEEPER_ABI from 'abis/compound-v3/CometSweeper.json'
import COMET_MONEY_MARKET_ABI from 'abis/compound-v3/CometMoneyMarket.json'
import AAVE_MONEY_MARKET_ABI from 'abis/aave/AaveMoneyMarket.json'
import STABLE_DEBT_TOKEN from 'abis/aave/StableDebtToken.json'
import MONEY_MARKET_ABI from 'abis/aave/AaveMoneyMarket.json'
import AAVE_SWEEPER_ABI from 'abis/aave/AaveSweeper.json'
import ADMIN_ABI from 'abis/account-based/Admin.json'
import TOKEN_MANAGER_ABI from 'abis/account-based/TokenManager.json'

import ACCOUNT_MARGIN_TRADER_ABI from 'abis/account-based/MarginTrader.json'
import ACCOUNT_MONEY_MARKET_ABI from 'abis/account-based/MoneyMarket.json'
import SWEEPER_ABI from 'abis/account-based/Sweeper.json'

import DELTA_ACCOUNT from 'abis/account-based/DeltaAccount.json'
import DIAMOND_FACTORY_ABI from 'abis/account-based/DiamondFactory.json'
import { getContract } from 'utils'
import { Contract } from 'ethers'
import { RPC_PROVIDERS } from '../../constants/providers'
import { SupportedChainId } from 'constants/chains'
import { aaveBrokerAddress, accountFactoryAddress, cometBrokerAddress, slotFactoryAddresses } from './addresses1Delta'
import { addressesAaveCore } from './addressesAave'
import { compoundAddresses } from './addressesCompound'
import { oVixAddresses } from './addresses0Vix'
import { ETHEREUM_CHAINS, POLYGON_CHAINS } from 'constants/1delta'
import { useWeb3React } from '@web3-react/core'
import { AAVEPoolV3, Comet, MarginTrader, MoneyMarket, SlotFactory, Sweeper } from 'abis/types'
import { GhoOracle } from 'abis/types/GhoOracle'
import { AAVEProtocolDataProvider } from 'abis/types/AAVEProtocolDataProvider'
import { CometLens } from 'abis/types/CometLens'
import { addressesCompoundV3Core } from './addressesCompoundV3'
import { OneDeltaTradeType, SupportedAssets } from 'types/1delta'
import { LendingProtocol } from 'state/1delta/actions'
import { useMemo } from 'react'
import { CometExt } from 'abis/types/CometExt'
import SLOT_FACTORY_ABI from 'abis/SlotFactory.json'

const defaultAddress = '0xBA4e9BbEa023AcaE6b9De0322A5b274414e4705C'

// account is optional
export function getAavePoolContract(chainId: number, account?: string, library?: any): Contract {
  return getContract(addressesAaveCore.PoolProxy[chainId] ?? defaultAddress, AAVE_POOL_ABI, library, account) as AAVEPoolV3
}

export function getCometLensContract(chainId: number, account?: string, library?: any): CometLens {
  return getContract(addressesCompoundV3Core.lens[chainId] ?? defaultAddress, COMET_LENS_ABI, library, account) as CometLens
}

export function getCometContract(chainId: number, baseAsset: SupportedAssets, account?: string, library?: any): Comet {
  return getContract(addressesCompoundV3Core.comet[chainId][baseAsset] ?? defaultAddress, COMET_ABI, library, account) as Comet
}

export function getCometExtContract(chainId: number, baseAsset: SupportedAssets, account?: string, library?: any): CometExt {
  return getContract(
    addressesCompoundV3Core.comet[chainId][baseAsset] ?? defaultAddress,
    COMET_EXT_ABI,
    library,
    account
  ) as CometExt
}

export function getCometExtAddress(chainId: number, baseAsset: SupportedAssets): string {
  return addressesCompoundV3Core.cometExt[chainId][baseAsset] ?? defaultAddress
}

/**
 * 
 * @param chainId the network Id
 * @param protocol the lending protocol
 * @param tradeType trade type (OneDeltaTradeType)
 * @param relevantAccount wallet address for comet / aave, 1delta account address for compound v2 
 * @param baseAsset base asset for compound V3
 * @param isDirect direct flag (signlas direct interaction with lender), makes only difference for comet / aave
 * @returns the contract
 */
export function useGetTradeContract(
  chainId: number,
  protocol: LendingProtocol,
  tradeType: OneDeltaTradeType,
  relevantAccount?: string,
  baseAsset = SupportedAssets.USDC,
  isDirect = false
): Contract {
  const { provider, account } = useWeb3React()
  return useMemo(() => {
    switch (tradeType) {
      case OneDeltaTradeType.MarginSwap:
      case OneDeltaTradeType.SingleSide:
        {
          switch (protocol) {
            case LendingProtocol.AAVE: {
              return getContract(
                aaveBrokerAddress[chainId] ?? defaultAddress,
                [...MARGIN_TRADER_ABI, ...AAVE_SWEEPER_ABI],
                provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
                account
              )
            }
            case LendingProtocol.COMPOUND: {
              return getContract(
                relevantAccount ?? defaultAddress,
                [...ACCOUNT_MARGIN_TRADER_ABI, ...SWEEPER_ABI],
                provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
                account
              )
            }
            case LendingProtocol.COMPOUNDV3: {
              return getContract(
                cometBrokerAddress[chainId] ?? defaultAddress,
                [...COMET_MARGIN_TRADER_ABI, ...COMET_SWEEPER_ABI],
                provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
                account
              )
            }
          }
        }
      case OneDeltaTradeType.Single:
      default: {
        switch (protocol) {
          case LendingProtocol.AAVE: {
            if (isDirect)
              return getContract(
                addressesAaveCore.PoolProxy[chainId] ?? defaultAddress,
                AAVE_POOL_ABI,
                provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
                account
              )
            else
              return getContract(
                aaveBrokerAddress[chainId] ?? defaultAddress,
                [...MONEY_MARKET_ABI, ...AAVE_SWEEPER_ABI],
                provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
                account
              )
          }
          case LendingProtocol.COMPOUND: {
            return getContract(
              relevantAccount ?? defaultAddress,
              [...ACCOUNT_MONEY_MARKET_ABI, ...SWEEPER_ABI],
              provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
              account
            )
          }
          case LendingProtocol.COMPOUNDV3: {
            if (isDirect)
              return getContract(
                addressesCompoundV3Core.comet[chainId][baseAsset] ?? defaultAddress,
                COMET_ABI,
                provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
                account
              )
            else
              return getContract(
                cometBrokerAddress[chainId] ?? defaultAddress,
                [...COMET_MONEY_MARKET_ABI, ...COMET_SWEEPER_ABI],
                provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
                account
              )
          }
        }
      }
    }
  },
    [
      chainId,
      protocol,
      tradeType,
      relevantAccount,
      baseAsset,
      isDirect,
      provider,
      account
    ])
}



/**
 * 
 * @param chainId the network Id
 * @param protocol the lending protocol
 * @param tradeType trade type (OneDeltaTradeType)
 * @param relevantAccount wallet address for comet / aave, 1delta account address for compound v2 
 * @param baseAsset base asset for compound V3
 * @param isDirect direct flag (signlas direct interaction with lender), makes only difference for comet / aave
 * @returns the contract
 */
export function useGetMoneyMarketTradeContracts(
  chainId: number,
  protocol: LendingProtocol,
  relevantAccount?: string,
  baseAsset = SupportedAssets.USDC,
  isDirect = false
): [Contract, Contract] {
  const { provider, account } = useWeb3React()
  return useMemo(() => {
    switch (protocol) {
      case LendingProtocol.AAVE: {
        return [
          getContract(
            addressesAaveCore.PoolProxy[chainId] ?? defaultAddress,
            AAVE_POOL_ABI,
            provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
            account
          ),
          getContract(
            aaveBrokerAddress[chainId] ?? defaultAddress,
            [...MARGIN_TRADER_ABI, ...AAVE_SWEEPER_ABI, ...AAVE_MONEY_MARKET_ABI],
            provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
            account
          )
        ]

      }
      case LendingProtocol.COMPOUND: {
        return [
          getContract(
            relevantAccount ?? defaultAddress,
            [...ACCOUNT_MONEY_MARKET_ABI, ...SWEEPER_ABI],
            provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
            account
          ),
          getContract(
            relevantAccount ?? defaultAddress,
            [...ACCOUNT_MONEY_MARKET_ABI, ...SWEEPER_ABI],
            provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
            account
          ),
        ]
      }
      case LendingProtocol.COMPOUNDV3: {
        return [
          getContract(
            addressesCompoundV3Core.comet[chainId][baseAsset] ?? defaultAddress,
            COMET_ABI,
            provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
            account
          ),
          getContract(
            cometBrokerAddress[chainId] ?? defaultAddress,
            [...COMET_MONEY_MARKET_ABI, ...COMET_SWEEPER_ABI],
            provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
            account
          )]

      }
    }
  },
    [
      chainId,
      protocol,
      relevantAccount,
      baseAsset,
      isDirect,
      provider,
      account
    ])
}


// ********** COMET ***********

export function useGetCometMarginTraderContract(chainId: number, account?: string): Contract {
  const { provider } = useWeb3React()
  return getContract(
    cometBrokerAddress[chainId] ?? defaultAddress,
    [...COMET_MARGIN_TRADER_ABI, ...COMET_SWEEPER_ABI],
    provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  )
}

export function useGetCometMoneyMarketContract(chainId: number, account?: string): Contract {
  const { provider } = useWeb3React()
  return getContract(
    cometBrokerAddress[chainId] ?? defaultAddress,
    [...COMET_MONEY_MARKET_ABI, ...COMET_SWEEPER_ABI],
    provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  )
}

// ********** AAVE ************

// account is not optional
export function useGetMarginTraderContract(chainId: number, account?: string): Contract {
  const { provider } = useWeb3React()
  return getContract(
    aaveBrokerAddress[chainId] ?? defaultAddress,
    [...MARGIN_TRADER_ABI, ...AAVE_SWEEPER_ABI],
    provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  )
}

export function useGetAavePoolContractWithUserProvider(chainId: number, account?: string): AAVEPoolV3 & Contract {
  const { provider } = useWeb3React()
  return getContract(
    addressesAaveCore.PoolProxy[chainId] ?? defaultAddress,
    AAVE_POOL_ABI, provider ?? RPC_PROVIDERS[chainId as SupportedChainId], account) as AAVEPoolV3 & Contract
}


// account is not optional
export function useGetMoneyMarketOperatorContract(chainId: number, account?: string): Contract {
  const { provider } = useWeb3React()
  return getContract(
    aaveBrokerAddress[chainId] ?? defaultAddress,
    [...MONEY_MARKET_ABI, ...AAVE_SWEEPER_ABI],
    provider ?? RPC_PROVIDERS[chainId as SupportedChainId], account)
}

// account is not optional
export function getDebtTokenContract(
  chainId?: number,
  address?: string,
  library?: any,
  account?: string
): Contract | undefined {
  if (!chainId || !address) return undefined
  return getContract(
    address,
    STABLE_DEBT_TOKEN, // the relevant functions are the same for stable and variable debt tokens
    library,
    account
  )
}

export function getAavePoolDataProviderContract(chainId: number, account?: string): Contract {
  return getContract(
    addressesAaveCore.PoolDataProvider[chainId] ?? defaultAddress,
    AAVE_POOL_DATA_PROVIDER_ABI,
    RPC_PROVIDERS[chainId as SupportedChainId],
    account
  ) as AAVEProtocolDataProvider
}

export function getAaveOracleContract(chainId: number, account?: string): Contract {
  return getContract(
    addressesAaveCore.AaveOracle[chainId] ?? defaultAddress,
    ORACLE_ABI,
    RPC_PROVIDERS[chainId as SupportedChainId],
    account
  )
}

export function getGhoOracleContract(chainId: number, account?: string): Contract {
  return getContract(
    addressesAaveCore.ghoOracle[chainId] ?? defaultAddress,
    GHO_ORACLE,
    RPC_PROVIDERS[chainId as SupportedChainId],
    account
  ) as GhoOracle
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

// ************ COMPOUND V2 ACCOUNTS ************

// account is not optional
export function getAccountFactoryContract(chainId: number, library?: any, account?: string): Contract {
  return getContract(
    accountFactoryAddress[chainId] ?? defaultAddress,
    DIAMOND_FACTORY_ABI,
    library ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  )
}

// account is not optional
export function useGetAccountFactoryContractWithUserProvider(chainId: number, account?: string): Contract {
  const { provider } = useWeb3React()
  return getContract(
    accountFactoryAddress[chainId] ?? defaultAddress,
    DIAMOND_FACTORY_ABI,
    provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
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

export function useGetMoneyMarketAccountContract(
  chainId: number,
  deltaAccount?: string,
  account?: string
): MoneyMarket & Sweeper {
  const { provider } = useWeb3React()
  return getContract(
    deltaAccount ?? defaultAddress,
    [...ACCOUNT_MONEY_MARKET_ABI, ...SWEEPER_ABI],
    provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  ) as MoneyMarket & Sweeper
}

export function useGetMarginTraderAccountContract(
  chainId: number,
  deltaAccount?: string,
  account?: string
): MarginTrader & Sweeper {
  const { provider } = useWeb3React()
  return getContract(
    deltaAccount ?? defaultAddress,
    [...ACCOUNT_MARGIN_TRADER_ABI, ...SWEEPER_ABI],
    provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  ) as MarginTrader & Sweeper
}

export function useGetMulticallAccountContract(
  chainId: number,
  deltaAccount?: string,
  account?: string
): Contract {
  const { provider } = useWeb3React()
  return getContract(
    deltaAccount ?? defaultAddress,
    DELTA_ACCOUNT,
    provider ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  )
}

export function getAdminAccountContract(
  chainId: number,
  library?: any,
  deltaAccount?: string,
  account?: string
): Contract {
  return getContract(
    deltaAccount ?? defaultAddress,
    [...ADMIN_ABI, ...TOKEN_MANAGER_ABI],
    library ?? RPC_PROVIDERS[chainId as SupportedChainId],
    account
  )
}

export function getTokenManagerContract(
  chainId: number,
  library?: any,
  deltaAccount?: string,
  account?: string
): Contract {
  return getContract(
    deltaAccount ?? defaultAddress,
    TOKEN_MANAGER_ABI,
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