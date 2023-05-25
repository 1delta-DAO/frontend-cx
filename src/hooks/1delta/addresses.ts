import { MULTICALL2_ADDRESS } from '@uniswap/smart-order-router'
import { getSupportedAssets } from 'constants/1delta'
import { SupportedChainId } from 'constants/chains'
import { LendingProtocol } from 'state/1delta/actions'

export type AddressDictionary = { [prop: string]: { [chainId: number]: string } }
export type FlatAddressDictionary = { [prop: string]: string }

export function getAddressesForChainIdFromAssetDict(
  dict: AddressDictionary,
  chainId: number,
  lending = LendingProtocol.AAVE
): FlatAddressDictionary {
  const ob = Object.assign(
    {},
    ...getSupportedAssets(chainId, lending).map((a) => {
      return {
        [a]: dict?.[a]?.[chainId],
      }
    })
  )
  return ob
}

export const getMulticallV2Address = (chainId: number): string => {
  switch (chainId) {
    case SupportedChainId.POLYGON:
      return '0x275617327c958bD06b5D6b871E7f491D76113dd8'
    case SupportedChainId.POLYGON_MUMBAI:
      return '0xe9939e7Ea7D7fb619Ac57f648Da7B1D425832631'

    default: return MULTICALL2_ADDRESS
  }
}

export const multicallAddressGeneral: { [chainId: number]: string } = {
  [SupportedChainId.GOERLI]: '0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e',
}

export const multicallAddress: { [chainId: number]: string } = {
  [SupportedChainId.MAINNET]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [SupportedChainId.GOERLI]: '0xf10Bd0dA1f0e69c3334D7F8116C9082746EBC1B4',
  [SupportedChainId.POLYGON]: '0x35e4aA226ce52e1E59E5e5Ec24766007bCbE2e7D',
  [SupportedChainId.POLYGON_MUMBAI]: '0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc',
}

export const uniswapMulticallAddress: { [chainId: number]: string } = {
  [SupportedChainId.MAINNET]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [SupportedChainId.GOERLI]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [SupportedChainId.POLYGON]: '0x35e4aA226ce52e1E59E5e5Ec24766007bCbE2e7D',
  [SupportedChainId.POLYGON_MUMBAI]: '0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc',
}

export const chainLinkOracles: AddressDictionary = {
  'MIMATIC-USD': {
    [SupportedChainId.POLYGON]: '0xd8d483d813547cfb624b8dc33a00f2fcbcd2d428'
  },
  'BTC-ETH': {
    [SupportedChainId.GOERLI]: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    [SupportedChainId.POLYGON]: '0x19b0F0833C78c0848109E3842D34d2fDF2cA69BA',
  },
  'BTC-USD': {
    [SupportedChainId.GOERLI]: '0xA39434A63A52E749F02807ae27335515BA4b07F7',
    [SupportedChainId.POLYGON_MUMBAI]: '0x007A22900a3B98143368Bd5906f8E17e9867581b',
    [SupportedChainId.POLYGON]: '0xc907E116054Ad103354f2D350FD2514433D57F6f',
    [SupportedChainId.MAINNET]: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
  },
  'DAI-USD': {
    [SupportedChainId.GOERLI]: '0x0d79df66BE487753B02D015Fb622DED7f0E9798d',
    [SupportedChainId.POLYGON_MUMBAI]: '0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046',
    [SupportedChainId.POLYGON]: '0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D',
    [SupportedChainId.MAINNET]: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
  },
  'ETH-USD': {
    [SupportedChainId.GOERLI]: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
    [SupportedChainId.POLYGON_MUMBAI]: '0x0715A7794a1dc8e42615F059dD6e406A6594651A',
    [SupportedChainId.POLYGON]: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    [SupportedChainId.MAINNET]: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  },
  'FORTH-USD': {
    [SupportedChainId.GOERLI]: '0x7A65Cf6C2ACE993f09231EC1Ea7363fb29C13f2F',
  },
  'JPY-USD': {
    [SupportedChainId.GOERLI]: '0x295b398c95cEB896aFA18F25d0c6431Fd17b1431',
    [SupportedChainId.POLYGON]: '0xD647a6fC9BC6402301583C91decC5989d8Bc382D',
  },
  'LINK-ETH': {
    [SupportedChainId.GOERLI]: '0xb4c4a493AB6356497713A78FFA6c60FB53517c63',
  },
  'LINK-USD': {
    [SupportedChainId.GOERLI]: '0x48731cF7e84dc94C5f84577882c14Be11a5B7456',
    [SupportedChainId.POLYGON_MUMBAI]: '0x1C2252aeeD50e0c9B64bDfF2735Ee3C932F5C408',
    [SupportedChainId.POLYGON]: '0xd9FFdb71EbE7496cC440152d43986Aae0AB76665',
    [SupportedChainId.MAINNET]: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
  },
  'LINK-MATIC': {
    [SupportedChainId.POLYGON_MUMBAI]: '0x12162c3E810393dEC01362aBf156D7ecf6159528',
    [SupportedChainId.POLYGON]: '0x5787BefDc0ECd210Dfa948264631CD53E68F7802',
  },
  'MATIC-USD': {
    [SupportedChainId.POLYGON_MUMBAI]: '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada',
    [SupportedChainId.POLYGON]: '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
  },
  'MATICX-USD': {
    [SupportedChainId.POLYGON]: '0x5d37E4b374E6907de8Fc7fb33EE3b0af403C7403',
  },
  'STMATIC-USD': {
    [SupportedChainId.POLYGON]: '0x97371dF4492605486e23Da797fA68e55Fc38a13f',
  },
  'USDC-USD': {
    [SupportedChainId.GOERLI]: '0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7',
    [SupportedChainId.POLYGON_MUMBAI]: '0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0',
    [SupportedChainId.POLYGON]: '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
    [SupportedChainId.MAINNET]: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
  },
  'USDT-USD': {
    [SupportedChainId.MAINNET]: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
    [SupportedChainId.POLYGON]: '0x0a6513e40db6eb1b165753ad52e80663aea50545'
  },
  'XAU-USD': {
    [SupportedChainId.GOERLI]: '0x7b219F57a8e9C7303204Af681e9fA69d17ef626f',
  },
  'EUR-USD': {
    [SupportedChainId.POLYGON_MUMBAI]: '0x7d7356bF6Ee5CDeC22B216581E48eCC700D0497A',
    [SupportedChainId.POLYGON]: '0x73366Fe0AA0Ded304479862808e02506FE556a98',
  },
  'SAND-USD': {
    [SupportedChainId.POLYGON_MUMBAI]: '0x9dd18534b8f456557d11B9DDB14dA89b2e52e308',
  },
  'USDT-USDC': {
    [SupportedChainId.POLYGON_MUMBAI]: '0x92C09849638959196E976289418e5973CC96d645',
    [SupportedChainId.POLYGON]: '0x0A6513e40db6EB1b165753AD52E80663aeA50545',
  },
  'AAVE-USD': {
    [SupportedChainId.MAINNET]: '0x547a514d5e3769680Ce22B2361c10Ea13619e8a9',
  },
  'BAT-ETH': {
    [SupportedChainId.MAINNET]: '0x0d16d4528239e9ee52fa531af613AcdB23D88c94',
  },
  'UNI-USD': {
    [SupportedChainId.MAINNET]: '0x553303d460EE0afB37EdFf9bE42922D8FF63220e',
  },
  'YFI-USD': {
    [SupportedChainId.MAINNET]: '0xA027702dbb89fbd58938e4324ac03B58d812b0E1',
  },
  'USDP-USD': {
    [SupportedChainId.MAINNET]: '0x09023c0DA49Aaf8fc3fA3ADF34C6A7016D38D5e3',
  },
  'ZRX-USD': {
    [SupportedChainId.MAINNET]: '0x2885d15b8Af22648b98B122b22FDF4D2a56c6023',
  },
  'FEI-USD': {
    [SupportedChainId.MAINNET]: '0x31e0a88fecB6eC0a411DBe0e9E76391498296EE9',
  },
  'MKR-USD': {
    [SupportedChainId.MAINNET]: '0xec1D1B3b0443256cc3860e24a46F108e699484Aa',
  },
  'COMP-USD': {
    [SupportedChainId.MAINNET]: '0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5',
  },
  'WSTETH-ETH': {
    [SupportedChainId.POLYGON]: '0x10f964234cae09cB6a9854B56FF7D4F38Cda5E6a',
  },
}

export const getChainLinkKeys = (chainId: number): string[] => {
  return Object.keys(chainLinkOracles).filter((x) => chainLinkOracles[x][chainId] !== undefined)
}

export const chainLinkOraclesEthereum: AddressDictionary = {
  '1INCH-USD': {
    [SupportedChainId.MAINNET]: '0xc929ad75B72593967DE83E7F7Cda0493458261D9',
  },
  'AAPL-USD': {
    [SupportedChainId.MAINNET]: '0x139C8512Cde1778e9b9a8e721ce1aEbd4dD43587',
  },
  'AAVE-ETH': {
    [SupportedChainId.MAINNET]: '0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012',
  },
  'AAVE-USD': {
    [SupportedChainId.MAINNET]: '0x547a514d5e3769680Ce22B2361c10Ea13619e8a9',
  },
  'ADA-USD': {
    [SupportedChainId.MAINNET]: '0xAE48c91dF1fE419994FFDa27da09D5aC69c30f55',
  },
  'ADX-USD': {
    [SupportedChainId.MAINNET]: '0x231e764B44b2C1b7Ca171fa8021A24ed520Cde10',
  },
  'ALCX-ETH': {
    [SupportedChainId.MAINNET]: '0x194a9AaF2e0b67c35915cD01101585A33Fe25CAa',
  },
  'ALCX-USD': {
    [SupportedChainId.MAINNET]: '0xc355e4C0B3ff4Ed0B49EaACD55FE29B311f42976',
  },
  'ALPHA-ETH': {
    [SupportedChainId.MAINNET]: '0x89c7926c7c15fD5BFDB1edcFf7E7fC8283B578F6',
  },
  'AMP-USD': {
    [SupportedChainId.MAINNET]: '0x8797ABc4641dE76342b8acE9C63e3301DC35e3d8',
  },
  'AMPL-ETH': {
    [SupportedChainId.MAINNET]: '0x492575FDD11a0fCf2C6C719867890a7648d526eB',
  },
  'AMZN-USD': {
    [SupportedChainId.MAINNET]: '0x8994115d287207144236c13Be5E2bDbf6357D9Fd',
  },
  'ANKR-USD': {
    [SupportedChainId.MAINNET]: '0x7eed379bf00005CfeD29feD4009669dE9Bcc21ce',
  },
  'ANT-ETH': {
    [SupportedChainId.MAINNET]: '0x8f83670260F8f7708143b836a2a6F11eF0aBac01',
  },
  'APE-ETH': {
    [SupportedChainId.MAINNET]: '0xc7de7f4d4C9c991fF62a07D18b3E31e349833A18',
  },
  'APE-USD': {
    [SupportedChainId.MAINNET]: '0xD10aBbC76679a20055E167BB80A24ac851b37056',
  },
  'ARPA-USD': {
    [SupportedChainId.MAINNET]: '0xc40ec815A2f8eb9912BD688d3bdE6B6D50A37ff2',
  },
  'ATOM-ETH': {
    [SupportedChainId.MAINNET]: '0x15c8eA24Ba2d36671Fa22aD4Cff0a8eafe144352',
  },
  'ATOM-USD': {
    [SupportedChainId.MAINNET]: '0xDC4BDB458C6361093069Ca2aD30D74cc152EdC75',
  },
  'AUD-USD': {
    [SupportedChainId.MAINNET]: '0x77F9710E7d0A19669A13c055F62cd80d313dF022',
  },
  'AVAX-USD': {
    [SupportedChainId.MAINNET]: '0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7',
  },
  'AXS-ETH': {
    [SupportedChainId.MAINNET]: '0x8B4fC5b68cD50eAc1dD33f695901624a4a1A0A8b',
  },
  'BADGER-ETH': {
    [SupportedChainId.MAINNET]: '0x58921Ac140522867bf50b9E009599Da0CA4A2379',
  },
  'BADGER-USD': {
    [SupportedChainId.MAINNET]: '0x66a47b7206130e6FF64854EF0E1EDfa237E65339',
  },
  'BAL-ETH': {
    [SupportedChainId.MAINNET]: '0xC1438AA3823A6Ba0C159CfA8D98dF5A994bA120b',
  },
  'BAL-USD': {
    [SupportedChainId.MAINNET]: '0xdF2917806E30300537aEB49A7663062F4d1F2b5F',
  },
  'BAND-ETH': {
    [SupportedChainId.MAINNET]: '0x0BDb051e10c9718d1C29efbad442E88D38958274',
  },
  'BAND-USD': {
    [SupportedChainId.MAINNET]: '0x919C77ACc7373D000b329c1276C76586ed2Dd19F',
  },
  'BAT-ETH': {
    [SupportedChainId.MAINNET]: '0x0d16d4528239e9ee52fa531af613AcdB23D88c94',
  },
  'BCH-USD': {
    [SupportedChainId.MAINNET]: '0x9F0F69428F923D6c95B781F89E165C9b2df9789D',
  },
  'BIT-USD': {
    [SupportedChainId.MAINNET]: '0x7b33EbfA52F215a30FaD5a71b3FeE57a4831f1F0',
  },
  'BNB-ETH': {
    [SupportedChainId.MAINNET]: '0xc546d2d06144F9DD42815b8bA46Ee7B8FcAFa4a2',
  },
  'BNB-USD': {
    [SupportedChainId.MAINNET]: '0x14e613AC84a31f709eadbdF89C6CC390fDc9540A',
  },
  'BNT-ETH': {
    [SupportedChainId.MAINNET]: '0xCf61d1841B178fe82C8895fe60c2EDDa08314416',
  },
  'BNT-USD': {
    [SupportedChainId.MAINNET]: '0x1E6cF0D433de4FE882A437ABC654F58E1e78548c',
  },
  'BOND-ETH': {
    [SupportedChainId.MAINNET]: '0xdd22A54e05410D8d1007c38b5c7A3eD74b855281',
  },
  'BRL-USD': {
    [SupportedChainId.MAINNET]: '0x971E8F1B779A5F1C36e1cd7ef44Ba1Cc2F5EeE0f',
  },
  'BTC-ETH': {
    [SupportedChainId.MAINNET]: '0xdeb288F737066589598e9214E782fa5A8eD689e8',
  },
  'BTC-USD': {
    [SupportedChainId.MAINNET]: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
  },
  'BUSD-ETH': {
    [SupportedChainId.MAINNET]: '0x614715d2Af89E6EC99A233818275142cE88d1Cfd',
  },
  'BUSD-USD': {
    [SupportedChainId.MAINNET]: '0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A',
  },
  'C98-USD': {
    [SupportedChainId.MAINNET]: '0xE95CDc33E1F5BfE7eB26f45E29C6C9032B97db7F',
  },
  'CAD-USD': {
    [SupportedChainId.MAINNET]: '0xa34317DB73e77d453b1B8d04550c44D10e981C8e',
  },
  'CAKE-USD': {
    [SupportedChainId.MAINNET]: '0xEb0adf5C06861d6c07174288ce4D0a8128164003',
  },
  'CBETH-ETH': {
    [SupportedChainId.MAINNET]: '0xF017fcB346A1885194689bA23Eff2fE6fA5C483b',
  },
  'CEL-ETH': {
    [SupportedChainId.MAINNET]: '0x75FbD83b4bd51dEe765b2a01e8D3aa1B020F9d33',
  },
  'CELO-ETH': {
    [SupportedChainId.MAINNET]: '0x9ae96129ed8FE0C707D6eeBa7b90bB1e139e543e',
  },
  'CHF-USD': {
    [SupportedChainId.MAINNET]: '0x449d117117838fFA61263B61dA6301AA2a88B13A',
  },
  'CNY-USD': {
    [SupportedChainId.MAINNET]: '0xeF8A4aF35cd47424672E3C590aBD37FBB7A7759a',
  },
  'COMP-ETH': {
    [SupportedChainId.MAINNET]: '0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699',
  },
  'COMP-USD': {
    [SupportedChainId.MAINNET]: '0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5',
  },
  'CREAM-ETH': {
    [SupportedChainId.MAINNET]: '0x82597CFE6af8baad7c0d441AA82cbC3b51759607',
  },
  'CRO-USD': {
    [SupportedChainId.MAINNET]: '0x00Cb80Cf097D9aA9A3779ad8EE7cF98437eaE050',
  },
  'CRV-ETH': {
    [SupportedChainId.MAINNET]: '0x8a12Be339B0cD1829b91Adc01977caa5E9ac121e',
  },
  'CRV-USD': {
    [SupportedChainId.MAINNET]: '0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f',
  },
  'CSPR-USD': {
    [SupportedChainId.MAINNET]: '0x9e37a8Ee3bFa8eD6783Db031Dc458d200b226074',
  },
  'CTSI-ETH': {
    [SupportedChainId.MAINNET]: '0x0a1d1b9847d602e789be38B802246161FFA24930',
  },
  'CVX-ETH': {
    [SupportedChainId.MAINNET]: '0xC9CbF687f43176B302F03f5e58470b77D07c61c6',
  },
  'CVX-USD': {
    [SupportedChainId.MAINNET]: '0xd962fC30A72A84cE50161031391756Bf2876Af5D',
  },
  'DAI-ETH': {
    [SupportedChainId.MAINNET]: '0x773616E4d11A78F511299002da57A0a94577F1f4',
  },
  'DAI-USD': {
    [SupportedChainId.MAINNET]: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
  },
  'DASH-USD': {
    [SupportedChainId.MAINNET]: '0xFb0cADFEa136E9E343cfb55B863a6Df8348ab912',
  },
  'DODO-USD': {
    [SupportedChainId.MAINNET]: '0x9613A51Ad59EE375e6D8fa12eeef0281f1448739',
  },
  'DOGE-USD': {
    [SupportedChainId.MAINNET]: '0x2465CefD3b488BE410b941b1d4b2767088e2A028',
  },
  'DOT-USD': {
    [SupportedChainId.MAINNET]: '0x1C07AFb8E2B827c5A4739C6d59Ae3A5035f28734',
  },
  'DYDX-USD': {
    [SupportedChainId.MAINNET]: '0x478909D4D798f3a1F11fFB25E4920C959B4aDe0b',
  },
  'ENJ-ETH': {
    [SupportedChainId.MAINNET]: '0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B',
  },
  'ENJ-USD': {
    [SupportedChainId.MAINNET]: '0x23905C55dC11D609D5d11Dc604905779545De9a7',
  },
  'ENS-USD': {
    [SupportedChainId.MAINNET]: '0x5C00128d4d1c2F4f652C267d7bcdD7aC99C16E16',
  },
  'EOS-USD': {
    [SupportedChainId.MAINNET]: '0x10a43289895eAff840E8d45995BBa89f9115ECEe',
  },
  'ERN-USD': {
    [SupportedChainId.MAINNET]: '0x0a87e12689374A4EF49729582B474a1013cceBf8',
  },
  'ETC-USD': {
    [SupportedChainId.MAINNET]: '0xaEA2808407B7319A31A383B6F8B60f04BCa23cE2',
  },
  'ETH-BTC': {
    [SupportedChainId.MAINNET]: '0xAc559F25B1619171CbC396a50854A3240b6A4e99',
  },
  'ETH-USD': {
    [SupportedChainId.MAINNET]: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  },
  'EUR-USD': {
    [SupportedChainId.MAINNET]: '0xb49f677943BC038e9857d61E7d053CaA2C1734C1',
  },
  'EURT-USD': {
    [SupportedChainId.MAINNET]: '0x01D391A48f4F7339aC64CA2c83a07C22F95F587a',
  },
  'FARM-ETH': {
    [SupportedChainId.MAINNET]: '0x611E0d2709416E002A3f38085e4e1cf77c015921',
  },
  'FB-USD': {
    [SupportedChainId.MAINNET]: '0xCe1051646393087e706288C1B57Fd26446657A7f',
  },
  'FEI-ETH': {
    [SupportedChainId.MAINNET]: '0x7F0D2c2838c6AC24443d13e23d99490017bDe370',
  },
  'FEI-USD': {
    [SupportedChainId.MAINNET]: '0x31e0a88fecB6eC0a411DBe0e9E76391498296EE9',
  },
  'FIL-ETH': {
    [SupportedChainId.MAINNET]: '0x0606Be69451B1C9861Ac6b3626b99093b713E801',
  },
  'FLOW-USD': {
    [SupportedChainId.MAINNET]: '0xD9BdD9f5ffa7d89c846A5E3231a093AE4b3469D2',
  },
  'FOR-USD': {
    [SupportedChainId.MAINNET]: '0x456834f736094Fb0AAD40a9BBc9D4a0f37818A54',
  },
  'FORTH-USD': {
    [SupportedChainId.MAINNET]: '0x7D77Fd73E468baECe26852776BeaF073CDc55fA0',
  },
  'FRAX-ETH': {
    [SupportedChainId.MAINNET]: '0x14d04Fff8D21bd62987a5cE9ce543d2F1edF5D3E',
  },
  'FRAX-USD': {
    [SupportedChainId.MAINNET]: '0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD',
  },
  'FTM-ETH': {
    [SupportedChainId.MAINNET]: '0x2DE7E4a9488488e0058B95854CC2f7955B35dC9b',
  },
  'FXS-USD': {
    [SupportedChainId.MAINNET]: '0x6Ebc52C8C1089be9eB3945C4350B68B8E4C2233f',
  },
  'GBP-USD': {
    [SupportedChainId.MAINNET]: '0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5',
  },
  'GLM-USD': {
    [SupportedChainId.MAINNET]: '0x83441C3A10F4D05de6e0f2E849A850Ccf27E6fa7',
  },
  'GNO-ETH': {
    [SupportedChainId.MAINNET]: '0xA614953dF476577E90dcf4e3428960e221EA4727',
  },
  'GOOGL-USD': {
    [SupportedChainId.MAINNET]: '0x36D39936BeA501755921beB5A382a88179070219',
  },
  'GRT-ETH': {
    [SupportedChainId.MAINNET]: '0x17D054eCac33D91F7340645341eFB5DE9009F1C1',
  },
  'GRT-USD': {
    [SupportedChainId.MAINNET]: '0x86cF33a451dE9dc61a2862FD94FF4ad4Bd65A5d2',
  },
  'GTC-ETH': {
    [SupportedChainId.MAINNET]: '0x0e773A17a01E2c92F5d4c53435397E2bd48e215F',
  },
  'GUSD-ETH': {
    [SupportedChainId.MAINNET]: '0x96d15851CBac05aEe4EFD9eA3a3DD9BDEeC9fC28',
  },
  'GUSD-USD': {
    [SupportedChainId.MAINNET]: '0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc',
  },
  'HBAR-USD': {
    [SupportedChainId.MAINNET]: '0x38C5ae3ee324ee027D88c5117ee58d07c9b4699b',
  },
  'HIGH-USD': {
    [SupportedChainId.MAINNET]: '0xe2F95bC12FE8a3C35684Be7586C39fD7c0E5b403',
  },
  'HT-USD': {
    [SupportedChainId.MAINNET]: '0xE1329B3f6513912CAf589659777b66011AEE5880',
  },
  'ILV-ETH': {
    [SupportedChainId.MAINNET]: '0xf600984CCa37cd562E74E3EE514289e3613ce8E4',
  },
  'IMX-USD': {
    [SupportedChainId.MAINNET]: '0xBAEbEFc1D023c0feCcc047Bff42E75F15Ff213E6',
  },
  'INJ-USD': {
    [SupportedChainId.MAINNET]: '0xaE2EbE3c4D20cE13cE47cbb49b6d7ee631Cd816e',
  },
  'INR-USD': {
    [SupportedChainId.MAINNET]: '0x605D5c2fBCeDb217D7987FC0951B5753069bC360',
  },
  'IOTX-USD': {
    [SupportedChainId.MAINNET]: '0x96c45535d235148Dc3ABA1E48A6E3cFB3510f4E2',
  },
  'JPY-USD': {
    [SupportedChainId.MAINNET]: '0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3',
  },
  'KNC-ETH': {
    [SupportedChainId.MAINNET]: '0x656c0544eF4C98A6a98491833A89204Abb045d6b',
  },
  'KNC-USD': {
    [SupportedChainId.MAINNET]: '0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc',
  },
  'KP3R-ETH': {
    [SupportedChainId.MAINNET]: '0xe7015CCb7E5F788B8c1010FC22343473EaaC3741',
  },
  'KRW-USD': {
    [SupportedChainId.MAINNET]: '0x01435677FB11763550905594A16B645847C1d0F3',
  },
  'KSM-USD': {
    [SupportedChainId.MAINNET]: '0x06E4164E24E72B879D93360D1B9fA05838A62EB5',
  },
  'LDO-ETH': {
    [SupportedChainId.MAINNET]: '0x4e844125952D32AcdF339BE976c98E22F6F318dB',
  },
  'LINK-ETH': {
    [SupportedChainId.MAINNET]: '0xDC530D9457755926550b59e8ECcdaE7624181557',
  },
  'LINK-USD': {
    [SupportedChainId.MAINNET]: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
  },
  'LON-ETH': {
    [SupportedChainId.MAINNET]: '0x13A8F2cC27ccC2761ca1b21d2F3E762445f201CE',
  },
  'LRC-ETH': {
    [SupportedChainId.MAINNET]: '0x160AC928A16C93eD4895C2De6f81ECcE9a7eB7b4',
  },
  'LTC-USD': {
    [SupportedChainId.MAINNET]: '0x6AF09DF7563C363B5763b9102712EbeD3b9e859B',
  },
  'LUSD-USD': {
    [SupportedChainId.MAINNET]: '0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0',
  },
  'MANA-ETH': {
    [SupportedChainId.MAINNET]: '0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9',
  },
  'MANA-USD': {
    [SupportedChainId.MAINNET]: '0x56a4857acbcfe3a66965c251628B1c9f1c408C19',
  },
  'MATIC-USD': {
    [SupportedChainId.MAINNET]: '0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676',
  },
  'MIM-USD': {
    [SupportedChainId.MAINNET]: '0x7A364e8770418566e3eb2001A96116E6138Eb32F',
  },
  'MKR-ETH': {
    [SupportedChainId.MAINNET]: '0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2',
  },
  'MKR-USD': {
    [SupportedChainId.MAINNET]: '0xec1D1B3b0443256cc3860e24a46F108e699484Aa',
  },
  'MLN-ETH': {
    [SupportedChainId.MAINNET]: '0xDaeA8386611A157B08829ED4997A8A62B557014C',
  },
  'MSFT-USD': {
    [SupportedChainId.MAINNET]: '0x021Fb44bfeafA0999C7b07C4791cf4B859C3b431',
  },
  'NEAR-USD': {
    [SupportedChainId.MAINNET]: '0xC12A6d1D827e23318266Ef16Ba6F397F2F91dA9b',
  },
  'NFLX-USD': {
    [SupportedChainId.MAINNET]: '0x67C2e69c5272B94AF3C90683a9947C39Dc605ddE',
  },
  'NMR-ETH': {
    [SupportedChainId.MAINNET]: '0x9cB2A01A7E64992d32A34db7cEea4c919C391f6A',
  },
  'NMR-USD': {
    [SupportedChainId.MAINNET]: '0xcC445B35b3636bC7cC7051f4769D8982ED0d449A',
  },
  'NZD-USD': {
    [SupportedChainId.MAINNET]: '0x3977CFc9e4f29C184D4675f4EB8e0013236e5f3e',
  },
  'OCEAN-ETH': {
    [SupportedChainId.MAINNET]: '0x9b0FC4bb9981e5333689d69BdBF66351B9861E62',
  },
  'OGN-ETH': {
    [SupportedChainId.MAINNET]: '0x2c881B6f3f6B5ff6C975813F87A4dad0b241C15b',
  },
  'OHMv2-ETH': {
    [SupportedChainId.MAINNET]: '0x9a72298ae3886221820B1c878d12D872087D3a23',
  },
  'OM-USD': {
    [SupportedChainId.MAINNET]: '0xb9583cfBdEeacd2705546F392E43F8E03eB92216',
  },
  'OMG-ETH': {
    [SupportedChainId.MAINNET]: '0x57C9aB3e56EE4a83752c181f241120a3DBba06a1',
  },
  'OMG-USD': {
    [SupportedChainId.MAINNET]: '0x7D476f061F8212A8C9317D5784e72B4212436E93',
  },
  'ONT-USD': {
    [SupportedChainId.MAINNET]: '0xcDa3708C5c2907FCca52BB3f9d3e4c2028b89319',
  },
  'ORN-ETH': {
    [SupportedChainId.MAINNET]: '0xbA9B2a360eb8aBdb677d6d7f27E12De11AA052ef',
  },
  'OXT-USD': {
    [SupportedChainId.MAINNET]: '0xd75AAaE4AF0c398ca13e2667Be57AF2ccA8B5de6',
  },
  'PAXG-ETH': {
    [SupportedChainId.MAINNET]: '0x9B97304EA12EFed0FAd976FBeCAad46016bf269e',
  },
  'PERP-ETH': {
    [SupportedChainId.MAINNET]: '0x3b41D5571468904D4e53b6a8d93A6BaC43f02dC9',
  },
  'PERP-USD': {
    [SupportedChainId.MAINNET]: '0x01cE1210Fe8153500F60f7131d63239373D7E26C',
  },
  'PHA-USD': {
    [SupportedChainId.MAINNET]: '0x2B1248028fe48864c4f1c305E524e2e6702eAFDF',
  },
  'RAI-ETH': {
    [SupportedChainId.MAINNET]: '0x4ad7B025127e89263242aB68F0f9c4E5C033B489',
  },
  'REN-ETH': {
    [SupportedChainId.MAINNET]: '0x3147D7203354Dc06D9fd350c7a2437bcA92387a4',
  },
  'REN-USD': {
    [SupportedChainId.MAINNET]: '0x0f59666EDE214281e956cb3b2D0d69415AfF4A01',
  },
  'REQ-USD': {
    [SupportedChainId.MAINNET]: '0x2F05888D185970f178f40610306a0Cc305e52bBF',
  },
  'RLC-ETH': {
    [SupportedChainId.MAINNET]: '0x4cba1e1fdc738D0fe8DB3ee07728E2Bc4DA676c6',
  },
  'RUNE-ETH': {
    [SupportedChainId.MAINNET]: '0x875D60C44cfbC38BaA4Eb2dDB76A767dEB91b97e',
  },
  'SAND-USD': {
    [SupportedChainId.MAINNET]: '0x35E3f7E558C04cE7eEE1629258EcbbA03B36Ec56',
  },
  'SGD-USD': {
    [SupportedChainId.MAINNET]: '0xe25277fF4bbF9081C75Ab0EB13B4A13a721f3E13',
  },
  'SHIB-ETH': {
    [SupportedChainId.MAINNET]: '0x8dD1CD88F43aF196ae478e91b9F5E4Ac69A97C61',
  },
  'SNX-ETH': {
    [SupportedChainId.MAINNET]: '0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c',
  },
  'SNX-USD': {
    [SupportedChainId.MAINNET]: '0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699',
  },
  'SOL-USD': {
    [SupportedChainId.MAINNET]: '0x4ffC43a60e009B551865A93d232E33Fce9f01507',
  },
  'SPELL-USD': {
    [SupportedChainId.MAINNET]: '0x8c110B94C5f1d347fAcF5E1E938AB2db60E3c9a8',
  },
  'SRM-ETH': {
    [SupportedChainId.MAINNET]: '0x050c048c9a0CD0e76f166E2539F87ef2acCEC58f',
  },
  'STETH-ETH': {
    [SupportedChainId.MAINNET]: '0x86392dC19c0b719886221c78AB11eb8Cf5c52812',
  },
  'SUSD-ETH': {
    [SupportedChainId.MAINNET]: '0x8e0b7e6062272B5eF4524250bFFF8e5Bd3497757',
  },
  'SUSHI-ETH': {
    [SupportedChainId.MAINNET]: '0xe572CeF69f43c2E488b33924AF04BDacE19079cf',
  },
  'SUSHI-USD': {
    [SupportedChainId.MAINNET]: '0xCc70F09A6CC17553b2E31954cD36E4A2d89501f7',
  },
  'SXP-USD': {
    [SupportedChainId.MAINNET]: '0xFb0CfD6c19e25DB4a08D8a204a387cEa48Cc138f',
  },
  'TOMO-USD': {
    [SupportedChainId.MAINNET]: '0x3d44925a8E9F9DFd90390E58e92Ec16c996A331b',
  },
  'TRIBE-ETH': {
    [SupportedChainId.MAINNET]: '0x84a24deCA415Acc0c395872a9e6a63E27D6225c8',
  },
  'TRU-USD': {
    [SupportedChainId.MAINNET]: '0x26929b85fE284EeAB939831002e1928183a10fb1',
  },
  'TRY-USD': {
    [SupportedChainId.MAINNET]: '0xB09fC5fD3f11Cf9eb5E1C5Dba43114e3C9f477b5',
  },
  'TSLA-USD': {
    [SupportedChainId.MAINNET]: '0x1ceDaaB50936881B3e449e47e40A2cDAF5576A4a',
  },
  'TUSD-ETH': {
    [SupportedChainId.MAINNET]: '0x3886BA987236181D98F2401c507Fb8BeA7871dF2',
  },
  'TUSD-USD': {
    [SupportedChainId.MAINNET]: '0xec746eCF986E2927Abd291a2A1716c940100f8Ba',
  },
  'UNI-ETH': {
    [SupportedChainId.MAINNET]: '0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e',
  },
  'UNI-USD': {
    [SupportedChainId.MAINNET]: '0x553303d460EE0afB37EdFf9bE42922D8FF63220e',
  },
  'USDC-ETH': {
    [SupportedChainId.MAINNET]: '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4',
  },
  'USDC-USD': {
    [SupportedChainId.MAINNET]: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
  },
  'USDK-USD': {
    [SupportedChainId.MAINNET]: '0xfAC81Ea9Dd29D8E9b212acd6edBEb6dE38Cb43Af',
  },
  'USDN-USD': {
    [SupportedChainId.MAINNET]: '0x7a8544894F7FD0C69cFcBE2b4b2E277B0b9a4355',
  },
  'USDP-USD': {
    [SupportedChainId.MAINNET]: '0x09023c0DA49Aaf8fc3fA3ADF34C6A7016D38D5e3',
  },
  'USDT-ETH': {
    [SupportedChainId.MAINNET]: '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46',
  },
  'USDT-USD': {
    [SupportedChainId.MAINNET]: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
  },
  'WBTC-BTC': {
    [SupportedChainId.MAINNET]: '0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23',
  },
  'WING-USD': {
    [SupportedChainId.MAINNET]: '0x134fE0a225Fb8e6683617C13cEB6B3319fB4fb82',
  },
  'WNXM-ETH': {
    [SupportedChainId.MAINNET]: '0xe5Dc0A609Ab8bCF15d3f35cFaa1Ff40f521173Ea',
  },
  'WTI-USD': {
    [SupportedChainId.MAINNET]: '0xf3584F4dd3b467e73C2339EfD008665a70A4185c',
  },
  'XAG-USD': {
    [SupportedChainId.MAINNET]: '0x379589227b15F1a12195D3f2d90bBc9F31f95235',
  },
  'XAU-USD': {
    [SupportedChainId.MAINNET]: '0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6',
  },
  'XCN-USD': {
    [SupportedChainId.MAINNET]: '0xeb988B77b94C186053282BfcD8B7ED55142D3cAB',
  },
  'XMR-USD': {
    [SupportedChainId.MAINNET]: '0xFA66458Cce7Dd15D8650015c4fce4D278271618F',
  },
  'XRP-USD': {
    [SupportedChainId.MAINNET]: '0xCed2660c6Dd1Ffd856A5A82C67f3482d88C50b12',
  },
  'YFI-ETH': {
    [SupportedChainId.MAINNET]: '0x7c5d4F8345e66f68099581Db340cd65B078C41f4',
  },
  'YFI-USD': {
    [SupportedChainId.MAINNET]: '0xA027702dbb89fbd58938e4324ac03B58d812b0E1',
  },
  'YFII-ETH': {
    [SupportedChainId.MAINNET]: '0xaaB2f6b45B28E962B3aCd1ee4fC88aEdDf557756',
  },
  'ZRX-ETH': {
    [SupportedChainId.MAINNET]: '0x2Da4983a622a8498bb1a21FaE9D8F6C664939962',
  },
  'ZRX-USD': {
    [SupportedChainId.MAINNET]: '0x2885d15b8Af22648b98B122b22FDF4D2a56c6023',
  },
  'sUSD-USD': {
    [SupportedChainId.MAINNET]: '0xad35Bd71b9aFE6e4bDc266B345c198eaDEf9Ad94',
  },
}
