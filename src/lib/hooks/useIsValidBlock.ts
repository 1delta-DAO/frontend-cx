import { atomWithImmer } from 'jotai-immer'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import useBlockNumber from './useBlockNumber'
import { useChainId } from 'state/globalNetwork/hooks'

// The oldest block (per chain) to be considered valid.
const oldestBlockMapAtom = atomWithImmer<{ [chainId: number]: number }>({})

const DEFAULT_MAX_BLOCK_AGE = 10

export function useGetIsValidBlock(maxBlockAge = DEFAULT_MAX_BLOCK_AGE): (block: number) => boolean {
  const chainId = useChainId()
  const currentBlock = useBlockNumber()
  const oldestBlockMap = useAtomValue(oldestBlockMapAtom)
  const oldestBlock = chainId ? oldestBlockMap[chainId] : 0
  return useCallback(
    (block: number) => {
      if (!currentBlock) return false
      if (currentBlock - block > maxBlockAge) return false
      if (currentBlock < oldestBlock) return false
      return true
    },
    [currentBlock, maxBlockAge, oldestBlock]
  )
}

export default function useIsValidBlock(block: number): boolean {
  return useGetIsValidBlock()(block)
}
