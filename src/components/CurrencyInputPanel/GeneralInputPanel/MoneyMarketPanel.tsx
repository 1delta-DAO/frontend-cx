import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
import { isSupportedChain } from 'constants/chains'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { ReactNode, useCallback, useState } from 'react'
import styled, { useTheme } from 'styled-components/macro'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { ReactComponent as DropDown } from '../../../assets/images/dropdown.svg'
import { useCurrencyBalance } from '../../../state/connection/hooks'
import { ThemedText } from '../../../theme'
import { ButtonGray } from '../../Button'
import CurrencyLogo from '../../CurrencyLogo'
import { Input as NumericalInput } from '../../NumericalInput'
import { RowBetween, RowFixed } from '../../Row'
import { FiatValue } from '../FiatValue'
import GeneralCurrencySearchModal from 'components/SearchModal/GeneralCurrencySearchModal/GeneralCurrencySearchModal'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import WalletIcon from 'components/Wallet'

const InputPanel = styled.div<{ hideInput?: boolean; redesignFlag: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  background-color: ${({ theme, redesignFlag, hideInput }) =>
    redesignFlag ? 'transparent' : hideInput ? 'transparent' : theme.deprecated_bg2};
  z-index: 1;
  width: 100%;
  transition: height 1s ease;
  will-change: height;
`

const Container = styled.div<{ hideInput: boolean; disabled: boolean; redesignFlag: boolean }>`
  min-height: ${({ redesignFlag }) => redesignFlag && '69px'};
  border-radius: ${({ hideInput }) => (hideInput ? '5px' : '7px')};
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
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  color: ${({ theme }) => theme.deprecated_text1};
  cursor: pointer;
  height: ${({ hideInput, redesignFlag }) => (redesignFlag ? 'unset' : hideInput ? '2.8rem' : '2.4rem')};
  border-radius: 16px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 400;
  width: initial;
  gap: ${({ redesignFlag }) => (redesignFlag ? '8px' : '0px')};
  justify-content: space-between;
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  margin-left: -14px;
  background: none;
  &:hover {
    cursor: pointer;
    background: none;
  }
  &:active {
    background: none;
  }
`

const InputRow = styled.div<{ selected: boolean; redesignFlag: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
  padding: 0px;

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
  font-size:  16px;
  color: ${({ theme }) => theme.deprecated_text1};
  opacity: 0.5;
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
  padding: 2px 6px;
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
  font-size: ${({ redesignFlag }) => redesignFlag && '36px'};
  line-height: ${({ redesignFlag }) => redesignFlag && '44px'};
  font-variant: ${({ redesignFlag }) => redesignFlag && 'small-caps'};
`


const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

interface MoneyMarketPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  hideBalance?: boolean
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
  isWallet?: boolean
  isPlus?: boolean
  balanceSignIsPlus?: boolean
}

export default function MoneyMarketPanel({
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
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  loading = false,
  isWallet = false,
  isPlus = true,
  balanceSignIsPlus = true,
  ...rest
}: MoneyMarketPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account, chainId } = useChainIdAndAccount()
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
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
          <CurrencySelect
            disabled={!chainAllowed}
            visible={currency !== undefined}
            selected={!!currency}
            hideInput={hideInput}
            redesignFlag={redesignFlagEnabled}
            className="open-currency-select-button"
            onClick={() => {
              if (onCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner style={{ marginLeft: '0px' }}>
              <RowFixed style={{ marginLeft: '0px' }}>
                {currency ? (
                  <CurrencyLogo style={{ marginRight: '2px', marginLeft: '0px' }} currency={currency} size={'24px'} />
                ) : null}
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
              </RowFixed>
              {onCurrencySelect && <StyledDropDown selected={!!currency} redesignFlag={redesignFlagEnabled} />}
            </Aligner>
          </CurrencySelect>

          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={onUserInput}
              disabled={!chainAllowed}
              $loading={loading}
              redesignFlag={redesignFlagEnabled}
              prependSymbol={isPlus ? '+' : '-'}
              style={{ marginRight: '5px', textAlign: 'right' }}
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
                  <ThemedText.DeprecatedSmall
                    color={redesignFlag ? theme.textSecondary : theme.deprecated_text3}
                    fontWeight={redesignFlag ? 400 : 500}
                    fontSize={14}
                    style={{ display: 'inline', opacity: 0.5 }}
                  >
                    {!hideBalance && currency && selectedCurrencyBalance ? (
                      renderBalance ? (
                        renderBalance(selectedCurrencyBalance)
                      ) : (<IconContainer>
                        <div style={{ marginRight: '10px' }}>
                          <WalletIcon size={16} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', fontSize: '12px' }}>
                          Balance:
                          <div style={{ color: balanceSignIsPlus ? 'green' : 'red', marginLeft: '10px' }}>
                            {balanceSignIsPlus ? '+' : '-'}{formatCurrencyAmount(selectedCurrencyBalance, 4)}
                          </div>
                        </div>
                      </IconContainer>
                      )
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
        )}
      </Container>
      {onCurrencySelect && (
        <GeneralCurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          showCurrencyAmount={showCurrencyAmount}
          disableNonToken={disableNonToken}
        />
      )}
    </InputPanel>
  )
}
