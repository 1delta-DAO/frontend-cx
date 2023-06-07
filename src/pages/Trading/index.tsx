import { BaseButton, ButtonSecondary } from "components/Button";
import Loader from "components/Loader";
import { useEffect, useMemo, useState, useCallback } from "react";
import TradingViewWidget from 'react-tradingview-widget';
import styled, { css, useTheme } from "styled-components";
import {
  AaveInterestMode,
  Field,
  PositionSides,
  SupportedAssets,
  MarginTradeType
} from "types/1delta";
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'
import { getSupportedAssets, ETHEREUM_CHAINS, POLYGON_CHAINS } from "constants/1delta";
import { useNetworkState } from "state/globalNetwork/hooks";
import { LendingProtocol } from "state/1delta/actions";
import { AutoColumn } from "components/Column";
import { ArrowContainer, InputWrapper } from "./components/wrappers";
import { ArrowDown, CheckCircle, HelpCircle } from "react-feather";
import { Trans } from '@lingui/macro'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import PriceImpactWarning from 'components/swap/PriceImpactWarning'
import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown'
import { MouseoverTooltip } from 'components/Tooltip'
import { MAINNET_CHAINS } from 'constants/1delta'
import { SupportedChainId, isSupportedChain } from 'constants/chains'
import { BigNumber } from 'ethers'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { useGetMarginTraderContract } from 'hooks/1delta/use1DeltaContract'
import JSBI from 'jsbi'
import { useIsMobile } from 'hooks/useIsMobile'
import { useToggleWalletModal } from 'state/application/hooks'
import { useAppDispatch } from 'state/hooks'
import { TradeState } from 'state/routing/types'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonConfirmed, ButtonLight, ButtonPrimary } from '../../components/Button'
import { GreyCard } from '../../components/Card'
import { AutoRow, RowFixed } from '../../components/Row'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from '../../components/swap/ConfirmMarginTradeModal'
import { SwapCallbackError } from '../../components/swap/styleds'
import { ApprovalState } from '../../hooks/useApproveCallback'
import { useStablecoinDollarValue } from '../../hooks/useStablecoinPrice'
import { useExpertModeManager, useIsDarkMode } from '../../state/user/hooks'
import { LinkStyledButton, ThemedText } from '../../theme'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeRealizedPriceImpact, warningSeverity } from '../../utils/prices'
import { largerPercentValue } from 'utils/1delta/generalFormatters'
import { AaveMarginTrader, AaveSweeper } from 'abis/types'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { useTransactionAdder } from 'state/transactions/hooks'
import { MarginTradingButtonText } from 'components/Styles'
import { parseMessage } from 'constants/errors'
import { useDeltaState, useGetCurrentAccount } from "state/1delta/hooks";
import { useDerivedSwapInfoMargin, useDerivedSwapInfoMarginAlgebra } from "state/professionalTradeSelection/tradeHooks";
import { Text } from "rebass";
import PairInput from "components/CurrencyInputPanel/PairInput";
import PositionTable from "./components/MarketTable";
import { useOracleState, usePrices } from "state/oracles/hooks";
import { usePollLendingData } from "hooks/polling/pollData";
import DecimalSlider from "./components/Slider";
import { useMarginTradeApproval } from "hooks/approval";
import { usePrepareAssetData } from "hooks/asset/useAssetData";
import { generateCalldata } from "utils/calldata/generateCall";
import { SwitchCircle } from "components/Wallet";
import { fetchChainLinkData } from "state/oracles/fetchChainLinkData";
import { fetchAAVEAggregatorDataAsync } from "state/oracles/fetchAaveAggregatorData";
import { fetchUserBalances } from "state/1delta/fetchAssetBalances";
import { ArrowDotted } from "./components/Arrow";
import { getTradingViewSymbol } from "constants/chartMapping";
import { useDerivedMoneyMarketTradeInfo, useMoneyMarketState, useMoneyMarketActionHandlers } from "state/moneyMarket/hooks";
import GeneralCurrencyInputPanel from "components/CurrencyInputPanel/GeneralInputPanel/GeneralCurrencyInputPanel";
import { useCurrency } from "hooks/Tokens";
import { getTokenAddresses } from "hooks/1delta/addressGetter";
import DepositTypeDropdown, { DepositMode } from "components/Dropdown/depositTypeDropdown";
import { USDC_POLYGON, USDC_POLYGON_ZK_EVM } from "constants/tokens";
import useDebounce from "hooks/useDebounce";
import { PairSearchDropdown } from "components/Dropdown/dropdownPairSearch";
import { parseUnits } from "ethers/lib/utils";
import { addressesTokens } from "hooks/1delta/addressesTokens";
import { calculateCompoundRiskChangeSlot, useGetCompoundRiskParametersSlot } from "hooks/riskParameters/useCompoundParameters";
import { useAlgebraClientSideV3 } from "hooks/professional/algebra/useClientSideV3Trade";
import { UniswapTrade } from "utils/Types";
import SettingsTab from "components/Settings";
import { SlotData } from "./components/MarketTable/PositionRow";

export enum Mode {
  LONG = 'Long',
  SHORT = 'Short',
  EXPERT = 'Expert',
}

const dummyData: SlotData[] = [
  {
    pair: [SupportedAssets.WBTC, SupportedAssets.USDC],
    leverage: 2.0,
    direction: Mode.LONG,
    pnl: 1020,
    healthFactor: 1.1,
    price: 21123.2,
    size: 100,
    rewardApr: 0.12,
    supplyApr: 0.12,
    borrowApr: 0.12,
  },
  {
    pair: [SupportedAssets.USDC, SupportedAssets.ETH],
    leverage: 2.5,
    direction: Mode.SHORT,
    pnl: -23,
    price: 1823.2,
    healthFactor: 1.01,
    size: 1500,
    rewardApr: 0.12,
    supplyApr: 0.12,
    borrowApr: 0.12,
  },
]
export const ArrowWrapper = styled.div<{ clickable: boolean; redesignFlag: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 4px;
  border-radius: 7px;
  height: 32px;
  width: 32px;
  position: relative;
  margin-top: -10px;
  margin-bottom: -10px;
  left: calc(50% - 16px);
  /* transform: rotate(90deg); */
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundInteractive : theme.deprecated_bg1)};
  border: 1px solid;
  border-color: #242B33;

  z-index: 2;
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`

const Row = styled.div`
display: flex;
flex-direction: row;
align-items: flex-start;
justify-content: space-between;
`

const CurrencySelectionRow = styled.div`
  display: flex;
  padding: 2px;
  flex-direction: row;
  align-items: center;
  margin: 0px;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  border: 1px solid;
  border-bottom: none;
  border-color: ${({ theme }) => theme.backgroundInteractive};
  background-color: ${({ theme }) => theme.deprecated_bg0};
`

const SwapPanel = styled.div`
  height: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin: 5px;
  border-radius: 10px;
  min-width: 350px;
  max-width: 350px;
  background: ${({ theme }) => theme.deprecated_bg0};
  border: 1px solid;
  border-color: ${({ theme }) => theme.backgroundInteractive};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 95%;
  max-width: none;
`};
`

const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items:center;
  justify-content: space-between;
  margin-bottom: 5px;
`

export const ButtonLightBoring = styled(BaseButton) <{ redesignFlag?: boolean }>`
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentAction : theme.deprecated_primaryText1)};
  font-size: ${({ redesignFlag }) => (redesignFlag ? '20px' : '16px')};
  font-weight: ${({ redesignFlag }) => (redesignFlag ? '600' : '500')};

  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_primary5)};
      box-shadow: none;
      outline: none;
    }
  }
`

const TypeButton = styled(ButtonLightBoring) <{ selected: boolean }>`
  border-radius: 0px;
  font-size: 14px;
  width: 33%;
  &:first-child {
    border-top-left-radius: 8px;
    padding-left: 10px;
  }
  &:last-child {
    border-top-right-radius: 8px;
    padding-right: 10px;
    width: 34%;
  }
  height: 40px;
  ${({ theme, selected }) =>
    selected ?
      `
    border: 1px solid ${({ theme }) => theme.backgroundInteractive};
    border-bottom: none;
    background-color: ${theme.deprecated_bg0};
    font-weight: bold;
    `: `
    opacity: 0.5;
    background-color: ${theme.deprecated_bg3};
    `
  }
`


export const AutoColumnAdjusted = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
  width: 360px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 95%;
  padding: 2px;
`};
`

const ChartContainer = styled.div`
  margin-bottom: 5px;
  min-height: 500px;
  width: 100%;
  box-sizing:border-box;
  -moz-box-sizing: border-box; 
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  min-height: 400px;
`};
`


const CartAndTableContainer = styled(AutoColumnAdjusted)`
  width: 100%;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  padding: 2px;
`};
`


const Container = styled.div`
  width: 95vw;
  max-width: 1600px;
`

const SliderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 2px;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  margin-right: 10px;
`
const SliderValue = styled.div`
  width: 40px;
  padding: 2px;
  color: ${({ theme }) => (theme.textSecondary)};
  background-color: ${({ theme }) => theme.deprecated_bg1};
  border-radius: 2px;
  margin-left: 10px;
  padding: 2px;
`

const ContentContainer = styled(Row)`
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
display: flex;
flex-direction: column;
`};
`

const InputPanelContainer = styled.div`
  width: 90%;
  margin: 2px;
`

const getPairs = (assets: SupportedAssets[]): [SupportedAssets, SupportedAssets][] => {

  const pairs: [SupportedAssets, SupportedAssets][] = []
  const noAssets = assets.length
  for (let i = 0; i < noAssets; i++) {
    for (let k = 0; k < noAssets; k++) {
      if (assets[i] !== assets[k])
        pairs.push([assets[i], assets[k]])
    }
  }
  return pairs
}



const assetToId = (asset: SupportedAssets, chainId: number, protocol: LendingProtocol) => {
  if (asset === SupportedAssets.ETH && ETHEREUM_CHAINS.includes(chainId))
    return 'ETH'
  else if (asset === SupportedAssets.MATIC && POLYGON_CHAINS.includes(chainId))
    return 'MATIC'
  else {
    try {
      if (MAINNET_CHAINS.includes(chainId))
        return addressesTokens[String(asset)][chainId]
      return getTokenAddresses(chainId, protocol)[String(asset)]
    } catch (err) {
      console.log("failed to get token address:", err)
      return 'ETH'
    }
  }
}

let LAST_VALID_TRADE_IN: UniswapTrade | undefined;
let LAST_VALID_TRADE_MT: UniswapTrade | undefined;

let LAST_VALID_AMOUNT_IN: CurrencyAmount<Currency> | undefined;
let LAST_VALID_AMOUNT_MT: CurrencyAmount<Currency> | undefined;
let LAST_LEVERAGE = 0

export default function Professional() {
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const { connectionIsSupported, chainId, account } = useNetworkState()
  const currentProtocol = LendingProtocol.COMPOUND

  const deltaAccount = useGetCurrentAccount(chainId)

  const relevantAccount = currentProtocol === LendingProtocol.COMPOUND ? deltaAccount?.accountAddress : account

  const isDark = useIsDarkMode()

  const [selectedMode, setSelectedMode] = useState(Mode.LONG)

  const [pair, selectPair] = useState<[SupportedAssets, SupportedAssets]>([SupportedAssets.WETH, SupportedAssets.USDC])
  const [chartPair, setChartPair] = useState(pair)

  const handleSelectPair = (p: [SupportedAssets, SupportedAssets]) => {
    selectPair(p)
    setChartPair(p)
  }

  const [leverage, setLeverage] = useState(1.2)



  const assets = useMemo(() => getSupportedAssets(chainId, LendingProtocol.COMPOUND), [chainId]).map(x => x === SupportedAssets.ETH ? SupportedAssets.WETH : x)

  const pairs = useMemo(() => getPairs(assets), [assets])

  const hasNoImplementation = useMemo(() => MAINNET_CHAINS.includes(chainId), [chainId])


  const deltaState = useDeltaState()
  const oracleState = useOracleState()

  const compoundLoadingState = useMemo(() => deltaState.loadingState.compound, [deltaState.loadingState.compound])
  const aaveLoadingState = useMemo(() => deltaState.loadingState.aave, [deltaState.loadingState.aave])
  const oracleLoadingState = useMemo(() => oracleState.loadingState, [oracleState.loadingState])

  usePollLendingData(
    account,
    undefined,
    deltaState.loadingState,
    deltaState.userMeta,
    chainId,
    connectionIsSupported,
    aaveLoadingState,
    compoundLoadingState,
    false,
    currentProtocol,
    oracleLoadingState
  )


  const [repeater, setRepeater] = useState(0)

  useEffect(() => {
    // fetch oracle data
    dispatch(fetchChainLinkData({ chainId: SupportedChainId.POLYGON }))
    dispatch(fetchAAVEAggregatorDataAsync({ chainId: SupportedChainId.POLYGON }))

    // fetch wallet balances
    if (account) {
      dispatch(fetchUserBalances({ chainId, account, lendingProtocol: currentProtocol }))
    }
    setTimeout(() => setRepeater((prevState) => prevState + 1), 10000)
  }, [repeater, deltaState?.userMeta?.[chainId]?.loaded, chainId])

  const dispatch = useAppDispatch()

  const isMobile = useIsMobile()

  const theme = useTheme()

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()


  const [selectedCurrencyOutside, setCurrencyOutside] = useState<Currency>(USDC_POLYGON_ZK_EVM)

  const selectedIsAsset = assets.filter(a => a.toUpperCase() === selectedCurrencyOutside.symbol)

  const { onCurrencySelection, onUserInput, onChangeRecipient } = useMoneyMarketActionHandlers()

  const handleCcyInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
      setCurrencyOutside(inputCurrency)
    },
    [onCurrencySelection]
  )

  const { typedValue, independentField, recipient } = useMoneyMarketState()

  const [depositMode, setDepositMode] = useState(DepositMode.TO_COLLATERAL)

  const selectedAsset = selectedIsAsset ? selectedCurrencyOutside.symbol as SupportedAssets : undefined

  useEffect(() => {
    if (depositMode === DepositMode.DIRECT && !selectedIsAsset)
      setDepositMode(DepositMode.TO_COLLATERAL)

    if (pair[0] === SupportedAssets.USDC && selectedAsset === SupportedAssets.USDC)
      setDepositMode(DepositMode.DIRECT)

    if (depositMode !== DepositMode.DIRECT && pair[0] === selectedAsset)
      setDepositMode(DepositMode.DIRECT)
  },
    [depositMode, selectedIsAsset, pair]
  )

  const depositAsset = useMemo(() => {
    if (depositMode === DepositMode.DIRECT) {
      if (selectedAsset) return selectedAsset
      else return pair[0]
    } else if (depositMode === DepositMode.TO_USDC) {
      return SupportedAssets.USDC
    } else return pair[0]
  },
    [pair, depositMode]
  )

  // validates selectable deposit modes
  const availableDepoModes = useMemo(() => {
    // deposit = USDC -> don't show to_usdc
    if (selectedAsset === SupportedAssets.USDC) {
      if (pair[0] === SupportedAssets.USDC) {
        // case usdc to usdc
        return [DepositMode.DIRECT]
      } else {
        // case usdc to collateral
        return [DepositMode.TO_COLLATERAL, DepositMode.DIRECT]
      }
    } else {
      if (pair[0] === SupportedAssets.USDC) {
        if (selectedIsAsset)
          return [DepositMode.DIRECT, DepositMode.TO_COLLATERAL]
        else return [DepositMode.TO_COLLATERAL]
      } else {
        if (selectedIsAsset)
          return [DepositMode.DIRECT, DepositMode.TO_COLLATERAL, DepositMode.TO_USDC]
        else return [DepositMode.TO_COLLATERAL, DepositMode.TO_USDC]
      }
    }
  }
    ,
    [selectedAsset, pair]
  )

  const selectedPrice = usePrices(selectedIsAsset ? [selectedCurrencyOutside.symbol as SupportedAssets] : [], SupportedChainId.POLYGON)
  const prices = usePrices([...pair, depositAsset], SupportedChainId.POLYGON)

  const [depositId, collateralId, debtId] = useMemo(() => {
    return [
      assetToId(depositAsset, chainId, currentProtocol),
      assetToId(pair[0], chainId, currentProtocol),
      assetToId(pair[1], chainId, currentProtocol)
    ]
  },
    [depositAsset, pair, chainId, currentProtocol, depositMode]
  )

  const selectedCurrency = selectedCurrencyOutside // useCurrency(selectedCurrencyOutside, currentProtocol)
  const collateralCurrency = useCurrency(collateralId, currentProtocol)
  const depositCurrency = useCurrency(depositId, currentProtocol)
  const debtCurrency = useCurrency(debtId, currentProtocol)

  const {
    trade: { state: tradeStateInUni, trade: tradeInUni },
    allowedSlippage: allowedSlippageIn,
    parsedAmount: parsedAmountIn,
    inputError: swapInInputError,
  } = useDerivedMoneyMarketTradeInfo(
    selectedCurrency,
    depositCurrency,
    false
  )

  const { state: agebraStateIn, trade: algebraTradeIn } = useAlgebraClientSideV3(
    TradeType.EXACT_INPUT,
    parsedAmountIn,
    depositCurrency,
  )

  const tradeIn = useMemo(() => {

    const currTrade = tradeInUni ?? algebraTradeIn
    if (!currTrade) {
      if (LAST_VALID_AMOUNT_IN && parsedAmountIn && LAST_VALID_AMOUNT_IN.toExact() === parsedAmountIn?.toExact())
        return LAST_VALID_TRADE_IN
      else return undefined
    } else {
      LAST_VALID_TRADE_IN = currTrade
      LAST_VALID_AMOUNT_IN = parsedAmountIn
      return currTrade
    }
  }, [tradeInUni, algebraTradeIn, parsedAmountIn])


  const depositDollarValue = useMemo(() => {
    // case direct depo
    if (depositMode === DepositMode.DIRECT) return Number(parsedAmountIn?.toExact()) * (selectedPrice?.[0] ? selectedPrice[0] : 1)
    // case swap to usdc or collateral
    return Number(tradeIn?.outputAmount.toExact()) * (prices?.[2] ? prices[2] : 1)
  },
    [parsedAmountIn, Boolean(tradeIn?.outputAmount), depositMode, Boolean(prices[2]), Boolean(selectedPrice?.[0]), pair]
  )
  const borrowAmount = useMemo(() => {
    if (!debtCurrency || !prices[1]) return undefined
    try {
      const stringValue = String(depositDollarValue / prices[1] * leverage)
      const finalVal = stringValue.substring(0, stringValue.indexOf('.') + debtCurrency.decimals + 1)
      const numberValue = parseUnits(finalVal, String(debtCurrency.decimals))
      return CurrencyAmount.fromRawAmount(debtCurrency, numberValue.toString())
    }
    catch (e) {
      console.log("Error determining borrow amount:", e)
      return undefined
    }
  },
    [typedValue, debtCurrency, leverage, depositDollarValue, Boolean(tradeIn), parsedAmountIn, pair, Boolean(prices[0])]
  )

  const debouncedBorrowAmount = useDebounce(borrowAmount, 200)


  const {
    trade: { state: tradeStateUni, trade: tradeUni },
    allowedSlippage: allowedSlippageUni,
    parsedAmount: parsedAmountUni,
    inputError: swapInputErrorUni,
  } = useDerivedSwapInfoMargin(
    debouncedBorrowAmount,
    collateralCurrency,
  )

  const {
    trade: { state: tradeStateAlgebra, trade: tradeAlgebra },
    allowedSlippage,
    parsedAmount: parsedAmountAlgebra,
    inputError: swapInputErrorAlgebra,
  } = useDerivedSwapInfoMarginAlgebra(
    borrowAmount,
    collateralCurrency,
  )

  const [tradeState, tradeStateIn] = Boolean(tradeUni) ?
    [tradeStateUni,
      depositMode === DepositMode.DIRECT ? TradeState.VALID : tradeStateInUni
    ] : [
      tradeStateAlgebra,
      depositMode === DepositMode.DIRECT ? TradeState.VALID : agebraStateIn]

  const [parsedAmount, trade] = useMemo(() => {

    const currTrade = tradeUni ?? tradeAlgebra
    const isUni = Boolean(tradeUni)
    const parsedAmount = isUni ? parsedAmountUni : parsedAmountAlgebra
    if (!currTrade) {
      if (LAST_LEVERAGE !== leverage) return [parsedAmount, undefined]
      if (LAST_VALID_TRADE_MT && LAST_VALID_AMOUNT_IN && parsedAmount && LAST_VALID_AMOUNT_IN?.toFixed() === parsedAmountIn?.toFixed() && LAST_LEVERAGE === leverage)
        return [parsedAmount, LAST_VALID_TRADE_MT]
      else return [parsedAmount, undefined]
    } else {
      LAST_VALID_TRADE_MT = currTrade
      LAST_LEVERAGE = leverage
      LAST_VALID_AMOUNT_IN = parsedAmountIn
      LAST_VALID_AMOUNT_MT = parsedAmount
      return [parsedAmount, currTrade]
    }
  }, [tradeUni, tradeAlgebra, parsedAmountIn, leverage])


  // const [trade, parsedAmount] = Boolean(tradeUni) ? [tradeUni, parsedAmountUni] : [tradeAlgebra, parsedAmountAlgebra]

  const riskParams = useGetCompoundRiskParametersSlot(chainId, oracleState.data[chainId].chainLink)

  const riksParamsChange = useMemo(() => {

    if (!borrowAmount) {
      return undefined

    }

    return calculateCompoundRiskChangeSlot(
      {
        asset: depositAsset,
        delta: depositMode === DepositMode.DIRECT ? BigNumber.from(parsedAmountIn?.quotient.toString()) : BigNumber.from(tradeIn?.outputAmount?.quotient.toString() ?? '0'),
        side: PositionSides.Collateral
      },
      {
        asset: pair[0],
        delta: BigNumber.from(trade?.outputAmount.quotient.toString() ?? '0'),
        side: PositionSides.Collateral
      },
      {
        asset: pair[1],
        delta: BigNumber.from(borrowAmount.quotient.toString()),
        side: PositionSides.Borrow
      },
      riskParams
    )
  },
    [borrowAmount, depositAsset, trade, tradeIn, pair, depositMode, parsedAmountIn, riskParams])

  // console.log("RISK", riksParamsChange)
  const recipientAddress = recipient

  const parsedAmounts = useMemo(
    () => {
      return {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    }
    ,
    [independentField, parsedAmount, trade]
  )

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [
      !trade?.swaps,
      TradeState.LOADING === tradeState || TradeState.LOADING === tradeStateIn,
      TradeState.SYNCING === tradeState || TradeState.SYNCING === tradeStateIn],
    [trade, tradeState]
  )

  const fiatValueInput = useStablecoinDollarValue(trade?.inputAmount)
  const fiatValueOutput = useStablecoinDollarValue(trade?.outputAmount)

  // console.log("FV", fiatValueInput?.toExact(), fiatValueOutput?.toExact())

  const stablecoinPriceImpact = useMemo(
    () => (routeIsSyncing ? undefined : computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)),
    [fiatValueInput, fiatValueOutput, routeIsSyncing]
  )

  const [maxInput, setMaxInput] = useState(false)
  const [maxOutput, setMaxOutput] = useState(false)

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
      maxInput && setMaxInput(false)
      maxOutput && setMaxOutput(false)
    },
    [onUserInput, maxInput, maxOutput]
  )

  const addTransaction = useTransactionAdder()

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade<Currency, Currency, TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })


  const userHasSpecifiedInputOutput = Boolean(
    parsedAmountIn && parsedAmountIn?.greaterThan(JSBI.BigInt(0))
  )
  const marginTraderContract = useGetMarginTraderContract(chainId, relevantAccount)

  const {
    approvalStateOfConcern,
    handleApprove,
    setApprovalSubmitted,
    showApproveFlow,
    approvalPending,
    approvalSubmitted,
    approveTokenButtonDisabled,
  } = useMarginTradeApproval(
    currentProtocol,
    relevantAccount,
    trade,
    MarginTradeType.Open,
    marginTraderContract.address,
    allowedSlippage,
    AaveInterestMode.NONE,
    selectedAsset,
    hasNoImplementation
  )

  const maxInputAmount: CurrencyAmount<Currency> | undefined | null = useMemo(
    () => parsedAmountIn && maxAmountSpend(parsedAmountIn),
    [parsedAmountIn]
  )

  const showMaxButton =
    !maxInput && Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  const handleSwap = useCallback(async () => {
    if (!trade) {
      return
    }
    if (stablecoinPriceImpact && !confirmPriceImpactWithoutFee(stablecoinPriceImpact)) {
      return
    }

    const { args, method, estimate, call } = generateCalldata(
      currentProtocol,
      MarginTradeType.Open,
      account,
      {
        trade,
        allowedSlippage,
        sourceBorrowInterestMode: AaveInterestMode.NONE,
        targetBorrowInterestMode: AaveInterestMode.NONE,
        isMaxIn: maxInput,
        isMaxOut: maxOutput,
        marginTraderContract: marginTraderContract as AaveMarginTrader & AaveSweeper,
        parsedAmount,
        inIsETH: false,
        outIsETH: false,
        walletIsETH: false
      }
    )


    // estimate gas 
    let gasEstimate: any = undefined
    try {
      gasEstimate = await estimate()
    } catch (error) {
      setSwapState({
        attemptingTxn: false,
        tradeToConfirm,
        showConfirm,
        swapErrorMessage: error.message,
        txHash: undefined,
      })
    }
    const opts = gasEstimate ? { gasLimit: calculateGasMargin(gasEstimate) } : {}

    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    if (call)
      await call(opts)
        .then((txResponse) => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: txResponse.hash,
          })

          // if (trade)
          //   addTransaction(
          //     txResponse,
          //     trade.tradeType === TradeType.EXACT_INPUT
          //       ? {
          //         protocol: currentProtocol,
          //         type: TransactionType.SINGLE_SIDE,
          //         subType: side,
          //         tradeType: TradeType.EXACT_INPUT,
          //         inputCurrencyId: currencyId(trade.inputAmount.currency),
          //         inputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
          //         expectedOutputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
          //         outputCurrencyId: currencyId(trade.outputAmount.currency),
          //         minimumOutputCurrencyAmountRaw: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
          //       }
          //       : {
          //         protocol: currentProtocol,
          //         type: TransactionType.SINGLE_SIDE,
          //         subType: side,
          //         tradeType: TradeType.EXACT_OUTPUT,
          //         inputCurrencyId: currencyId(trade.inputAmount.currency),
          //         maximumInputCurrencyAmountRaw: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
          //         outputCurrencyId: currencyId(trade.outputAmount.currency),
          //         outputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
          //         expectedInputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
          //       }
          //   )
        })
        .catch((error) => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            // rejection in the wallet has a different nesting
            swapErrorMessage: parseMessage(error),
            txHash: undefined,
          })
        })
  }, [
    stablecoinPriceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade?.inputAmount?.currency?.symbol,
    trade?.outputAmount?.currency?.symbol,
  ])


  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on the greater of fiat value price impact and execution price impact
  const { priceImpactSeverity, largerPriceImpact } = useMemo(() => {
    const marketPriceImpact = trade?.priceImpact ? computeRealizedPriceImpact(trade) : undefined
    const largerPriceImpact = largerPercentValue(marketPriceImpact, stablecoinPriceImpact)
    return { priceImpactSeverity: warningSeverity(largerPriceImpact), largerPriceImpact }
  }, [stablecoinPriceImpact, trade])

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])


  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
    !maxInput && setMaxInput(true)
    maxOutput && setMaxOutput(false)
  }, [maxInputAmount, onUserInput, maxInput, maxOutput])


  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode
  const showPriceImpactWarning = largerPriceImpact && priceImpactSeverity > 3

  const [validatedSwapText, buttonDisabled,] = useMemo(() => {
    if (hasNoImplementation) return ['Coming Soon!', true]

    if (Boolean(account)) {
      return ['Coming Soon!', true]
    }

    return ['Connect', true]
  }, [
    routeIsLoading,
    routeIsSyncing,
    priceImpactTooHigh,
    priceImpactSeverity
  ])

  const handlePairSwap = useCallback(() => handleSelectPair([pair[1], pair[0]]), [pair])


  const { aprData, assetData, balanceData } = usePrepareAssetData(currentProtocol, chainId, account)


  const [appprovalMessagRequest, approvalMessage] = useMemo(() => {

    return [
      `Allow depositing ${parsedAmountIn?.currency.symbol}`,
      `You can now deposit ${parsedAmountIn?.currency.symbol}`,
    ]
  },
    [
      parsedAmountIn
    ]
  )
  const chartPrices = usePrices(chartPair, chainId)

  const tradingViewSymbol = useMemo(() => getTradingViewSymbol(chartPair[0], chartPair[1]), [chartPair])

  return (
    <Container >
      <ConfirmSwapModal
        riskMessage={"riskErrorText"}
        hasRiskError={false}
        healthFactor={1}
        isOpen={showConfirm}
        trade={trade}
        originalTrade={tradeToConfirm}
        onAcceptChanges={handleAcceptChanges}
        attemptingTxn={attemptingTxn}
        txHash={txHash}
        recipient={recipient}
        allowedSlippage={allowedSlippage}
        onConfirm={handleSwap}
        swapErrorMessage={swapErrorMessage}
        onDismiss={handleConfirmDismiss}
        fiatValueInput={fiatValueInput}
        fiatValueOutput={fiatValueOutput}
      />
      <ContentContainer>
        <SwapPanel>
          <ButtonRow>
            <TypeButton
              onClick={() => {
                setSelectedMode(Mode.LONG)
                handleSelectPair([pair[1], pair[0]])
              }}
              selected={selectedMode === Mode.LONG}
            >
              Long
            </TypeButton>
            <TypeButton
              onClick={() => {
                setSelectedMode(Mode.SHORT)
                handleSelectPair([pair[1], pair[0]])
              }}
              selected={selectedMode === Mode.SHORT}
            >
              Short
            </TypeButton>
            <TypeButton
              onClick={() => setSelectedMode(Mode.EXPERT)}
              selected={selectedMode === Mode.EXPERT}
            >
              Expert
            </TypeButton>
          </ButtonRow>
          <InputPanelContainer>
            <RowFixed style={{ width: '100%', zIndex: 5, paddingRight: '5px' }}>
              <PanelLabel
                options={availableDepoModes}
                selectedOption={depositMode}
                onSelect={setDepositMode}
              />
              <SettingsTab placeholderSlippage={allowedSlippage} />
            </RowFixed>
            <InputWrapper redesignFlag={redesignFlagEnabled}>
              <GeneralCurrencyInputPanel
                onCurrencySelect={handleCcyInputSelect}
                value={typedValue}
                showMaxButton={showMaxButton}
                currency={selectedCurrency}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                fiatValue={fiatValueInput ?? undefined}
                otherCurrency={null}
                showCommonBases={true}
                id={'CURRENCY_INPUT_PANEL'}
                loading={independentField === Field.OUTPUT && routeIsSyncing}
                topRightLabel={undefined}
              />
            </InputWrapper>
            <ArrowWrapper clickable={isSupportedChain(chainId)} redesignFlag={redesignFlagEnabled}>
              <ArrowContainer
                onClick={() => {
                  setApprovalSubmitted(false)
                }}
              >
                <ArrowDotted size={20} isUp={false} />
              </ArrowContainer>
            </ArrowWrapper>

            <InputWrapper redesignFlag={redesignFlagEnabled}>
              <PairInput
                isLong={selectedMode === Mode.LONG}
                simpleVersion={selectedMode !== Mode.EXPERT}
                onPairSelect={handleSelectPair}
                pairList={pairs}
                placeholder={SupportedAssets.USDC}
                trade={trade}
                isPlus={true}
                providedTokenList={{}}
                onUserInput={() => null}
                hideBalance={false}
                fiatValue={fiatValueOutput ?? undefined}
                priceImpact={stablecoinPriceImpact}
                pair={pair}
                id={'CURRENCY_PAIR_PANEL'}
                loading={independentField === Field.INPUT && routeIsSyncing}
                topRightLabel={selectedMode === Mode.EXPERT ? <PairSwap onSwitch={handlePairSwap} /> : null}
              />
            </InputWrapper>
          </InputPanelContainer>
          {recipient !== null ? (
            <>
              <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable={false} redesignFlag={redesignFlagEnabled}>
                  <ArrowDown size="16" color={theme.deprecated_text2} />
                </ArrowWrapper>
                <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                  <Trans>- Remove recipient</Trans>
                </LinkStyledButton>
              </AutoRow>
              <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
            </>
          ) : null}
          <SliderContainer >
            <SliderValue>
              {leverage}x
            </SliderValue>
            <DecimalSlider min={1.2} max={5} step={0.1} markers={[0, 1, 2, 3, 4, 5]} onChange={setLeverage} value={leverage} />
          </SliderContainer>
          <div style={{ marginTop: '10px', zIndex: 0, width: '80%' }}>
            {!account ? (
              <ButtonLight onClick={toggleWalletModal} style={{ height: '40px' }}>
                <Trans>Connect Wallet</Trans>
              </ButtonLight>
            ) : routeNotFound && userHasSpecifiedInputOutput && !routeIsLoading && !routeIsSyncing ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <ThemedText.DeprecatedMain mb="4px">
                  <Trans>Insufficient liquidity for this trade.</Trans>
                </ThemedText.DeprecatedMain>
              </GreyCard>
            ) : showApproveFlow ? (
              <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }} gap={'5px'}>
                <AutoColumn style={{ width: '100%', zIndex: 0 }} gap="12px">
                  <ButtonConfirmed
                    onClick={handleApprove}
                    disabled={approveTokenButtonDisabled}
                    width="100%"
                    altDisabledStyle={approvalStateOfConcern === ApprovalState.PENDING} // show solid button while waiting
                    confirmed={
                      approvalStateOfConcern === ApprovalState.APPROVED
                    }
                  >
                    <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }} height="20px">
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {approvalStateOfConcern === ApprovalState.APPROVED ? (
                          <MarginTradingButtonText>
                            {approvalMessage}
                          </MarginTradingButtonText>
                        ) : (
                          <MarginTradingButtonText>
                            {appprovalMessagRequest}
                          </MarginTradingButtonText>
                        )}
                      </span>
                      {approvalPending || approvalStateOfConcern === ApprovalState.PENDING ? (
                        <Loader stroke={theme.white} />
                      ) : (approvalSubmitted && approvalStateOfConcern === ApprovalState.APPROVED) ? (
                        <CheckCircle size="20" color={theme.deprecated_green1} />
                      ) : (
                        <MouseoverTooltip
                          text={
                            <Trans>
                              You must give the 1delta smart contracts permission to use your{' '}
                              {parsedAmountIn?.currency.symbol}. You only have to do this once per token.
                            </Trans>
                          }
                        >
                          <HelpCircle size="20" color={theme.deprecated_white} style={{ marginLeft: '8px' }} />
                        </MouseoverTooltip>
                      )}
                    </AutoRow>
                  </ButtonConfirmed>
                  <ButtonPrimary
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        })
                      }
                    }}
                    width="100%"
                    id="swap-button"
                    disabled={
                      routeIsSyncing ||
                      routeIsLoading ||
                      (approvalStateOfConcern !== ApprovalState.APPROVED) ||
                      buttonDisabled
                    }
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {validatedSwapText}
                    </Text>
                  </ButtonPrimary>
                </AutoColumn>
              </AutoRow>
            ) : (
              <ButtonPrimary
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    })
                  }
                }}
                id="swap-button"
                disabled={
                  routeIsSyncing || routeIsLoading ||
                  buttonDisabled
                }
              >
                <Text fontSize={16} fontWeight={500}>
                  {validatedSwapText}
                </Text>
              </ButtonPrimary>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          </div>
          {userHasSpecifiedInputOutput && (trade || routeIsLoading || routeIsSyncing) && (
            <SwapDetailsDropdown
              trade={trade}
              syncing={routeIsSyncing}
              loading={routeIsLoading}
              showInverted={showInverted}
              setShowInverted={setShowInverted}
              allowedSlippage={allowedSlippage}
            />
          )}
          {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />}
        </SwapPanel>
        <CartAndTableContainer >
          <CurrencySelectionRow>
            <PairSelectContainer>
              <PairSearchDropdown
                selectedOption={chartPair}
                options={pairs}
                onSelect={setChartPair}
                placeholder={String(chartPair)}
              />
              <StyledDropDown />
            </PairSelectContainer>
          </CurrencySelectionRow>

          <ChartContainer>
            <TradingViewWidget
              symbol={tradingViewSymbol}
              theme={isDark ? 'DARK' : 'LIGHT'}
              allow_symbol_change={false}
              autosize={true}
              interval={'30'}
              hide_volume={true}
              style={'10'}
              withdateranges={true}
              save_image={false}
              backgroundColor={'#000000'}
              toolbar_bg={'#000000'}
            />
          </ChartContainer>
          <PositionTable
            tradeImpact={{}}
            isMobile={isMobile}
            assetData={account ? dummyData : []}
          />
        </CartAndTableContainer>
      </ContentContainer>
    </Container>
  )
}

interface TopLabelProps {
  selectedOption: DepositMode
  options: DepositMode[]
  onSelect: (opt: DepositMode) => void
}


const PanelLabel = ({ selectedOption, onSelect, options }: TopLabelProps) => {
  return <PanelContainer>
    <DepositTypeDropdown selectedOption={selectedOption} onSelect={onSelect} options={options}></DepositTypeDropdown>
  </PanelContainer>
}

const PanelContainer = styled.div`
  width: 100%;
  margin: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  z-index: 5;
`
const StyledDropDown = styled(DropDown)`
  margin-right: 5px;;
  height: 35%;
`

const PairSelectContainer = styled.div`
  width: 180px;
  padding: 3px;
  margin: 5px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  background: ${({ theme }) => theme.deprecated_bg2};
  align-items: center;
  justify-content: space-between;
`


const SwitchButton = styled(ButtonSecondary)`
  width: 80px;
  height: 28px;
  font-size: 10px;
  font-weight: 250;
  border-radius: 10px;
  display: flex;
  font-weight: 200;
  flex-direction: row;
  align-items: space-between;
  justify-content: space-between;
  color: ${({ theme }) => theme.textSecondary};
  background: ${({ theme }) => theme.deprecated_bg3};
  opacity: 0.7;
  border: none;
  padding: 5px;
  margin: 2px;
  &:hover{
    opacity: 0.4;
    border: none;
  }
`

interface PairSwitchProps {
  onSwitch: () => void;
}


const PairSwap = ({ onSwitch }: PairSwitchProps) => {
  return <SwitchButton onClick={onSwitch}>
    Invert Pair
    <SwitchCircle size={13} />
  </SwitchButton>
}