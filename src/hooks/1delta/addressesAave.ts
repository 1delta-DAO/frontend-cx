import { SupportedChainId } from 'constants/chains'
import { SupportedAssets } from 'types/1delta'
import { AddressDictionary } from './addresses'

export const addressesAaveCore: AddressDictionary = {
  UiIncentiveDataProviderV3: {
    [SupportedChainId.POLYGON]: '0xF43EfC9789736BaF550DC016C7389210c43e7997',
  },
  AaveOracle: {
    [SupportedChainId.GOERLI]: '0xcb601629B36891c43943e3CDa2eB18FAc38B5c4e',
    [SupportedChainId.POLYGON_MUMBAI]: '0xf0E6744a59177014738e1eF920dc676fb3b8CB62',
    [SupportedChainId.POLYGON]: '0xb023e699F5a33916Ea823A16485e259257cA8Bd1',
  },
  FallbackOracleAave: {
    [SupportedChainId.GOERLI]: '0x0000000000000000000000000000000000000000',
    [SupportedChainId.POLYGON_MUMBAI]: '0x0000000000000000000000000000000000000000',
  },
  PoolProxy: {
    [SupportedChainId.GOERLI]: '0x617Cf26407193E32a771264fB5e9b8f09715CdfB',
    [SupportedChainId.POLYGON_MUMBAI]: '0x0b913A76beFF3887d35073b8e5530755D60F78C7',
    [SupportedChainId.POLYGON]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD', // marked as pool in docs
  },
  PoolDataProvider: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xacB5aDd3029C5004f726e8411033E6202Bc3dd01',
    [SupportedChainId.GOERLI]: '0xB7d8ff9949dB06D8387C28332045b8F734641755',
    [SupportedChainId.POLYGON]: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
  },
  ghoOracle: {
    [SupportedChainId.GOERLI]: '0xDD714B0A68b9c81C6878688c5dc6238f8AC8eadD'
  },
  PoolDataProviderGhst: {
    [SupportedChainId.GOERLI]: '0xB7d8ff9949dB06D8387C28332045b8F734641755',
  },
  ghst: {
    [SupportedChainId.GOERLI]: '0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211',
  },
}

export const addressesAaveTestnetTokens: AddressDictionary = {
  [SupportedAssets.AAVE]: {
    [SupportedChainId.GOERLI]: '0xE205181Eb3D7415f15377F79aA7769F846cE56DD',
    [SupportedChainId.POLYGON_MUMBAI]: '0x2020b82569721DF47393505eeEDF2863D6A0504f',
  },
  [SupportedAssets.AGEUR]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x1870299d37aa5992850156516DD81DcBf98f2b1C',
  },
  [SupportedAssets.BAL]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x332Ef44Ece256E4d99838f2AD4E63DB4754E0876',
  },
  [SupportedAssets.CRV]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x0799ea468F812e40DBABe77B381cac105Da500Cd',
  },
  [SupportedAssets.DAI]: {
    [SupportedChainId.GOERLI]: '0xD77b79BE3e85351fF0cbe78f1B58cf8d1064047C',
    [SupportedChainId.POLYGON_MUMBAI]: '0xF14f9596430931E177469715c591513308244e8F',
  },
  [SupportedAssets.DPI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x521C69B654d1e6EAC55d95EfccEa839fE3cb92Af',
  },
  [SupportedAssets.EURS]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xF6379c02780AB48f55EE5F79dC5083C5a15583b9',
  },
  [SupportedAssets.GHST]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xA13F6C1047f90642039EF627C66B758BCEC513Ba',
  },
  [SupportedAssets.JEUR]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x6bF2BC4BD4277737bd50cF377851eCF81B62e320',
  },
  [SupportedAssets.LINK]: {
    [SupportedChainId.GOERLI]: '0x2166903C38B4883B855eA2C77A02430a27Cdfede',
    [SupportedChainId.POLYGON_MUMBAI]: '0x4e2f1E0dC4EAD962d3c3014e582d974b3cedF743',
  },
  [SupportedAssets.SUSHI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x69d6444016CBE7f60f02A476B1832a36010c22e4',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.GOERLI]: '0x69305b943C6F55743b2Ece5c0b20507300a39FC3',
    [SupportedChainId.POLYGON_MUMBAI]: '0xe9DcE89B076BA6107Bb64EF30678efec11939234',
  },
  [SupportedAssets.USDT]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xAcDe43b9E5f72a4F554D4346e69e8e7AC8F352f0',
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x97e8dE167322a3bCA28E8A49BC46F6Ce128FEC68',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.GOERLI]: '0x84ced17d95F3EC7230bAf4a369F1e624Ae60090d',
    [SupportedChainId.POLYGON_MUMBAI]: '0xD087ff96281dcf722AEa82aCA57E8545EA9e6C96',
  },
  [SupportedAssets.WMATIC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xf237dE5664D3c2D2545684E76fef02A3A58A364c',
  },
  [SupportedAssets.GHO]: {
    [SupportedChainId.GOERLI]: '0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211'
  }
}

export const addressesAaveATokens: AddressDictionary = {
  [SupportedAssets.AAVE]: {
    [SupportedChainId.POLYGON]: '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375',
    [SupportedChainId.POLYGON_MUMBAI]: '0xB695309240e72Fc0244E8aF58b2f6A13b2930502',
    [SupportedChainId.GOERLI]: '0xAC4D92980562Ac11Af46C6C7CEdD7C819C2028D0',
  },
  [SupportedAssets.AGEUR]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x605d3B24D146d202E15f55139c160c492D9F945e',
    [SupportedChainId.POLYGON]: '0x8437d7c167dfb82ed4cb79cd44b7a32a1dd95c77',
  },
  [SupportedAssets.BAL]: {
    [SupportedChainId.POLYGON]: '0x8ffDf2DE812095b1D19CB146E4c004587C0A0692',
    [SupportedChainId.POLYGON_MUMBAI]: '0x85c530cf815F842Bd7F9f1C41Ed81a6a54719375',
  },
  [SupportedAssets.CRV]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x4582d6B1c50345d9CF74d2cF5F130141d0BBA595',
    [SupportedChainId.POLYGON]: '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf',
  },
  [SupportedAssets.DAI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xFAF6a49b4657D9c8dDa675c41cB9a05a94D3e9e9',
    [SupportedChainId.GOERLI]: '0x7402b9625D1712426807952b798e3180dC38876F',
    [SupportedChainId.POLYGON]: '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE',
  },
  [SupportedAssets.DPI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x3Ae14a7486b3c7bfB93C1368249368a4458Fd557',
    [SupportedChainId.POLYGON]: '0x724dc807b04555b71ed48a6896b6F41593b8C637',
  },
  [SupportedAssets.EURS]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x7948efE934B6a7D24B17032D81cB9CD489C68Df0',
    [SupportedChainId.POLYGON]: '0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5',
  },
  [SupportedAssets.GHST]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x1687666e4ffA0f45c1B6701720E32f79b1B24036',
    [SupportedChainId.POLYGON]: '0x8Eb270e296023E9D92081fdF967dDd7878724424',
  },
  [SupportedAssets.JEUR]: {
    [SupportedChainId.POLYGON]: '0x6533afac2E7BCCB20dca161449A13A32D391fb00',
    [SupportedChainId.POLYGON_MUMBAI]: '0x07931E5fA73f30Ae626C5809A736A7a7374a1320',
  },
  [SupportedAssets.LINK]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x60f42c880B61D9114251882fC144395843D9839d',
    [SupportedChainId.GOERLI]: '0x601c61Fc4eEe64a4b1f5201125b788dc1585746b',
    [SupportedChainId.POLYGON]: '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530',
  },
  [SupportedAssets.SUSHI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xD9EB7E2FEcA3132A1bd8EB259C26717935488f04',
    [SupportedChainId.POLYGON]: '0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.POLYGON]: '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
    [SupportedChainId.POLYGON_MUMBAI]: '0x9daBC9860F8792AeE427808BDeF1f77eFeF0f24E',
    [SupportedChainId.GOERLI]: '0xdC916609281306558E0e8245bFBf90EFd3eCAb96',
  },
  [SupportedAssets.USDT]: {
    [SupportedChainId.POLYGON]: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
    [SupportedChainId.POLYGON_MUMBAI]: '0xEF4aEDfD3552db80E8F5133ed5c27cebeD2fE015',
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x7aF0Df3DD1b8ee7a70549bd3E3C902e7B24D32F9',
    [SupportedChainId.POLYGON]: '0x078f358208685046a11C85e8ad32895DED33A249',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xAA02A95942Cb7d48Ac8ad8C3b5D65E546eC3Ecd3',
    [SupportedChainId.GOERLI]: '0x49871B521E44cb4a34b2bF2cbCF03C1CF895C48b',
    [SupportedChainId.POLYGON]: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
  },
  [SupportedAssets.WMATIC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xC0e5f125D33732aDadb04134dB0d351E9bB5BCf6',
    [SupportedChainId.POLYGON]: '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97',
  },
  [SupportedAssets.MIMATIC]: {
    [SupportedChainId.POLYGON]: '0xeBe517846d0F36eCEd99C735cbF6131e1fEB775D',
  },
  [SupportedAssets.MATICX]: {
    [SupportedChainId.POLYGON]: '0x80cA0d8C38d2e2BcbaB66aA1648Bd1C7160500FE',
  },
  [SupportedAssets.STMATIC]: {
    [SupportedChainId.POLYGON]: '0xEA1132120ddcDDA2F119e99Fa7A27a0d036F7Ac9',
  },
  [SupportedAssets.GHO]: {
    [SupportedChainId.GOERLI]: '0xdC25729a09241d24c4228f1a0C27137770cF363e'
  }
}

export const addressesAaveAggregators = {
  [SupportedAssets.AAVE]: {
    [SupportedChainId.GOERLI]: '0x87a3F24060BbbAD5dfCE055f24d253f84B11326d',
    [SupportedChainId.POLYGON_MUMBAI]: '0xD90db1ca5A6e9873BCD9B0279AE038272b656728',
  },
  [SupportedAssets.AGEUR]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x028806D92D6fC46f301b38EF1cA6d3ceFE7f3E4B',
  },
  [SupportedAssets.BAL]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x99B70f90b76716D9f909AD91de7e7F44d3445da4',
  },
  [SupportedAssets.CRV]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xCcbBaf8D40a5C34bf1c836e8dD33c7B7646706C5',
  },
  [SupportedAssets.DAI]: {
    [SupportedChainId.GOERLI]: '0x2A5Acddb524B9454204Ed54EAB51Faf24250a397',
    [SupportedChainId.POLYGON_MUMBAI]: '0x1D01f7d8B42Ec47837966732f831E1D6321df499',
  },
  [SupportedAssets.DPI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x36556E9b01BCcCF0017C4998D972614f751Adf14',
  },
  [SupportedAssets.EURS]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x8e0988b28f9CdDe0134A206dfF94111578498C63',
  },
  [SupportedAssets.GHST]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x1775ECC8362dB6CaB0c7A9C0957cF656A5276c29',
  },
  [SupportedAssets.JEUR]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x55E1267C2e587b6b5E94aD4f72E3eDA725D58b8D',
  },
  [SupportedAssets.LINK]: {
    [SupportedChainId.GOERLI]: '0x5b48AE7B44e1b6000d5E9227Af362223AfA87b1A',
    [SupportedChainId.POLYGON_MUMBAI]: '0xFc7215C9498Fc12b22Bc0ed335871Db4315f03d3',
  },
  [SupportedAssets.SUSHI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x127277bF2F5fA186bfC6b3a0ca00baefB5472d3a',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.GOERLI]: '0x30Ce0bA21A92E14b889F4f31748650EFA8D4C860',
    [SupportedChainId.POLYGON_MUMBAI]: '0x73b4C0C45bfB90FC44D9013FA213eF2C2d908D0A',
  },
  [SupportedAssets.USDT]: {
    [SupportedChainId.GOERLI]: '0x5838fD84a94B3Bc30EE4BDF10AD981Da3310a6a9',
    [SupportedChainId.POLYGON_MUMBAI]: '0x28A8E6e41F84e62284970E4bc0867cEe2AAd0DA4',
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.GOERLI]: '0x2Cb17b22e3Aff6e291D3448C11f39779A576ae17',
    [SupportedChainId.POLYGON_MUMBAI]: '0x3E937B4881CBd500d05EeDAB7BA203f2b7B3f74f',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.GOERLI]: '0x60E4B131f0F219c72b0346675283E73888e4AB24',
    [SupportedChainId.POLYGON_MUMBAI]: '0x09C85Ef96e93f0ae892561052B48AE9DB29F2458',
  },
  [SupportedAssets.WMATIC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x036dDd300B57F6a8A6A55e2ede8b50b517A5094f',
  },
  [SupportedAssets.EURS]: {
    [SupportedChainId.GOERLI]: '0xf6dc74ec7851695AD549BbF88d371C0A62E9Be23',
    [SupportedChainId.POLYGON_MUMBAI]: '0x8e0988b28f9CdDe0134A206dfF94111578498C63',
  },
  [SupportedAssets.GHO]: {
    [SupportedChainId.GOERLI]: '0xDD714B0A68b9c81C6878688c5dc6238f8AC8eadD'
  }
}

export const addressesAaveVTokens: AddressDictionary = {
  [SupportedAssets.AAVE]: {
    [SupportedChainId.GOERLI]: '0xCB62E1d181179d1D86D3877e221D1EdE0bDD8841',
    [SupportedChainId.POLYGON_MUMBAI]: '0xe4Fd5bEe63f91e784da0C1f7C1Dc243305f65bBd',
    [SupportedChainId.POLYGON]: '0xE80761Ea617F66F96274eA5e8c37f03960ecC679',
  },
  [SupportedAssets.AGEUR]: {
    [SupportedChainId.POLYGON]: '0x3ca5fa07689f266e907439afd1fbb59c44fe12f6',
    [SupportedChainId.POLYGON_MUMBAI]: '0x928fD606dDD48C199462B5D12f4693e5E6F5010B',
  },
  [SupportedAssets.BAL]: {
    [SupportedChainId.POLYGON]: '0xA8669021776Bc142DfcA87c21b4A52595bCbB40a',
    [SupportedChainId.POLYGON_MUMBAI]: '0x53590ef864856C156e1D403e238746EE3a2824e5',
  },
  [SupportedAssets.CRV]: {
    [SupportedChainId.POLYGON]: '0x77CA01483f379E58174739308945f044e1a764dc',
    [SupportedChainId.POLYGON_MUMBAI]: '0xef7dF8bc0F410a620Fe730fCA028b9322f8e501b',
  },
  [SupportedAssets.DAI]: {
    [SupportedChainId.POLYGON]: '0x8619d80FB0141ba7F184CbF22fd724116D9f7ffC',
    [SupportedChainId.GOERLI]: '0x76f5D888234e88599c12D46A2a55Fece923cf48c',
    [SupportedChainId.POLYGON_MUMBAI]: '0xBc4Fbe180979181f84209497320A03c65E1dc64B',
  },
  [SupportedAssets.DPI]: {
    [SupportedChainId.POLYGON]: '0xf611aeb5013fd2c0511c9cd55c7dc5c1140741a6',
    [SupportedChainId.POLYGON_MUMBAI]: '0x6ECCb955323B6C25a4D20f98b0Daed670ef302d4',
  },
  [SupportedAssets.EURS]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x61328728b2efd74224E9e524b50ef36a557f98Ec',
    [SupportedChainId.POLYGON]: '0x5D557B07776D12967914379C71a1310e917C7555',
  },
  [SupportedAssets.GHST]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x8B422A12C2CD22a9F0FE84E97B6D7e51AA09bDD4',
    [SupportedChainId.POLYGON]: '0xce186f6cccb0c955445bb9d10c59cae488fea559',
  },
  [SupportedAssets.JEUR]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x3048572a85336A4c74B9B7e51ebf08f6bBD6B7f9',
    [SupportedChainId.POLYGON]: '0x44705f578135cC5d703b4c9c122528C73Eb87145',
  },
  [SupportedAssets.LINK]: {
    [SupportedChainId.GOERLI]: '0x91eFc3Ff5fBD2f9b2aE8880Bb1d52Db3e01A261d',
    [SupportedChainId.POLYGON_MUMBAI]: '0x97BDaa1fD8bdb266f73C0E6095F39aa168d4509c',
    [SupportedChainId.POLYGON]: '0x953A573793604aF8d41F306FEb8274190dB4aE0e',
  },
  [SupportedAssets.SUSHI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x2FB450BAec43498198aA615E184c54Dc4E62B640',
    [SupportedChainId.POLYGON]: '0x34e2eD44EF7466D5f9E0b782B5c08b57475e7907',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.GOERLI]: '0x908636F60d276a3b30C13F300065E1Cf43bf49cf',
    [SupportedChainId.POLYGON_MUMBAI]: '0xdbFB1eE219CA788B02d50bA687a927ABf58A8fC0',
    [SupportedChainId.POLYGON]: '0xFCCf3cAbbe80101232d343252614b6A3eE81C989',
  },
  [SupportedAssets.USDT]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xbe9B550142De795A54d5BBec50ab562a95b303B4',
    [SupportedChainId.POLYGON]: '0xfb00AC187a8Eb5AFAE4eACE434F493Eb62672df7',
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x6b447f753e08a07f108A835A70E3bdBE1F6233e2',
    [SupportedChainId.POLYGON]: '0x92b42c66840C7AD907b4BF74879FF3eF7c529473',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.GOERLI]: '0x86065184932b2e2E7bC2BC953Cd3d131d2497cDe',
    [SupportedChainId.POLYGON_MUMBAI]: '0x71Cf6ef87a3b0B7ceaacA66daB39b81972466B83',
    [SupportedChainId.POLYGON]: '0x0c84331e39d6658Cd6e6b9ba04736cC4c4734351',
  },
  [SupportedAssets.WMATIC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x3062CEfc74220dcB7341d268653F9ACAe8fB1107',
    [SupportedChainId.POLYGON]: '0x4a1c3aD6Ed28a636ee1751C69071f6be75DEb8B8',
  },
  [SupportedAssets.MIMATIC]: {
    [SupportedChainId.POLYGON]: '0x18248226C16BF76c032817854E7C83a2113B4f06',
  },
  [SupportedAssets.MATICX]: {
    [SupportedChainId.POLYGON]: '0x18248226C16BF76c032817854E7C83a2113B4f06',
  },
  [SupportedAssets.STMATIC]: {
    [SupportedChainId.POLYGON]: '0x18248226C16BF76c032817854E7C83a2113B4f06',
  },
  [SupportedAssets.GHO]: {
    [SupportedChainId.GOERLI]: '0x80aa933EfF12213022Fd3d17c2c59C066cBb91c7'
  }
}

export const addressesAaveSTokens: AddressDictionary = {
  [SupportedAssets.AAVE]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x22A3039fD1B3fCe323A1F09efc03704E3698b7d0',
    [SupportedChainId.GOERLI]: '0x1721dDa383B02ec058Ee7B47596F61246eAD0069',
    [SupportedChainId.POLYGON]: '0xfAeF6A702D15428E588d4C0614AEFb4348D83D48',
  },
  [SupportedAssets.AGEUR]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x52b7f2d743d858D2377398220671f2D3BC8da56A',
    [SupportedChainId.POLYGON]: '0x40B4BAEcc69B882e8804f9286b12228C27F8c9BF',
  },
  [SupportedAssets.BAL]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x87B6A061a921115dfaB18841735f69D00F0adf0e',
    [SupportedChainId.POLYGON]: '0xa5e408678469d23efdb7694b1b0a85bb0669e8bd',
  },
  [SupportedAssets.CRV]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x1c30ad29089d5b5d5c256B98B88C979112981B8e',
    [SupportedChainId.POLYGON]: '0x08Cb71192985E936C7Cd166A8b268035e400c3c3',
  },
  [SupportedAssets.DAI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x7df8918f0DA9a9FB286E3dA272C33645b6812582',
    [SupportedChainId.GOERLI]: '0x00b5314dcDA79F235a9EDE5dA53e63A9747c3f22',
    [SupportedChainId.POLYGON]: '0xd94112B5B62d53C9402e7A60289c6810dEF1dC9B',
  },
  [SupportedAssets.DPI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x7ec80e834C261A2f087EEFD59691EAB4c7B7213E',
    [SupportedChainId.POLYGON]: '0xDC1fad70953Bb3918592b6fCc374fe05F5811B6a',
  },
  [SupportedAssets.EURS]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xDdF01A1391372cE42fd9ae622aB8b5bc5C8EAd1F',
    [SupportedChainId.GOERLI]: '0xf4874d1d69E07aDdB8807150ba33AC4d59C8dA3f',
    [SupportedChainId.POLYGON]: '0x8a9FdE6925a839F6B1932d16B36aC026F8d3FbdB',
  },
  [SupportedAssets.GHST]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x6B6475a50b2275AE3E20751cfcE670B769076DbF',
    [SupportedChainId.POLYGON]: '0x3ef10dff4928279c004308ebadc4db8b7620d6fc',
  },
  [SupportedAssets.JEUR]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x576CDE647d09a9C394898de6A18aF6d5Ca9EAC22',
    [SupportedChainId.POLYGON]: '0x6B4b37618D85Db2a7b469983C888040F7F05Ea3D',
  },
  [SupportedAssets.LINK]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x08FCe88114f6A89FcEe58EB16a0C1C90e74403f5',
    [SupportedChainId.GOERLI]: '0x98413Db84158e6f4dEaa0F4d098240a7FdfA7060',
    [SupportedChainId.POLYGON]: '0x89D976629b7055ff1ca02b927BA3e020F22A44e4',
  },
  [SupportedAssets.SUSHI]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x4E2eFce50eFc1c982162c7f6458a745043257Da3',
    [SupportedChainId.POLYGON]: '0x78246294a4c6fBf614Ed73CcC9F8b875ca8eE841',
  },
  [SupportedAssets.USDC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xe336CbD5416CDB6CE70bA16D9952A963a81A918d',
    [SupportedChainId.GOERLI]: '0x8117853a7Ecf500b27f5e5901c326B3840E58784',
    [SupportedChainId.POLYGON]: '0x307ffe186F84a3bc2613D1eA417A5737D69A7007',
  },
  [SupportedAssets.USDT]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x776Ba5F425008977b27dcB9ab4859eFFb461ff9d',
    [SupportedChainId.POLYGON]: '0x70eFfc565DB6EEf7B927610155602d31b670e802',
  },
  [SupportedAssets.WBTC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xAbF216E1640848B4eFFe9D23f283a12e96227C83',
    [SupportedChainId.POLYGON]: '0x633b207Dd676331c413D4C013a6294B0FE47cD0e',
  },
  [SupportedAssets.WETH]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0xF2CFFd2c2f6c86E10a8Ab346d96DF5F30Ee2C53A',
    [SupportedChainId.GOERLI]: '0xCEa68d3acD31b0d9d5E52f15Ce2662592C24aFc9',
    [SupportedChainId.POLYGON]: '0xD8Ad37849950903571df17049516a5CD4cbE55F6',
  },
  [SupportedAssets.WMATIC]: {
    [SupportedChainId.POLYGON_MUMBAI]: '0x4cEF60a947598A62118172fd451Eb1862A3531d8',
    [SupportedChainId.POLYGON]: '0xF15F26710c827DDe8ACBA678682F3Ce24f2Fb56E',
  },
  [SupportedAssets.GHO]: {
    [SupportedChainId.GOERLI]: '0xEe27a567B18ef957dd2BFBE027F09Ea3ecC35722'
  }
}
