import { SupportedChainId } from 'constants/chains'
import { SupportedAssets } from 'types/1delta'
import { AddressDictionary, FlatAddressDictionary } from './addresses'

export const oVixAddresses: AddressDictionary = {
  Oracle: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x5E884f4FA21b6a9cb0b77f5645DA89e346aeB120',
    [SupportedChainId.POLYGON]: '0x421FF03Fe1085bce50ec5Bf06c5907119d87672F',
  },
  Comptroller: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x6F809eABA306dAaf5892a33C77d323b33b7a7Fd5',
    [SupportedChainId.POLYGON]: '0xf29d0ae1A29C453df338C5eEE4f010CFe08bb3FF',
  },
  Unitroller: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xC9CC886dA03D3Ae9F362bc69972Dc68235944847',
    [SupportedChainId.POLYGON]: '0x8849f1a0cB6b5D6076aB150546EddEe193754F1C',
    [SupportedChainId.POLYGON_ZK_EVM]: '0x6EA32f626e3A5c41547235ebBdf861526e11f482',
  },
  InterestRate: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x8e7a6D141fd2854b703Ec624D523b54096465557',
    [SupportedChainId.POLYGON]: '0x15c7DAaD15E3EE00C30C16D6294ea3528641165a',
  },
  oMaticLogic: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x21C7f99013D993d22f68c38d0f2C2B74a3d5D0E1',
    [SupportedChainId.POLYGON]: '0x188D24cfEB2837c11Fd22F1462C6E0174cD910Bc',
  },
  oMatic: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xcf48fD4dF32097f482809E45E361C9667df32F90',
    [SupportedChainId.POLYGON]: '0xE554E874c9c60E45F1Debd479389C76230ae25A8',
  },
  oTokenLogic: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x1b824f7e13bdEb11d6dc2F6FA03f85D2a2fF8deb',
    [SupportedChainId.POLYGON]: '0xb329FC9379dBf71BC58178383BA494D10D4E296F',
  },
  oWTBC: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xF151CC6EE64046342D8287660596fb78D2212A23',
    [SupportedChainId.POLYGON]: '0x3B9128Ddd834cE06A60B0eC31CCfB11582d8ee18',
    [SupportedChainId.POLYGON_ZK_EVM]: ''
  },
  oDAI: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xcb9F13Cb8cCA0ECfE908AbBfa25D1fc16C1aaE6d',
    [SupportedChainId.POLYGON]: '0x2175110F2936bf630a278660E9B6E4EFa358490A',
    [SupportedChainId.POLYGON_ZK_EVM]: ''
  },
  oWETH: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xFcCea9c3bb8e2fEFE9E2c7EFa1C63890Cf6F69b6',
    [SupportedChainId.POLYGON]: '0xb2D9646A1394bf784E376612136B3686e74A325F',
    [SupportedChainId.POLYGON_ZK_EVM]: ''
  },
  oUSDC: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x4413dbCf851D73bEc0BBF50b474EA89bded11153',
    [SupportedChainId.POLYGON]: '0xEBb865Bf286e6eA8aBf5ac97e1b56A76530F3fBe',
    [SupportedChainId.POLYGON_ZK_EVM]: '0x68d9baA40394dA2e2c1ca05d30BF33F52823ee7B'
  },
  oUSDT: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x2ed82022025374fcC839D557c7a360099244e06b',
    [SupportedChainId.POLYGON]: '0x1372c34acC14F1E8644C72Dad82E3a21C211729f',
    [SupportedChainId.POLYGON_ZK_EVM]: ''
  },
  maximillion: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xe1d11e64fcD630AAa2C9216f736F9193665d0cC6',
    [SupportedChainId.POLYGON]: '',
  },
  CompoundLens: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xB07222F11819CEBf994dcfb28Edd4B2Fc77EA18b',
    [SupportedChainId.POLYGON]: '0x38294502a05D10cf9266964443212e8D535bd3E1',
    [SupportedChainId.POLYGON_ZK_EVM]: '0x830d7Fb34Cf45BD0F9A5A8f4D899998c692541e2'
  },
  oMAI: {
    [SupportedChainId.POLYGON]: '0xC57E5e261d49Af3026446de3eC381172f17bB799',
  },
  oMATICX: {
    [SupportedChainId.POLYGON]: '0xAAcc5108419Ae55Bc3588E759E28016d06ce5F40',
  },
}

export const addresses0VixOTokens: AddressDictionary = {
  [SupportedAssets.DAI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xcb9F13Cb8cCA0ECfE908AbBfa25D1fc16C1aaE6d',
    [SupportedChainId.POLYGON]: '0x2175110F2936bf630a278660E9B6E4EFa358490A',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x4413dbCf851D73bEc0BBF50b474EA89bded11153',
    [SupportedChainId.POLYGON]: '0xEBb865Bf286e6eA8aBf5ac97e1b56A76530F3fBe',
    [SupportedChainId.POLYGON_ZK_EVM]: '0x68d9baA40394dA2e2c1ca05d30BF33F52823ee7B'
  },
  [SupportedAssets.USDT]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x2ed82022025374fcC839D557c7a360099244e06b',
    [SupportedChainId.POLYGON]: '0x1372c34acC14F1E8644C72Dad82E3a21C211729f',
    [SupportedChainId.POLYGON_ZK_EVM]: '0xad41C77d99E282267C1492cdEFe528D7d5044253'
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xF151CC6EE64046342D8287660596fb78D2212A23',
    [SupportedChainId.POLYGON]: '0x3B9128Ddd834cE06A60B0eC31CCfB11582d8ee18',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xFcCea9c3bb8e2fEFE9E2c7EFa1C63890Cf6F69b6',
    [SupportedChainId.POLYGON]: '0xb2D9646A1394bf784E376612136B3686e74A325F',
  },
  [SupportedAssets.MATIC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xcf48fD4dF32097f482809E45E361C9667df32F90',
    [SupportedChainId.POLYGON]: '0xE554E874c9c60E45F1Debd479389C76230ae25A8',
  },
  [SupportedAssets.MATICX]: {
    [SupportedChainId.POLYGON]: '0xAAcc5108419Ae55Bc3588E759E28016d06ce5F40',
  },
  [SupportedAssets.MAI]: {
    [SupportedChainId.POLYGON]: '0xC57E5e261d49Af3026446de3eC381172f17bB799',
  },
  [SupportedAssets.JEUR]: {
    [SupportedChainId.POLYGON]: '0x29b0F07d5A61595685a17D5F9F86313742Ebd6Bc'
  },
  [SupportedAssets.STMATIC]: {
    [SupportedChainId.POLYGON]: '0xDc3C5E5c01817872599e5915999c0dE70722D07f'
  },
  // [SupportedAssets.VGHST]: {
  //   [SupportedChainId.POLYGON]: '0xE053A4014b50666ED388ab8CbB18D5834de0aB12'
  // },
  // [SupportedAssets.GDAI]: {
  //   [SupportedChainId.POLYGON]: '0x6F063Fe661d922e4fd77227f8579Cb84f9f41F0B'
  // },
  [SupportedAssets.WSTETH]: {
    [SupportedChainId.POLYGON]: '0xf06edA703C62b9889C75DccDe927b93bde1Ae654'
  },
  [SupportedAssets.WMATIC]: {
    [SupportedChainId.POLYGON_ZK_EVM]: '0x8903Dc1f4736D2FcB90C1497AebBABA133DaAC76'
  },
  [SupportedAssets.ETH]: {
    [SupportedChainId.POLYGON_ZK_EVM]: '0xee1727f5074E747716637e1776B7F7C7133f16b1'
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.POLYGON_ZK_EVM]: '0xee1727f5074E747716637e1776B7F7C7133f16b1'
  }
}

export const getOVixOTokens = (chainId: number, assets: SupportedAssets[]): FlatAddressDictionary => {
  return Object.assign(
    {},
    ...assets.map((a) => {
      return { [a]: addresses0VixOTokens[a][chainId] }
    })
  )
}

export const addresses0VixTestnetTokens: AddressDictionary = {
  [SupportedAssets.DAI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xcB1e72786A6eb3b44C2a2429e317c8a2462CFeb1',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747',
  },
  [SupportedAssets.USDT]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x3813e82e6f7098b9583FC0F33a962D02018B6803',
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xEB8df6700E24802a5D435E5B0e4228065CA9E0f3',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x714550C2C1Ea08688607D86ed8EeF4f5E4F22323',
  },
}
