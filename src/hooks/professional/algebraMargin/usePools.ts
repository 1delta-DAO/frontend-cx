import { Interface } from '@ethersproject/abi'
import { BigintIsh, Currency, Token } from '@uniswap/sdk-core'
import IUniswapV3PoolStateABI from 'abis/algebra/AlgebraPool.json'
// import { computeAlgebraPoolAddress } from '@uniswap/v3-sdk'
import { FeeAmount, Pool, POOL_INIT_CODE_HASH } from '@uniswap/v3-sdk'
import { POOL_GAS_OVERRIDE } from 'constants/1delta'
import { ethers } from 'ethers'
import JSBI from 'jsbi'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { useChainId } from 'state/globalNetwork/hooks'
import { bytecode } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json'
import { V3_CORE_FACTORY_ADDRESSES } from '../../../constants/addresses'
import { IUniswapV3PoolStateInterface } from '../../../types/v3/IUniswapV3PoolState'
import { ALGEBRA_POOL_DEPLOYER } from 'constants/algebraAddresses'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI) as IUniswapV3PoolStateInterface

export function computeAlgebraPoolAddress(factoryAddress: string, [tokenA, tokenB]: [string, string]): string {
  const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA]
  const constructorArgumentsEncoded = ethers.utils.defaultAbiCoder.encode(
    ['address', 'address'],
    [token0, token1]
  )
  const create2Inputs = [
    '0xff',
    factoryAddress,
    // salt
    ethers.utils.keccak256(constructorArgumentsEncoded),
    // init code hash
    '0x6ec6c9c8091d160c0aa74b2b14ba9c1717e95093bd3ac085cee99a49aab294a4',
  ]
  const sanitizedInputs = `0x${create2Inputs.map((i) => i.slice(2)).join('')}`
  return ethers.utils.getAddress(`0x${ethers.utils.keccak256(sanitizedInputs).slice(-40)}`)
}



// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = []
  private static addresses: { key: string; address: string }[] = []

  static getPoolAddress(factoryAddress: string, tokenA: Token, tokenB: Token): string {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2)
    }

    const { address: addressA } = tokenA
    const { address: addressB } = tokenB
    const key = `${factoryAddress}:${addressA}:${addressB}}`
    const found = this.addresses.find((address) => address.key === key)
    if (found) return found.address

    const address = {
      key,
      address: computeAlgebraPoolAddress(
        factoryAddress,
        [tokenA.address, tokenB.address]
      ),
    }

    this.addresses.unshift(address)
    return address.address
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number
  ): Pool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2)
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
        JSBI.EQ(pool.liquidity, liquidity) &&
        pool.tickCurrent === tick
    )
    if (found) return found

    const pool = new Pool(tokenA, tokenB, FeeAmount.MEDIUM, sqrtPriceX96, liquidity, tick)
    this.pools.unshift(pool)
    return pool
  }
}

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function useAlgebraPools(
  poolKeys: [Currency | undefined, Currency | undefined | undefined][]
): [PoolState, Pool | null][] {
  const chainId = useChainId()

  const poolTokens: ([Token, Token] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length)

    return poolKeys.map(([currencyA, currencyB]) => {
      if (currencyA && currencyB) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return undefined

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      }
      return undefined
    })
  }, [chainId, poolKeys])

  const poolAddresses: (string | undefined)[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && ALGEBRA_POOL_DEPLOYER[chainId]
    if (!v3CoreFactoryAddress) return new Array(poolTokens.length)

    return poolTokens.map((value) => value && PoolCache.getPoolAddress(v3CoreFactoryAddress, ...value))
  }, [chainId, poolTokens])

  const slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'globalState', [],
    // {
    //   gasRequired: POOL_GAS_OVERRIDE,
    // }
  )
  const liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'liquidity', [],
    // {
    //   gasRequired: POOL_GAS_OVERRIDE,
    // }
  )

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]
      if (!tokens) return [PoolState.INVALID, null]
      const [token0, token1] = tokens

      if (!slot0s[index]) return [PoolState.INVALID, null]
      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]

      if (!liquidities[index]) return [PoolState.INVALID, null]
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]

      if (!tokens || !slot0Valid || !liquidityValid) return [PoolState.INVALID, null]
      if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null]
      if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null]
      if (!slot0.price || slot0.price.eq(0)) return [PoolState.NOT_EXISTS, null]

      try {
        const pool = PoolCache.getPool(token0, token1, slot0.price, liquidity[0], slot0.tick)
        return [PoolState.EXISTS, pool]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [liquidities, poolKeys, slot0s, poolTokens])
}

export function usePoolProfessional(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined, Currency | undefined][] = useMemo(
    () => [[currencyA, currencyB]],
    [currencyA, currencyB]
  )

  return useAlgebraPools(poolKeys)[0]
}
