import { useBlockNumber } from 'state/globalNetwork/hooks'

/** Requires that BlockUpdater be installed in the DOM tree. */
export default function useBlockNumberMulticall(): number | undefined {
  const bn = useBlockNumber()
  return bn
}

