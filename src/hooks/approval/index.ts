import { Percent } from "@uniswap/sdk-core"
import { useApproveCallbacFromTradeAbstractAccount, useApproveCallbackFromMarginTrade, useDelegateBorrowCallback } from "hooks/use1DeltaMarginSwapCallback"
import { ApprovalState } from "hooks/useApproveCallback"
import useIsArgentWallet from "hooks/useIsArgentWallet"
import { useCallback, useEffect, useMemo, useState } from "react"
import { LendingProtocol } from "state/1delta/actions"
import { AaveInterestMode, Field, MarginTradeType, SupportedAssets } from "types/1delta"
import { UniswapTrade } from "utils/Types"


interface Approval {
  approvalStateOfConcern: ApprovalState;
  handleApprove: () => Promise<void>;
  setApprovalSubmitted: (v: boolean) => void
  showApproveFlow: boolean;
  approvalPending: boolean;
  approvalSubmitted: boolean;
  approveTokenButtonDisabled: boolean,
  abstractApproval: boolean
}

/**
 * Manages the approval state for a margin trade
 * - Margin open, close
 * - Collateral / Debt swap
 * @param lendingprotocol 
 * @param trade 
 * @param marginTradeType 
 * @param marginTradeContractAddress 
 * @param allowedSlippage 
 * @param sourceBorrowInterestMode 
 * @param baseAsset 
 * @param hasNoImplementation 
 * @returns 
 */
export const useMarginTradeApproval = (
  lendingprotocol: LendingProtocol,
  relevantAccount: string | undefined,
  trade: UniswapTrade | undefined,
  marginTradeType: MarginTradeType,
  marginTradeContractAddress: string,
  allowedSlippage: Percent,
  sourceBorrowInterestMode: AaveInterestMode,
  baseAsset = SupportedAssets.USDC,
  hasNoImplementation: boolean,
): Approval => {
  const generalLPInteraction = useMemo(() => {
    switch (marginTradeType) {
      case MarginTradeType.Collateral:
        return MarginTradeType.Withdraw;
      case MarginTradeType.Debt:
        return MarginTradeType.Borrow
      default: {
        // compound V2 interacts throguh abstract accounts
        // these have to approve spending on the cToken for opening a position
        // and repaying debt
        if (lendingprotocol === LendingProtocol.COMPOUND) {
          return marginTradeType === MarginTradeType.Trim ? MarginTradeType.Repay : MarginTradeType.Supply
        }
        // other protocols fall back to withdraw interactions
        else {
          return MarginTradeType.Withdraw
        }
      }
    }
  },
    [marginTradeType, lendingprotocol]
  )

  const borrowLPInteraction = useMemo(() => {
    switch (marginTradeType) {
      case MarginTradeType.Collateral:
        if (lendingprotocol === LendingProtocol.COMPOUND)
          return MarginTradeType.Supply;
        else return MarginTradeType.Withdraw
      case MarginTradeType.Debt:
        if (lendingprotocol === LendingProtocol.COMPOUND)
          return MarginTradeType.Repay
        else return MarginTradeType.Borrow

      default: {
        return MarginTradeType.Borrow
      }
    }
  },
    [marginTradeType, lendingprotocol]
  )

  // check whether the user has approved the router on the input token when trading into the protocol
  // - used for all protocols when swapping from wallet to lender
  // - used when swapping aTokens from user Wallet to broker contract for withdrawals
  const [approvalState, approveCallback] = useApproveCallbackFromMarginTrade(
    lendingprotocol,
    relevantAccount,
    trade,
    generalLPInteraction,
    Field.INPUT,
    marginTradeContractAddress,
    allowedSlippage,
    undefined,
    baseAsset
  )

  const checkAbstractAccountApproval = lendingprotocol === LendingProtocol.COMPOUND
  // check whether the user has approved the router on the input token
  const [approvalStateAbstractAccount, approveCallbackAbstractAccount] = useApproveCallbacFromTradeAbstractAccount(
    checkAbstractAccountApproval ? trade : undefined,
    generalLPInteraction,
    relevantAccount,
    allowedSlippage,
    undefined
  )


  // check whether the user has approved the router on the input token when borrowing
  // - used for opening a position
  // - used for debt swap
  // - collateral swap for compound V3
  const [borrowApprovalState, approveBorrowCallback] = useDelegateBorrowCallback(
    lendingprotocol,
    trade,
    borrowLPInteraction,
    Field.INPUT,
    marginTradeContractAddress,
    allowedSlippage,
    sourceBorrowInterestMode,
    undefined,
    baseAsset
  )

  const [abstractApproval, setAbstractApproval] = useState(false)

  const [approvalStateOfConcern, callbackOfConcern] = useMemo(() => {
    switch (marginTradeType) {
      case MarginTradeType.Trim: {
        if (checkAbstractAccountApproval && approvalStateAbstractAccount !== ApprovalState.APPROVED) {
          !abstractApproval && setAbstractApproval(true)
          return [approvalStateAbstractAccount, approveCallbackAbstractAccount]
        } else {
          abstractApproval && setAbstractApproval(false)
          // withdrawal is relevant,
          return [approvalState, approveCallback]
        }
      }
      case MarginTradeType.Open: {
        if (checkAbstractAccountApproval && approvalStateAbstractAccount !== ApprovalState.APPROVED) {
          !abstractApproval && setAbstractApproval(true)
          return [approvalStateAbstractAccount, approveCallbackAbstractAccount]
        } else {
          abstractApproval && setAbstractApproval(false)
          // borrowing is relevant
          return [borrowApprovalState, approveBorrowCallback]
        }
      }

      case MarginTradeType.Debt: {
        if (checkAbstractAccountApproval && approvalStateAbstractAccount !== ApprovalState.APPROVED) {
          !abstractApproval && setAbstractApproval(true)
          return [approvalStateAbstractAccount, approveCallbackAbstractAccount]
        } else {
          abstractApproval && setAbstractApproval(false)
          // borrowing is relevant
          return [borrowApprovalState, approveBorrowCallback]
        }
      }

      case MarginTradeType.Collateral: {
        if (checkAbstractAccountApproval && approvalStateAbstractAccount !== ApprovalState.APPROVED) {
          !abstractApproval && setAbstractApproval(true)
          return [approvalStateAbstractAccount, approveCallbackAbstractAccount]
        } else {
          abstractApproval && setAbstractApproval(false)
          return [approvalState, approveCallback]
        }
      }
      default:
        return [approvalState, approveCallback]
    }
  }, [marginTradeType, approvalState, borrowApprovalState, lendingprotocol])

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // === from here, the code is independent of the trade type and protocol 

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalStateOfConcern === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    } else
      if (approvalStateOfConcern === ApprovalState.NOT_APPROVED) {
        setApprovalSubmitted(false)
      }
  }, [approvalStateOfConcern, approvalSubmitted])


  const isArgentWallet = useIsArgentWallet()
  const showApproveFlow = // swap input error should be respected
    !hasNoImplementation &&
    !isArgentWallet &&
    (approvalStateOfConcern === ApprovalState.NOT_APPROVED ||
      approvalStateOfConcern === ApprovalState.PENDING ||
      (approvalSubmitted && approvalStateOfConcern === ApprovalState.APPROVED))

  const [approvalPending, setApprovalPending] = useState<boolean>(false)

  const handleApprove = useCallback(async () => {
    setApprovalPending(true)
    try {
      await callbackOfConcern()
    } finally {
      setApprovalPending(false)
    }
  }, [callbackOfConcern, trade?.inputAmount?.currency.symbol])

  const approveTokenButtonDisabled =
    approvalStateOfConcern !== ApprovalState.NOT_APPROVED ||
    approvalSubmitted

  return {
    approvalStateOfConcern,
    handleApprove,
    showApproveFlow,
    approvalSubmitted,
    approvalPending,
    approveTokenButtonDisabled,
    setApprovalSubmitted,
    abstractApproval
  }
}