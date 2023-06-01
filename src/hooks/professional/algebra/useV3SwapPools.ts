import { Currency, Token } from '@uniswap/sdk-core'
import { FeeAmount, Pool } from '@uniswap/v3-sdk'
import { SupportedChainId } from 'constants/chains'
import { useMemo } from 'react'
import { useChainId } from 'state/globalNetwork/hooks'
import { useAllCurrencyCombinations } from '../../useAllCurrencyCombinations'
import { PoolState, useAlgebraPools } from './usePools'

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useAlgebraSwapPools(
  currencyIn?: Currency,
  currencyOut?: Currency
): {
  pools: Pool[]
  loading: boolean
} {
  const chainId = useChainId()

  const allCurrencyCombinations = useAllCurrencyCombinations(currencyIn, currencyOut)

  const pools = useAlgebraPools(allCurrencyCombinations)

  return useMemo(() => {
    return {
      pools: pools
        .filter((tuple): tuple is [PoolState.EXISTS, Pool] => {
          return tuple[0] === PoolState.EXISTS && tuple[1] !== null
        })
        .map(([, pool]) => pool),
      loading: pools.some(([state]) => state === PoolState.LOADING),
    }
  }, [pools])
}