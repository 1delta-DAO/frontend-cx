import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { loadingOpacityMixin } from 'components/Loader/styled'
import { isSupportedChain } from 'constants/chains'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { darken } from 'polished'
import { ReactNode, useState } from 'react'
import styled, { useTheme } from 'styled-components/macro'
import { ReactComponent as DropDown } from '../../../assets/images/dropdown.svg'
import { ThemedText } from '../../../theme'
import { Input as NumericalInput } from '../../NumericalInput'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { SupportedAssets } from 'types/1delta'
import { PairSearchDropdown, SingleSearchDropdown } from 'components/Dropdown/dropdownPairSearch'
import { ButtonGray } from 'components/Button'
import { UniswapTrade } from 'utils/Types'
import { TOKEN_SVGS } from 'constants/1delta'

const InputPanel = styled.div<{ hideInput?: boolean; redesignFlag: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 10px;
  background-color: ${({ theme, redesignFlag, hideInput }) =>
    redesignFlag
      ? 'transparent'
      : hideInput
        ? 'transparent'
        : theme.darkMode
          ? theme.deprecated_bg2
          : theme.deprecated_bg6};
  border: 1px solid;
  border-color: ${({ theme }) => theme.backgroundInteractive};
  width: 100%;
  transition: height 1s ease;
  will-change: height;
  padding: 1px;
`


const Container = styled.div<{ hideInput: boolean; disabled: boolean; redesignFlag: boolean }>`
  min-height: ${({ redesignFlag }) => redesignFlag && '69px'};
  border-radius: 10px;
  border-top-right-radius: 1px;
  border-top-left-radius: 1px;
  border: 1px solid ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_bg0)};
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_bg1)};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  ${({ theme, hideInput, disabled, redesignFlag }) =>
    !redesignFlag &&
    !disabled &&
    `
    :focus,
    :hover {
      border: 1px solid ${hideInput ? ' transparent' : theme.deprecated_bg3};
    }
  `}
`

const InputRow = styled.div<{ selected: boolean; redesignFlag: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected, redesignFlag }) =>
    redesignFlag ? '0px' : selected ? ' 0.1rem 0.1rem 0.3rem 0.1rem' : '0.1rem 0.1rem 0.1rem 0.5rem'};
`

const LabelRow = styled.div<{ redesignFlag: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.textSecondary : theme.deprecated_text1)};
  font-size: 0.75rem;
  line-height: 1rem;
  padding-bottom: 5px;
  padding-top: 5px;
  padding-right: 5px;

  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.deprecated_text2)};
  }
`

const FiatRow = styled(LabelRow) <{ redesignFlag: boolean }>`
  justify-content: flex-end;
  min-height: ${({ redesignFlag }) => redesignFlag && '32px'};
  padding: ${({ redesignFlag }) => redesignFlag && '8px 0px'};
  height: ${({ redesignFlag }) => !redesignFlag && '24px'};
`

const PairSelect = styled(ButtonGray) <{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
  redesignFlag: boolean
  wideMode: boolean
}>`
  align-items: center;
  background-color: ${({ selected, theme, redesignFlag }) =>
    redesignFlag
      ? selected
        ? theme.stateOverlayPressed
        : theme.accentAction
      : selected
        ? theme.deprecated_bg2
        : theme.deprecated_primary1};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  color: ${({ selected, theme }) => (selected ? theme.deprecated_text1 : theme.deprecated_white)};
  cursor: pointer;
  height: ${({ hideInput, redesignFlag }) => (redesignFlag ? 'unset' : hideInput ? '2.8rem' : '2.4rem')};
  border-radius: 10px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 400;
  width: ${({ wideMode }) => (wideMode ? '160px' : '100%')};
  ${({ wideMode }) => wideMode ? '' : 'max-width: 110px;'}
  padding: ${({ selected }) => selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px'};
  justify-content: space-between;

  &:hover {
    background-color: ${({ theme }) =>
    theme.stateOverlayHover};
  }

  &:active {
    background-color: ${({ selected, theme, redesignFlag }) =>
    redesignFlag
      ? theme.stateOverlayPressed
      : selected
        ? darken(0.05, theme.deprecated_primary1)
        : theme.deprecated_bg3};
  }

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`

const StyledNumericalInput = styled(NumericalInput) <{ $loading: boolean; redesignFlag: boolean }>`
  ${loadingOpacityMixin};
  text-align: left;
  font-size: ${({ redesignFlag }) => redesignFlag && '36px'};
  line-height: ${({ redesignFlag }) => redesignFlag && '44px'};
  font-variant: ${({ redesignFlag }) => redesignFlag && 'small-caps'};
`

const SimpleRow = styled.div`
  height: 32px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const StyledDropDown = styled(DropDown) <{ selected: boolean; redesignFlag: boolean }>`
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

  const { account, chainId } = useChainIdAndAccount()
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const theme = useTheme()
  const chainAllowed = isSupportedChain(chainId)
  const [showCollateral, setShowCollateral] = useState(true)
  const color = 'green'

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest} redesignFlag={redesignFlagEnabled}>
      <SimpleRow>
        <PanelContainer>
          <div style={{ color, fontSize: '14px', marginLeft: '10px' }}>
            {simpleVersion ? isLong ? 'Long' : 'Short' : 'Open'}{trade && `@`}
          </div>
          {trade && pair && (
            <div onClick={() => setShowCollateral(!showCollateral)}>
              {!showCollateral ? <CurrencyValueBox style={{ color }}>
                {trade.executionPrice.toFixed(6)} {pair[0]}/{pair[1]}
              </CurrencyValueBox>
                : <CurrencyValueBox style={{ color }}>
                  {trade.executionPrice.invert().toFixed(6)} {pair[1]}/{pair[0]}
                </CurrencyValueBox>}
            </div>)
          } </PanelContainer>
        {topRightLabel && topRightLabel}
      </SimpleRow>
      <Container hideInput={hideInput} disabled={!chainAllowed} redesignFlag={redesignFlagEnabled}>
        <InputRow
          style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}
          selected={!onPairSelect}
          redesignFlag={redesignFlagEnabled}
        >
          {trade && pair && !simpleVersion && <Image src={TOKEN_SVGS[(showCollateral ? pair[0] : pair[1])]} onClick={() => setShowCollateral(!showCollateral)} />}
          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={(simpleVersion ? (isLong ? trade?.outputAmount.toFixed(4) : trade?.inputAmount.toFixed(4)) : (showCollateral ? trade?.outputAmount.toFixed(4) : trade?.inputAmount.toFixed(4))) ?? '0.0'}
              onUserInput={onUserInput}
              disabled
              $loading={loading}
              redesignFlag={redesignFlagEnabled}
              style={{ marginRight: '5px' }}
            />
          )}
          <PairSelect
            wideMode={!simpleVersion}
            disabled={!chainAllowed}
            visible
            selected
            hideInput={hideInput}
            redesignFlag={redesignFlagEnabled}
            className="open-pair-select-button"
          >
            {simpleVersion ? <SingleSearchDropdown selectedOption={pair} options={pairList} onSelect={onPairSelect} placeholder={placeholder} isLong={isLong} />
              : <PairSearchDropdown selectedOption={pair} options={pairList} onSelect={onPairSelect} placeholder={placeholder} />}
            <StyledDropDown selected redesignFlag={redesignFlagEnabled} />
          </PairSelect>
        </InputRow>
      </Container>
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
  font-size: 14px;
  text-align: left;
  width: 100%;
  margin-right: 10px;
  cursor: pointer;
  font-weight: bold;
`
