import { getSupportedAssets, TEN } from "constants/1delta"
import { SupportedChainId } from "constants/chains"
import { BigNumber } from "ethers"
import { formatEther } from "ethers/lib/utils"
import { Mode } from "pages/Trading"
import { AppState } from "state"
import { LendingProtocol } from "state/1delta/actions"
import { useDeltaAssetState } from "state/1delta/hooks"
import { useAppSelector } from "state/hooks"
import { usePrices } from "state/oracles/hooks"
import { SupportedAssets } from "types/1delta"
import { calculateRateToNumber, TimeScale } from "utils/tableUtils/format"
import { Slot } from "./reducer"

export function useSlotState(): AppState['slots'] {
  return useAppSelector((state) => state.slots)
}

export interface ExtendedSlot extends Slot {
  collateralBalanceUsd: number,
  debtBalanceUsd: number,
  collateralFactor: number
  healthFactor: number
  liquidationPrice: number
  pair: [SupportedAssets, SupportedAssets]
  leverage: number
  size: number
  rewardApr: number
  supplyApr: number
  borrowApr: number
  pnl: number
  direction: Mode
  price: number
}

export const useParsedSlots = (chainId?: number, account?: string): ExtendedSlot[] => {

  const slotData = useSlotState()
  const assets = getSupportedAssets(Number(chainId), LendingProtocol.COMPOUND)
  const assetData = useDeltaAssetState()
  const prices = usePrices(assets, SupportedChainId.POLYGON)
  const priceDict = Object.assign({}, ...assets.map((a, i) => { return { [a]: prices[i] } }))
  if (!account || !chainId) return []



  const cfs = Object.assign({},
    ...assets.map(a => {
      return {
        [a]: {
          cf: assetData[a].compoundData[chainId].reserveData.collateralFactorMantissa,
          cApr: assetData[a].compoundData[chainId].reserveData.supplyRatePerBlock,
          bApr: assetData[a].compoundData[chainId].reserveData.borrowRatePerBlock,
        }
      }
    })
  )

  return slotData.slots.map(s => {
    const c = Number(formatEther(BigNumber.from(s.collateralBalance ?? '0').mul(TEN.pow(18 - s.collateralDecimals))))
    const d = Number(formatEther(BigNumber.from(s.debtBalance ?? '0').mul(TEN.pow(18 - s.debtDecimals))))

    const collateralAsset = safeSymbol(s.collateralSymbol as SupportedAssets)
    const debtAsset = safeSymbol(s.debtSymbol as SupportedAssets)
    const cUSD = c * priceDict[collateralAsset ?? '']
    const dUSD = d * priceDict[debtAsset ?? '']
    const size = cUSD - dUSD
    const cf = Number(formatEther(cfs[collateralAsset]?.cf ?? '0'))
    const mode = collateralAsset.toUpperCase().includes('USD') ? Mode.SHORT : Mode.LONG
    return {
      ...s,
      collateralBalanceUsd: cUSD,
      debtBalanceUsd: dUSD,
      collateralFactor: cf,
      healthFactor: calculateHealthFactor(cf, cUSD, dUSD),
      liquidationPrice: calculateLiqPrice(
        cf,
        c,
        d,
        cUSD,
        dUSD,
        !collateralAsset.toUpperCase().includes('USD')
      ),
      pair: mode === Mode.LONG ? [collateralAsset as SupportedAssets, debtAsset as SupportedAssets] : [debtAsset as SupportedAssets, collateralAsset as SupportedAssets],
      leverage: mode === Mode.LONG ? cUSD / size : dUSD / size,
      size,
      rewardApr: 0.20,
      supplyApr: calculateRateToNumber(
        cfs[collateralAsset].cApr ?? '0',
        chainId,
        TimeScale.MS
      ),
      borrowApr: calculateRateToNumber(
        cfs[debtAsset].bApr ?? '0',
        chainId,
        TimeScale.MS
      ),
      direction: mode,
      pnl: 0,
      price: mode === Mode.LONG ? priceDict[collateralAsset ?? ''] : priceDict[debtAsset ?? '']
    }
  })
}



const calculateHealthFactor = (cf: number, cUSD: number, dUSD: number) => {
  return cf * cUSD / dUSD
}


// hf = cUSD* cf / dUSD -> solve for hf = 1
export const calculateLiqPrice = (cf: number, c: number, d: number, cUSD: number, dUSD: number, collateral: boolean) => {
  if (collateral) {
    return dUSD / c / cf
  }
  return cUSD * cf / d
}


const safeSymbol = (asset: SupportedAssets) => {
  if (asset === SupportedAssets.MATIC)
    return SupportedAssets.WMATIC
  return asset
}