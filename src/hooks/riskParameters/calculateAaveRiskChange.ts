import { AAVE_PRICE_PRECISION, BPS_BN, LTV_PRECISION, TEN, TOKEN_META, ZERO_BN } from "constants/1delta"
import { ethers } from "ethers"
import { PositionSides } from "types/1delta"
import { ChangeInformation, LtvParams, TradeImpact } from "./types"


/**
 * Calculates the universal risk change for an trade on top of Aave
 * @param assetChange0 change of asset0
 * @param assetChange1 change in asset1
 * @param tradeParams existing risk parameters
 * @returns trade impact information
 */
export function calculateAaveRiskChange(
  assetChange0?: ChangeInformation,
  assetChange1?: ChangeInformation,
  tradeParams?: LtvParams
): TradeImpact {
  if (
    (!assetChange0?.asset && !assetChange1?.asset) ||
    (!tradeParams?.assetData[assetChange0?.asset ?? ''] && !tradeParams?.assetData[assetChange1?.asset ?? ''])
  )
    return {
      ltv: ZERO_BN,
      ltvNew: ZERO_BN,
      ltvDelta: ZERO_BN,
      healthFactor: ZERO_BN,
      healthFactorNew: ZERO_BN,
      healthFactorDelta: ZERO_BN,
      marginImpact: ZERO_BN,
      deltaBorrow: ZERO_BN,
      deltaCollateral: ZERO_BN
    }

  let effectiveDeltaCollateral = ZERO_BN;
  let effectiveDeltaBorrow = ZERO_BN;
  let deltaCollateral = ZERO_BN;

  if (assetChange0)
    if (assetChange0.side === PositionSides.Collateral) {
      [deltaCollateral, effectiveDeltaCollateral] = calculateDeltaCollateral(assetChange0, tradeParams)
    } else {
      effectiveDeltaBorrow = calculateDeltaBorrow(assetChange0, tradeParams)
    }

  if (assetChange1)
    if (assetChange1.side === PositionSides.Collateral) {
      const [newCollat, effectiveNewCollat] = calculateDeltaCollateral(assetChange1, tradeParams)
      effectiveDeltaCollateral = effectiveDeltaCollateral.add(
        effectiveNewCollat
      )
      deltaCollateral = deltaCollateral.add(newCollat)
    } else {
      effectiveDeltaBorrow = effectiveDeltaBorrow.add(
        calculateDeltaBorrow(assetChange1, tradeParams)
      )
    }


  // new values are created by adding the deltas
  const newCollateral = tradeParams.collateral.add(effectiveDeltaCollateral)
  const newBorrow = tradeParams.debt.add(effectiveDeltaBorrow)

  // the new ltv is the quotient
  const ltvNew = newCollateral.gt(0) ? newBorrow.mul(LTV_PRECISION).div(newCollateral) : ZERO_BN
  const healthFactorNew = newBorrow.gt(0) ? newCollateral.mul(LTV_PRECISION).div(newBorrow) : ethers.constants.MaxUint256
  return {
    ltv: tradeParams.currentLtv,
    ltvNew,
    ltvDelta: ltvNew.sub(tradeParams.currentLtv),
    healthFactor: tradeParams.healthFactor,
    healthFactorNew,
    healthFactorDelta: healthFactorNew.sub(tradeParams.healthFactor),
    marginImpact: effectiveDeltaBorrow.add(effectiveDeltaCollateral),
    deltaBorrow: effectiveDeltaBorrow,
    deltaCollateral
  }
}


function calculateDeltaCollateral(
  assetChange: ChangeInformation,
  tradeParams: LtvParams
) {
  const collateralFactor = tradeParams.assetData[assetChange.asset].liquidationThreshold
  // we we normalize everything to 18 decimals
  const multiplierCollateral = TEN.pow(18 - TOKEN_META[assetChange.asset].decimals)

  // fetch prices - we measure everything on state price levels
  const priceCollateral = tradeParams.assetData[assetChange.asset].priceParams.price
  const collateral = assetChange.delta
    .mul(multiplierCollateral)
    .mul(priceCollateral)
    .div(AAVE_PRICE_PRECISION)

  return [
    collateral,
    collateral
      .mul(collateralFactor)
      .div(BPS_BN)
  ]

}

function calculateDeltaBorrow(
  assetChange: ChangeInformation,
  tradeParams: LtvParams
) {

  // we we normalize everything to 18 decimals
  const multiplierBorrow = TEN.pow(18 - TOKEN_META[assetChange.asset].decimals)

  // fetch prices - we measure everything on state price levels
  const priceBorrow = tradeParams.assetData[assetChange.asset].priceParams.price
  return assetChange.delta.mul(multiplierBorrow).mul(priceBorrow).div(AAVE_PRICE_PRECISION)
}