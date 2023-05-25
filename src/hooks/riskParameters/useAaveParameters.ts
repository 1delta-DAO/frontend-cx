import { AAVE_PRICE_PRECISION, BPS_BN, getSupportedAssets, LTV_PRECISION, TEN, TOKEN_META, ZERO_BN } from "constants/1delta"
import { BigNumber, ethers } from "ethers"
import { LendingProtocol } from "state/1delta/actions"
import { useAppSelector } from "state/hooks"
import { useAavePrices } from "state/oracles/hooks"
import { PositionSides, SupportedAssets } from "types/1delta"
import { ChangeInformation, LtvAssetParams, LtvParams, TradeImpact } from "./types"


// see https://docs.aave.com/risk/asset-risk/risk-parameters
export function useGetAaveRiskParameters(chainId: number, account?: string): LtvParams | undefined {
  const assets = getSupportedAssets(chainId, LendingProtocol.AAVE)
  const assetData = useAppSelector((state) => state.delta.assets)
  const aavePrices = useAavePrices(assets, chainId)

  // return nothing if not connected
  if (!account) return undefined

  let totalCollateral = ZERO_BN
  let totalRawCollateral = ZERO_BN
  let totalDebt = ZERO_BN

  const aaveData: { [key: string]: LtvAssetParams } = {}

  // we iterate through all assets and calculate collateral, debt and record process and liquidation thresholds
  for (let i = 0; i < assets.length; i++) {
    const name = assets[i] as SupportedAssets
    const price = aavePrices[name]

    // we we normalize everything to 18 decimals
    const multiplier = TEN.pow(18 - TOKEN_META[name].decimals)

    // the price has a provided precision
    const amountCollateral = price
      .mul(ethers.BigNumber.from(assetData[name]?.aaveData[chainId].userData?.currentATokenBalance ?? '0'))
      .mul(multiplier)
      .div(AAVE_PRICE_PRECISION)

    // threshold is a basis point value 100% = 10k
    const liquidationThreshold = assetData[name]?.aaveData[chainId].reserveData?.liquidationThreshold ?? '10000'

    // add adjusted collateral
    totalCollateral = totalCollateral.add(amountCollateral.mul(liquidationThreshold).div(BPS_BN))
    totalRawCollateral = totalRawCollateral.add(amountCollateral)

    // records debt for this specific asset
    let amountDebt = ZERO_BN
    const amountDebtStable = ethers.BigNumber.from(
      assetData[name]?.aaveData[chainId].userData?.currentStableDebt ?? '0'
    )
    const amountDebtVariable = ethers.BigNumber.from(
      assetData[name]?.aaveData[chainId].userData?.currentVariableDebt ?? '0'
    )

    // add debts if existing (for aave, at max one can be nonzero)
    if (amountDebtStable.gt(0))
      amountDebt = amountDebt.add(amountDebtStable.mul(price).mul(multiplier).div(AAVE_PRICE_PRECISION))
    if (amountDebtVariable.gt(0))
      amountDebt = amountDebt.add(amountDebtVariable.mul(price).mul(multiplier).div(AAVE_PRICE_PRECISION))

    // add the asset-specific debt in usd to the total debt
    totalDebt = totalDebt.add(amountDebt)

    aaveData[name] = {
      priceParams: {
        price,
        decimals: 8 // decimals are always 8 for aave prices
      },
      liquidationThreshold: ethers.BigNumber.from(liquidationThreshold),
      collateral: amountCollateral,
      debt: amountDebt,
    }
  }

  return {
    assetData: aaveData,
    collateral: totalCollateral,
    rawCollateral: totalRawCollateral,
    debt: totalDebt,
    currentLtv: totalCollateral.gt(0) ? totalDebt.mul(LTV_PRECISION).div(totalCollateral) : ZERO_BN,
    healthFactor: totalDebt.gt(0) ? totalCollateral.mul(LTV_PRECISION).div(totalDebt) : ethers.constants.MaxUint256,
  }
}

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