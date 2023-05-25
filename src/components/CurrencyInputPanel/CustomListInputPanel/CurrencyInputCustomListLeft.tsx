import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
import { isSupportedChain } from 'constants/chains'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { darken } from 'polished'
import { ReactNode, useCallback, useState } from 'react'
import styled, { useTheme } from 'styled-components/macro'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { ReactComponent as DropDown } from '../../../assets/images/dropdown.svg'
import { ThemedText } from '../../../theme'
import { ButtonGray } from '../../Button'
import CurrencyLogo from '../../CurrencyLogo'
import { Input as NumericalInput } from '../../NumericalInput'
import { RowBetween, RowFixed } from '../../Row'
import { FiatValue } from '../FiatValue'
import CustomCurrencySearchModal from 'components/SearchModal/CurrencyModalCustomList/CustomCurrencySearchModal'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'

const InputPanel = styled.div<{ hideInput?: boolean; redesignFlag: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  background-color: ${({ theme, redesignFlag, hideInput }) =>
    redesignFlag ? 'transparent' : hideInput ? 'transparent' : theme.deprecated_bg2};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  transition: height 1s ease;
  will-change: height;
`

const FixedContainer = styled.div<{ redesignFlag: boolean }>`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_bg2)};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

const Container = styled.div<{ hideInput: boolean; disabled: boolean; redesignFlag: boolean }>`
  min-height: ${({ redesignFlag }) => redesignFlag && '69px'};
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
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

const CurrencySelect = styled(ButtonGray) <{
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
  border-radius: 16px;
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

const InputRow = styled.div<{ selected: boolean; redesignFlag: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected, redesignFlag }) =>
    redesignFlag ? '0px' : selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 1rem 1rem'};
`

const LabelRow = styled.div<{ redesignFlag: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.textSecondary : theme.deprecated_text1)};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0 1rem 1rem;

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

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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

const StyledTokenName = styled.span<{ active?: boolean; redesignFlag: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '18px' : '18px')};
  font-weight: ${({ redesignFlag }) => (redesignFlag ? '600' : '500')};
`

const StyledBalanceMax = styled.button<{ disabled?: boolean; redesignFlag: boolean }>`
  background-color: transparent;
  background-color: ${({ theme, redesignFlag }) => !redesignFlag && theme.deprecated_primary5};
  border: none;
  text-transform: ${({ redesignFlag }) => !redesignFlag && 'uppercase'};
  border-radius: ${({ redesignFlag }) => !redesignFlag && '12px'};
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentAction : theme.deprecated_primary1)};
  cursor: pointer;
  font-size: ${({ redesignFlag }) => (redesignFlag ? '14px' : '11px')};
  font-weight: ${({ redesignFlag }) => (redesignFlag ? '600' : '500')};
  margin-left: ${({ redesignFlag }) => (redesignFlag ? '0px' : '0.25rem')};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  padding: 4px 6px;
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};

  :hover {
    opacity: ${({ disabled }) => (!disabled ? 0.8 : 0.4)};
  }

  :focus {
    outline: none;
  }
`

const StyledNumericalInput = styled(NumericalInput) <{ $loading: boolean; redesignFlag: boolean }>`
  ${loadingOpacityMixin};
  text-align: right;
  width: 100%;
  font-size: ${({ redesignFlag }) => redesignFlag && '36px'};
  line-height: ${({ redesignFlag }) => redesignFlag && '44px'};
  font-variant: ${({ redesignFlag }) => redesignFlag && 'small-caps'};
`

interface CurrencyInputCustomListProps {
  providedTokenList: { [address: string]: Token }
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  hideBalance?: boolean
  providedCurrencyBalance?: CurrencyAmount<Currency> | null
  balanceText?: string
  pair?: Pair | null
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
}

export default function CurrencyInputCustomListCollateral({
  providedTokenList,
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
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
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  loading = false,
  ...rest
}: CurrencyInputCustomListProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account, chainId } = useChainIdAndAccount()
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const selectedCurrencyBalance = providedCurrencyBalance
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const chainAllowed = isSupportedChain(chainId)

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest} redesignFlag={redesignFlagEnabled}>
      <Container hideInput={hideInput} disabled={!chainAllowed} redesignFlag={redesignFlagEnabled}>
        <InputRow
          style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}
          selected={!onCurrencySelect}
          redesignFlag={redesignFlagEnabled}
        >
          <Aligner>
            <RowFixed>
              {
                <StyledTokenName
                  className="token-symbol-container"
                  active={Boolean(currency && currency.symbol)}
                  redesignFlag={redesignFlagEnabled}
                >
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? currency.symbol.slice(0, 4) +
                    '...' +
                    currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                    : currency?.symbol) || <Trans>Select token</Trans>}
                </StyledTokenName>
              }
              {currency ? <CurrencyLogo style={{ marginRight: '2px' }} currency={currency} size={'24px'} /> : null}
            </RowFixed>
          </Aligner>
          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={onUserInput}
              disabled={!chainAllowed}
              $loading={loading}
              redesignFlag={redesignFlagEnabled}
            />
          )}
        </InputRow>
        {!hideInput && !hideBalance && currency && (
          <FiatRow redesignFlag={redesignFlagEnabled}>
            <RowBetween>
              <LoadingOpacityContainer $loading={loading}>
                <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />
              </LoadingOpacityContainer>
              {account ? (
                <RowFixed style={{ height: '17px' }}>
                  <ThemedText.DeprecatedBody
                    color={redesignFlag ? theme.textSecondary : theme.deprecated_text3}
                    fontWeight={redesignFlag ? 400 : 500}
                    fontSize={14}
                    style={{ display: 'inline' }}
                  >
                    {!hideBalance && currency && selectedCurrencyBalance ? (
                      <Trans>
                        {balanceText}: {formatCurrencyAmount(selectedCurrencyBalance, 4)}
                      </Trans>
                    ) : null}
                  </ThemedText.DeprecatedBody>
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
        )}
      </Container>
      {onCurrencySelect && (
        <CustomCurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          showCurrencyAmount={showCurrencyAmount}
          disableNonToken={disableNonToken}
          providedTokenList={providedTokenList}
        />
      )}
    </InputPanel>
  )
}
