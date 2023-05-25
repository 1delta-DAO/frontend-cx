import { formatEther } from 'ethers/lib/utils'
import { TradeImpact } from 'hooks/riskParameters/types'
import { useMemo } from 'react'
import { MarginTradeType } from 'types/1delta'

export const useMoneyMarketRiskValidation = (
  riskChange: TradeImpact,
  poolInteraction: MarginTradeType,
  isExpertMode: boolean
): [string, boolean, number] => {
  // risk validation
  return useMemo(() => {
    let message = ''
    let error = false
    if (!riskChange) return ['', false, 1]
    // ltv = 0 means no debt -> no error
    if (riskChange.ltvNew.eq(0)) return ['', false, 1]
    const numberHf = Number(formatEther(riskChange.healthFactorNew))

    // only borrows and withdrawals decrease the health factor
    if (
      poolInteraction === MarginTradeType.Withdraw ||
      poolInteraction === MarginTradeType.Borrow
    ) {
      if (numberHf <= 1.05) {
        message = 'Transaction will bring the account close to liquidation'
        error = true
      }
      if (numberHf <= 1.0) {
        message = 'Transaction might lead to liquidation'
        error = true
      }

      if (numberHf < 0.95) {
        message = 'Transaction will lead to liquidation'
        error = true
      }
    }
    if (isExpertMode) return [message, false, numberHf]

    return [message, error, numberHf]
  }, [isExpertMode, riskChange])
}


export const useSingleSideRiskValidation = (
  riskChange: TradeImpact,
  isExpertMode: boolean
): [string, boolean, number] => {
  return useMemo(() => {
    let message = ''
    let error = false
    if (!riskChange) return ['', false, 1]

    const numberHf = Number(formatEther(riskChange.healthFactorNew))
    if (numberHf <= 1.05) {
      message = 'Transaction will bring the account close to liquidation'
      error = true
    }
    if (numberHf <= 1.0) {
      message = 'Transaction might lead to liquidation'
      error = true
    }

    if (numberHf < 0.95) {
      message = 'Transaction will lead to liquidation'
      error = true
    }

    if (isExpertMode) return [message, false, numberHf]

    return [message, error, numberHf]
  }, [isExpertMode, riskChange])
}



export const useMarginTradeRiskValidation = (
  riskChange: TradeImpact,
  marginTradeType: MarginTradeType,
  isExpertMode: boolean
): [string, boolean, number] => {

  return useMemo(() => {
    let message = ''
    let error = false
    if (!riskChange) return ['', false, 1]

    const numberHf = Number(formatEther(riskChange.healthFactorNew))
    if (marginTradeType === MarginTradeType.Trim) {
      if (numberHf < 1.0) {
        message = 'Cannot withdraw at Health Factor lower than 1'
        error = true
      }
    } else {
      if (numberHf <= 1.05) {
        message = 'Transaction will bring the account close to liquidation'
        error = true
      }
      if (numberHf < 1.0) {
        message = 'Transaction might lead to liquidation'
        error = true
      }

      if (numberHf < 0.95) {
        message = 'Transaction will lead to liquidation'
        error = true
      }
    }

    if (isExpertMode) return [message, false, numberHf]

    return [message, error, numberHf]
  }, [isExpertMode, riskChange, marginTradeType])
}

export const useGeneralRiskValidation = (
  riskChange: TradeImpact,
  marginTradeType: MarginTradeType,
  isExpertMode: boolean
): [string, boolean, number] => {

  return useMemo(() => {
    let message = ''
    let error = false
    const numberHf = Number(formatEther(riskChange.healthFactorNew))
    if (!riskChange) return ['', false, 1]
    switch (marginTradeType) {
      case (MarginTradeType.Trim): {
        if (numberHf < 1.0) {
          message = 'Cannot withdraw at Health Factor lower than 1'
          error = true
        }
        break;
      }
      case MarginTradeType.Open: {
        if (numberHf <= 1.05) {
          message = 'Transaction will bring the account close to liquidation'
          error = true
        }
        if (numberHf < 1.0) {
          message = 'Transaction might lead to liquidation'
          error = true
        }

        if (numberHf < 0.95) {
          message = 'Transaction will lead to liquidation'
          error = true
        }

        break;
      }

      case MarginTradeType.Collateral:
      case MarginTradeType.Debt: {
        if (numberHf <= 1.05) {
          message = 'Transaction will bring the account close to liquidation'
          error = true
        }
        if (numberHf <= 1.0) {
          message = 'Transaction might lead to liquidation'
          error = true
        }

        if (numberHf < 0.95) {
          message = 'Transaction will lead to liquidation'
          error = true
        }
      }
    }
    if (isExpertMode) return [message, false, numberHf]
    return [message, error, numberHf]
  }, [isExpertMode, riskChange, marginTradeType])
}