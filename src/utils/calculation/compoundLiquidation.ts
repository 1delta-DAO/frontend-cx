import { ONE_18, TEN } from 'constants/1delta'
import { BigNumber, ethers } from 'ethers'
import { getPriceParams } from 'state/oracles/hooks'
import { ChainLinkData } from 'state/oracles/reducer'
import { Asset, SupportedAssets } from 'types/1delta'
import { Exp, mulExp_, mul_ScalarTruncate, mul_ScalarTruncateAddUInt } from './compoundBase'

const ONE = BigNumber.from(1)
export const ZERO = BigNumber.from(0)
const exp1: Exp = { mantissa: ONE }
/**
 * @dev Local vars for avoiding stack-depth limits in calculating account liquidity.
 *  Note that `cTokenBalance` is the number of cTokens the account owns in the market,
 *  whereas `borrowBalance` is the amount of underlying that the account has borrowed.
 */
interface AccountLiquidityLocalVars {
  sumCollateral: BigNumber
  sumBorrowPlusEffects: BigNumber
  cTokenBalance: BigNumber
  borrowBalance: BigNumber
  exchangeRateMantissa: BigNumber
  oraclePriceMantissa: BigNumber
  collateralFactor: Exp
  exchangeRate: Exp
  oraclePrice: Exp
  tokensToDenom: Exp
}

const dummyVars: AccountLiquidityLocalVars = {
  sumCollateral: ZERO,
  sumBorrowPlusEffects: ZERO,
  cTokenBalance: ZERO,
  borrowBalance: ZERO,
  exchangeRateMantissa: ZERO,
  oraclePriceMantissa: ZERO,
  collateralFactor: exp1,
  exchangeRate: exp1,
  oraclePrice: exp1,
  tokensToDenom: exp1,
}

export const getHypotheticalAccountLiquidity = (
  chainId: number,
  compoundAssets: Asset[],
  oracles: { [key: string]: ChainLinkData } | undefined,
  account: string,
  asset0: SupportedAssets,
  asset1: SupportedAssets,
  redeemTokens0: BigNumber,
  borrowAmount0: BigNumber,
  redeemTokens1: BigNumber,
  borrowAmount1: BigNumber
): { surplus: BigNumber; deficit: BigNumber } => {
  if (!account || !oracles) return { surplus: ZERO, deficit: ZERO }
  // const vars = dummyVars; // Holds all our calculation results
  let sumCollateral = ZERO
  let sumBorrowPlusEffects = ZERO
  let cTokenBalance = ZERO
  let borrowBalance = ZERO
  let exchangeRateMantissa = ZERO
  let oraclePriceMantissa = ZERO
  let collateralFactor = exp1
  let exchangeRate = exp1
  let oraclePrice = exp1
  let tokensToDenom = exp1

  // For each asset the account is in

  for (let i = 0; i < compoundAssets.length; i++) {
    const asset = compoundAssets[i]

    const priceParams = getPriceParams(oracles, asset.id)
    // Read the balances and exchange rate from the cToken
    cTokenBalance = BigNumber.from(asset.compoundData[chainId].userData[account].balanceOf ?? '0')
    borrowBalance = BigNumber.from(asset.compoundData[chainId].userData[account].borrowBalanceCurrent ?? '0')
    exchangeRateMantissa = BigNumber.from(asset.compoundData[chainId].reserveData.exchangeRateCurrent ?? '0')
    const collateralFactorMantissa = BigNumber.from(
      asset.compoundData[chainId].reserveData.collateralFactorMantissa ?? '0'
    )
    //   (oErr, cTokenBalance, borrowBalance, exchangeRateMantissa) = asset.compoundData[chainId].userData[account]. //asset.getAccountSnapshot(account);
    //     if(oErr !== 0) { // semi-opaque error code, we assume NO_ERROR === 0 is invariant between upgrades
    //   return (Error.SNAPSHOT_ERROR, 0, 0);
    // }

    collateralFactor = { mantissa: collateralFactorMantissa }
    exchangeRate = { mantissa: exchangeRateMantissa }

    // Get the normalized price of the asset
    oraclePriceMantissa = priceParams.price
      .mul(TEN.pow(18 - priceParams.decimals))
      .mul(TEN.pow(18 - (Number(asset.compoundData[chainId].reserveData.underlyingDecimals) ?? 18)))

    if (oraclePriceMantissa.eq(0)) {
      return { surplus: ZERO, deficit: ZERO }
    }
    oraclePrice = { mantissa: oraclePriceMantissa }

    // Pre-compute a conversion factor from tokens -> ether (normalized price value)
    tokensToDenom = mulExp_(mulExp_(collateralFactor, exchangeRate), oraclePrice)

    // sumCollateral += tokensToDenom * cTokenBalance
    sumCollateral = mul_ScalarTruncateAddUInt(tokensToDenom, cTokenBalance, sumCollateral)

    // sumBorrowPlusEffects += oraclePrice * borrowBalance
    sumBorrowPlusEffects = mul_ScalarTruncateAddUInt(oraclePrice, borrowBalance, sumBorrowPlusEffects)

    // Calculate effects of interacting with cTokenModify
    if (asset.id === asset0) {
      // redeem effect
      // sumBorrowPlusEffects += tokensToDenom * redeemTokens
      sumBorrowPlusEffects = mul_ScalarTruncateAddUInt(tokensToDenom, redeemTokens0, sumBorrowPlusEffects)

      // borrow effect
      // sumBorrowPlusEffects += oraclePrice * borrowAmount
      sumBorrowPlusEffects = mul_ScalarTruncateAddUInt(oraclePrice, borrowAmount0, sumBorrowPlusEffects)
    }

    // Calculate effects of interacting with cTokenModify
    if (asset.id === asset1) {
      // redeem effect
      // sumBorrowPlusEffects += tokensToDenom * redeemTokens
      sumBorrowPlusEffects = mul_ScalarTruncateAddUInt(tokensToDenom, redeemTokens1, sumBorrowPlusEffects)

      // borrow effect
      // sumBorrowPlusEffects += oraclePrice * borrowAmount
      sumBorrowPlusEffects = mul_ScalarTruncateAddUInt(oraclePrice, borrowAmount1, sumBorrowPlusEffects)
    }
  }

  // These are safe, as the underflow condition is checked first
  if (sumCollateral.gt(sumBorrowPlusEffects)) {
    return { surplus: sumCollateral.sub(sumBorrowPlusEffects), deficit: ZERO }
  } else {
    return { surplus: ZERO, deficit: sumBorrowPlusEffects.sub(sumCollateral) }
  }
}
