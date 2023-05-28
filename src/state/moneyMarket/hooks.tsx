import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import useAutoSlippageTolerance from 'hooks/useAutoSlippageTolerance'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ParsedQs } from 'qs'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useChainId, useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useSelectedTradeType } from 'state/marginTradeSelection/hooks'
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
import { replaceMoneyMarketState, selectMoneyMarketCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { MoneyMarketState } from './reducer'
import { useBestMoneyMarketTradeBroker } from 'hooks/tradeBroker/moneyMarket/useBestTrade'
import { useClientSideV3MoneyMarket } from 'hooks/tradeAccount/moneyMarket/useClientSideV3Trade'

export function useMoneyMarketState(): AppState['moneyMarket'] {
  return useAppSelector((state) => state.moneyMarket)
}

export function useMoneyMarketActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useAppDispatch()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectMoneyMarketCurrency({
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

export function queryParametersToMoneyMarketState(parsedQs: ParsedQs): MoneyMarketState {
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
export function useDefaultsFromURLSearch(): MoneyMarketState {
  const chainId = useChainId()
  const dispatch = useAppDispatch()
  const parsedQs = useParsedQueryString()

  const parsedMoneyMarketState = useMemo(() => {
    return queryParametersToMoneyMarketState(parsedQs)
  }, [parsedQs])

  useEffect(() => {
    if (!chainId) return
    const inputCurrencyId = parsedMoneyMarketState[Field.INPUT].currencyId ?? undefined
    const outputCurrencyId = parsedMoneyMarketState[Field.OUTPUT].currencyId ?? undefined

    dispatch(
      replaceMoneyMarketState({
        typedValue: parsedMoneyMarketState.typedValue,
        field: parsedMoneyMarketState.independentField,
        inputCurrencyId,
        outputCurrencyId,
        recipient: parsedMoneyMarketState.recipient,
      })
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return parsedMoneyMarketState
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfoClientSideMoneyMarket(
  currencyBalances: MappedCurrencyAmounts,
  isDirect?: boolean
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

  const { independentField, typedValue, recipient } = useMoneyMarketState()

  const inputCurrency = currencies[Field.INPUT]
  const outputCurrency = currencies[Field.OUTPUT]
  const recipientLookup = recipient ?? undefined
  const to: string | null = (recipient === null ? account : recipientLookup ?? null) ?? null

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue]
  )
  const tradeType = useSelectedTradeType()

  const tradeRaw = useClientSideV3MoneyMarket(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    isDirect ? undefined : parsedAmount,
    isDirect ? undefined : ((isExactIn ? outputCurrency : inputCurrency) ?? undefined)
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
export function useDerivedMoneyMarketTradeInfoBroker(
  currencyBalances: MappedCurrencyAmounts,
  isDirect?: boolean
): {
  currencies: { [field in Field]?: Currency | null }
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: ReactNode
  trade: {
    trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
    state: TradeState
  }
  allowedSlippage: Percent
} {
  const { account } = useWeb3React()

  const { independentField, typedValue, recipient } = useMoneyMarketState()

  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: currencyBalances[Field.INPUT]?.currency,
      [Field.OUTPUT]: currencyBalances[Field.OUTPUT]?.currency,
    }),
    [currencyBalances]
  )

  const inputCurrency = currencies[Field.INPUT]
  const outputCurrency = currencies[Field.OUTPUT]

  const to: string | null = (recipient === null ? account : recipient) ?? null

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [inputCurrency ?? undefined, outputCurrency ?? undefined], [inputCurrency, outputCurrency])
  )

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue]
  )

  const trade = useBestMoneyMarketTradeBroker(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    isDirect ? undefined : parsedAmount,
    isDirect ? undefined : (isExactIn ? outputCurrency : inputCurrency) ?? undefined
  )

  // allowed slippage is either auto slippage, or custom user defined slippage if auto slippage disabled
  const autoSlippageTolerance = useAutoSlippageTolerance(trade.trade)
  const allowedSlippage = useUserSlippageToleranceWithDefault(autoSlippageTolerance)

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? <Trans>Select a token</Trans>
    }

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
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
      trade,
      allowedSlippage,
    }),
    [allowedSlippage, currencies, currencyBalances, inputError, parsedAmount, trade]
  )
}



// from the current swap inputs, compute the best trade and return it.
export function useDerivedMoneyMarketTradeInfo(
  inCurrency: Currency | null | undefined,
  outCurrency: Currency | null | undefined,
  isDirect?: boolean
): {
  currencies: { [field in Field]?: Currency | null }
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: ReactNode
  trade: {
    trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
    state: TradeState
  }
  allowedSlippage: Percent
} {
  const { account } = useWeb3React()

  const { typedValue, recipient } = useMoneyMarketState()

  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: inCurrency,
      [Field.OUTPUT]: outCurrency,
    }),
    [inCurrency, outCurrency]
  )

  const inputCurrency = inCurrency
  const outputCurrency = outCurrency

  const to: string | null = (recipient === null ? account : recipient) ?? null

  const isExactIn = true
  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue]
  )

  const trade = useBestMoneyMarketTradeBroker(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    isDirect ? undefined : parsedAmount,
    isDirect ? undefined : (isExactIn ? outputCurrency : inputCurrency) ?? undefined
  )

  // allowed slippage is either auto slippage, or custom user defined slippage if auto slippage disabled
  const autoSlippageTolerance = useAutoSlippageTolerance(trade.trade)
  const allowedSlippage = useUserSlippageToleranceWithDefault(autoSlippageTolerance)

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? <Trans>Select a token</Trans>
    }

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
  }, [account, allowedSlippage, currencies, parsedAmount, to, trade.trade])

  return useMemo(
    () => ({
      currencies,
      parsedAmount,
      inputError,
      trade,
      allowedSlippage,
    }),
    [allowedSlippage, currencies, inputError, parsedAmount, trade]
  )
}

