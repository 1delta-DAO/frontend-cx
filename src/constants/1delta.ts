import { BigNumber } from 'ethers'
import { aaveAssets, compoundAssets, SupportedAssets, TokenMeta } from 'types/1delta'
import { default as wethLogoUrl } from 'assets/svg/tokens/weth.svg'
import { default as daiLogoUrl } from 'assets/svg/tokens/dai.svg'
import { default as linkLogoUrl } from 'assets/svg/tokens/link.svg'
import { default as usdcLogoUrl } from 'assets/svg/tokens/usdc.svg'
import { default as wbtcLogoUrl } from 'assets/svg/tokens/wbtc.svg'
import { default as usdtLogoUrl } from 'assets/svg/tokens/usdt.svg'
import { default as aaveLogoUrl } from 'assets/svg/tokens/aave.svg'
import { default as ethLogoUrl } from 'assets/svg/tokens/eth.svg'
import { default as uniLogoUrl } from 'assets/svg/tokens/uni.svg'
import { default as eursLogoUrl } from 'assets/svg/tokens/eurs.svg'
import { default as compLogoUrl } from 'assets/svg/tokens/comp.svg'
import { default as wmaticLogoUrl } from 'assets/svg/tokens/wmatic.svg'
import { default as ghstLogoUrl } from 'assets/svg/tokens/ghst.svg'
import { default as jeurLogoUrl } from 'assets/svg/tokens/jeur.svg'
import { default as dpiLogoUrl } from 'assets/svg/tokens/dpi.svg'
import { default as sushiLogoUrl } from 'assets/svg/tokens/sushi.svg'
import { default as balLogoUrl } from 'assets/svg/tokens/bal.svg'
import { default as ageurLogoUrl } from 'assets/svg/tokens/ageur.svg'
import { default as crvLogoUrl } from 'assets/svg/tokens/crv.svg'
import { default as batLogoUrl } from 'assets/svg/tokens/bat.svg'
import { default as feiLogoUrl } from 'assets/svg/tokens/fei.svg'
import { default as usdpLogoUrl } from 'assets/svg/tokens/usdp.svg'
import { default as zrxLogoUrl } from 'assets/svg/tokens/zrx.svg'
import { default as mkrLogoUrl } from 'assets/svg/tokens/mkr.svg'
import { default as saiLogoUrl } from 'assets/svg/tokens/sai.svg'
import { default as repLogoUrl } from 'assets/svg/tokens/rep.svg'
import { default as yfiLogoUrl } from 'assets/svg/tokens/yfi.svg'
import { default as tusdLogoUrl } from 'assets/svg/tokens/tusd.svg'
import { default as stmaticLogoUrl } from 'assets/svg/tokens/stmatic.svg'
import { default as maticxLogoUrl } from 'assets/svg/tokens/maticx.svg'
import { default as mimaticLogoUrl } from 'assets/svg/tokens/mimatic.svg'
import { default as gdaiLogoUrl } from 'assets/svg/tokens/gdai.svg'
import { default as wstethLogoUrl } from 'assets/svg/tokens/wsteth.svg'
import { default as vghstLogoUrl } from 'assets/svg/tokens/vghst.svg'
import { default as ghoLogoUrl } from 'assets/svg/tokens/gho.svg'


import { default as ovix } from 'assets/svg/ovix-logo.svg'
import { default as aave } from 'assets/svg/aave-logo.svg'
import { default as compoundV3 } from 'assets/svg/compound-v3-logo.svg'
import { default as compound } from 'assets/svg/compound-logo.svg'
import { default as deltaAccount } from 'assets/svg/logo-light-account.svg'

import { default as ovixStandalone } from 'assets/svg/logos/logo-0vix.svg'
import { default as aaveStandalone } from 'assets/svg/logos/logo-aave.svg'
import { default as compoundV3Standalone } from 'assets/svg/logos/logo-compound.svg'
import { default as compoundStandalone } from 'assets/svg/logos/logo-compound-2.svg'

import { LendingProtocol } from 'state/1delta/actions'
import { SupportedChainId } from './chains'

export const TEN = BigNumber.from(10)

export const ZERO_BN = BigNumber.from(0)

export const LTV_PRECISION = TEN.pow(18)

export const AAVE_PRICE_PRECISION = TEN.pow(8)

export const CHAINLINK_PRICE_PRECISION = TEN.pow(8)

export const ONE_18 = TEN.pow(18)

export const BPS_BN = BigNumber.from(10000)

export const TOKEN_META: { [key in SupportedAssets]: TokenMeta } = {
  [SupportedAssets.WETH]: { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18 },
  [SupportedAssets.UNI]: { symbol: 'UNI', name: 'Uniswap', decimals: 18 },
  [SupportedAssets.DAI]: { symbol: 'DAI', name: 'Dai', decimals: 18 },
  [SupportedAssets.LINK]: { symbol: 'LINK', name: 'ChainLink', decimals: 18 },
  [SupportedAssets.USDC]: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  [SupportedAssets.WBTC]: { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
  [SupportedAssets.USDT]: { symbol: 'USDT', name: 'Tether', decimals: 6 },
  [SupportedAssets.AAVE]: { symbol: 'AAVE', name: 'AAVE', decimals: 18 },
  [SupportedAssets.EURS]: { symbol: 'EURS', name: 'EURS', decimals: 2 },
  [SupportedAssets.WMATIC]: { symbol: 'WMATIC', name: 'Wrapped Matic', decimals: 18 },
  [SupportedAssets.AGEUR]: { symbol: 'AGEUR', name: 'AGEUR', decimals: 18 },
  [SupportedAssets.BAL]: { symbol: 'BAL', name: 'Balancer', decimals: 18 },
  [SupportedAssets.CRV]: { symbol: 'CRV', name: 'Curve', decimals: 18 },
  [SupportedAssets.DPI]: { symbol: 'DPI', name: 'DPI', decimals: 18 },
  [SupportedAssets.GHST]: { symbol: 'GHST', name: 'GHST', decimals: 18 },
  [SupportedAssets.JEUR]: { symbol: 'JEUR', name: 'JEUR', decimals: 18 },
  [SupportedAssets.SUSHI]: { symbol: 'SUSHI', name: 'SUSHI', decimals: 18 },
  [SupportedAssets.ETH]: { symbol: 'ETH', name: 'ETH', decimals: 18 },
  [SupportedAssets.MATIC]: { symbol: 'MATIC', name: 'MATIC', decimals: 18 },
  [SupportedAssets.COMP]: { symbol: 'COMP', name: 'COMP', decimals: 18 },
  [SupportedAssets.BAT]: { symbol: 'BAT', name: 'BAT', decimals: 18 },
  [SupportedAssets.FEI]: { symbol: 'FEI', name: 'FEI', decimals: 18 },
  [SupportedAssets.MKR]: { symbol: 'MKR', name: 'MKR', decimals: 18 },
  [SupportedAssets.ZRX]: { symbol: 'ZRX', name: 'ZRX', decimals: 18 },
  [SupportedAssets.YFI]: { symbol: 'YFI', name: 'YFI', decimals: 18 },
  [SupportedAssets.WBTC2]: { symbol: 'WBTC2', name: 'WBTC2', decimals: 8 },
  [SupportedAssets.USDP]: { symbol: 'USDP', name: 'USDP', decimals: 18 },
  [SupportedAssets.TUSD]: { symbol: 'TUSD', name: 'TUSD', decimals: 18 },
  [SupportedAssets.SAI]: { symbol: 'SAI', name: 'SAI', decimals: 18 },
  [SupportedAssets.REP]: { symbol: 'REP', name: 'REP', decimals: 18 },
  [SupportedAssets.MATICX]: { symbol: 'MATICX', name: 'MATICX', decimals: 18 },
  [SupportedAssets.MAI]: { symbol: 'MIMATIC', name: 'MIMATIC', decimals: 18 },
  [SupportedAssets.STMATIC]: { symbol: 'STMATIC', name: 'STMATIC', decimals: 18 },
  [SupportedAssets.VGHST]: { symbol: 'VGHST', name: 'VGHST', decimals: 18 },
  [SupportedAssets.GDAI]: { symbol: 'GDAI', name: 'GDAI', decimals: 18 },
  [SupportedAssets.WSTETH]: { symbol: 'WSTETH', name: 'WSTETH', decimals: 18 },
  [SupportedAssets.GHO]: { symbol: 'GHO', name: 'GHO', decimals: 18 }
}

export enum OtherAssets {
  ETH = 'ETH',
  BNB = 'BNB',
}

export const ETHEREUM_CHAINS = [SupportedChainId.MAINNET, SupportedChainId.GOERLI]

export const POLYGON_CHAINS = [SupportedChainId.POLYGON, SupportedChainId.POLYGON_MUMBAI]

export const MAINNET_CHAINS = [SupportedChainId.POLYGON, SupportedChainId.MAINNET, SupportedChainId.POLYGON_ZK_EVM]

export const TOKEN_SVGS: { [asset: string]: string } = {
  [SupportedAssets.WETH]: wethLogoUrl,
  [SupportedAssets.DAI]: daiLogoUrl,
  [SupportedAssets.LINK]: linkLogoUrl,
  [SupportedAssets.USDC]: usdcLogoUrl,
  [SupportedAssets.WBTC]: wbtcLogoUrl,
  [SupportedAssets.USDT]: usdtLogoUrl,
  [SupportedAssets.AAVE]: aaveLogoUrl,
  [SupportedAssets.EURS]: eursLogoUrl,
  [SupportedAssets.WMATIC]: wmaticLogoUrl,
  [SupportedAssets.AGEUR]: ageurLogoUrl,
  [SupportedAssets.BAL]: balLogoUrl,
  [SupportedAssets.CRV]: crvLogoUrl,
  [SupportedAssets.DPI]: dpiLogoUrl,
  [SupportedAssets.GHST]: ghstLogoUrl,
  [SupportedAssets.JEUR]: jeurLogoUrl,
  [SupportedAssets.SUSHI]: sushiLogoUrl,
  [SupportedAssets.UNI]: uniLogoUrl,
  [SupportedAssets.ETH]: ethLogoUrl,
  [SupportedAssets.MATIC]: wmaticLogoUrl,
  [SupportedAssets.COMP]: compLogoUrl,
  [SupportedAssets.BAT]: batLogoUrl,
  [SupportedAssets.FEI]: feiLogoUrl,
  [SupportedAssets.MKR]: mkrLogoUrl,
  [SupportedAssets.ZRX]: zrxLogoUrl,
  [SupportedAssets.YFI]: yfiLogoUrl,
  [SupportedAssets.WBTC2]: wbtcLogoUrl,
  [SupportedAssets.USDP]: usdpLogoUrl,
  [SupportedAssets.TUSD]: tusdLogoUrl,
  [SupportedAssets.SAI]: saiLogoUrl,
  [SupportedAssets.REP]: repLogoUrl,
  [SupportedAssets.MAI]: mimaticLogoUrl,
  [SupportedAssets.MATICX]: maticxLogoUrl,
  [SupportedAssets.STMATIC]: stmaticLogoUrl,
  [SupportedAssets.VGHST]: vghstLogoUrl,
  [SupportedAssets.GDAI]: gdaiLogoUrl,
  [SupportedAssets.WSTETH]: wstethLogoUrl,
  [SupportedAssets.GHO]: ghoLogoUrl,
}

export const PROTOCOL_SVGS: { [chainId: number]: string } = {
  [SupportedChainId.POLYGON]: ovix,
  [SupportedChainId.POLYGON_MUMBAI]: ovix,
  [SupportedChainId.MAINNET]: compound,
  [SupportedChainId.GOERLI]: compound,
}

export const PROTOCOL_SVGS_STANDALONE: { [chainId: number]: string } = {
  [SupportedChainId.POLYGON]: ovixStandalone,
  [SupportedChainId.POLYGON_MUMBAI]: ovixStandalone,
  [SupportedChainId.MAINNET]: compoundStandalone,
  [SupportedChainId.GOERLI]: compoundStandalone,
}

export const AAVE_SVG = aave

export const COMPOUNDV3_SVG = compoundV3

export const LOGO_ACCOUNT_SVG = deltaAccount

export const AAVE_SVG_STANDALONE = aaveStandalone

export const OVIX_SVG_STANDALONE = ovixStandalone

export const COMPOUNDV3_SVG_STANDALONE = compoundV3Standalone

export const COMPOUNDV2_SVG_STANDALONE = compoundStandalone

export const getTokenIcon = (asset: SupportedAssets): string => TOKEN_SVGS[asset]

export const getSupportedAssets = (chainId: number, lendingProtocol = LendingProtocol.AAVE): SupportedAssets[] => {
  switch (chainId) {
    case SupportedChainId.POLYGON_ZK_EVM: {
      switch (lendingProtocol) {
        case LendingProtocol.COMPOUND:
          return [
            SupportedAssets.ETH,
            SupportedAssets.WETH,
            SupportedAssets.USDC,
            SupportedAssets.USDT,
            SupportedAssets.WMATIC
          ]

        default:
          return []
      }
    }
    case SupportedChainId.GOERLI: {
      switch (lendingProtocol) {
        case LendingProtocol.AAVE:
          return aaveAssets

        case LendingProtocol.COMPOUND:
          return compoundAssets

        default:
          return []
      }
    }
    case SupportedChainId.POLYGON_MUMBAI:
      switch (lendingProtocol) {
        case LendingProtocol.AAVE: {
          return [
            SupportedAssets.AAVE,
            SupportedAssets.AGEUR,
            SupportedAssets.BAL,
            SupportedAssets.CRV,
            SupportedAssets.DAI,
            SupportedAssets.DPI,
            SupportedAssets.EURS,
            SupportedAssets.GHST,
            SupportedAssets.JEUR,
            SupportedAssets.LINK,
            SupportedAssets.SUSHI,
            SupportedAssets.USDC,
            SupportedAssets.USDT,
            SupportedAssets.WBTC,
            SupportedAssets.WETH,
            SupportedAssets.WMATIC,
          ]
        }
        case LendingProtocol.COMPOUND: {
          return [
            SupportedAssets.DAI,
            SupportedAssets.USDC,
            SupportedAssets.USDT,
            SupportedAssets.WBTC,
            SupportedAssets.WETH,
            SupportedAssets.MATIC,
          ]
        }
        case LendingProtocol.COMPOUNDV3: {
          return [
            SupportedAssets.DAI,
            SupportedAssets.USDC,
            SupportedAssets.WBTC,
            SupportedAssets.WETH,
            SupportedAssets.WMATIC,
          ]
        }
        default:
          return []
      }
    case SupportedChainId.MAINNET: {
      switch (lendingProtocol) {
        case LendingProtocol.AAVE: {
          return []
        }
        case LendingProtocol.COMPOUND: {
          return [
            SupportedAssets.ETH,
            SupportedAssets.DAI,
            SupportedAssets.UNI,
            SupportedAssets.USDC,
            SupportedAssets.USDT,
            SupportedAssets.WBTC,
            SupportedAssets.COMP,
            SupportedAssets.ZRX,
            SupportedAssets.YFI,
            SupportedAssets.WBTC2,
            SupportedAssets.USDP,
            SupportedAssets.FEI,
            SupportedAssets.LINK,
            SupportedAssets.MKR,
            SupportedAssets.REP,
            SupportedAssets.AAVE,
            SupportedAssets.BAT,
          ]
        }

        default:
          return []
      }
    }
    case SupportedChainId.POLYGON: {
      switch (lendingProtocol) {
        case LendingProtocol.AAVE: {
          return [
            SupportedAssets.AGEUR,
            SupportedAssets.DAI,
            SupportedAssets.EURS,
            SupportedAssets.JEUR,
            SupportedAssets.MAI,
            SupportedAssets.USDC,
            SupportedAssets.USDT,
            SupportedAssets.AAVE,
            SupportedAssets.BAL,
            SupportedAssets.CRV,
            SupportedAssets.DPI,
            SupportedAssets.GHST,
            SupportedAssets.LINK,
            SupportedAssets.MATICX,
            SupportedAssets.STMATIC,
            SupportedAssets.SUSHI,
            SupportedAssets.WBTC,
            SupportedAssets.WETH,
            SupportedAssets.WMATIC,
          ]
        }
        case LendingProtocol.COMPOUND: {
          return [
            SupportedAssets.DAI,
            SupportedAssets.USDC,
            SupportedAssets.USDT,
            SupportedAssets.WBTC,
            SupportedAssets.WETH,
            SupportedAssets.MATIC,
            SupportedAssets.MATICX,
            SupportedAssets.MAI,
            SupportedAssets.STMATIC,
            SupportedAssets.JEUR,
            // SupportedAssets.WSTETH
          ]
        }

        default:
          return []

      }
    }

    default:
      return [
        SupportedAssets.WETH,
        SupportedAssets.DAI,
        SupportedAssets.LINK,
        SupportedAssets.USDC,
        SupportedAssets.WBTC,
        SupportedAssets.USDT,
        SupportedAssets.AAVE,
        SupportedAssets.EURS,
        // SupportedAssets.WMATIC
      ]
  }
}

// for oracles
export const allSupportedAssets: { [chainId: number]: SupportedAssets[] } = {
  [SupportedChainId.POLYGON]: [
    SupportedAssets.AGEUR,
    SupportedAssets.DAI,
    SupportedAssets.EURS,
    SupportedAssets.JEUR,
    SupportedAssets.MAI,
    SupportedAssets.USDC,
    SupportedAssets.USDT,
    SupportedAssets.AAVE,
    SupportedAssets.BAL,
    SupportedAssets.CRV,
    SupportedAssets.DPI,
    SupportedAssets.GHST,
    SupportedAssets.LINK,
    SupportedAssets.MATICX,
    SupportedAssets.STMATIC,
    SupportedAssets.SUSHI,
    SupportedAssets.WBTC,
    SupportedAssets.WETH,
    SupportedAssets.WMATIC,
    SupportedAssets.DAI,
    SupportedAssets.MATIC,
    SupportedAssets.WSTETH,
  ],
  [SupportedChainId.MAINNET]: [
    SupportedAssets.ETH,
    SupportedAssets.DAI,
    SupportedAssets.UNI,
    SupportedAssets.USDC,
    SupportedAssets.USDT,
    SupportedAssets.WBTC,
    SupportedAssets.COMP,
    SupportedAssets.ZRX,
    SupportedAssets.YFI,
    SupportedAssets.WBTC2,
    SupportedAssets.USDP,
    SupportedAssets.FEI,
    SupportedAssets.LINK,
    SupportedAssets.MKR,
    SupportedAssets.REP,
    SupportedAssets.AAVE,
    SupportedAssets.BAT,
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    SupportedAssets.AAVE,
    SupportedAssets.AGEUR,
    SupportedAssets.BAL,
    SupportedAssets.CRV,
    SupportedAssets.DAI,
    SupportedAssets.DPI,
    SupportedAssets.EURS,
    SupportedAssets.GHST,
    SupportedAssets.JEUR,
    SupportedAssets.LINK,
    SupportedAssets.SUSHI,
    SupportedAssets.USDC,
    SupportedAssets.USDT,
    SupportedAssets.WBTC,
    SupportedAssets.WETH,
    SupportedAssets.WMATIC,
    SupportedAssets.MATIC,
  ],
  [SupportedChainId.GOERLI]: [
    SupportedAssets.WETH,
    SupportedAssets.DAI,
    SupportedAssets.LINK,
    SupportedAssets.USDC,
    SupportedAssets.WBTC,
    SupportedAssets.USDT,
    SupportedAssets.AAVE,
    SupportedAssets.EURS,
    SupportedAssets.ETH,
    SupportedAssets.UNI,
    SupportedAssets.COMP,
    SupportedAssets.GHO
  ]
}

export const GREEKS = [
  'alpha',
  'beta',
  'gamma',
  'Delta',
  'delta',
  'epsilon',
  'zeta',
  'eta',
  'Theta',
  'theta',
  'iota',
  'kappa',
  'Lambda',
  'lambda',
  'mu',
  'nu',
  'Xi',
  'xi',
  'Pi',
  'pi',
  'varpi',
  'Sigma',
  'sigma',
  'tau',
  'Phi',
  'phi',
  'varphi',
  'chi',
  'Psi',
  'psi',
  'Omega',
  'omega',
]

export const WRAPPED_NATIVE_SYMBOL: { [key: number]: string } = {
  [SupportedChainId.POLYGON]: 'WMATIC',
  [SupportedChainId.GOERLI]: 'WETH',
  [SupportedChainId.MAINNET]: 'WETH',
  [SupportedChainId.POLYGON_MUMBAI]: 'WMATIC',
  [SupportedChainId.POLYGON_ZK_EVM]: 'WETH',
}

export const NATIVE_SYMBOL: { [key: number]: string } = {
  [SupportedChainId.POLYGON]: 'MATIC',
  [SupportedChainId.GOERLI]: 'ETH',
  [SupportedChainId.MAINNET]: 'ETH',
  [SupportedChainId.POLYGON_MUMBAI]: 'MATIC',
  [SupportedChainId.POLYGON_ZK_EVM]: 'ETH',
}


export const COMET_MARKET_MAPPING: { [chainId: number]: { [asset: string]: SupportedAssets[] } } = {
  [SupportedChainId.POLYGON_MUMBAI]: {
    [SupportedAssets.USDC]: [
      SupportedAssets.DAI,
      SupportedAssets.USDC,
      SupportedAssets.WBTC,
      SupportedAssets.WETH,
      SupportedAssets.WMATIC,
    ]
  }
}


export const toLenderText = (lender: LendingProtocol, chainId: number) => {
  if (POLYGON_CHAINS.includes(chainId) && lender === LendingProtocol.COMPOUND)
    return '0VIX'
  return lender
}


export const DEFAULT_GAS_QUOTE = 2_000_000

export const POOL_GAS_OVERRIDE = 100_000

export const QUOTE_GAS_OVERRIDES: { [chainId: number]: number } = {
  [SupportedChainId.ARBITRUM_ONE]: 25_000_000,
  [SupportedChainId.ARBITRUM_RINKEBY]: 25_000_000,
  [SupportedChainId.CELO]: 50_000_000,
  [SupportedChainId.CELO_ALFAJORES]: 50_000_000,
  [SupportedChainId.POLYGON]: 1_000_000,
  [SupportedChainId.POLYGON_MUMBAI]: 50_000_000,
  [SupportedChainId.POLYGON_ZK_EVM]: 100_000_000,
}

export const SHOW_VIX_REWARDS = false


export const handleDisplaySymbol = (symbolIn?: string | undefined) => {
  if (!symbolIn) return undefined
  return symbolIn === 'WMATIC' ? 'MATIC' : symbolIn
}