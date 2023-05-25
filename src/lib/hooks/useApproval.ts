import { MaxUint256 } from '@ethersproject/constants'
import type { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { getAssetAddress, getCompoundCTokenAddress } from 'hooks/1delta/addressGetter'
import { getCometExtContract, getTokenManagerContract } from 'hooks/1delta/use1DeltaContract'
import { useTokenContract } from 'hooks/useContract'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { useCallback, useMemo } from 'react'
import { SupportedAssets } from 'types/1delta'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { useWeb3React } from '@web3-react/core'
import { useChainId } from 'state/globalNetwork/hooks'
import { useCometIsAllowed, useFetchCometData, useGetCurrentAccount } from 'state/1delta/hooks'
import { LendingProtocol } from 'state/1delta/actions'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

const gasLimitsApproval: { [chainId: number]: number } = {
  [SupportedChainId.POLYGON]: 1e4,
  [SupportedChainId.POLYGON_MUMBAI]: 1e4,
  [SupportedChainId.MAINNET]: 1e4,
  [SupportedChainId.GOERLI]: 1e4,
}

function useApprovalStateForSpender(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): ApprovalState {
  const { account } = useWeb3React()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined

  const { tokenAllowance } = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useIsPendingApproval(token, spender)

  return useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!tokenAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if tokenAllowance is
    return tokenAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, tokenAllowance, pendingApproval, spender])
}

export function useApproval(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): [
    ApprovalState,
    () => Promise<{ response: TransactionResponse; tokenAddress: string; spenderAddress: string } | undefined>
  ] {
  const { chainId } = useWeb3React()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined

  // check the current approval status
  const approvalState = useApprovalStateForSpender(amountToApprove, spender, useIsPendingApproval)

  const tokenContract = useTokenContract(token?.address)

  const approve = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} approval failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      return logFailure('approve was called unnecessarily')
    } else if (!chainId) {
      return logFailure('no chainId')
    } else if (!token) {
      return logFailure('no token')
    } else if (!tokenContract) {
      return logFailure('tokenContract is null')
    } else if (!amountToApprove) {
      return logFailure('missing amount to approve')
    } else if (!spender) {
      return logFailure('no spender')
    }

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens which restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())
    })

    return tokenContract
      .approve(spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
      .then((response) => {
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
  }, [approvalState, token, tokenContract, amountToApprove, spender, chainId])

  return [approvalState, approve]
}


function useMarginTradeApprovalStateForSpender(
  relevantAccount: string | undefined,
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  isCometWithdrawal: boolean,
  cometBaseAsset: SupportedAssets
): ApprovalState {
  const chainId = useChainId()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined

  const { tokenAllowance } = useTokenAllowance(token, relevantAccount ?? undefined, spender)
  const cometIsAllowing = useCometIsAllowed(chainId, token?.symbol as SupportedAssets, cometBaseAsset)
  const pendingApproval = useIsPendingApproval(token, spender)

  return useMemo(() => {
    if (isCometWithdrawal) {
      if (cometIsAllowing) return ApprovalState.APPROVED
      return ApprovalState.NOT_APPROVED
    }
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!tokenAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if tokenAllowance is
    return tokenAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, tokenAllowance, pendingApproval, spender, cometIsAllowing, isCometWithdrawal, cometBaseAsset])
}

export function useMarginTradeApprovalAllLenders(
  lendingProtocol: LendingProtocol,
  relevantAccount: string | undefined,
  amountToApprove: CurrencyAmount<Currency> | undefined,
  assetSpender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  isCometWithdrawal: boolean,
  cometBaseAsset: SupportedAssets
): [
    ApprovalState,
    () => Promise<{ response: TransactionResponse; tokenAddress: string; spenderAddress: string } | undefined>
  ] {
  const { account, provider } = useWeb3React()
  const chainId = useChainId()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined


  let spender = assetSpender
  const asset = (token?.symbol as SupportedAssets) ?? undefined

  // for compound the spender is the cToken
  if (lendingProtocol === LendingProtocol.COMPOUND) {
    spender = getCompoundCTokenAddress(chainId, asset)
  }

  // check the current approval status
  const approvalState = useMarginTradeApprovalStateForSpender(
    relevantAccount,
    amountToApprove,
    spender,
    useIsPendingApproval,
    isCometWithdrawal,
    cometBaseAsset
  )

  const deltaAccount = useGetCurrentAccount(chainId)
  let tokenContract: any = useTokenContract(token?.address)

  // for compound, the approval has to be wrapped in the abstract account
  if (lendingProtocol === LendingProtocol.COMPOUND)
    tokenContract = getTokenManagerContract(chainId, provider, deltaAccount?.accountAddress, account)

  const fetchCometUser = useFetchCometData(chainId, account, cometBaseAsset)

  const approve = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} approval failed:`, error)
      return
    }

    // case 1: general - needs approve call
    if (!cometBaseAsset || !isCometWithdrawal) {
      // Bail early if there is an issue.
      if (approvalState !== ApprovalState.NOT_APPROVED) {
        return logFailure('approve was called unnecessarily')
      } else if (!chainId) {
        return logFailure('no chainId')
      } else if (!token) {
        return logFailure('no token')
      } else if (!tokenContract) {
        return logFailure('tokenContract is null')
      } else if (!amountToApprove) {
        return logFailure('missing amount to approve')
      } else if (!spender) {
        return logFailure('no spender')
      }
      // case 1.1: Compound Abstract Account - needs to call
      // "approveSpending" on from account to cToken
      if (lendingProtocol === LendingProtocol.COMPOUND) {
        try {
          const assetToApprove = getAssetAddress(chainId, asset)
          let useExact = false
          const estimatedGas = await tokenContract.estimateGas
            .approveSpending(assetToApprove, spender, MaxUint256)
            .catch(() => {
              // general fallback for tokens which restrict approval amounts
              useExact = true
              return tokenContract.estimateGas.approveSpending(assetToApprove, spender, amountToApprove.quotient.toString())
            })

          return tokenContract
            .approveSpending(assetToApprove, spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
              gasLimit: calculateGasMargin(estimatedGas),
            })
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
        } catch (err) {
          console.log('Error Approval Args', err)
          return null
        }
      }
      // case 1.2: general, for CompoundV3 non-withdrawals and Aave
      else {
        let useExact = false
        const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
          // general fallback for tokens which restrict approval amounts
          useExact = true
          return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())
        })

        return tokenContract
          .approve(spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
            gasLimit: calculateGasMargin(estimatedGas),
          })
          .then((response) => {
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
      }
    }
    // case 2: Comet withdrawal - need "allow"-call
    else {
      return getCometExtContract(chainId ?? 0, cometBaseAsset, account, provider)
        .allow(spender ?? '', true)
        .then((response) => {
          fetchCometUser()
          return {
            response,
            tokenAddress: tokenContract?.address ?? '',
            spenderAddress: String(spender),
          }
        })
        .catch((error: Error) => {
          logFailure(error)
          throw error
        })
    }
  }, [approvalState, token, tokenContract, amountToApprove, spender, chainId])

  return [approvalState, approve]
}

function useCompoundApprovalStateForSpender(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  deltaAccount: string | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): ApprovalState {
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined

  const { tokenAllowance } = useTokenAllowance(token, deltaAccount ?? undefined, spender)
  const pendingApproval = useIsPendingApproval(token, spender)

  return useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!tokenAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if tokenAllowance is
    return tokenAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, tokenAllowance, pendingApproval, spender])
}

export function useApprovalOnCompound(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  deltaAccount: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): [
    ApprovalState,
    () => Promise<{ response: TransactionResponse; tokenAddress: string; spenderAddress: string } | undefined>
  ] {
  const { provider, account } = useWeb3React()
  const chainId = useChainId()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
  const asset = (token?.symbol as SupportedAssets) ?? undefined
  const spender = getCompoundCTokenAddress(chainId, asset)
  const assetToApprove = getAssetAddress(chainId, asset)

  // check the current approval status
  const approvalState = useCompoundApprovalStateForSpender(amountToApprove, deltaAccount, spender, useIsPendingApproval)

  const tokenContract = getTokenManagerContract(chainId, provider, deltaAccount, account)

  const approve = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} approval failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      return logFailure('approve was called unnecessarily')
    } else if (!chainId) {
      return logFailure('no chainId')
    } else if (!token) {
      return logFailure('no token')
    } else if (!tokenContract) {
      return logFailure('tokenContract is null')
    } else if (!amountToApprove) {
      return logFailure('missing amount to approve')
    } else if (!spender) {
      return logFailure('no spender')
    }

    try {
      let useExact = false
      const estimatedGas = await tokenContract.estimateGas
        .approveSpending(assetToApprove, spender, MaxUint256)
        .catch(() => {
          // general fallback for tokens which restrict approval amounts
          useExact = true
          return tokenContract.estimateGas.approveSpending(assetToApprove, spender, amountToApprove.quotient.toString())
        })

      return tokenContract
        .approveSpending(assetToApprove, spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
          gasLimit: calculateGasMargin(estimatedGas),
        })
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
    } catch (err) {
      console.log('Error Approval Args', err)
      return null
    }
  }, [approvalState, token, tokenContract, amountToApprove, spender, chainId])

  return [approvalState, approve]
}
