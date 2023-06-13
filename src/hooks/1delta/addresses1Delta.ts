import { SupportedChainId } from 'constants/chains'

export const aaveBrokerAddress: { [chainId: number]: string } = {
  [SupportedChainId.GOERLI]: '0x0C233b11F886da1D5206Fa9e0d48293c23A4fDb9',
  [SupportedChainId.POLYGON_MUMBAI]: '0x529abb3a7083d00b6956372475f17B848954aC50'
}

export const cometBrokerAddress: { [chainId: number]: string } = {
  [SupportedChainId.POLYGON_MUMBAI]: '0x178E4EB141BBaEAcd56DAE120693D48d4B5f198d'
}

export const accountFactoryAddress: { [chainId: number]: string } = {
  [SupportedChainId.GOERLI]: '0x9D0980F620081158Fb2E915404A49A36F92899ef',
  [SupportedChainId.POLYGON_MUMBAI]: '0xC2ef8d1288982451eEfB20671153CF14fa22e72A',
  [SupportedChainId.POLYGON]: '0x36E5e5e12782389359dFc89A7C3BAAA6E39666AA',
}

export const slotFactoryAddresses: { [chainId: number]: string } = {
  [SupportedChainId.POLYGON_ZK_EVM]: '0x925716D57c842B50806884EDb295bA3E3A8EBdFE',
}


