// eslint-disable-next-line no-restricted-imports
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useApproval, useApprovalOnCompound, useMarginTradeApprovalAllLenders } from 'lib/hooks/useApproval'
import { useBorrowDelegation, useGeneralBorrowDelegation } from 'lib/hooks/useBorrowDelegation'
import { useMemo } from 'react'
import { LendingProtocol } from 'state/1delta/actions'
import { Field } from 'state/swap/actions'
import { AaveInterestMode, MarginTradeType, SupportedAssets } from 'types/1delta'
import { useHasPendingApproval } from '../state/transactions/hooks'
import { safeGetAToken } from './1delta/tokens'
import { ApprovalState, useGetAndTrackApproval } from './useApproveCallback'



// wraps useApproveCallback in the context of a swap
// designed for special approvals like cTokens, aTokens and allow function of comet
export function useTradeApproval(
  lendingProtocol: LendingProtocol,
  relevantAccount: string | undefined,
  trade: Trade<Currency, Currency, TradeType> | undefined,
  lendingInteraction: MarginTradeType,
  field: Field,
  addressToApprove: string,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  amount?: CurrencyAmount<Currency>, // defaults to trade.maximumAmountIn(allowedSlippage),
  cometBaseAsset = SupportedAssets.USDC
) {
  const { chainId } = useWeb3React()

  const amountToApprove = useMemo(() => {
    // borrows do not require a separate approvals that are covered here
    // delegated borrows are covered on a separate hook
    // for Aave, we need to approve aTokens in case of withdrawals
    if (lendingProtocol === LendingProtocol.AAVE) {
      // for a supply or withdraw the user has to approve the regular spending
      if (
        lendingInteraction === MarginTradeType.Supply ||
        lendingInteraction === MarginTradeType.Repay
      )
        return (
          amount || (trade && trade.inputAmount.currency.isToken ? trade.maximumAmountIn(allowedSlippage) : undefined)
        )

      // for a withdraw the user needs to actually approve the aToken
      // the aToken in question is in this case the output token
      if (lendingInteraction === MarginTradeType.Withdraw) {
        let amountAToken: CurrencyAmount<Currency> | undefined = undefined
        if (field === Field.OUTPUT) {
          const aToken = safeGetAToken(chainId, (trade?.outputAmount.currency.symbol ?? 'WETH') as SupportedAssets)
          amountAToken = CurrencyAmount.fromRawAmount(aToken, amount?.quotient ?? '0')
          if (trade && trade.outputAmount.currency.isToken) {
            amountAToken = CurrencyAmount.fromRawAmount(
              aToken,
              trade.maximumAmountIn(allowedSlippage).quotient.toString()
            )
          }
        } else {
          const aToken = safeGetAToken(chainId, (trade?.inputAmount.currency.symbol ?? 'WETH') as SupportedAssets)
          amountAToken = CurrencyAmount.fromRawAmount(aToken, amount?.quotient ?? '0')
          if (trade && trade.inputAmount.currency.isToken) {
            amountAToken = CurrencyAmount.fromRawAmount(
              aToken,
              trade.maximumAmountIn(allowedSlippage).quotient.toString()
            )
          }
        }
        return amountAToken as CurrencyAmount<Currency>
      }
    }
    // for compound V2 only the regular amount
    // withdrawals might be relevant as the abstract account might be required to call the approve
    // on a cToken if the user wants to withdraw
    if (lendingProtocol === LendingProtocol.COMPOUND) {
      return (
        amount || (trade && trade.outputAmount.currency.isToken ? trade.minimumAmountOut(allowedSlippage) : undefined)
      )
    }
    // for comounV3 we need to approve only supply and repay
    if (lendingProtocol === LendingProtocol.COMPOUNDV3) {
      if (
        lendingInteraction === MarginTradeType.Supply ||
        lendingInteraction === MarginTradeType.Repay ||
        lendingInteraction === MarginTradeType.Withdraw
      )
        return (
          amount || (trade && trade.inputAmount.currency.isToken ? trade.maximumAmountIn(allowedSlippage) : undefined)
        )
    }
    return undefined
  }, [amount, trade, allowedSlippage, lendingInteraction, chainId])

  // compound V3 is a special case or withdrawals as it uses isAllowed flag for delegated withdrawal (= delegated borrow)
  const isCometWithdrawal = lendingProtocol === LendingProtocol.COMPOUNDV3 ?
    (Boolean(amount) || Boolean(trade)) && Boolean(cometBaseAsset) && lendingInteraction === MarginTradeType.Withdraw
    : false

  // the general spender of the amount
  // will be set to the cToken in Compound V2 caser
  const spender = chainId ? addressToApprove : undefined

  return useMarginTradeApprovalAllLenders(
    lendingProtocol,
    relevantAccount,
    amountToApprove,
    spender,
    useIsPendingApproval,
    isCometWithdrawal,
    cometBaseAsset
  )
}

// wraps useApproveCallback in the context of a swap
export function useGeneralTradeApproval(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  lendingInteraction: MarginTradeType,
  field: Field,
  addressToApprove: string,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  amount?: CurrencyAmount<Currency> // defaults to trade.maximumAmountIn(allowedSlippage)
) {
  const { chainId } = useWeb3React()

  const amountToApprove = useMemo(() => {
    // for a supply or withdraw the user has to approve the regular spending
    if (
      lendingInteraction === MarginTradeType.Supply ||
      lendingInteraction === MarginTradeType.Repay
    )
      return (
        amount || (trade && trade.inputAmount.currency.isToken ? trade.maximumAmountIn(allowedSlippage) : undefined)
      )

    if (lendingInteraction === MarginTradeType.Withdraw) {
      // for a withdraw the user needs to actually approve the aToken
      // the aToken in question is in this case the output token

      let amountAToken: CurrencyAmount<Currency> | undefined = undefined
      if (field === Field.OUTPUT) {
        const aToken = safeGetAToken(chainId, (trade?.outputAmount.currency.symbol ?? 'WETH') as SupportedAssets)
        amountAToken = CurrencyAmount.fromRawAmount(aToken, amount?.quotient ?? '0')
        if (trade && trade.outputAmount.currency.isToken) {
          amountAToken = CurrencyAmount.fromRawAmount(
            aToken,
            trade.maximumAmountIn(allowedSlippage).quotient.toString()
          )
        }
      } else {
        const aToken = safeGetAToken(chainId, (trade?.inputAmount.currency.symbol ?? 'WETH') as SupportedAssets)
        amountAToken = CurrencyAmount.fromRawAmount(aToken, amount?.quotient ?? '0')
        if (trade && trade.inputAmount.currency.isToken) {
          amountAToken = CurrencyAmount.fromRawAmount(
            aToken,
            trade.maximumAmountIn(allowedSlippage).quotient.toString()
          )
        }
      }
      return amountAToken as CurrencyAmount<Currency>
    }
    return undefined
  }, [amount, trade, allowedSlippage, lendingInteraction, chainId])
  const spender = chainId ? addressToApprove : undefined

  return useApproval(amountToApprove, spender, useIsPendingApproval)
}

export function useApproveCallbackFromGeneralTrade(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  lendingInteraction: MarginTradeType,
  field: Field,
  addressToApprove: string,
  allowedSlippage: Percent
): [ApprovalState, () => Promise<void>] {
  const [approval, getApproval] = useGeneralTradeApproval(
    trade,
    lendingInteraction,
    field,
    addressToApprove,
    allowedSlippage,
    useHasPendingApproval
  )
  return [approval, useGetAndTrackApproval(getApproval)]
}


export function useApproveCallbackFromMarginTrade(
  lendingProtocol: LendingProtocol,
  relevantAccount: string | undefined,
  trade: Trade<Currency, Currency, TradeType> | undefined,
  lendingInteraction: MarginTradeType,
  field: Field,
  addressToApprove: string,
  allowedSlippage: Percent,
  amount?: CurrencyAmount<Currency>,
  cometBaseAsset = SupportedAssets.USDC
): [ApprovalState, () => Promise<void>] {
  const [approval, getApproval] = useTradeApproval(
    lendingProtocol,
    relevantAccount,
    trade,
    lendingInteraction,
    field,
    addressToApprove,
    allowedSlippage,
    useHasPendingApproval,
    amount,
    cometBaseAsset,
  )
  return [approval, useGetAndTrackApproval(getApproval)]
}

// wraps useApproveCallback in the context of a swap
export function useGeneralTradeApprovalAbstractAccount(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  lendingInteraction: MarginTradeType,
  allowedSlippage: Percent,
  deltaAccount: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  amount?: CurrencyAmount<Currency> // defaults to trade.maximumAmountIn(allowedSlippage)
) {
  const amountToApprove = useMemo(() => {
    // only the output is relevant as we have to safeTransfer from the abstract account to the cToken to repay or deposit
    // for borrow / withdraw no approval is relevant
    return (
      amount || (trade && trade.outputAmount.currency.isToken ? trade.minimumAmountOut(allowedSlippage) : undefined)
    )
  }, [amount, trade, allowedSlippage, lendingInteraction])

  return useApprovalOnCompound(amountToApprove, deltaAccount, useIsPendingApproval)
}

export function useApproveCallbacFromTradeAbstractAccount(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  lendingInteraction: MarginTradeType,
  deltaAccount: string | undefined,
  allowedSlippage: Percent,
  singleAmount?: CurrencyAmount<Currency>
): [ApprovalState, () => Promise<void>] {
  const [approval, getApproval] = useGeneralTradeApprovalAbstractAccount(
    trade,
    lendingInteraction,
    allowedSlippage,
    deltaAccount,
    useHasPendingApproval,
    singleAmount
  )
  return [approval, useGetAndTrackApproval(getApproval)]
}

// wraps useApproveCallback in the context of a swap
export function useGeneralTradeBorrowDelegation(
  lendingProtocol: LendingProtocol,
  trade: Trade<Currency, Currency, TradeType> | undefined,
  lendingInteraction: MarginTradeType,
  field: Field,
  addressToApprove: string,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  interestMode: AaveInterestMode,
  amount?: CurrencyAmount<Currency>
) {
  const { chainId } = useWeb3React()

  const amountToApprove = useMemo(() => {
    if (lendingInteraction !== MarginTradeType.Borrow) return undefined
    else {
      if (field === Field.OUTPUT)
        return (
          amount || (trade && trade.outputAmount.currency.isToken ? trade.minimumAmountOut(allowedSlippage) : undefined)
        )
      else
        return (
          amount || (trade && trade.inputAmount.currency.isToken ? trade.maximumAmountIn(allowedSlippage) : undefined)
        )
    }
  }, [amount, trade, allowedSlippage, lendingInteraction])
  const spender = chainId ? addressToApprove : undefined
  return useGeneralBorrowDelegation(interestMode, lendingProtocol === LendingProtocol.COMPOUND ? amountToApprove : amount, spender, useIsPendingApproval)
}

export function useDelegateBorrowCallbackFromGeneralTrade(
  lendingProtocol: LendingProtocol,
  trade: Trade<Currency, Currency, TradeType> | undefined,
  lendingInteraction: MarginTradeType,
  field: Field,
  addressToApprove: string,
  allowedSlippage: Percent,
  interestMode: AaveInterestMode,
  amount?: CurrencyAmount<Currency>
): [ApprovalState, () => Promise<void>] {
  const [approval, getApproval] = useGeneralTradeBorrowDelegation(
    lendingProtocol,
    trade,
    lendingInteraction,
    field,
    addressToApprove,
    allowedSlippage,
    useHasPendingApproval,
    interestMode,
    amount
  )
  return [approval, useGetAndTrackApproval(getApproval)]
}



// wraps useApproveCallback in the context of a swap
export function useTradeBorrowDelegationApproval(
  lendingProtocol: LendingProtocol,
  trade: Trade<Currency, Currency, TradeType> | undefined,
  lendingInteraction: MarginTradeType,
  field: Field,
  addressToApprove: string,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  interestMode: AaveInterestMode,
  amount?: CurrencyAmount<Currency>,
  baseAsset = SupportedAssets.USDC
) {
  const { chainId } = useWeb3React()

  const amountToApprove = useMemo(() => {
    if (lendingInteraction !== MarginTradeType.Borrow) return undefined
    else {
      if (field === Field.OUTPUT)
        return (
          amount || (trade && trade.outputAmount.currency.isToken ? trade.minimumAmountOut(allowedSlippage) : undefined)
        )
      else
        return (
          amount || (trade && trade.inputAmount.currency.isToken ? trade.maximumAmountIn(allowedSlippage) : undefined)
        )
    }
  }, [amount, trade, allowedSlippage, lendingInteraction])
  const spender = chainId ? addressToApprove : undefined

  const isCometBorrow = lendingProtocol === LendingProtocol.COMPOUNDV3 && lendingInteraction === MarginTradeType.Borrow
  return useBorrowDelegation(lendingProtocol, interestMode, amountToApprove, spender, baseAsset, useIsPendingApproval, isCometBorrow)
}

export function useDelegateBorrowCallback(
  lendingProtocol: LendingProtocol,
  trade: Trade<Currency, Currency, TradeType> | undefined,
  lendingInteraction: MarginTradeType,
  field: Field,
  addressToApprove: string,
  allowedSlippage: Percent,
  interestMode: AaveInterestMode,
  singleAmount?: CurrencyAmount<Currency>,
  baseAsset = SupportedAssets.USDC
): [ApprovalState, () => Promise<void>] {
  const [approval, getApproval] = useTradeBorrowDelegationApproval(
    lendingProtocol,
    trade,
    lendingInteraction,
    field,
    addressToApprove,
    allowedSlippage,
    useHasPendingApproval,
    interestMode,
    singleAmount,
    baseAsset
  )
  return [approval, useGetAndTrackApproval(getApproval)]
}