import { Trans } from '@lingui/macro'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { TOKEN_SVGS } from 'constants/1delta'
import { SupportedChainId, SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useMemo } from 'react'
import { useChainId } from 'state/globalNetwork/hooks'
import { usePrices } from 'state/oracles/hooks'
import { InterfaceTrade } from 'state/routing/types'
import styled, { useTheme } from 'styled-components/macro'
import { Z_INDEX } from 'theme/zIndex'
import { SupportedAssets } from 'types/1delta'
import { formatSmallUSDValue } from 'utils/tableUtils/format'
import HelpCircleIcon from 'components/AccountCards/HelpCircleIcon'
import { Separator, ThemedText } from '../../theme'
import { computeRealizedPriceImpact } from '../../utils/prices'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { MouseoverTooltip } from '../Tooltip'
import FormattedPriceImpact from './FormattedPriceImpact'
import { DepositMode } from 'components/Dropdown/depositTypeDropdown'

const StyledCard = styled(Card)`
  padding: 0;
`
const HEALTH_FACTOR_CRITICAL = 1.05
const HEALTH_FACTOR_AT_RISK = 1.1

enum Level {
  CRITICAL,
  AT_RISK,
  OK
}

const AccountCardHeading = styled.span`
font-size: 14px;
color: ${({ theme }) => theme.textSecondary};
`

const BarCol = styled.div`
margin-top: 5px;
padding: 2px;
width: 100%;
display: flex;
flex-direction: column;
`

const ProgressWrapper = styled.div`
width: 100%;
height: 7px;
border-radius: 20px;
background-color: ${({ theme }) => theme.backgroundOutline};
position: relative;
`

const Progress = styled.div<{ percentageString?: string, level: Level }>`
height: 7px;
border-radius: 20px;
opacity: 0.6;
${({ theme, level }) => `
    background-color: ${(level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ? theme.accentFailure : theme.accentSuccess)};
    box-shadow: ${(level === Level.AT_RISK ? `
    0px 0px 0.1rem 0.1rem  ${theme.accentWarning};
    `  : level === Level.CRITICAL ? `
    0px 0px 2px 2px  ${theme.accentFailure};
    ` : `
    0px 0px 1px 1px ${theme.accentSuccess};
    ` )}`}
width: ${({ percentageString }) => percentageString ?? '0%'};
`

const ProgressValue = styled.span<{ level: Level }>`
color: ${({ theme, level }) =>
    (level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ? theme.accentFailure : theme.accentSuccess)};
font-size: 14px;
font-weight: 500;
`

const RowFromLeft = styled.div`
display: flex;
flex-direction: row;
justify-content: flex-start;
align-items: flex-start;
`

const RowSpaceBetween = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: flex-start;
`




const StyledImg = styled.img`
  width: 20px;
  height: 20px;
  margin-left: 5px;
`


const TextToImage = styled.div`
  display: flex;
  flex-direction: row;
`

interface AdvancedRiskDetailsProps {
  depositCurrency: SupportedAssets
  depositAmount: number
  ltv: number
  depositMode: DepositMode
  healthFactor: number
  trade?: InterfaceTrade<Currency, Currency, TradeType>
  allowedSlippage: Percent
  syncing?: boolean
  hideInfoTooltips?: boolean
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
    children
  )
}

export function AdvancedRiskDetails({
  trade,
  depositAmount,
  healthFactor,
  ltv,
  depositCurrency,
  depositMode,
  allowedSlippage,
  syncing = false,
  hideInfoTooltips = false,
}: AdvancedRiskDetailsProps) {
  const theme = useTheme()
  const chainId = useChainId()
  const nativeCurrency = useNativeCurrency()
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const [depoPrice] = usePrices([depositCurrency], SupportedChainId.POLYGON)
  const { expectedOutputAmount, priceImpact } = useMemo(() => {
    return {
      expectedOutputAmount: trade?.outputAmount,
      priceImpact: trade ? computeRealizedPriceImpact(trade) : undefined,
    }
  }, [trade])
  const data = trade ? [
    depositCurrency,
    trade.outputAmount.currency.symbol as SupportedAssets,
    trade.inputAmount.currency.symbol as SupportedAssets] : undefined
  const [priceReceived, priceCollateral, priceDebt] = usePrices(data ?? [], SupportedChainId.POLYGON)

  const [safeLtv, safeHf, state] = useMemo(() => {
    const _safeLtv = Number(ltv * 100)
    const _safeHf = healthFactor === 0 ? 100 : Number(healthFactor)
    const _state = (_safeHf < HEALTH_FACTOR_CRITICAL) ? Level.CRITICAL :
      (_safeHf < HEALTH_FACTOR_AT_RISK) ? Level.AT_RISK : Level.OK
    return [_safeLtv, _safeHf, _state]
  }, [ltv, healthFactor])


  return (!trade || !data) ? null : (
    <StyledCard>
      <AutoColumn gap="8px">
        <RowBetween >
          <RowFixed>
            <MouseoverTooltip
              text={
                <Trans>
                  T
                </Trans>
              }
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text1}>
                <Trans>Expected Collateral</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={65}>
            <TextToImage>
              <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                {expectedOutputAmount
                  ? `${formatSmallUSDValue(Number(expectedOutputAmount.toExact()) * priceCollateral + (depositMode !== DepositMode.TO_COLLATERAL ? 0 : depositAmount))} in `
                  : '-'}

              </ThemedText.DeprecatedBlack>
              <StyledImg src={TOKEN_SVGS[data[1]]} />
            </TextToImage>
          </TextWithLoadingPlaceholder>
        </RowBetween>
        {trade && (depositMode !== DepositMode.TO_COLLATERAL) && <RowBetween>
          <RowFixed>

          </RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={65}>
            <TextToImage>
              <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                {expectedOutputAmount
                  ? `${formatSmallUSDValue(depositAmount)} in `
                  : '-'}
              </ThemedText.DeprecatedBlack>
              <StyledImg src={TOKEN_SVGS[depositMode === DepositMode.DIRECT ? data[2] : SupportedAssets.USDC]} />
            </TextToImage>
          </TextWithLoadingPlaceholder>
        </RowBetween>}
        <Separator redesignFlag={redesignFlagEnabled} />
        <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              text={<Trans>The impact your trade has on the market price of this pool.</Trans>}
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text1}>
                <Trans>Expected Debt</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={65}>
            <TextToImage>
              <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                {trade
                  ? `${formatSmallUSDValue(Number(trade.inputAmount.toExact()) * priceDebt)} in `
                  : '-'}

              </ThemedText.DeprecatedBlack>
              <StyledImg src={TOKEN_SVGS[data[2]]} />
            </TextToImage>
          </TextWithLoadingPlaceholder>
        </RowBetween>
        <Separator redesignFlag={redesignFlagEnabled} />
        <RowBetween>
          <BarCol>
            <RowSpaceBetween>
              <RowFromLeft>
                <AccountCardHeading>Loan-to-Value</AccountCardHeading>
                {HelpCircleIcon('Measures the $ value of your collateral in relation to your supplies. If it is higher than 100%, your account is flagged for liquidation.')}
              </RowFromLeft>
              <ProgressValue
                level={state}
              >{(isNaN(safeLtv)) ? '-' : `${(safeLtv).toLocaleString(undefined, { minimumFractionDigits: 2 })}%`}</ProgressValue>{' '}
            </RowSpaceBetween>
            <ProgressWrapper>
              <Progress
                percentageString={`${ltv * 100}%`}
                level={state}
              />
            </ProgressWrapper>
            <div style={{ height: '10px' }} />
            <RowSpaceBetween>
              <RowFromLeft>
                <AccountCardHeading>Health Factor</AccountCardHeading>
                {HelpCircleIcon('If the health factor is lower than 1.0, your account is flagged for liquidation.')}
              </RowFromLeft>
              <ProgressValue
                level={state}
              >
                {safeHf === 0
                  ? '\u221e'
                  : safeHf > 10e6
                    ? '>1M'
                    : healthFactor.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </ProgressValue>
            </RowSpaceBetween>
            <ProgressWrapper>
              <Progress
                percentageString={`${((safeHf - 1) / safeHf) * 100}%`}
                level={state}
              />
            </ProgressWrapper>
          </BarCol>
        </RowBetween>
        {!trade?.gasUseEstimateUSD || !chainId || !SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId) ? null : (
          <RowBetween>
            <MouseoverTooltip
              text={
                <Trans>
                  The fee paid to miners who process your transaction. This must be paid in {nativeCurrency.symbol}.
                </Trans>
              }
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text3}>
                <Trans>Network Fee</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
            <TextWithLoadingPlaceholder syncing={syncing} width={50}>
              <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={theme.deprecated_text3}>
                ~${trade.gasUseEstimateUSD.toFixed(2)}
              </ThemedText.DeprecatedBlack>
            </TextWithLoadingPlaceholder>
          </RowBetween>
        )}
      </AutoColumn>
    </StyledCard>
  )
}
