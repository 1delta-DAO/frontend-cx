import { BigNumber } from '@ethersproject/bignumber'
import { useMemo } from 'react'
import { useTimestamp } from 'state/globalNetwork/hooks'


// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber | undefined {
  const timestamp = useTimestamp()
  return useMemo(() => BigNumber.from(timestamp), [timestamp])
}
