import { createMulticall, ListenerOptions } from '@uniswap/redux-multicall'
import { SupportedChainId } from 'constants/chains'
import { useInterfaceMulticall } from 'hooks/useContract'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useEffect, useMemo, useState } from 'react'
import { combineReducers, createStore } from 'redux'
import { useChainId } from 'state/globalNetwork/hooks'

const multicall = createMulticall()
const reducer = combineReducers({ [multicall.reducerPath]: multicall.reducer })
export const store = createStore(reducer)

export default multicall

function getBlocksPerFetchForChainId(chainId: number | undefined): number {
  switch (chainId) {
    case SupportedChainId.ARBITRUM_ONE:
    case SupportedChainId.OPTIMISM:
      return 15
    case SupportedChainId.CELO:
    case SupportedChainId.CELO_ALFAJORES:
      return 5
    case SupportedChainId.POLYGON_ZK_EVM:
      return 2;
    default:
      return 10
  }
}


const useRandomInteger = () => {
  const [randomInteger, setRandomInteger] = useState(Math.floor(Math.random() * 4));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRandomInteger(Math.floor(Math.random() * 4));
    }, 10000); // updates every 5 seconds

    return () => {
      clearInterval(intervalId); // clean up interval on component unmount
    };
  }, []); // empty dependency array means this effect runs once on mount and clean up on unmount

  return randomInteger;
};


export function MulticallUpdater() {
  const chainId = useChainId()
  const latestBlockNumber = useBlockNumber()
  const id = useRandomInteger()
  const contract = useInterfaceMulticall(id, chainId)

  const listenerOptions: ListenerOptions = useMemo(
    () => ({
      blocksPerFetch: getBlocksPerFetchForChainId(chainId),
    }),
    [chainId]
  )

  return (
    <multicall.Updater
      chainId={chainId}
      latestBlockNumber={latestBlockNumber}
      contract={contract}
      listenerOptions={listenerOptions}
      isDebug={true}
    />
  )
}
