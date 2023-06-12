import { useWeb3React } from "@web3-react/core"
import { useSingleCallResult } from "lib/hooks/multicall"
import { useChainId } from "state/globalNetwork/hooks"
import { useGetSlotFactoryContract } from "./1delta/use1DeltaContract"

export const useNextSlotAddress = () => {
  const chainId = useChainId()
  const { account } = useWeb3React()
  const factoryContract = useGetSlotFactoryContract(chainId, account)
  const nextAddress = useSingleCallResult(account ? factoryContract : undefined, 'getNextAddress', [account])
  return nextAddress ? nextAddress?.result?.slotAddress : undefined
}