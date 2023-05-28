import { BaseButton, ButtonSecondary } from "components/Button";
import Loader from "components/Loader";
import { darken } from "polished";
import { useEffect, useMemo, useState, useCallback } from "react";
import TradingViewWidget from 'react-tradingview-widget';
import styled, { css, useTheme } from "styled-components";
import {
  AaveInterestMode,
  Field,
  PositionSides,
  OneDeltaTradeType,
  SupportedAssets,
  MarginTradeType,
  Asset
} from "types/1delta";
import { TOKEN_SVGS, ZERO_BN, getSupportedAssets, ETHEREUM_CHAINS, POLYGON_CHAINS } from "constants/1delta";
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
import { AAVE_CHAINIDS, AAVE_VIEW_CHAINIDS, COMPOUND_CHAINIDS, COMPOUND_VIEW_CHAINIDS, SupportedChainId, isSupportedChain } from 'constants/chains'
import { BigNumber, ethers } from 'ethers'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { filterSupportedAssets, getAaveTokens, safeGetToken } from 'hooks/1delta/tokens'
import { useGetMarginTraderContract } from 'hooks/1delta/use1DeltaContract'
import JSBI from 'jsbi'
import { useIsMobile } from 'hooks/useIsMobile'
import { fetchAAVEUserReserveDataAsync } from 'state/1delta/aave/fetchAAVEUserData'
import { useToggleWalletModal } from 'state/application/hooks'
import { useAppDispatch } from 'state/hooks'
import { TradeState } from 'state/routing/types'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonConfirmed, ButtonLight, ButtonPrimary } from '../../components/Button'
import { GreyCard } from '../../components/Card'
import { AutoRow } from '../../components/Row'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from '../../components/swap/ConfirmMarginTradeModal'
import { Dots, PageWrapper, SwapCallbackError, SwapWrapper } from '../../components/swap/styleds'
import { ApprovalState } from '../../hooks/useApproveCallback'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import { useStablecoinValue } from '../../hooks/useStablecoinPrice'
import useWrapCallback, { WrapErrorText, WrapType } from '../../hooks/useWrapCallback'
import {
  useProfessionalTradeSelectionState, useSelectedTradeTypeProfessional,
} from '../../state/professionalTradeSelection/hooks'
import { useExpertModeManager, useIsDarkMode } from '../../state/user/hooks'
import { ReactComponent as CloseIcon } from 'assets/images/x.svg'
import { LinkStyledButton, ThemedText } from '../../theme'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeRealizedPriceImpact, warningSeverity } from '../../utils/prices'
import { largerPercentValue } from 'utils/1delta/generalFormatters'
import { calculateAaveRiskChange, useGetAaveRiskParameters } from 'hooks/riskParameters/useAaveParameters'
import { AaveMarginTrader, AaveSweeper, Sweeper } from 'abis/types'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { TransactionType } from 'state/transactions/types'
import { currencyId } from 'utils/currencyId'
import { useTransactionAdder } from 'state/transactions/hooks'
import { MarginTradingButtonText } from 'components/Styles'
import { parseMessage } from 'constants/errors'
import { useDeltaAssetState, useDeltaState, useGetCurrentAccount, useSelectLendingProtocol } from "state/1delta/hooks";
import { useTradeTypeSelector } from "state/professionalTradeSelection/hooks";
import { useDerivedSwapInfoMargin } from "state/professionalTradeSelection/tradeHooks";
import { setTradeType } from "state/professionalTradeSelection/actions";
import { Text } from "rebass";
import PairInput from "components/CurrencyInputPanel/PairInput";
import PositionTable from "./components/MarketTable";
import { useOracleState, usePrices } from "state/oracles/hooks";
import { usePollLendingData } from "hooks/polling/pollData";
import { useSingleInteraction } from "state/marginTradeSelection/hooks";
import { useRiskParameters } from "hooks/professional/riskParameters";
import DecimalSlider from "./components/Slider";
import { useMarginTradeApproval } from "hooks/approval";
import { useBalanceText, useCurrencyAmounts } from "../../hooks/trade";
import { usePrepareAssetData } from "hooks/asset/useAssetData";
import { useGeneralRiskValidation } from "pages/Trading/hooks/riskValidation";
import { useGeneralBalanceValidation } from "pages/Trading/hooks/balanceValidation";
import { generateCalldata } from "utils/calldata/generateCall";
import { SwitchCircle } from "components/Wallet";
import { fetchChainLinkData } from "state/oracles/fetchChainLinkData";
import { fetchAAVEAggregatorDataAsync } from "state/oracles/fetchAaveAggregatorData";
import { fetchUserBalances } from "state/1delta/fetchAssetBalances";
import { ArrowDotted } from "./components/Arrow";
import { getTradingViewSymbol } from "constants/chartMapping";
import { useGetRiskParameters, useRiskChange } from "hooks/riskParameters/useRiskParameters";
import { useDerivedMoneyMarketTradeInfo, useMoneyMarketState, useMoneyMarketActionHandlers } from "state/moneyMarket/hooks";
import GeneralCurrencyInputPanel from "components/CurrencyInputPanel/GeneralInputPanel/GeneralCurrencyInputPanel";
import { useCurrency, useCurrencyWithFallback } from "hooks/Tokens";
import { getTokenAddresses } from "hooks/1delta/addressGetter";
import DepositTypeDropdown, { DepositMode } from "components/Dropdown/depositTypeDropdown";
import { USDC_POLYGON } from "constants/tokens";
import useDebounce from "hooks/useDebounce";
import { UniswapTrade } from "utils/Types";
import PairSearchDropdown from "components/Dropdown/dropdownPairSearch";
import { parseUnits } from "ethers/lib/utils";
import tryParseCurrencyAmount from "lib/utils/tryParseCurrencyAmount";
import { addressesTokens } from "hooks/1delta/addressesTokens";


export const ArrowWrapper = styled.div<{ clickable: boolean; redesignFlag: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 4px;
  border-radius: 7px;
  height: 32px;
  width: 32px;
  position: relative;
  margin-top: 2px;
  margin-bottom: 2px;
  left: calc(50% - 16px);
  /* transform: rotate(90deg); */
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundInteractive : theme.deprecated_bg1)};
  border: 2px solid;
  border-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundSurface : theme.deprecated_bg0)};

  z-index: 0;
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

const Close = styled.div`
  margin-top: 6px;
  padding: 5px;
  color: ${({ theme }) => theme.accentActionSoft};
  transition: 150ms ease-in;
  &:hover {
    color: ${({ theme }) => theme.hoverState};
    cursor: pointer;
  }
`


const ButtonRow = styled.div`
display: flex;
flex-direction: row;
align-items:center;
justify-content: space:between;
margin-bottom: 5px;
`

const Image = styled.img`
width: 25px;
height: 25px;
`

const ModalContainer = styled.div<{ isMobile: boolean }>`
  padding: ${({ isMobile }) => (isMobile ? '1px' : '10px')};
  padding-bottom: 21px;
  width: 100%;
  ${({ isMobile }) => (isMobile ? `
  height: 70%;
  ` : '')}
`


const ConfigPanel = styled.div`
  border: 1px solid;
  border-color: ${({ theme }) => theme.backgroundInteractive};
  background: ${({ theme }) => theme.deprecated_bg0};
  height: 100%;
  width: 20%;
  min-width: 350px;
  min-height: 400px;
  margin: 5px;
  border-radius: 10px;
`

const SwapPanel = styled.div`
  height: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  aign-items: center;
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
  background-color: ${({ theme }) => darken(0.01, theme.deprecated_primary5)}; 
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  min-height: 400px;
`};
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
&:first-child {
  border-top-left-radius: 10px;
  padding-left: 10px;
}
&:last-child {
  border-top-right-radius: 10px;
  padding-right: 10px;
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


const CartAndTableContainer = styled(AutoColumnAdjusted)`
  width: 100%;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  padding: 2px;
`};
`


const Container = styled.div`
  width: 95vw;
  max-width: 2000px;
`

const SliderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding 2px;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  margin-right: 10px;
`
const SliderValue = styled.div`
  width: 40px;
  padding 2px;
  color: ${({ theme }) => (theme.textSecondary)};
  background-color: ${({ theme }) => theme.deprecated_bg1};
  border-radius: 2px;
  padding: 2px;
`

const ContentContainer = styled(Row)`
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
display: flex;
flex-direction: column;
`};
`
const PriceRow = styled.div`
  margin-left: 15px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 150px;
  gap: 10px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 100px;
`};
`

const PriceText = styled.span`
font-size: 20px;
color: ${({ theme }) => (theme.textSecondary)};
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
font-size: 14px;
`};`

const InputPanelContainer = styled.div`
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

interface AssetRowProps {
  asset: SupportedAssets
  onSelect: (a: SupportedAssets) => void
}

const AssetText = styled.span`

`

const AssetRow = ({ asset, onSelect }: AssetRowProps): JSX.Element => {

  return <Row onClick={() => onSelect(asset)}>
    <Image src={TOKEN_SVGS[asset]} key={String(asset)} />
    <AssetText>
      {String(asset)}
    </AssetText>
  </Row>
}

interface DropdownLabelProps {
  asset: SupportedAssets

}


const LabelAssetText = styled.span`
font-size: 12px;
`

const ChartAssetRow = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
`

const DropdownLabel = ({ asset }: DropdownLabelProps): JSX.Element => {

  return <ChartAssetRow >
    <Image src={TOKEN_SVGS[asset]} key={String(asset)} />
    <LabelAssetText>
      {String(asset)}
    </LabelAssetText>
  </ChartAssetRow>
}

enum ProTradeType {
  MarginOpen,
  Liquidate,
  CollateralSwap,
  DebtSwap

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

export default function Professional() {
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const { connectionIsSupported, chainId, account } = useNetworkState()
  const currentProtocol = LendingProtocol.COMPOUND

  const deltaAccount = useGetCurrentAccount(chainId)

  const relevantAccount = currentProtocol === LendingProtocol.COMPOUND ? deltaAccount?.accountAddress : account

  const isDark = useIsDarkMode()

  const [sourceBorrowInterestMode, setSourceBorrowInterestMode] = useState(AaveInterestMode.VARIABLE)

  const [targetBorrowInterestMode, setTargetBorrowInterestMode] = useState(AaveInterestMode.VARIABLE)

  const [currencyIn, selectCurrencyIn] = useState(SupportedAssets.USDC)
  const [currencyOut, selectCurrencyOut] = useState(SupportedAssets.WETH)


  const [pair, selectPair] = useState<[SupportedAssets, SupportedAssets]>([SupportedAssets.WETH, SupportedAssets.USDC])
  const [chartPair, setChartPair] = useState(pair)

  const handleSelectPair = (p: [SupportedAssets, SupportedAssets]) => {
    selectPair(p)
    setChartPair(p)
  }

  const [leverage, setLeverage] = useState(1)

  const assets = useMemo(() => getSupportedAssets(chainId, LendingProtocol.AAVE), [chainId])

  const pairs = useMemo(() => getPairs(assets), [assets])

  const hasNoImplementation = useMemo(() => MAINNET_CHAINS.includes(chainId), [chainId])


  const [hasCompoundView, hasAaveView] = useMemo(() => [COMPOUND_VIEW_CHAINIDS.includes(chainId), AAVE_VIEW_CHAINIDS.includes(chainId)]
    , [chainId])


  const deltaState = useDeltaState()
  const oracleState = useOracleState()

  const [userAccount, userAccountData] = useMemo(() => [
    deltaState?.userMeta?.[chainId]?.selectedAccountData,
    deltaState?.userMeta?.[chainId]?.accounts1Delta
  ],
    [
      chainId,
      deltaState?.userMeta,
      account
    ])

  const compoundLoadingState = useMemo(() => deltaState.loadingState.compound, [deltaState.loadingState.compound])
  const aaveLoadingState = useMemo(() => deltaState.loadingState.aave, [deltaState.loadingState.aave])
  const oracleLoadingState = useMemo(() => oracleState.loadingState, [oracleState.loadingState])

  usePollLendingData(
    account,
    userAccountData,
    deltaState.loadingState,
    deltaState.userMeta,
    chainId,
    connectionIsSupported,
    aaveLoadingState,
    compoundLoadingState,
    hasAaveView,
    currentProtocol,
    oracleLoadingState
  )


  const [repeater, setRepeater] = useState(0)

  useEffect(() => {
    if (account) {
      // if ( && chainId !== SupportedChainId.MAINNET && userAccountData) {
      //   dispatch(fetch1DeltaUserAccountDataAsync({ chainId, account }))
      //   set(false)
      // }

      // if (chainId === SupportedChainId.POLYGON_MUMBAI)
      //   dispatch(
      //     fetchCometReserveDataAsync({
      //       chainId
      //     })
      //   )

      dispatch(
        fetchAAVEUserReserveDataAsync({
          chainId,
          account,
          assetsToQuery: getSupportedAssets(chainId, LendingProtocol.AAVE),
        })
      )
      // if (chainId !== SupportedChainId.MAINNET)
      //   dispatch(
      //     fetchCompoundAccountDataAsync({
      //       chainId,
      //       accounts: convertAccountArray(userAccountData),
      //       assetIds: getSupportedAssets(chainId, LendingProtocol.COMPOUND),
      //     })
      //   )
    }
    // fetch oracle data
    dispatch(fetchChainLinkData({ chainId }))
    dispatch(fetchAAVEAggregatorDataAsync({ chainId }))

    // fetch wallet balances
    if (account) {
      dispatch(fetchUserBalances({ chainId, account, lendingProtocol: currentProtocol }))
    }
    setTimeout(() => setRepeater((prevState) => prevState + 1), 10000)
  }, [repeater, deltaState?.userMeta?.[chainId]?.loaded, chainId])


  const filteredAssets = useMemo(() => {
    return Object.assign(
      {},
      ...getSupportedAssets(chainId, currentProtocol).map((x) => {
        return { [x]: deltaState.assets[x] }
      })
    )
  }, [deltaState, currentProtocol, chainId])

  const restrictedTokenList = useMemo(() => {
    return getAaveTokens(chainId)
  }, [chainId])
  const dispatch = useAppDispatch()

  const isMobile = useIsMobile()
  const selectTradeType = useTradeTypeSelector()

  const [marginTradeType, setMarginTradeType] = useState(MarginTradeType.Open)
  const [side, setSide] = useState(PositionSides.Collateral)
  // const [side, setSide] = useState(PositionSides.Collateral)
  const [proTradeType, setProTradeType] = useState(ProTradeType.MarginOpen)


  const tradeType = useSelectedTradeTypeProfessional()

  const theme = useTheme()

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  const [selectedAsset0, selectedAsset1] = useMemo(() => {
    return [
      safeGetToken(chainId, currencyIn, LendingProtocol.AAVE),
      safeGetToken(chainId, currencyOut, LendingProtocol.AAVE)
    ]
  },
    [
      chainId,
      currencyIn,
      currencyOut
    ])


  const [assetState, switchAssets] = useState<{ assetIn: SupportedAssets; assetOut: SupportedAssets }>({
    assetIn: selectedAsset0.symbol as SupportedAssets,
    assetOut: selectedAsset1.symbol as SupportedAssets,
  })

  const deltaAssets = useDeltaAssetState()

  const { assetIn, assetOut } = useMemo(() => {
    return { assetIn: deltaAssets[currencyIn], assetOut: deltaAssets[currencyOut] }
  }, [currencyIn, currencyOut, deltaAssets[currencyIn], deltaAssets[currencyOut]])

  const currencyAmounts = useCurrencyAmounts(
    chainId,
    account,
    currentProtocol,
    marginTradeType,
    assetIn,
    assetOut,
    selectedAsset0,
    selectedAsset1,
    sourceBorrowInterestMode,
    targetBorrowInterestMode,
    undefined,
    SupportedAssets.USDC,
    false
  )

  const { textTop, textBottom, plusTop, plusBottom, hasSwitchBottom, hasSwitchTop } = useBalanceText(
    currentProtocol,
    tradeType,
    marginTradeType,
    sourceBorrowInterestMode,
    targetBorrowInterestMode
  )

  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: currencyAmounts[Field.INPUT]?.currency,
      [Field.OUTPUT]: currencyAmounts[Field.OUTPUT]?.currency,
    }),
    [currencyAmounts]
  )
  const [selectedCurrencyOutside, setCurrencyOutside] = useState<Currency>(USDC_POLYGON)

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
    if (depositMode == DepositMode.DIRECT && !selectedIsAsset)
      setDepositMode(DepositMode.TO_COLLATERAL)

    if (pair[0] === SupportedAssets.USDC && selectedAsset === SupportedAssets.USDC)
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

  const selectedPrice = usePrices(selectedIsAsset ? [selectedCurrencyOutside.symbol as SupportedAssets] : [], chainId)
  const prices = usePrices([...pair, depositAsset], chainId)

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
    trade: { state: tradeStateIn, trade: tradeIn },
    allowedSlippage: allowedSlippageIn,
    parsedAmount: parsedAmountIn,
    inputError: swapInInputError,
  } = useDerivedMoneyMarketTradeInfo(
    selectedCurrency,
    depositCurrency,
    false
  )
  const tradeInState = depositMode === DepositMode.DIRECT ? TradeState.VALID : tradeStateIn

  const depositDollarValue = useMemo(() => {
    // case direct depo
    if (depositMode === DepositMode.DIRECT && selectedPrice?.[0]) return Number(parsedAmountIn?.toExact()) * selectedPrice[0]
    // case swap to usdc or collateral
    return Number(tradeIn?.outputAmount.toExact()) * prices[2]
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

  const debouncedBorrowAmount = useDebounce(borrowAmount, 400)

  const {
    trade: { state: tradeState, trade },
    allowedSlippage,
    parsedAmount,
    inputError: swapInputError,
  } = useDerivedSwapInfoMargin(
    debouncedBorrowAmount,
    collateralCurrency,
  )

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
    () => [!trade?.swaps, TradeState.LOADING === tradeState, TradeState.SYNCING === tradeState || TradeState.SYNCING === tradeInState],
    [trade, tradeState]
  )

  const fiatValueInput = useStablecoinValue(trade?.inputAmount)
  const fiatValueOutput = useStablecoinValue(trade?.outputAmount)
  const stablecoinPriceImpact = useMemo(
    () => (routeIsSyncing ? undefined : computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)),
    [fiatValueInput, fiatValueOutput, routeIsSyncing]
  )

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

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

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }),
    [dependentField, independentField, currencyAmounts, typedValue, parsedAmounts]
  )

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
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
    marginTradeType,
    marginTraderContract.address,
    allowedSlippage,
    sourceBorrowInterestMode,
    assetIn.id,
    hasNoImplementation
  )

  const maxInputAmount: CurrencyAmount<Currency> | undefined | null = useMemo(
    () => currencyAmounts[Field.INPUT] && maxAmountSpend(currencyAmounts[Field.INPUT]),
    [currencyAmounts]
  )

  const maxOutputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyAmounts[Field.OUTPUT]),
    [currencyAmounts]
  )

  const showMaxButton =
    !maxInput && Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount)) &&
    side === PositionSides.Collateral
  const showMaxButtonOut =
    !maxOutput && Boolean(maxOutputAmount?.greaterThan(0) && !parsedAmounts[Field.OUTPUT]?.equalTo(maxOutputAmount)) &&
    (side === PositionSides.Borrow || marginTradeType === MarginTradeType.Trim)

  const handleSwap = useCallback(async () => {
    if (!trade) {
      return
    }
    if (stablecoinPriceImpact && !confirmPriceImpactWithoutFee(stablecoinPriceImpact)) {
      return
    }

    const { args, method, estimate, call } = generateCalldata(
      currentProtocol,
      marginTradeType,
      account,
      {
        trade,
        allowedSlippage,
        sourceBorrowInterestMode,
        targetBorrowInterestMode,
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

          if (trade)
            addTransaction(
              txResponse,
              trade.tradeType === TradeType.EXACT_INPUT
                ? {
                  protocol: currentProtocol,
                  type: TransactionType.SINGLE_SIDE,
                  subType: side,
                  tradeType: TradeType.EXACT_INPUT,
                  inputCurrencyId: currencyId(trade.inputAmount.currency),
                  inputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                  expectedOutputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                  outputCurrencyId: currencyId(trade.outputAmount.currency),
                  minimumOutputCurrencyAmountRaw: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
                }
                : {
                  protocol: currentProtocol,
                  type: TransactionType.SINGLE_SIDE,
                  subType: side,
                  tradeType: TradeType.EXACT_OUTPUT,
                  inputCurrencyId: currencyId(trade.inputAmount.currency),
                  maximumInputCurrencyAmountRaw: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
                  outputCurrencyId: currencyId(trade.outputAmount.currency),
                  outputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                  expectedInputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                }
            )

          dispatch(
            fetchAAVEUserReserveDataAsync({
              chainId,
              account: account ?? '',
              assetsToQuery: filterSupportedAssets(trade?.inputAmount?.currency, trade?.outputAmount?.currency),
            })
          )
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

  const handleSwitchAssets = useCallback(() => {
    setMaxInput(false)
    setMaxOutput(false)
    return switchAssets({ assetIn: assetState.assetOut, assetOut: assetState.assetIn })
  }, [assetState])

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
    !maxInput && setMaxInput(true)
    maxOutput && setMaxOutput(false)
  }, [maxInputAmount, onUserInput, maxInput, maxOutput])


  const handleMaxOutput = useCallback(() => {
    maxOutputAmount && onUserInput(Field.OUTPUT, maxOutputAmount.toExact())
    !maxOutput && setMaxOutput(true)
    maxInput && setMaxInput(false)
  }, [maxOutputAmount, onUserInput, maxInput, maxOutput])

  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode
  const showPriceImpactWarning = largerPriceImpact && priceImpactSeverity > 3

  const [hasStableRateIn, hasStableRateOut] = useMemo(() => {
    return [
      assetIn?.aaveData[chainId].reserveData?.stableBorrowRateEnabled ?? false,
      assetOut?.aaveData[chainId].reserveData?.stableBorrowRateEnabled ?? false,
    ]
  }, [assetIn, assetOut, chainId])

  useEffect(() => {
    if (!hasStableRateIn) {
      setSourceBorrowInterestMode(AaveInterestMode.VARIABLE)
    }
    if (!hasStableRateOut) {
      setTargetBorrowInterestMode(AaveInterestMode.VARIABLE)
    }
  }, [hasStableRateIn, hasStableRateOut])

  const riskParameters = useGetRiskParameters(chainId, currentProtocol, account)

  const { riskChange, tradeImpact } = useRiskChange(
    assetIn,
    assetOut,
    currentProtocol,
    riskParameters,
    marginTradeType,
    trade,
    sourceBorrowInterestMode,
    targetBorrowInterestMode
  )

  const [riskErrorText, hasRiskError, hf] = useGeneralRiskValidation(riskChange, marginTradeType, isExpertMode)


  const [balanceErrorText, hasBalanceError] = useGeneralBalanceValidation(
    account,
    currencyAmounts,
    parsedAmount,
    marginTradeType,
    trade
  )

  const [validatedSwapText, buttonDisabled,] = useMemo(() => {
    if (hasNoImplementation) return ['Coming Soon!', true]

    if (Boolean(account)) {

      if (balanceErrorText) return [balanceErrorText, true]
      if (swapInputError) return [swapInputError, true]
      if (riskErrorText && hf < 1.05) {
        if (hf >= 1) {
          return [riskErrorText, false]
        }
        // for a critical violation we disable the button
        return [riskErrorText, true]
      }
      if (routeIsSyncing || routeIsLoading) return [<Dots key={'loadingMS'}>Calculating Trade</Dots>, true]

      if (priceImpactSeverity > 2) return ['Swap Anyway', false]

      if (priceImpactTooHigh) return ['Price Impact Too High', true]

      switch (marginTradeType) {
        case MarginTradeType.Trim: {
          return ['Trim Position', false]
        }
        case MarginTradeType.Open: {
          return ['Build Position', false]
        }
        case MarginTradeType.Collateral: {
          return ['Swap Collaterals', false]
        }
        case MarginTradeType.Debt: {
          return ['Swap Debts', false]
        }
      }
    }

    return ['Create a 1delta Account to trade!', true]
  }, [
    routeIsLoading,
    routeIsSyncing,
    priceImpactTooHigh,
    priceImpactSeverity,
    riskErrorText,
    balanceErrorText,
    hf,
  ])


  const { supply, borrow, healthFactor, ltv, collateral, hasBalance } = useRiskParameters(
    chainId,
    oracleState,
    userAccount,
    account,
    currentProtocol,
    deltaState.userState.aaveTotals
  )

  const [collateralValue, typeCollateral] = useState(String(collateral))

  const currentLeverage = useMemo(() => supply / (supply - borrow), [supply, borrow])

  useEffect(() => {
    if (account && collateral > 0) {
      typeCollateral(String(collateral))
      setLeverage(currentLeverage)
    }

  }, [account, collateral > 0])


  const onSliderChange = useCallback(
    (n: number) => {
      setLeverage(n)
      handleTypeInput(String((n * collateral).toFixed(6)))
    }, [collateral])




  const handlePairSwap = useCallback(() => handleSelectPair([pair[1], pair[0]]), [pair])


  const { aprData, assetData, balanceData } = usePrepareAssetData(currentProtocol, chainId, account)


  const [collateralAssets, debtAssets, borrowableAssets] = useMemo(() => {
    if (account)
      return [
        assetData.filter(x => x.hasPosition && assets.includes(x.assetId)).map(x => x.assetId),
        assetData.filter(x => x.hasBorrowPosition && assets.includes(x.assetId)).map(x => x.assetId),
        assetData.filter(x => x.borrowEnabled && assets.includes(x.assetId)).map(x => x.assetId)
      ]
    return [
      assets,
      assets,
      assetData.filter(x => x.borrowEnabled && assets.includes(x.assetId)).map(x => x.assetId)
    ]
  },
    [assetData, assets, account])

  const [selectableAssets, setSelectableAssets] = useState({ assetsIn: assets, assetsOut: assets })

  useEffect(() => {
    setSelectableAssets({
      assetsIn: assets,
      assetsOut: assets
    })
  }, [assets])

  const [appprovalMessagRequest, approvalMessage] = useMemo(() => {
    switch (marginTradeType) {
      case MarginTradeType.Trim: {
        return [
          `Allow withdrawing ${currencies[Field.INPUT]?.symbol}`,
          `You can now withdraw ${currencies[Field.INPUT]?.symbol}`,
        ]
      }
      case MarginTradeType.Open: {
        return [
          `Allow borrowing ${currencies[Field.INPUT]?.symbol}`,
          `You can now borrow ${currencies[Field.INPUT]?.symbol}`
        ]
      }
      case MarginTradeType.Collateral: {
        return [
          `Allow withdrawing ${currencies[Field.INPUT]?.symbol}`,
          `You can now withdraw ${currencies[Field.INPUT]?.symbol}`
        ]
      }
      default: // debt swap
        return [
          `Allow borrowing ${currencies[Field.INPUT]?.symbol}`,
          `You can now borrow ${currencies[Field.INPUT]?.symbol}`
        ]
    }
  },
    [
      currencies,
      marginTradeType
    ]
  )
  const chartPrices = usePrices(chartPair, chainId)

  const tradingViewSymbol = useMemo(() => getTradingViewSymbol(chartPair[0], chartPair[1]), [chartPair])

  return (
    <Container >
      <ConfirmSwapModal
        riskMessage={riskErrorText}
        hasRiskError={hasRiskError}
        healthFactor={hf}
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
          <InputPanelContainer>
            <InputWrapper redesignFlag={redesignFlagEnabled}>
              <GeneralCurrencyInputPanel
                onCurrencySelect={handleCcyInputSelect}
                topLabel={<PanelLabel
                  color='green'
                  text='Pay'
                  options={availableDepoModes}
                  selectedOption={depositMode}
                  onSelect={setDepositMode} />
                }
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
                  handleSwitchAssets()
                  setApprovalSubmitted(false)
                }}
              >
                <ArrowDotted size={20} isUp={false} />
              </ArrowContainer>
            </ArrowWrapper>

            <InputWrapper redesignFlag={redesignFlagEnabled}>
              <PairInput
                onPairSelect={handleSelectPair}
                pairList={pairs}
                placeholder={currencyOut}
                trade={trade}
                isPlus={true}
                providedTokenList={restrictedTokenList}
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={() => null}
                label={
                  independentField === Field.INPUT ? (
                    <>To (at least)</>
                  ) : (
                    <>To</>
                  )
                }
                showMaxButton={showMaxButtonOut}
                onMax={handleMaxOutput}
                hideBalance={false}
                fiatValue={fiatValueOutput ?? undefined}
                priceImpact={stablecoinPriceImpact}
                currency={currencyAmounts[Field.OUTPUT]?.currency}
                pair={pair}
                otherCurrency={null}
                id={'CURRENCY_PAIR_PANEL'}
                loading={independentField === Field.INPUT && routeIsSyncing}
                balanceSignIsPlus={plusBottom}
                topRightLabel={<PairSwap onSwitch={handlePairSwap} />}
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
            <DecimalSlider min={1} max={5} step={0.1} markers={[0, 1, 2, 3, 4, 5]} onChange={setLeverage} value={leverage} />
          </SliderContainer>
          <div style={{ marginTop: '10px', zIndex: 0 }}>
            {swapIsUnsupported ? (
              <ButtonPrimary disabled={true}>
                <ThemedText.DeprecatedMain mb="4px">
                  <Trans>Unsupported Asset</Trans>
                </ThemedText.DeprecatedMain>
              </ButtonPrimary>
            ) : !account ? (
              <ButtonLight onClick={toggleWalletModal} redesignFlag={redesignFlagEnabled}>
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
                              {currencies[Field.INPUT]?.symbol}. You only have to do this once per token.
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
            <PairSearchDropdown
              selectedOption={chartPair}
              options={pairs}
              onSelect={setChartPair}
              placeholder={String(chartPair)}
            />
          </CurrencySelectionRow>

          <ChartContainer>
            <TradingViewWidget
              symbol={tradingViewSymbol}
              theme={isDark ? 'DARK' : 'LIGHT'}
              allow_symbol_change={false}
              autosize={true}
              interval={'30'}
              hide_volume={true}
              style={'2'}
              withdateranges={true}
              save_image={false}
              details={true}
            />
          </ChartContainer>
          <PositionTable
            tradeImpact={tradeImpact}
            isMobile={isMobile}
            assetData={assetData}
          />
        </CartAndTableContainer>
      </ContentContainer>
    </Container>
  )
}


interface LabelProps {
  color: string;
  text: string;
}

interface TopLabelProps extends LabelProps {
  selectedOption: DepositMode
  options: DepositMode[]
  onSelect: (opt: DepositMode) => void
}


const PanelLabel = ({ color, text, selectedOption, onSelect, options }: TopLabelProps) => {
  return <PanelContainer>
    <div style={{ color, fontSize: '14px', marginLeft: '10px' }}>
      {text}
    </div>
    <DepositTypeDropdown selectedOption={selectedOption} onSelect={onSelect} options={options}></DepositTypeDropdown>
  </PanelContainer>
}

const PanelContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`


const SwitchButton = styled(ButtonSecondary)`
  width: 80px;
  height: 32px;
  font-size: 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.accentActiveSoft};
  display: flex;
  font-weight: 200;
  flex-direction: row;
  align-items: space-between;
  justify-content: space-between;
  padding: 5px;
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