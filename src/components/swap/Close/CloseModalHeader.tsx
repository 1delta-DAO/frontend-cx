import { Trans } from '@lingui/macro'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { Price } from '@uniswap/sdk-core'
import { formatPercentInBasisPointsNumber } from 'analytics/utils'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowDown } from 'react-feather'
import { Text } from 'rebass'
import { InterfaceTrade } from 'state/routing/types'
import styled, { useTheme } from 'styled-components/macro'

import { useStablecoinDollarValue } from '../../../hooks/useStablecoinPrice'
import { ThemedText } from '../../../theme'
import { isAddress, shortenAddress } from '../../../utils'
import { computeFiatValuePriceImpact } from '../../../utils/computeFiatValuePriceImpact'
import { ButtonPrimary } from '../../Button'
import { LightCard } from '../../Card'
import { AutoColumn } from '../../Column'
import { FiatValue } from '../../CurrencyInputPanel/FiatValue'
import CurrencyLogo from '../../CurrencyLogo'
import { RowBetween, RowFixed } from '../../Row'
import TradePrice from '../TradePrice'
import { AdvancedSwapDetails } from '../AdvancedSwapDetails'
import { SwapShowAcceptChanges, TruncatedText } from '../styleds'


const ValueText = styled.div`
  color: ${({ theme }) => theme.deprecated_text1};
  width: 0;
  position: relative;
  font-weight: bold;
  font-size: 24px;
  opacity: 0.6;
`

const ArrowWrapper = styled.div<{ redesignFlag: boolean }>`
  padding: 4px;
  border-radius: 12px;
  height: ${({ redesignFlag }) => (redesignFlag ? '40px' : '32px')};
  width: ${({ redesignFlag }) => (redesignFlag ? '40px' : '32px')};
  position: relative;
  margin-top: -18px;
  margin-bottom: -18px;
  left: calc(50% - 16px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundSurface : theme.deprecated_bg1)};
  border: 4px solid;
  border-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundModule : theme.deprecated_bg0)};
  z-index: 2;
`

const getPriceUpdateBasisPoints = (
  prevPrice: Price<Currency, Currency>,
  newPrice: Price<Currency, Currency>
): number => {
  const changeFraction = newPrice.subtract(prevPrice).divide(prevPrice)
  const changePercentage = new Percent(changeFraction.numerator, changeFraction.denominator)
  return formatPercentInBasisPointsNumber(changePercentage)
}

export default function CloseModalHeader({
  trade,
  shouldLogModalCloseEvent,
  setShouldLogModalCloseEvent,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  shouldLogModalCloseEvent: boolean
  setShouldLogModalCloseEvent: (shouldLog: boolean) => void
  allowedSlippage: Percent
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const theme = useTheme()
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled

  const [showInverted, setShowInverted] = useState<boolean>(false)
  const [lastExecutionPrice, setLastExecutionPrice] = useState(trade.executionPrice)
  const [priceUpdate, setPriceUpdate] = useState<number | undefined>()

  const fiatValueInput = useStablecoinDollarValue(trade.inputAmount)
  const fiatValueOutput = useStablecoinDollarValue(trade.outputAmount)

  useEffect(() => {
    if (!trade.executionPrice.equalTo(lastExecutionPrice)) {
      setPriceUpdate(getPriceUpdateBasisPoints(lastExecutionPrice, trade.executionPrice))
      setLastExecutionPrice(trade.executionPrice)
    }
  }, [lastExecutionPrice, setLastExecutionPrice, trade.executionPrice])

  useEffect(() => {
    if (shouldLogModalCloseEvent && showAcceptChanges)
      setShouldLogModalCloseEvent(false)
  }, [shouldLogModalCloseEvent, showAcceptChanges, setShouldLogModalCloseEvent, trade, priceUpdate])

  return (
    <AutoColumn gap={'4px'} style={{ marginTop: '1rem' }}>
      <LightCard padding="5px" height={'60px'}>
        <AutoColumn gap={'1px'} style={{ paddingLeft: '10px', paddingRight: '10px' }}>
          <RowBetween align="center" >
            <RowFixed gap={'0px'}>
              <ValueText
              >
                {trade.inputAmount.toSignificant(6)}
              </ValueText>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.inputAmount.currency} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.inputAmount.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueInput} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <ArrowWrapper redesignFlag={redesignFlagEnabled}>
        <ArrowDown size="16" color={redesignFlagEnabled ? theme.textPrimary : theme.deprecated_text2} />
      </ArrowWrapper>
      <LightCard padding="5px" height={'60px'}>
        <AutoColumn gap={'1px'} style={{ paddingLeft: '10px', paddingRight: '10px' }}>
          <RowBetween align="flex-end">
            <RowFixed gap={'0px'}>
              <ValueText >
                {trade.outputAmount.toSignificant(6)}
              </ValueText>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.outputAmount.currency} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.outputAmount.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueOutput} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TradePrice price={trade.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
      </RowBetween>
      <LightCard style={{ padding: '.75rem', marginTop: '0.5rem' }}>
        <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      </LightCard>

      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '.75rem 1rem' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Output is estimated. You will receive at least{' '}
              <b>
                {trade.minimumAmountOut(allowedSlippage).toSignificant(6)} {trade.outputAmount.currency.symbol}
              </b>{' '}
              or the transaction will revert.
            </Trans>
          </ThemedText.DeprecatedItalic>
        ) : (
          <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Input is estimated. You will sell at most{' '}
              <b>
                {trade.maximumAmountIn(allowedSlippage).toSignificant(6)} {trade.inputAmount.currency.symbol}
              </b>{' '}
              or the transaction will revert.
            </Trans>
          </ThemedText.DeprecatedItalic>
        )}
      </AutoColumn>
    </AutoColumn>
  )
}
