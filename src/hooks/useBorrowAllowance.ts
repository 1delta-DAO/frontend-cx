import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { getDebtTokenContract } from './1delta/use1DeltaContract'

// the input ust be an AAVE sToken or vToken
export function useBorrowAllowance(token?: Token, owner?: string, spender?: string): CurrencyAmount<Token> | undefined {
  const contract = getDebtTokenContract(5, token?.address ?? '')
  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowance = useSingleCallResult(contract, 'borrowAllowance', inputs).result

  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
