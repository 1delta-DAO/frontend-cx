import { Percent } from '@uniswap/sdk-core'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import { LoadingRows } from 'components/Loader/styled'
import { RowBetween, RowFixed } from 'components/Row'
import { Separator } from 'components/SearchModal/styleds'
import { MouseoverTooltip } from 'components/Tooltip'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { useMemo } from 'react'
import { Activity, ChevronsRight, CreditCard } from 'react-feather'
import { TradeImpact } from 'hooks/riskParameters/types'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatPercent, formatPercentagePoints, ltvDataToNumber, healthFactorDeltaToNumber, healthFactorToNumber } from '../../../../utils/1delta/generalFormatters'

const StyledCard = styled(Card)`
  padding: 0;
  width: 100%;
`

const IconContainer = styled.div`
  width: 30px;
  margin-right: 10px;
`

const ArrowContainer = styled.div`
  width: 30px;
`

export const RiskRow = styled.div<{ hasTrade: boolean }>`
  flex-direction: row;
  display: flex;
  width: 300px;
  justify-content:  ${({ hasTrade }) => hasTrade ? 'space-between' : 'center'};
`

interface AdvancedRiskDetailsProps {
  tradeImpact?: TradeImpact
  allowedSlippage: Percent
  noTrade?: boolean
  hideInfoTooltips?: boolean
  isMobile?: boolean
}

function TextWithLoadingPlaceholder({
  syncing,
  width,
  children,
}: {
  syncing: boolean
  width: number
  children: JSX.Element
}) {
  return syncing ? (
    <LoadingRows>
      <div style={{ height: '15px', width: `${width}px` }} />
    </LoadingRows>
  ) : (
    <div style={{ alignSelf: 'center' }}>{children}</div>
  )
}

export function AdvancedRiskDetailsMoneyMarket({
  tradeImpact,
  allowedSlippage,
  noTrade = false,
  hideInfoTooltips = false,
  isMobile = false
}: AdvancedRiskDetailsProps) {
  const theme = useTheme()
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled

  const [hfDelta, hfNew, ltvDelta, ltvNew, hf, ltv] = useMemo(() => {
    return [
      ltvDataToNumber(tradeImpact?.healthFactorDelta),
      ltvDataToNumber(tradeImpact?.healthFactorNew),
      ltvDataToNumber(tradeImpact?.ltvDelta),
      ltvDataToNumber(tradeImpact?.ltvNew),
      ltvDataToNumber(tradeImpact?.healthFactor),
      ltvDataToNumber(tradeImpact?.ltv),
    ]
  }, [tradeImpact, noTrade])

  const isSyncing = useMemo(() => !Boolean(tradeImpact), [tradeImpact])

  return !tradeImpact ? null : (
    <StyledCard>
      <AutoColumn gap="8px">
        <RowBetween>
          <RowFixed>
            <IconContainer>
              <Activity />
            </IconContainer>
            <MouseoverTooltip
              text={
                'If your health factor drips below 1, it will be flagged for liquidation and your position might be closed at unfavorable terms. Always make sure to keep a margin of safety.'
              }
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text1}>
                {noTrade ? 'Current Health Factor' : `Health Factor${isMobile ? '' : ' Impact'}`}
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <RowFixed>
            <RiskRow hasTrade={!noTrade}>
              <TextWithLoadingPlaceholder syncing={isNaN(hf)} width={65}>
                <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                  {healthFactorToNumber(tradeImpact?.healthFactor)}
                </ThemedText.DeprecatedBlack>
              </TextWithLoadingPlaceholder>
              {!noTrade && (
                <>
                  <ArrowContainer>
                    <ChevronsRight />
                  </ArrowContainer>
                  <TextWithLoadingPlaceholder syncing={isSyncing} width={65}>
                    <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={hfDelta < 0 ? 'red' : 'green'}>
                      {healthFactorDeltaToNumber(tradeImpact.healthFactorDelta)}
                    </ThemedText.DeprecatedBlack>
                  </TextWithLoadingPlaceholder>
                  <ArrowContainer>
                    <ChevronsRight />
                  </ArrowContainer>
                  <TextWithLoadingPlaceholder syncing={isSyncing} width={65}>
                    <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                      {healthFactorToNumber(tradeImpact?.healthFactorNew)}
                    </ThemedText.DeprecatedBlack>
                  </TextWithLoadingPlaceholder>
                </>
              )}
            </RiskRow>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <IconContainer>
              <CreditCard />
            </IconContainer>
            <MouseoverTooltip
              text={'The impact your trade has on your Loan-To-Value ratio.'}
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text1}>
                {noTrade ? 'Current Adjusted LTV' : `Adjusted LTV${isMobile ? '' : ' Impact'}`}
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <RowFixed>
            <RiskRow hasTrade={!noTrade}>
              <TextWithLoadingPlaceholder syncing={isNaN(ltv)} width={50}>
                <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                  {ltv !== 0 ? `${formatPercent(ltv, 2)}` : '-'}
                </ThemedText.DeprecatedBlack>
              </TextWithLoadingPlaceholder>
              {!noTrade && (
                <>
                  <ArrowContainer>
                    <ChevronsRight />
                  </ArrowContainer>
                  <TextWithLoadingPlaceholder syncing={isSyncing} width={50}>
                    <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={ltvDelta > 0 ? 'red' : 'green'}>
                      {ltvDelta !== 0 ? `${formatPercentagePoints(ltvDelta, 2)}` : '-'}
                    </ThemedText.DeprecatedBlack>
                  </TextWithLoadingPlaceholder>
                  <ArrowContainer>
                    <ChevronsRight />
                  </ArrowContainer>
                  <TextWithLoadingPlaceholder syncing={isSyncing} width={50}>
                    <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                      {ltvNew !== 0 ? `${formatPercent(ltvNew, 2)}` : '0%'}
                    </ThemedText.DeprecatedBlack>
                  </TextWithLoadingPlaceholder>
                </>
              )}
            </RiskRow>
          </RowFixed>
        </RowBetween>
        <Separator redesignFlag={redesignFlagEnabled} />
      </AutoColumn>
    </StyledCard>
  )
}
