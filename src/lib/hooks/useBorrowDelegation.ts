import { MaxUint256 } from '@ethersproject/constants'
import type { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { getTokenAddress } from 'analytics/utils'
import { safeGetBorrowToken, safeGetToken } from 'hooks/1delta/tokens'
import { getCometContract, getCometExtContract, getDebtTokenContract } from 'hooks/1delta/use1DeltaContract'
import { useBorrowAllowance } from 'hooks/useBorrowAllowance'
import { useCallback, useMemo } from 'react'
import { AaveInterestMode, SupportedAssets } from 'types/1delta'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { ApprovalState } from './useApproval'
import { useWeb3React } from '@web3-react/core'
import { useChainId } from 'state/globalNetwork/hooks'
import { StableDebtToken } from 'abis/types/StableDebtToken'
import { LendingProtocol } from 'state/1delta/actions'
import { CometExt } from 'abis/types/CometExt'
import { useCometIsAllowed } from 'state/1delta/hooks'

// we use the approval state also for the borrow delegation
function useBorrowDelegationStateForSpender(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  isCometBorrow: boolean,
  cometBaseAsset = SupportedAssets.USDC
): ApprovalState {
  const { account } = useWeb3React()
  const chainId = useChainId()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined

  const currentAllowance = useBorrowAllowance(token, account ?? undefined, spender)
  const cometIsAllowing = useCometIsAllowed(chainId, token?.symbol as SupportedAssets, cometBaseAsset)
  const pendingApproval = useIsPendingApproval(token, spender)

  return useMemo(() => {
    if (token && isCometBorrow) {
      if (cometIsAllowing) return ApprovalState.APPROVED
      return ApprovalState.NOT_APPROVED
    }
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender, token, cometIsAllowing, isCometBorrow, cometBaseAsset])
}

export function useGeneralBorrowDelegation(
  interestMode: AaveInterestMode,
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): [
    ApprovalState,
    () => Promise<{ response: TransactionResponse; tokenAddress: string; spenderAddress: string } | undefined>
  ] {
  const { provider, account } = useWeb3React()
  const chainId = useChainId()
  const token = safeGetBorrowToken(
    chainId,
    (amountToApprove?.currency.symbol as SupportedAssets) ?? 'WETH',
    interestMode
  )
  const borrowTokenAmountToApprove =
    token && amountToApprove?.denominator && CurrencyAmount.fromRawAmount(token, amountToApprove?.quotient.toString())
  // check the current approval status
  const borrowApprovalState = useBorrowDelegationStateForSpender(
    borrowTokenAmountToApprove,
    spender,
    useIsPendingApproval,
    false,
    SupportedAssets.USDC,
  )
  // has extended functions
  const tokenContract = getDebtTokenContract(chainId, token?.address, provider, account) as StableDebtToken

  const approveBorrowDelegation = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} approval failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (borrowApprovalState !== ApprovalState.NOT_APPROVED) {
      return logFailure('approve was called unnecessarily')
    } else if (!chainId) {
      return logFailure('no chainId')
    } else if (!token) {
      return logFailure('no token')
    } else if (!tokenContract) {
      return logFailure('tokenContract is null')
    } else if (!borrowTokenAmountToApprove) {
      return logFailure('missing borrow samount to approve')
    } else if (!spender) {
      return logFailure('no spender')
    }

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approveDelegation(spender, MaxUint256).catch(() => {
      // general fallback for tokens which restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approveDelegation(spender, borrowTokenAmountToApprove.quotient.toString())
    })

    return tokenContract
      .approveDelegation(spender, useExact ? borrowTokenAmountToApprove.quotient.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
      .then((response: any) => {
        const eventProperties = {
          chain_id: chainId,
          token_symbol: token?.symbol,
          token_address: getTokenAddress(token),
        }
        return {
          response,
          tokenAddress: token.address,
          spenderAddress: spender,
        }
      })
      .catch((error: Error) => {
        logFailure(error)
        throw error
      })
  }, [borrowApprovalState, token, tokenContract, amountToApprove, spender, chainId])

  return [borrowApprovalState, approveBorrowDelegation]
}



export function useBorrowDelegation(
  lendingProtocol: LendingProtocol,
  interestMode: AaveInterestMode,
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  baseAsset = SupportedAssets.USDC,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  isCometBorrow: boolean
): [
    ApprovalState,
    () => Promise<{ response: TransactionResponse; tokenAddress: string; spenderAddress: string } | undefined>
  ] {
  const { provider, account } = useWeb3React()
  const chainId = useChainId()
  const token = lendingProtocol === LendingProtocol.AAVE ? safeGetBorrowToken(
    chainId,
    (amountToApprove?.currency.symbol as SupportedAssets) ?? 'WETH',
    interestMode
  ) : lendingProtocol === LendingProtocol.COMPOUNDV3 ? amountToApprove?.currency.wrapped : undefined
  const borrowTokenAmountToApprove =
    token && amountToApprove?.denominator && CurrencyAmount.fromRawAmount(token, amountToApprove?.quotient.toString())

  // check the current approval status
  const borrowApprovalState = useBorrowDelegationStateForSpender(
    borrowTokenAmountToApprove,
    spender,
    useIsPendingApproval,
    isCometBorrow,
    baseAsset
  )
  // has extended functions
  const tokenContract = lendingProtocol === LendingProtocol.AAVE ?
    getDebtTokenContract(chainId, token?.address, provider, account)
    : lendingProtocol === LendingProtocol.COMPOUNDV3 ?
      getCometExtContract(chainId, baseAsset, account, provider) : undefined

  const approveBorrowDelegation = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} approval failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (borrowApprovalState !== ApprovalState.NOT_APPROVED) {
      return logFailure('approve was called unnecessarily')
    } else if (!chainId) {
      return logFailure('no chainId')
    } else if (!token) {
      return logFailure('no token')
    } else if (!tokenContract) {
      return logFailure('tokenContract is null')
    } else if (!borrowTokenAmountToApprove) {
      return logFailure('missing borrow samount to approve')
    } else if (!spender) {
      return logFailure('no spender')
    }

    let useExact = false
    const estimatedGas =
      lendingProtocol === LendingProtocol.AAVE ?
        await (tokenContract as StableDebtToken).estimateGas.approveDelegation(spender, MaxUint256).catch(() => {
          // general fallback for tokens which restrict approval amounts
          useExact = true
          return (tokenContract as StableDebtToken).estimateGas.approveDelegation(spender, borrowTokenAmountToApprove.quotient.toString())
        }) : await (tokenContract as CometExt).estimateGas.allow(spender, true)


    return (lendingProtocol === LendingProtocol.AAVE ? (tokenContract as StableDebtToken)
      .approveDelegation(spender, useExact ? borrowTokenAmountToApprove.quotient.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas),
      }) :
      (tokenContract as CometExt)
        .allow(spender, true, {
          gasLimit: calculateGasMargin(estimatedGas),
        })
    )
      .then((response: any) => {
        return {
          response,
          tokenAddress: token.address,
          spenderAddress: spender,
        }
      })
      .catch((error: Error) => {
        logFailure(error)
        throw error
      })
  }, [borrowApprovalState, token, tokenContract, amountToApprove, spender, chainId])

  // compound v2 does not need delegated borrow
  if (lendingProtocol === LendingProtocol.COMPOUND)
    return [ApprovalState.APPROVED, async () => undefined]
  else
    return [borrowApprovalState, approveBorrowDelegation]
}
