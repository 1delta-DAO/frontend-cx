import { SupportedChainId } from 'constants/chains'
import { SupportedAssets } from 'types/1delta'
import { AddressDictionary, FlatAddressDictionary } from './addresses'

export const compoundAddresses: AddressDictionary = {
  cCOMP: {
    [SupportedChainId.GOERLI]: '0x0fF50a12759b081Bb657ADaCf712C52bb015F1Cd',
  },
  cDAI: {
    [SupportedChainId.GOERLI]: '0x0545a8eaF7ff6bB6F708CbB544EA55DBc2ad7b2a',
  },
  cETH: {
    [SupportedChainId.GOERLI]: '0x64078a6189Bf45f80091c6Ff2fCEe1B15Ac8dbde',
  },
  cUNI: {
    [SupportedChainId.GOERLI]: '0x2073d38198511F5Ed8d893AB43A03bFDEae0b1A5',
  },
  cUSDC: {
    [SupportedChainId.GOERLI]: '0x73506770799Eb04befb5AaE4734e58C2C624F493',
  },
  cUSDT: {
    [SupportedChainId.GOERLI]: '0x5A74332C881Ea4844CcbD8458e0B6a9B04ddb716',
  },
  cWBTC: {
    [SupportedChainId.GOERLI]: '0xDa6F609F3636062E06fFB5a1701Df3c5F1ab3C8f',
  },
  COMP: {
    [SupportedChainId.GOERLI]: '0x3587b2F7E0E2D6166d6C14230e7Fe160252B0ba4',
  },
  DAI: {
    [SupportedChainId.GOERLI]: '0x2899a03ffDab5C90BADc5920b4f53B0884EB13cC',
  },
  UNI: {
    [SupportedChainId.GOERLI]: '0x208F73527727bcB2D9ca9bA047E3979559EB08cC',
  },
  USDC: {
    [SupportedChainId.GOERLI]: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
  },
  USDT: {
    [SupportedChainId.GOERLI]: '0x79C950C7446B234a6Ad53B908fBF342b01c4d446',
  },
  WBTC: {
    [SupportedChainId.GOERLI]: '0xAAD4992D949f9214458594dF92B44165Fb84dC19',
  },
  CompoundLens: {
    [SupportedChainId.GOERLI]: '0x04EC9f6Ce8ca39Ee5c7ADE95C69e38ddcaA8CbB7',
    [SupportedChainId.MAINNET]: '0xdCbDb7306c6Ff46f77B349188dC18cEd9DF30299',
  },
  Unitroller: {
    [SupportedChainId.GOERLI]: '0x3cBe63aAcF6A064D32072a630A3eab7545C54d78',
    [SupportedChainId.MAINNET]: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
  },
  Comptroller: {
    [SupportedChainId.GOERLI]: '0x05Df6C772A563FfB37fD3E04C1A279Fb30228621',
    [SupportedChainId.MAINNET]: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', // we set this to the unitroller address
  },
  Fauceteer: {
    [SupportedChainId.GOERLI]: '0x75442Ac771a7243433e033F3F8EaB2631e22938f',
  },
  GovernorBravo: {
    [SupportedChainId.GOERLI]: '0xa3FbaE9180a3c835C1F8688383989bB5558245d3',
  },
  Maximillion: {
    [SupportedChainId.GOERLI]: '0xD4936082B4F93D9D2B79418765854A00f320Defb',
  },
  PriceOracle: {
    [SupportedChainId.GOERLI]: '0x65F19195e488B9C1A1Ac08ca115f197C992bC776',
  },
  Timelock: {
    [SupportedChainId.GOERLI]: '0x8Fa336EB4bF58Cfc508dEA1B0aeC7336f55B1399',
    [SupportedChainId.MAINNET]: '0x6d903f6003cca6255D85CcA4D3B5E5146dC33925',
  },
  Governance: {
    [SupportedChainId.MAINNET]: '0xc0Da02939E1441F497fd74F78cE7Decb17B66529',
  },
}

export const addressesCompoundTestnetTokens: AddressDictionary = {
  [SupportedAssets.DAI]: {
    [SupportedChainId.GOERLI]: '0x2899a03ffDab5C90BADc5920b4f53B0884EB13cC',
    [SupportedChainId.POLYGON_MUMBAI]: '0xcB1e72786A6eb3b44C2a2429e317c8a2462CFeb1',
  },
  [SupportedAssets.UNI]: {
    [SupportedChainId.GOERLI]: '0x208F73527727bcB2D9ca9bA047E3979559EB08cC',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.GOERLI]: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    [SupportedChainId.POLYGON_MUMBAI]: '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747',
  },
  [SupportedAssets.USDT]: {
    [SupportedChainId.GOERLI]: '0x79C950C7446B234a6Ad53B908fBF342b01c4d446',
    [SupportedChainId.POLYGON_MUMBAI]: '0x3813e82e6f7098b9583FC0F33a962D02018B6803',
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.GOERLI]: '0xAAD4992D949f9214458594dF92B44165Fb84dC19',
    [SupportedChainId.POLYGON_MUMBAI]: '0xF151CC6EE64046342D8287660596fb78D2212A23',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xFcCea9c3bb8e2fEFE9E2c7EFa1C63890Cf6F69b6',
  },
  [SupportedAssets.COMP]: {
    [SupportedChainId.GOERLI]: '0x3587b2F7E0E2D6166d6C14230e7Fe160252B0ba4',
  },
}

export const addressesCompoundCTokens: AddressDictionary = {
  [SupportedAssets.ZRX]: {
    [SupportedChainId.MAINNET]: '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
  },
  [SupportedAssets.YFI]: {
    [SupportedChainId.MAINNET]: '0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946',
  },
  [SupportedAssets.WBTC2]: {
    [SupportedChainId.MAINNET]: '0xccF4429DB6322D5C611ee964527D42E5d685DD6a',
  },
  [SupportedAssets.USDP]: {
    [SupportedChainId.MAINNET]: '0x041171993284df560249B57358F931D9eB7b925D',
  },
  [SupportedAssets.FEI]: {
    [SupportedChainId.MAINNET]: '0x7713DD9Ca933848F6819F38B8352D9A15EA73F67',
  },
  [SupportedAssets.LINK]: {
    [SupportedChainId.MAINNET]: '0xFAce851a4921ce59e912d19329929CE6da6EB0c7',
  },
  [SupportedAssets.MKR]: {
    [SupportedChainId.MAINNET]: '0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b',
  },
  [SupportedAssets.REP]: {
    [SupportedChainId.MAINNET]: '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
  },
  [SupportedAssets.DAI]: {
    [SupportedChainId.GOERLI]: '0x0545a8eaF7ff6bB6F708CbB544EA55DBc2ad7b2a',
    [SupportedChainId.POLYGON_MUMBAI]: '0xcb9F13Cb8cCA0ECfE908AbBfa25D1fc16C1aaE6d',
    [SupportedChainId.MAINNET]: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  },
  [SupportedAssets.UNI]: {
    [SupportedChainId.GOERLI]: '0x2073d38198511F5Ed8d893AB43A03bFDEae0b1A5',
    [SupportedChainId.MAINNET]: '0x35A18000230DA775CAc24873d00Ff85BccdeD550',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.GOERLI]: '0x73506770799Eb04befb5AaE4734e58C2C624F493',
    [SupportedChainId.POLYGON_MUMBAI]: '0x4413dbCf851D73bEc0BBF50b474EA89bded11153',
    [SupportedChainId.MAINNET]: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
  },
  [SupportedAssets.USDT]: {
    [SupportedChainId.GOERLI]: '0x5A74332C881Ea4844CcbD8458e0B6a9B04ddb716',
    [SupportedChainId.POLYGON_MUMBAI]: '0x2ed82022025374fcC839D557c7a360099244e06b',
    [SupportedChainId.MAINNET]: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.MAINNET]: '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',
    [SupportedChainId.GOERLI]: '0xDa6F609F3636062E06fFB5a1701Df3c5F1ab3C8f',
    [SupportedChainId.POLYGON_MUMBAI]: '0xF151CC6EE64046342D8287660596fb78D2212A23',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xFcCea9c3bb8e2fEFE9E2c7EFa1C63890Cf6F69b6',
  },
  [SupportedAssets.ETH]: {
    [SupportedChainId.GOERLI]: '0x64078a6189Bf45f80091c6Ff2fCEe1B15Ac8dbde',
    [SupportedChainId.MAINNET]: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
  },
  [SupportedAssets.COMP]: {
    [SupportedChainId.GOERLI]: '0x0fF50a12759b081Bb657ADaCf712C52bb015F1Cd',
    [SupportedChainId.MAINNET]: '0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4',
  },
  [SupportedAssets.MATIC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xcf48fD4dF32097f482809E45E361C9667df32F90',
  },
  [SupportedAssets.AAVE]: {
    [SupportedChainId.MAINNET]: '0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c',
  },
  [SupportedAssets.BAT]: {
    [SupportedChainId.MAINNET]: '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
  },
}

export const getCompoundCTokens = (chainId: number, assets: SupportedAssets[]): FlatAddressDictionary => {
  return Object.assign(
    {},
    ...assets.map((a) => {
      return { [a]: addressesCompoundCTokens[a][chainId] }
    })
  )
}
