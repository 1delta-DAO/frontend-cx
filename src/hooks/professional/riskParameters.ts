import { ethers } from "ethers"
import { useGetCompoundRiskParameters } from "hooks/riskParameters/useCompoundParameters"
import { useMemo } from "react"
import { LendingProtocol } from "state/1delta/actions"
import { AaveTotals } from "state/1delta/reducer"
import { OracleState } from "state/oracles/reducer"
import { bigNumberToDecimal } from "utils/1delta/generalFormatters"


export const useRiskParameters = (
  chainId: number,
  oracleState: OracleState,
  userAccount: any,
  account: string | undefined,
  currentProtocol: LendingProtocol,
  aaveTotals: AaveTotals
): {
  supply: number,
  borrow: number,
  healthFactor: number,
  ltv: number | undefined,
  collateral: number,
  hasBalance: boolean

} => {


  const compoundRiskParams = useGetCompoundRiskParameters(
    chainId,
    oracleState?.data[chainId]?.chainLink,
    userAccount?.account?.accountAddress
  )

  const [supplyAave, borrowAave, healthFactorAave, ltvAave] = useMemo(() => {
    if (!Boolean(account)) {
      return [0, 0, 0, undefined]
    }
    return [
      bigNumberToDecimal(aaveTotals[chainId]?.totalCollateralBase, 8, 2),
      bigNumberToDecimal(aaveTotals[chainId]?.totalDebtBase, 8, 2),
      Math.round(bigNumberToDecimal(aaveTotals[chainId]?.healthFactor, 18, 4) * 100) / 100,
      Math.round(
        (bigNumberToDecimal(aaveTotals[chainId]?.totalDebtBase, 8, 2) /
          bigNumberToDecimal(aaveTotals[chainId]?.totalCollateralBase, 8, 2)) *
        10000
      ) / 100,
    ]
  }, [account, aaveTotals[chainId], chainId])

  const [supplyCompound, borrowCompound, healthFactorCompound, ltvCompound, collateralCompound, hasBalanceCompound] =
    useMemo(() => {
      if (!Boolean(account) || !compoundRiskParams) {
        return [0, 0, 0, undefined, 0, false]
      }

      const bal = bigNumberToDecimal(compoundRiskParams.rawCollateral, 18, 10)
      return [
        bigNumberToDecimal(compoundRiskParams.rawCollateral, 18, 2),
        bigNumberToDecimal(compoundRiskParams.debt, 18, 2),
        Math.round(bigNumberToDecimal(compoundRiskParams.healthFactor, 18, 4) * 100) / 100,
        Math.round(
          (bigNumberToDecimal(compoundRiskParams.debt, 18, 4) /
            bigNumberToDecimal(compoundRiskParams.collateral, 18, 4)) *
          10000
        ) / 100,
        bigNumberToDecimal(compoundRiskParams.collateral, 18, 2),
        bal > 0,
      ]
    }, [account, compoundRiskParams, userAccount])

  const hasBalance = useMemo(() => {
    if (currentProtocol === LendingProtocol.AAVE)
      return (
        Boolean(account && ethers.BigNumber.from(aaveTotals[chainId]?.totalCollateralBase ?? '0').gt(0))
      )
    return hasBalanceCompound
  }, [
    aaveTotals[chainId],
    account,
    chainId,
    supplyCompound,
    currentProtocol,
    hasBalanceCompound,
  ])

  return useMemo(() => {
    if (currentProtocol === LendingProtocol.AAVE) return {
      hasBalance,
      supply: supplyAave,
      borrow: borrowAave,
      healthFactor: healthFactorAave,
      ltv: ltvAave,
      collateral: (0.7 * Number(supplyAave) - borrowAave)
    }
    return { supply: supplyCompound, borrow: borrowCompound, healthFactor: healthFactorCompound, ltv: ltvCompound, collateral: collateralCompound, hasBalance }
  }, [
    supplyAave,
    borrowAave,
    supplyCompound,
    borrowCompound,
    currentProtocol,
    supplyCompound,
    borrowCompound,
    healthFactorCompound,
    ltvCompound,
    userAccount?.account?.accountAddress,
  ])

}