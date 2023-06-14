import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { loadingOpacityMixin } from 'components/Loader/styled'
import { isSupportedChain, SupportedChainId } from 'constants/chains'
import { darken } from 'polished'
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
import GeneralCurrencySearchModal from 'components/SearchModal/GeneralCurrencySearchModal/GeneralCurrencySearchModal'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import WalletIcon from 'components/Wallet'
import { usePrices } from 'state/oracles/hooks'
import { SupportedAssets } from 'types/1delta'
import { formatUSDValuePanel } from 'utils/tableUtils/format'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

export const InputPanel = styled.div<{ hideInput?: boolean; }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius:  10px;
  background-color: ${({ theme, hideInput }) =>
    hideInput ? 'transparent' : theme.deprecated_bg2};
  z-index: 1;
  width: 100%;
  transition: height 1s ease;
  will-change: height;
`


export const InputPanelContainer = styled.div<{ hideInput: boolean; disabled: boolean; }>`
  border-radius: 10px;
  border-top-right-radius: 1px;
  border-top-left-radius: 1px;
  border: 1px solid #242B33;
  background-color: #0C0F12;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  ${({ theme, hideInput, disabled }) =>
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
}>`
  align-items: center;
  background-color: #1B2127;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  color: ${({ selected, theme }) => (selected ? theme.deprecated_text1 : theme.deprecated_white)};
  cursor: pointer;
  height: ${({ hideInput }) => hideInput ? '2.8rem' : '2.4rem'};
  border-radius: 10px;
  outline: none;
  user-select: none;
  border-top-right-radius: 0px;
  border: none;
  font-size: 24px;
  font-weight: 400;
  width: 110px;
  padding: ${({ selected }) => selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px'};
  gap: 0px;
  justify-content: space-between;
  margin-left: ${({ hideInput }) => (hideInput ? '0' : '12px')};
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`

export const InputRow = styled.div<{ selected: boolean; }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.deprecated_text1};
  font-size: 0.75rem;
  line-height: 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.deprecated_text2)};
  }
`

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledDropDown = styled(DropDown) <{ selected: boolean; }>`
  margin: 0 0.0rem 0 0.0rem;
  height: 35%;
`

const StyledTokenName = styled.span<{ active?: boolean; }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: 14px;
  font-weight: 500;
`

const StyledBalanceMax = styled.button<{ disabled?: boolean; }>`
  background-color: transparent;
  background-color: #242B33;
  border: none;
  color: ${({ theme }) => theme.textPrimary};
  font-weight: 200;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  border-radius: 5px;
  margin-left: 0.25rem;
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

const StyledNumericalInput = styled(NumericalInput) <{ $loading: boolean; }>`
  ${loadingOpacityMixin};
  text-align: left;
  font-size: 24px;
  font-weight: bold;
`


const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const SimpleRow = styled.div`
height: 32px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const PanelContainer = styled.div < { conn: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${({ conn }) => conn ? 'space-between' : 'flex-start'};
`

interface GeneralCurrencyInputPanelProps {
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
  topLabel?: any
  topRightLabel?: any
}

export default function GeneralCurrencyInputPanel({
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
  topLabel = undefined,
  topRightLabel = null,
  ...rest
}: GeneralCurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account, chainId } = useChainIdAndAccount()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const chainAllowed = isSupportedChain(chainId)

  const price = usePrices(currency ? [currency.symbol as SupportedAssets] : [], SupportedChainId.POLYGON)
  const color = '#7C8792'
  return (
    <InputPanel id={id} hideInput={hideInput} {...rest} >
      <SimpleRow>
        <PanelContainer conn={Boolean(account)}>
          <div style={{ color, fontSize: '14px', marginLeft: '10px' }}>
            Pay{currency && value && price[0] && `: ${formatUSDValuePanel(price[0] * Number(tryParseCurrencyAmount(value, currency)?.toExact()))}`}
          </div>

          {!hideInput && !hideBalance && currency && (
            <FiatRow >
              <RowBetween>
                {account ? (
                  <RowFixed style={{ height: '17px', marginRight: '10px' }}>
                    <ThemedText.DeprecatedBody
                      color={theme.deprecated_text3}
                      fontWeight={500}
                      fontSize={14}
                      style={{ display: 'inline' }}
                    >
                      {!hideBalance && currency && selectedCurrencyBalance ? (
                        renderBalance ? (
                          renderBalance(selectedCurrencyBalance)
                        ) : (<IconContainer>
                          <div style={{ marginRight: '10px' }}>
                            <WalletIcon size={15} />
                          </div>
                          {formatCurrencyAmount(selectedCurrencyBalance, 4)}
                        </IconContainer>
                        )
                      ) : null}
                    </ThemedText.DeprecatedBody>
                    {account && selectedCurrencyBalance ? (
                      <StyledBalanceMax onClick={onMax} disabled={!showMaxButton}>
                        <Trans>MAX</Trans>
                      </StyledBalanceMax>
                    ) : null}
                  </RowFixed>
                ) : (
                  <span />
                )}
              </RowBetween>
            </FiatRow>
          )}
        </PanelContainer>
      </SimpleRow>
      <InputPanelContainer hideInput={hideInput} disabled={!chainAllowed} >

        <InputRow
          style={hideInput ? { padding: '0', borderRadius: '8px' } : { paddingLeft: '10px' }}
          selected={!onCurrencySelect}

        >
          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={onUserInput}
              disabled={!chainAllowed}
              $loading={loading}
            />
          )}

          <CurrencySelect
            disabled={!chainAllowed}
            visible={currency !== undefined}
            selected={!!currency}
            hideInput={hideInput}

            className="open-currency-select-button"
            onClick={() => {
              if (onCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              <RowFixed>
                {currency ? (
                  <CurrencyLogo style={{ marginRight: '2px' }} currency={currency} size={'24px'} />
                ) : null}

                <StyledTokenName
                  className="token-symbol-container"
                  active={Boolean(currency && currency.symbol)}

                >
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? currency.symbol.slice(0, 4) +
                    '...' +
                    currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                    : currency?.symbol) || <Trans>Select token</Trans>}
                </StyledTokenName>

              </RowFixed>
              {onCurrencySelect && <StyledDropDown selected={!!currency} />}
            </Aligner>
          </CurrencySelect>
        </InputRow>

      </InputPanelContainer>
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
