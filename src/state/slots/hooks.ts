import { ETHEREUM_CHAINS, getSupportedAssets, TEN } from "constants/1delta"
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
    const cUSD = c * priceDict[s.collateralSymbol ?? '']
    const dUSD = d * priceDict[s.debtSymbol ?? '']
    const size = cUSD - dUSD
    const cf = Number(formatEther(cfs[s.collateralSymbol]?.cf ?? '0'))
    const mode = s.collateralSymbol.toUpperCase().includes('USD') ? Mode.SHORT : Mode.LONG
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
        !s.collateralSymbol.toUpperCase().includes('USD')
      ),
      pair: [s.collateralSymbol as SupportedAssets, s.debtSymbol as SupportedAssets],
      leverage: mode === Mode.LONG ? cUSD / size : dUSD / size,
      size,
      rewardApr: 0.20,
      supplyApr: calculateRateToNumber(
        cfs[s.collateralSymbol].cApr ?? '0',
        chainId,
        TimeScale.MS
      ),
      borrowApr: calculateRateToNumber(
        cfs[s.collateralSymbol].bApr ?? '0',
        chainId,
        TimeScale.MS
      ),
      direction: mode,
      pnl: 0,
      price: mode === Mode.LONG ? priceDict[s.collateralSymbol ?? ''] : priceDict[s.debtSymbol ?? '']
    }
  })
}



const calculateHealthFactor = (cf: number, cUSD: number, dUSD: number) => {
  return cf * cUSD / dUSD
}


// hf = c* cf / d 
const calculateLiqPrice = (cf: number, c: number, d: number, cUSD: number, dUSD: number, collateral: boolean) => {
  if (collateral) {
    return dUSD / c / cf
  }
  return cUSD * cf / d
}
