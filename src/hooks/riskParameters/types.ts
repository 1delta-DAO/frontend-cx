import { BigNumber } from "ethers"
import { PositionSides, SupportedAssets } from "types/1delta"


export interface LtvAssetParams {
  priceParams: {
    price: BigNumber
    decimals: number
  }
  collateral: BigNumber
  debt: BigNumber
  liquidationThreshold: BigNumber
}

export interface LtvParams {
  assetData: { [key: string]: LtvAssetParams }
  currentLtv: BigNumber
  collateral: BigNumber
  debt: BigNumber
  healthFactor: BigNumber
  rawCollateral: BigNumber
}

export interface TradeImpact {
  ltv: BigNumber
  ltvNew: BigNumber
  ltvDelta: BigNumber
  healthFactor: BigNumber
  healthFactorNew: BigNumber
  healthFactorDelta: BigNumber
  marginImpact: BigNumber
  deltaCollateral: BigNumber
  deltaBorrow: BigNumber
}

export interface AssetChange {
  asset: SupportedAssets
  delta: BigNumber
}


export interface ChangeInformation extends AssetChange {
  side: PositionSides
}
