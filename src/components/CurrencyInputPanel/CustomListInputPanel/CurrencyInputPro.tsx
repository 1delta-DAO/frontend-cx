import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
import { isSupportedChain } from 'constants/chains'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { darken } from 'polished'
import { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components/macro'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { ThemedText } from '../../../theme'
import { Input as NumericalInput } from '../../NumericalInput'
import { RowBetween, RowFixed } from '../../Row'
import { FiatValue } from '../FiatValue'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { SupportedAssets } from 'types/1delta'
import SearchDropdown from 'components/Dropdown/dropdownSearch'

const InputPanel = styled.div<{ hideInput?: boolean; redesignFlag: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
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

const InputRow = styled.div<{ selected: boolean; redesignFlag: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected, redesignFlag }) =>
    redesignFlag ? '0px' : selected ? ' 0.1rem 0.1rem 0.3rem 0.1rem' : '0.1rem 0.1rem 0.1rem 0.1rem'};
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

const StyledBalanceMax = styled.button<{ disabled?: boolean; redesignFlag: boolean }>`
  background-color: transparent;
  height: 15px;
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

const SimpleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

interface CurrencyInputProProps {
  placeholder: SupportedAssets
  assetList: SupportedAssets[]
  onAssetSelect: (asset: SupportedAssets) => void
  providedTokenList: { [address: string]: Token }
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  currency?: Currency | null
  asset?: SupportedAssets
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
  isPlus?: boolean
  topLabel?: any
  topRightLabel?: any
  balanceSignIsPlus?: boolean
}

export default function CurrencyInputPro({
  placeholder,
  providedTokenList,
  assetList,
  onAssetSelect,
  value,
  onUserInput,
  onMax,
  showMaxButton,
  currency,
  asset,
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
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  loading = false,
  isPlus = true,
  balanceSignIsPlus = true,
  topRightLabel = null,
  ...rest
}: CurrencyInputProProps) {

  const { account, chainId } = useChainIdAndAccount()
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const selectedCurrencyBalance = providedCurrencyBalance
  const theme = useTheme()

  const chainAllowed = isSupportedChain(chainId)

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest} redesignFlag={redesignFlagEnabled}>
      <Container hideInput={hideInput} disabled={!chainAllowed} redesignFlag={redesignFlagEnabled}>
        <SimpleRow>
          {topLabel && topLabel}
          {topRightLabel && topRightLabel}
        </SimpleRow>
        <InputRow
          style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}
          selected={!onAssetSelect}
          redesignFlag={redesignFlagEnabled}
        >
          <SearchDropdown selectedOption={asset} options={assetList} onSelect={onAssetSelect} placeholder={placeholder} />
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
          {/* </div> */}
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
        )}
      </Container>
    </InputPanel >
  )
}
