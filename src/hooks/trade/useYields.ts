import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { ethers } from "ethers";
import { useMemo } from "react";
import { LendingProtocol } from "state/1delta/actions";
import {
  AaveInterestMode,
  Asset,
  Field,
  MappedCurrencyAmounts,
  MarginTradeType,
  OneDeltaTradeType,
  PositionSides,
  SupportedAssets
} from "types/1delta";
import { calculateRateToNumber, formatAaveYield, formatAaveYieldToNumber, TimeScale } from "utils/tableUtils/format";


interface YieldParams {
  borrowYield: number
  supplyYield: number
  borrowStableYield: number
}


interface YieldData {
  asset0Yields: YieldParams
  asset1Yields: YieldParams
}

const dummyResponse = {
  asset0Yields: {
    borrowYield: 0,
    supplyYield: 0,
    borrowStableYield: 0,
  },
  asset1Yields: {
    borrowYield: 0,
    supplyYield: 0,
    borrowStableYield: 0,
  }
}


/**
 * Gets yield data for assets
 * @param chainId chainId
 * @param asset0 first asset
 * @param asset1 second asset
 * @param lender lending protocol
 * @param baseAsset asset for base market (only relevant for Compound V3)
 * @returns 
 */
export const useYields = (
  chainId: number,
  asset0: Asset,
  asset1: Asset,
  lender: LendingProtocol,
  baseAsset = SupportedAssets.USDC
): YieldData => {

  return useMemo(() => {
    switch (lender) {
      case LendingProtocol.AAVE: {
        return {
          asset0Yields: {
            supplyYield: formatAaveYieldToNumber(asset0?.aaveData[chainId].reserveData?.liquidityRate ?? '0'),
            borrowStableYield: formatAaveYieldToNumber(asset0?.aaveData[chainId].reserveData?.stableBorrowRate ?? '0'),
            borrowYield: formatAaveYieldToNumber(asset0?.aaveData[chainId].reserveData?.variableBorrowRate ?? '0'),
          },

          asset1Yields: {
            supplyYield: formatAaveYieldToNumber(asset1?.aaveData[chainId].reserveData?.liquidityRate ?? '0'),
            borrowStableYield: formatAaveYieldToNumber(asset1?.aaveData[chainId].reserveData?.stableBorrowRate ?? '0'),
            borrowYield: formatAaveYieldToNumber(asset1?.aaveData[chainId].reserveData?.variableBorrowRate ?? '0'),
          }
        }
      }

      case LendingProtocol.COMPOUNDV3: {
        return {
          asset0Yields: {
            supplyYield: calculateRateToNumber(
              asset0?.compoundV3Data[chainId][baseAsset]?.reserveData.supplyRate ?? '0',
              chainId,
              TimeScale.MS
            ),
            borrowStableYield: 0,
            borrowYield: calculateRateToNumber(
              asset0?.compoundV3Data[chainId][baseAsset].reserveData?.borrowRate ?? '0',
              chainId,
              TimeScale.MS
            ),
          },

          asset1Yields: {
            supplyYield: calculateRateToNumber(
              asset1?.compoundV3Data[chainId][baseAsset]?.reserveData.supplyRate ?? '0',
              chainId,
              TimeScale.MS
            ),
            borrowStableYield: 0,
            borrowYield: calculateRateToNumber(
              asset1?.compoundV3Data[chainId][baseAsset].reserveData?.borrowRate ?? '0',
              chainId,
              TimeScale.MS
            ),
          }
        }
      }
      case LendingProtocol.COMPOUND: {
        return {
          asset0Yields: {
            supplyYield: calculateRateToNumber(
              asset0?.compoundData[chainId]?.reserveData.supplyRatePerBlock ?? '0',
              chainId,
              TimeScale.BLOCK
            ),
            borrowStableYield: 0,
            borrowYield: calculateRateToNumber(
              asset0?.compoundData[chainId].reserveData?.borrowRatePerBlock ?? '0',
              chainId,
              TimeScale.BLOCK
            ),
          },

          asset1Yields: {
            supplyYield: calculateRateToNumber(
              asset1?.compoundData[chainId]?.reserveData.supplyRatePerBlock ?? '0',
              chainId,
              TimeScale.BLOCK
            ),
            borrowStableYield: 0,
            borrowYield: calculateRateToNumber(
              asset1?.compoundData[chainId].reserveData?.borrowRatePerBlock ?? '0',
              chainId,
              TimeScale.BLOCK
            ),
          }
        }
      }
    }

  },
    [
      chainId,
      asset0,
      asset1,
      lender,
      baseAsset
    ]
  )
}


/**
 * Gets yield data for assets
 * @param chainId chainId
 * @param asset0 first asset
 * @param asset1 second asset
 * @param lender lending protocol
 * @param baseAsset asset for base market (only relevant for Compound V3)
 * @returns 
 */
export const useYield = (
  chainId: number,
  asset: Asset,
  lender: LendingProtocol,
  baseAsset = SupportedAssets.USDC
): YieldParams => {

  return useMemo(() => {
    switch (lender) {
      case LendingProtocol.AAVE: {
        return {
          supplyYield: formatAaveYieldToNumber(asset?.aaveData[chainId].reserveData?.liquidityRate ?? '0'),
          borrowStableYield: formatAaveYieldToNumber(asset?.aaveData[chainId].reserveData?.stableBorrowRate ?? '0'),
          borrowYield: formatAaveYieldToNumber(asset?.aaveData[chainId].reserveData?.variableBorrowRate ?? '0'),
        }
      }
      case LendingProtocol.COMPOUNDV3: {
        return {
          supplyYield: calculateRateToNumber(
            asset?.compoundV3Data[chainId][baseAsset]?.reserveData.supplyRate ?? '0',
            chainId,
            TimeScale.MS
          ),
          borrowStableYield: 0,
          borrowYield: calculateRateToNumber(
            asset?.compoundV3Data[chainId][baseAsset].reserveData?.borrowRate ?? '0',
            chainId,
            TimeScale.MS
          )
        }
      }
      case LendingProtocol.COMPOUND: {
        return {
          supplyYield: calculateRateToNumber(
            asset?.compoundData[chainId]?.reserveData.supplyRatePerBlock ?? '0',
            chainId,
            TimeScale.BLOCK
          ),
          borrowStableYield: 0,
          borrowYield: calculateRateToNumber(
            asset?.compoundData[chainId].reserveData?.borrowRatePerBlock ?? '0',
            chainId,
            TimeScale.BLOCK
          ),
        }
      }
    }
  },
    [
      chainId,
      asset,
      lender,
      baseAsset
    ]
  )


} 