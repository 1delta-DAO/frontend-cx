import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { loadingOpacityMixin } from 'components/Loader/styled'
import { isSupportedChain } from 'constants/chains'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { darken } from 'polished'
import { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components/macro'
import { ReactComponent as DropDown } from '../../../assets/images/dropdown.svg'
import { ThemedText } from '../../../theme'
import { Input as NumericalInput } from '../../NumericalInput'
import { RowBetween, RowFixed } from '../../Row'
import { FiatValue } from '../FiatValue'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { SupportedAssets } from 'types/1delta'
import PairSearchDropdown from 'components/Dropdown/dropdownPairSearch'
import { ButtonGray } from 'components/Button'

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
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: ${({ selected, redesignFlag }) =>
    redesignFlag ? (selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px') : '0 8px'};
  gap: ${({ redesignFlag }) => (redesignFlag ? '8px' : '0px')};
  justify-content: space-between;
  margin-left: ${({ hideInput }) => (hideInput ? '0' : '12px')};

  &:hover {
    background-color: ${({ selected, theme, redesignFlag }) =>
    redesignFlag
      ? theme.stateOverlayHover
      : selected
        ? darken(0.05, theme.deprecated_primary1)
        : theme.deprecated_bg3};
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
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;
  margin-left: ${({ redesignFlag }) => redesignFlag && '8px'};

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.deprecated_text1 : theme.deprecated_white)};
    stroke-width: ${({ redesignFlag }) => (redesignFlag ? '2px' : '1.5px')};
  }
`


interface PairInputProps {
  placeholder: SupportedAssets
  pairList: [SupportedAssets, SupportedAssets][]
  onPairSelect: (pair: [SupportedAssets, SupportedAssets]) => void
  providedTokenList: { [address: string]: Token }
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  currency?: Currency | null
  pair?: [SupportedAssets, SupportedAssets]
  hideBalance?: boolean
  providedCurrencyBalance?: CurrencyAmount<Currency> | null
  balanceText?: string
  hideInput?: boolean
  otherCurrency?: Currency | null
  fiatValue?: CurrencyAmount<Token> | null
  priceImpact?: Percent
  id: string
  showCommonBases?: boolean
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
  onPairSelect,
  value,
  onUserInput,
  onMax,
  showMaxButton,
  currency,
  pair,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  priceImpact,
  hideBalance = false,
  providedCurrencyBalance,
  balanceText = 'Balance',
  topLabel = undefined,
  hideInput = false,
  locked = false,
  loading = false,
  isPlus = true,
  balanceSignIsPlus = true,
  topRightLabel = null,
  ...rest
}: PairInputProps) {

  const { account, chainId } = useChainIdAndAccount()
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const selectedCurrencyBalance = providedCurrencyBalance
  const theme = useTheme()

  const chainAllowed = isSupportedChain(chainId)

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest} redesignFlag={redesignFlagEnabled}>
      <SimpleRow>
        {topLabel && topLabel}
        {topRightLabel && topRightLabel}
      </SimpleRow>
      <Container hideInput={hideInput} disabled={!chainAllowed} redesignFlag={redesignFlagEnabled}>

        <InputRow
          style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}
          selected={!onPairSelect}
          redesignFlag={redesignFlagEnabled}
        >
          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={onUserInput}
              disabled={!chainAllowed}
              $loading={loading}
              redesignFlag={redesignFlagEnabled}
              prependSymbol={isPlus ? '+' : '-'}
              style={{ marginRight: '5px' }}
            />
          )}
          <PairSelect
            disabled={!chainAllowed}
            visible={currency !== undefined}
            selected={!!currency}
            hideInput={hideInput}
            redesignFlag={redesignFlagEnabled}
            className="open-pair-select-button"
          >
            <PairSearchDropdown selectedOption={pair} options={pairList} onSelect={onPairSelect} placeholder={placeholder} />
            <StyledDropDown selected={!!currency} redesignFlag={redesignFlagEnabled} />
          </PairSelect>
          {/* </div> */}
        </InputRow>
        {/* {!hideInput && !hideBalance && currency && (
          <FiatRow redesignFlag={redesignFlagEnabled}>
            <RowBetween>
              <LoadingOpacityContainer $loading={loading}>
                <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />
              </LoadingOpacityContainer>
              {account ? (
                <RowFixed style={{ height: '17px' }}>
                  <ThemedText.DeprecatedSmall
                    color={redesignFlag ? theme.textSecondary : theme.deprecated_text3}
                    fontWeight={redesignFlag ? 400 : 500}
                    fontSize={14}
                    style={{ display: 'inline', opacity: 0.5 }}
                  >
                    {!hideBalance && currency && selectedCurrencyBalance ? (
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', fontSize: '12px' }}>
                        {balanceText}: <div style={{ color: balanceSignIsPlus ? 'green' : 'red', marginLeft: '10px' }}>
                          {balanceSignIsPlus ? '+' : '-'}{formatCurrencyAmount(selectedCurrencyBalance, 4)}

                        </div>
                      </div>
                    ) : null}
                  </ThemedText.DeprecatedSmall>
                  {showMaxButton && selectedCurrencyBalance ? (
                    <StyledBalanceMax onClick={onMax} redesignFlag={redesignFlagEnabled}>
                      <Trans>Max</Trans>
                    </StyledBalanceMax>
                  ) : null}
                </RowFixed>
              ) : (
                <span />
              )}
            </RowBetween>
          </FiatRow>
        )} */}
      </Container>
    </InputPanel >
  )
}
