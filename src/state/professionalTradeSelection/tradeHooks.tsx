import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, NativeCurrency, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import useAutoSlippageTolerance from 'hooks/useAutoSlippageTolerance'
import { useBestTradeProfessional } from 'hooks/professional/useBestTrade'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ParsedQs } from 'qs'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useChainId, useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { Field, MappedCurrencyAmounts, OneDeltaTradeType } from 'types/1delta'
import { cherryPickTrade } from 'utils/swap/swapUtils'

import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { useCurrency } from '../../hooks/Tokens'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { useCurrencyBalances } from '../connection/hooks'
import { AppState } from '../index'
import { replaceProfessionalState, selectProfessionalCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { ProfessionalTradeSelection } from './reducer'
import { useClientSideV3Professional } from 'hooks/professional/useClientSideV3Trade'
import { useAlgebraClientSideV3Margin } from 'hooks/professional/algebraMargin/useClientSideV3Trade'
import { useAlgebraClientSideV3Close } from 'hooks/professional/algebraClose/useClientSideV3Trade'

export function useProfessionalState(): AppState['professionalTradeSelection'] {
  return useAppSelector((state) => state.professionalTradeSelection)
}

export function useProfessionalActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useAppDispatch()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectProfessionalCurrency({
          field,
          currencyId: currency.isToken ? currency.address : currency.isNative ? 'ETH' : '',
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  }
}

const BAD_RECIPIENT_ADDRESSES: { [address: string]: true } = {
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f': true, // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a': true, // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': true, // v2 router 02
}

function parseCurrencyFromURLParameter(urlParam: ParsedQs[string]): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    const upper = urlParam.toUpperCase()
    if (upper === 'ETH') return 'ETH'
    if (upper in TOKEN_SHORTHANDS) return upper
  }
  return ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToProfessionalState(parsedQs: ParsedQs) {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  const typedValue = parseTokenAmountURLParameter(parsedQs.exactAmount)
  const independentField = parseIndependentFieldURLParameter(parsedQs.exactField)

  if (inputCurrency === '' && outputCurrency === '' && typedValue === '' && independentField === Field.INPUT) {
    // Defaults to having the native currency selected
    inputCurrency = 'ETH'
  } else if (inputCurrency === outputCurrency) {
    // clear output if identical
    outputCurrency = ''
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency === '' ? null : inputCurrency ?? null,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency === '' ? null : outputCurrency ?? null,
    },
    typedValue,
    independentField,
    recipient,
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch() {
  const chainId = useChainId()
  const dispatch = useAppDispatch()
  const parsedQs = useParsedQueryString()

  const parsedProfessionalState = useMemo(() => {
    return queryParametersToProfessionalState(parsedQs)
  }, [parsedQs])

  useEffect(() => {
    if (!chainId) return
    const inputCurrencyId = parsedProfessionalState[Field.INPUT].currencyId ?? undefined
    const outputCurrencyId = parsedProfessionalState[Field.OUTPUT].currencyId ?? undefined

    dispatch(
      replaceProfessionalState({
        typedValue: parsedProfessionalState.typedValue,
        field: parsedProfessionalState.independentField,
        inputCurrencyId,
        outputCurrencyId,
        recipient: parsedProfessionalState.recipient,
      })
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return parsedProfessionalState
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfoClientSideProfessional(
  tradeType: OneDeltaTradeType,
  currencyBalances: MappedCurrencyAmounts
): {
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: ReactNode
  trade: {
    trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
    state: TradeState
  }
  allowedSlippage: Percent
} {
  const { account } = useWeb3React()

  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: currencyBalances[Field.INPUT]?.currency,
      [Field.OUTPUT]: currencyBalances[Field.OUTPUT]?.currency,
    }),
    [currencyBalances]
  )

  const { independentField, typedValue, recipient } = useProfessionalState()

  const inputCurrency = currencies[Field.INPUT]
  const outputCurrency = currencies[Field.OUTPUT]
  const recipientLookup = recipient ?? undefined
  const to: string | null = (recipient === null ? account : recipientLookup ?? null) ?? null

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue]
  )
  const tradeRaw = useClientSideV3Professional(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    tradeType === OneDeltaTradeType.Professional ? parsedAmount : undefined,
    tradeType === OneDeltaTradeType.Professional ? ((isExactIn ? outputCurrency : inputCurrency) ?? undefined) : undefined
  )

  const trade = useMemo(() => {
    return {
      trade: cherryPickTrade(tradeRaw.trade),
      state: tradeRaw.state,
    }
  }, [tradeRaw])

  // allowed slippage is either auto slippage, or custom user defined slippage if auto slippage disabled
  const autoSlippageTolerance = useAutoSlippageTolerance(trade.trade)
  const allowedSlippage = useUserSlippageToleranceWithDefault(autoSlippageTolerance)

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    // if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    //   inputError = inputError ?? <Trans>Select a token</Trans>
    // }

    if (!parsedAmount) {
      inputError = inputError ?? <Trans>Enter an amount</Trans>
    }

    const formattedTo = isAddress(to)
    if (!to || !formattedTo) {
      inputError = inputError ?? <Trans>Enter a recipient</Trans>
    } else {
      if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
        inputError = inputError ?? <Trans>Invalid recipient</Trans>
      }
    }

    // compare input balance to max input based on version
    const [balanceIn, amountIn] = [currencyBalances[Field.INPUT], trade.trade?.maximumAmountIn(allowedSlippage)]

    // if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    //   inputError = <Trans>Insufficient {amountIn.currency.symbol} balance</Trans>
    // }

    return inputError
  }, [account, allowedSlippage, currencies, currencyBalances, parsedAmount, to, trade.trade])

  return useMemo(
    () => ({
      parsedAmount,
      inputError,
      trade,
      allowedSlippage,
    }),
    [allowedSlippage, currencies, currencyBalances, inputError, parsedAmount, trade]
  )
}



// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfoMargin(
  inAmount: CurrencyAmount<Token | NativeCurrency> | undefined,
  outCurrency: Currency | null | undefined,
): {
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: ReactNode
  trade: {
    trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
    state: TradeState
  }
  allowedSlippage: Percent
} {
  const { account } = useWeb3React()
  const inCurrency = inAmount?.currency
  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: inCurrency,
      [Field.OUTPUT]: outCurrency,
    }),
    [inCurrency, outCurrency]
  )

  const { recipient } = useProfessionalState()

  const inputCurrency = currencies[Field.INPUT]
  const outputCurrency = currencies[Field.OUTPUT]
  const recipientLookup = recipient ?? undefined
  const to: string | null = (recipient === null ? account : recipientLookup ?? null) ?? null

  const isExactIn = true
  const parsedAmount = inAmount

  const tradeRaw = useClientSideV3Professional(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    parsedAmount,
    (isExactIn ? outputCurrency : inputCurrency) ?? undefined
  )

  const trade = useMemo(() => {
    return {
      trade: cherryPickTrade(tradeRaw.trade),
      state: tradeRaw.state,
    }
  }, [tradeRaw])

  // allowed slippage is either auto slippage, or custom user defined slippage if auto slippage disabled
  const autoSlippageTolerance = useAutoSlippageTolerance(trade.trade)
  const allowedSlippage = useUserSlippageToleranceWithDefault(autoSlippageTolerance)

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    // if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    //   inputError = inputError ?? <Trans>Select a token</Trans>
    // }

    if (!parsedAmount) {
      inputError = inputError ?? <Trans>Enter an amount</Trans>
    }

    const formattedTo = isAddress(to)
    if (!to || !formattedTo) {
      inputError = inputError ?? <Trans>Enter a recipient</Trans>
    } else {
      if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
        inputError = inputError ?? <Trans>Invalid recipient</Trans>
      }
    }


    // if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    //   inputError = <Trans>Insufficient {amountIn.currency.symbol} balance</Trans>
    // }

    return inputError
  }, [account, allowedSlippage, currencies, outCurrency, inCurrency, parsedAmount, to, trade.trade])

  return useMemo(
    () => ({
      parsedAmount,
      inputError,
      trade,
      allowedSlippage,
    }),
    [allowedSlippage, currencies, outCurrency, inCurrency, inputError, parsedAmount, trade]
  )
}




// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfoMarginAlgebra(
  inAmount: CurrencyAmount<Token | NativeCurrency> | undefined,
  outCurrency: Currency | null | undefined,
): {
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: ReactNode
  trade: {
    trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
    state: TradeState
  }
  allowedSlippage: Percent
} {
  const { account } = useWeb3React()
  const inCurrency = inAmount?.currency
  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: inCurrency,
      [Field.OUTPUT]: outCurrency,
    }),
    [inCurrency, outCurrency]
  )

  const { recipient } = useProfessionalState()

  const inputCurrency = currencies[Field.INPUT]
  const outputCurrency = currencies[Field.OUTPUT]
  const recipientLookup = recipient ?? undefined
  const to: string | null = (recipient === null ? account : recipientLookup ?? null) ?? null

  const isExactIn = true
  const parsedAmount = inAmount

  const tradeRaw = useAlgebraClientSideV3Margin(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    parsedAmount,
    (isExactIn ? outputCurrency : inputCurrency) ?? undefined
  )

  const trade = useMemo(() => {
    return {
      trade: cherryPickTrade(tradeRaw.trade),
      state: tradeRaw.state,
    }
  }, [tradeRaw])

  // allowed slippage is either auto slippage, or custom user defined slippage if auto slippage disabled
  const autoSlippageTolerance = useAutoSlippageTolerance(trade.trade)
  const allowedSlippage = useUserSlippageToleranceWithDefault(autoSlippageTolerance)

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    // if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    //   inputError = inputError ?? <Trans>Select a token</Trans>
    // }

    if (!parsedAmount) {
      inputError = inputError ?? <Trans>Enter an amount</Trans>
    }

    const formattedTo = isAddress(to)
    if (!to || !formattedTo) {
      inputError = inputError ?? <Trans>Enter a recipient</Trans>
    } else {
      if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
        inputError = inputError ?? <Trans>Invalid recipient</Trans>
      }
    }


    // if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    //   inputError = <Trans>Insufficient {amountIn.currency.symbol} balance</Trans>
    // }

    return inputError
  }, [account, allowedSlippage, currencies, outCurrency, inCurrency, parsedAmount, to, trade.trade])

  return useMemo(
    () => ({
      parsedAmount,
      inputError,
      trade,
      allowedSlippage,
    }),
    [allowedSlippage, currencies, outCurrency, inCurrency, inputError, parsedAmount, trade]
  )
}





// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfoMarginAlgebraClose(
  outAmount: CurrencyAmount<Token | NativeCurrency> | undefined,
  inCurrency: Currency | null | undefined,
): {
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: ReactNode
  trade: {
    trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
    state: TradeState
  }
  allowedSlippage: Percent
} {
  const { account } = useWeb3React()
  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: inCurrency,
      [Field.OUTPUT]: outAmount?.currency,
    }),
    [inCurrency, outAmount?.currency]
  )

  const { recipient } = useProfessionalState()

  const inputCurrency = currencies[Field.INPUT]
  const outputCurrency = currencies[Field.OUTPUT]
  const recipientLookup = recipient ?? undefined
  const to: string | null = (recipient === null ? account : recipientLookup ?? null) ?? null

  const isExactIn = false
  const parsedAmount = outAmount

  const tradeRaw = useAlgebraClientSideV3Close(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    parsedAmount,
    (isExactIn ? outputCurrency : inputCurrency) ?? undefined
  )

  const trade = useMemo(() => {
    return {
      trade: cherryPickTrade(tradeRaw.trade),
      state: tradeRaw.state,
    }
  }, [tradeRaw])

  // allowed slippage is either auto slippage, or custom user defined slippage if auto slippage disabled
  const autoSlippageTolerance = useAutoSlippageTolerance(trade.trade)
  const allowedSlippage = useUserSlippageToleranceWithDefault(autoSlippageTolerance)

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    // if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    //   inputError = inputError ?? <Trans>Select a token</Trans>
    // }

    if (!parsedAmount) {
      inputError = inputError ?? <Trans>Enter an amount</Trans>
    }

    const formattedTo = isAddress(to)
    if (!to || !formattedTo) {
      inputError = inputError ?? <Trans>Enter a recipient</Trans>
    } else {
      if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
        inputError = inputError ?? <Trans>Invalid recipient</Trans>
      }
    }


    // if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    //   inputError = <Trans>Insufficient {amountIn.currency.symbol} balance</Trans>
    // }

    return inputError
  }, [account, allowedSlippage, currencies, outAmount, inCurrency, parsedAmount, to, trade.trade])

  return useMemo(
    () => ({
      parsedAmount,
      inputError,
      trade,
      allowedSlippage,
    }),
    [allowedSlippage, currencies, outAmount, inCurrency, inputError, parsedAmount, trade]
  )
}
