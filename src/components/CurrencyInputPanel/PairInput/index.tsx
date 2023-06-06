import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { loadingOpacityMixin } from 'components/Loader/styled'
import { isSupportedChain, SupportedChainId } from 'constants/chains'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { darken } from 'polished'
import { ReactNode, useState } from 'react'
import styled, { useTheme } from 'styled-components/macro'
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'
import { Input as NumericalInput } from '../../NumericalInput'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { SupportedAssets } from 'types/1delta'
import { PairSearchDropdown, SingleSearchDropdown } from 'components/Dropdown/dropdownPairSearch'
import { ButtonGray } from 'components/Button'
import { UniswapTrade } from 'utils/Types'
import { TOKEN_SVGS } from 'constants/1delta'
import { InputPanel, InputPanelContainer, InputRow } from '../GeneralInputPanel/GeneralCurrencyInputPanel'
import { usePrices } from 'state/oracles/hooks'
import { formatUSDValuePanel } from 'utils/tableUtils/format'

const PairSelect = styled(ButtonGray) <{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
  wideMode: boolean
}>`
  align-items: center;
  background-color: #1B2127;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  color: ${({ selected, theme }) => (selected ? theme.deprecated_text1 : theme.deprecated_white)};
  cursor: pointer;
  height: ${({ hideInput }) => hideInput ? '2.8rem' : '2.4rem'};
  border-radius: 10px;
  border-top-right-radius: 0px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 400;
  width: ${({ wideMode }) => (wideMode ? '160px' : '120px')};
  ${({ wideMode }) => wideMode ? '' : 'max-width: 110px;'}
  padding: ${({ selected }) => selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px'};
  justify-content: space-between;

  &:hover {
    background-color: ${({ theme }) =>
    theme.stateOverlayHover};
  }

  &:active {
    background-color: ${({ selected, theme }) =>
    selected
      ? darken(0.05, theme.deprecated_primary1)
      : theme.deprecated_bg3};
  }

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`

const StyledNumericalInput = styled(NumericalInput) <{ $loading: boolean; }>`
  ${loadingOpacityMixin};
  text-align: left;
  font-size: 24px;
`

const SimpleRow = styled.div`
  height: 32px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const StyledDropDown = styled.img <{ selected: boolean; }>`
  margin: 0 0.0rem 0 0.0rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.deprecated_text1 : theme.deprecated_white)};
    stroke-width: 2px;
  }
`

const Image = styled.img`
  width: 25px;
  height: 25px;
  cursor: pointer;
`


interface PairInputProps {
  placeholder: SupportedAssets
  trade?: UniswapTrade
  pairList: [SupportedAssets, SupportedAssets][]
  onPairSelect: (pair: [SupportedAssets, SupportedAssets]) => void
  providedTokenList: { [address: string]: Token }
  onUserInput: (value: string) => void
  pair?: [SupportedAssets, SupportedAssets]
  hideBalance?: boolean
  hideInput?: boolean
  fiatValue?: CurrencyAmount<Token> | null
  priceImpact?: Percent
  id: string
  simpleVersion: boolean
  isLong: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  locked?: boolean
  loading?: boolean
  isPlus?: boolean
  topLabel?: any
  topRightLabel?: any
  balanceSignIsPlus?: boolean
}

export default function PairInput({
  placeholder,
  providedTokenList,
  pairList,
  trade,
  onPairSelect,
  onUserInput,
  pair,
  id,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  priceImpact,
  hideBalance = false,
  topLabel = undefined,
  hideInput = false,
  locked = false,
  loading = false,
  isPlus = true,
  balanceSignIsPlus = true,
  topRightLabel = null,
  simpleVersion = false,
  isLong = true,
  ...rest
}: PairInputProps) {

  const { chainId } = useChainIdAndAccount()

  const chainAllowed = isSupportedChain(chainId)
  const [showCollateral, setShowCollateral] = useState(true)
  const color = '#7C8792'
  const price = usePrices(trade ? [trade.outputAmount.currency.symbol as SupportedAssets] : [], SupportedChainId.POLYGON)
  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      <SimpleRow>
        <PanelContainer>
          {simpleVersion && <div style={{ color, fontSize: '14px', marginLeft: '10px' }}>
            {isLong ? 'Long' : 'Short'}{trade && price[0] && ` : ${formatUSDValuePanel(price[0] * Number(trade.outputAmount.toExact()))}`}
          </div>}
          {!simpleVersion && pair && (
            <>
              <div style={{ color, fontSize: '14px', marginLeft: '10px' }}>
                Open{trade && `@`}
              </div>
              {trade && <div onClick={() => setShowCollateral(!showCollateral)}>
                {!showCollateral ? <CurrencyValueBox style={{ color }}>
                  {trade.executionPrice.toFixed(6)} {pair[0]}/{pair[1]}
                </CurrencyValueBox>
                  : <CurrencyValueBox style={{ color }}>
                    {trade.executionPrice.invert().toFixed(6)} {pair[1]}/{pair[0]}
                  </CurrencyValueBox>}
              </div>}
            </>
          )
          } </PanelContainer>
        {topRightLabel && topRightLabel}
      </SimpleRow>
      <InputPanelContainer hideInput={hideInput} disabled={!chainAllowed}>
        <InputRow
          style={hideInput ? { padding: '0', borderRadius: '8px' } : { paddingLeft: '10px' }}
          selected={!onPairSelect}
        >
          {trade && pair && !simpleVersion && <Image src={TOKEN_SVGS[(showCollateral ? pair[0] : pair[1])]} onClick={() => setShowCollateral(!showCollateral)} />}
          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={(simpleVersion ? (isLong ? trade?.outputAmount.toFixed(4) : trade?.inputAmount.toFixed(4)) : (showCollateral ? trade?.outputAmount.toFixed(4) : trade?.inputAmount.toFixed(4))) ?? '0.0'}
              onUserInput={onUserInput}
              disabled
              $loading={loading}
              style={{ marginRight: '5px', color: '#4D5966', fontWeight: 'bold' }}
            />
          )}
          <PairSelect
            wideMode={!simpleVersion}
            disabled={!chainAllowed}
            visible
            selected
            hideInput={hideInput}
            className="open-pair-select-button"
          >
            {simpleVersion ? <SingleSearchDropdown selectedOption={pair} options={pairList} onSelect={onPairSelect} placeholder={placeholder} isLong={isLong} />
              : <PairSearchDropdown selectedOption={pair} options={pairList} onSelect={onPairSelect} placeholder={placeholder} />}
            <DropDown />
          </PairSelect>
        </InputRow>
      </InputPanelContainer>
    </InputPanel >
  )
}

const PanelContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`
const CurrencyValueBox = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 250;
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
  margin-right: 10px;
  cursor: pointer;
  font-weight: bold;
`
