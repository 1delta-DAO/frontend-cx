import { ONE_18, TEN, TOKEN_META, ZERO_BN } from 'constants/1delta'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import { useAppSelector } from 'state/hooks'
import { getPriceParams } from 'state/oracles/hooks'
import { ChainLinkData } from 'state/oracles/reducer'
import { PositionSides, SupportedAssets } from 'types/1delta'
import { LtvAssetParams, LtvParams, TradeImpact } from './types'
import { ChangeInformation } from './types'

export function useGetCompoundRiskParameters(
  chainId: number,
  oracles: { [key: string]: ChainLinkData } | undefined,
  deltaAccount?: string
): LtvParams | undefined {
  const assetData = useAppSelector((state) => state.delta.assets)

  return useMemo(() => {
    // return nothing if not connected
    if (!deltaAccount || !oracles) return undefined
    let totalCollateral = ZERO_BN
    let totalRawCollateral = ZERO_BN
    let totalDebt = ZERO_BN

    const compoundData: { [key: string]: LtvAssetParams } = {}
    const keys = Object.keys(assetData).map((a) => a as SupportedAssets)

    // we iterate through all assets and calculate collateral, debt and record process and liquidation thresholds
    for (let i = 0; i < keys.length; i++) {
      const name = keys[i] as SupportedAssets
      const priceParams = getPriceParams(oracles, name)
      // we we normalize everything to 18 decimals, also the price
      const multiplier = TEN.pow(18 - TOKEN_META[name].decimals)
      const multiplierPrice = TEN.pow(18 - priceParams.decimals)

      // get balance
      const cTokenBal = ethers.BigNumber.from(
        assetData[name]?.compoundData[chainId].userData[deltaAccount ?? '']?.balanceOf ?? '0'
      )
      const underlyingDeposited = cTokenBal
        .mul(assetData[name]?.compoundData[chainId].reserveData.exchangeRateCurrent ?? '0')
        .div(ONE_18)
        .mul(multiplier)

      // the price has a provided precision
      const amountCollateral = priceParams.price.mul(underlyingDeposited).mul(multiplierPrice).div(ONE_18)

      // threshold is a basis point value 100% = 1e18
      const liquidationThreshold =
        assetData[name]?.compoundData[chainId].reserveData?.collateralFactorMantissa ?? ONE_18

      // add adjusted collateral
      totalCollateral = totalCollateral.add(amountCollateral.mul(liquidationThreshold).div(ONE_18))
      totalRawCollateral = totalRawCollateral.add(amountCollateral)

      // records debt for this specific asset
      let amountDebt = ethers.BigNumber.from(
        assetData[name]?.compoundData[chainId].userData[deltaAccount ?? '']?.borrowBalanceCurrent ?? '0'
      )

      // add debts if existing (for aave, at max one can be nonzero)
      amountDebt = amountDebt.mul(priceParams.price).mul(multiplier).mul(multiplierPrice).div(ONE_18)

      // add the asset-specific debt in usd to the total debt
      totalDebt = totalDebt.add(amountDebt)

      compoundData[name] = {
        priceParams,
        liquidationThreshold: ethers.BigNumber.from(liquidationThreshold),
        collateral: amountCollateral,
        debt: amountDebt,
      }
    }

    return {
      assetData: compoundData,
      collateral: totalCollateral,
      rawCollateral: totalRawCollateral,
      debt: totalDebt,
      currentLtv: totalCollateral.gt(0) ? totalDebt.mul(ONE_18).div(totalCollateral) : ZERO_BN,
      healthFactor: totalDebt.gt(0)
        ? totalCollateral.mul(ONE_18).div(totalDebt)
        : totalCollateral.gt(0)
          ? ethers.constants.MaxUint256
          : ZERO_BN,
    }
  }, [oracles, assetData, deltaAccount])
}


/**
 * Calculates the universal risk change for an trade on top of Compound V2
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
    : ethers.constants.MaxUint256
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
  if (!tradeParams) return [ZERO_BN, ZERO_BN]
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
  if (!tradeParams) return ZERO_BN
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