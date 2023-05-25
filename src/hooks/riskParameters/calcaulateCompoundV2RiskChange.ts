import { ONE_18, TEN, TOKEN_META, ZERO_BN } from 'constants/1delta'
import { ethers } from 'ethers'
import { PositionSides } from 'types/1delta'
import { LtvAssetParams, LtvParams, TradeImpact } from './types'
import { ChangeInformation } from './types'

/**
 * Calculates the universal risk change for an trade on top of Compound V2 and V3
 * The speciality here is that lqiudiation factors here have 18 decimals 
 * @param assetChange0 change of asset0
 * @param assetChange1 change in asset1
 * @param tradeParams existing risk parameters
 * @returns trade impact information
 */
export function calculateCompoundRiskChange(
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
      [deltaCollateral, effectiveDeltaCollateral] = calculateDeltaCollateral(assetChange0, tradeParams.assetData[assetChange0.asset])
    } else {
      effectiveDeltaBorrow = calculateDeltaBorrow(assetChange0, tradeParams.assetData[assetChange0.asset])
    }

  if (assetChange1)
    if (assetChange1.side === PositionSides.Collateral) {
      const [newCollat, effectiveNewCollat] = calculateDeltaCollateral(assetChange1, tradeParams.assetData[assetChange1.asset])
      effectiveDeltaCollateral = effectiveDeltaCollateral.add(
        effectiveNewCollat
      )
      deltaCollateral = deltaCollateral.add(newCollat)
    } else {
      effectiveDeltaBorrow = effectiveDeltaBorrow.add(
        calculateDeltaBorrow(assetChange1, tradeParams.assetData[assetChange1.asset])
      )
    }

  // new values are created by adding the deltas
  const newCollateral = tradeParams.collateral.add(effectiveDeltaCollateral)
  const newBorrow = tradeParams.debt.add(effectiveDeltaBorrow)

  // the new ltv is the quotient
  const ltvNew = newCollateral.gt(0) ? newBorrow.mul(ONE_18).div(newCollateral) : ZERO_BN
  const healthFactorNew = newBorrow.gt(0)
    ? newCollateral.mul(ONE_18).div(newBorrow)
    : newCollateral.gt(0)
      ? ethers.constants.MaxUint256
      : ZERO_BN
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
  tradeParams: LtvAssetParams
) {
  const priceParams = tradeParams.priceParams
  // we we normalize everything to 18 decimals
  const multiplierCollateral = TEN.pow(18 - TOKEN_META[assetChange.asset].decimals)
  const multiplierPriceCollateral = TEN.pow(18 - priceParams.decimals)

  // fetch prices - we measure everything on state price levels
  const priceCollateral = priceParams.price

  // the collateral will be downscaled
  const collateralFactor = tradeParams.liquidationThreshold

  const collateral = assetChange.delta
    .mul(multiplierCollateral)
    .mul(priceCollateral)
    .mul(multiplierPriceCollateral)
    .div(ONE_18)

  return [
    collateral,
    collateral
      .mul(collateralFactor)
      .div(ONE_18)
  ]
}

function calculateDeltaBorrow(
  assetChange: ChangeInformation,
  tradeParams: LtvAssetParams
) {
  const priceParams = tradeParams.priceParams
  // we we normalize everything to 18 decimals
  const multiplierBorrow = TEN.pow(18 - TOKEN_META[assetChange.asset].decimals)
  const multiplierPriceBorrow = TEN.pow(18 - priceParams.decimals)

  // fetch prices - we measure everything on state price levels
  const priceBorrow = priceParams.price

  // borrow is the usd value
  return assetChange.delta
    .mul(multiplierBorrow)
    .mul(priceBorrow)
    .mul(multiplierPriceBorrow)
    .div(ONE_18)
}