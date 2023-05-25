import { Percent } from '@uniswap/sdk-core'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { RowFixed } from 'components/Row'
import { Separator } from 'components/SearchModal/styleds'
import { MouseoverTooltip } from 'components/Tooltip'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { TradeImpact } from 'hooks/riskParameters/types'
import { useMemo } from 'react'
import { TrendingDown, TrendingUp } from 'react-feather'
import { LendingProtocol } from 'state/1delta/actions'
import { useLiquidationThreshold } from 'state/1delta/hooks'
import { useNetworkState } from 'state/globalNetwork/hooks'
import { usePrices } from 'state/oracles/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { MarginTradeType, SupportedAssets } from 'types/1delta'

const StyledCard = styled(Card)`
  padding: 0;
  width: 70%;
`

const IconContainer = styled.div<{ isMobile: boolean }>`
  width: ${({ isMobile }) => (isMobile ? '20px' : '30px')};
  margin-right: 10px;
`

export const RiskRow = styled.div`
  flex-direction: row;
  display: flex;
  width: 100%;
  justify-content: space-between;
`

const MarginRequirementRow = styled.div`
  flex-direction: row;
  margin-top: 5px;
  display: flex;
  width: 100%;
  justify-content: center;
  column-gap: 50px;
  align-items: center;
  align-self: center;
  height: 30px;
`

const RiskParamContainer = styled.div<{ isMobile: boolean }>`
  ${({ isMobile }) =>
    isMobile
      ? `
  display: flex;
  width: 300px;
  flex-direction: row;
  align-items: space-between;
  justify-content: space-between;
  margin: 5px;
`
      : `display: flex;
    width: 100%;
    flex-direction: row;
    align-items: space-between;
    justify-content: space-between;
    margin: 5px;`}
`
const Container = styled.div<{ isMobile: boolean }>`
  ${({ isMobile }) =>
    isMobile
      ? `
  display: flex;
  flex-direction: column;
  align-items: space-between;
  justify-content: center;
`
      : `display: flex;
    flex-direction: column;
    align-items: space-between;
    justify-content: center;`}
`

interface YieldDetailsMarginTradeProps {
  protocol: LendingProtocol
  assetCollateral: SupportedAssets
  assetBorrow: SupportedAssets
  yieldCollateral: number
  yieldBorrow: number
  amountCollateral: number
  amountBorrow: number
  tradeImpact?: TradeImpact
  marginTradeType: MarginTradeType
  allowedSlippage: Percent
  isMobile: boolean
  noTrade?: boolean
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
    <div style={{ alignSelf: 'center' }}>{children}</div>
  )
}

export function YieldDetailsMarginTrade({
  protocol,
  assetCollateral,
  assetBorrow,
  yieldCollateral,
  yieldBorrow,
  amountCollateral,
  amountBorrow,
  marginTradeType,
  allowedSlippage,
  isMobile,
  noTrade = false,
  hideInfoTooltips = false,
}: YieldDetailsMarginTradeProps) {
  const theme = useTheme()
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled
  const { chainId } = useNetworkState()
  const [priceCollateral, priceBorrow] = usePrices([assetCollateral, assetBorrow], chainId)
  const [bLiq] = useLiquidationThreshold([assetCollateral], chainId, protocol)

  const [carryYieldOfPosition, flowCollateral, flowBorrow] = useMemo(() => {
    const _flowCollateral = amountCollateral * yieldCollateral * priceCollateral
    const _flowBorrow = amountBorrow * yieldBorrow * priceBorrow
    if (marginTradeType === MarginTradeType.Open) {
      return [
        (_flowCollateral - _flowBorrow) / amountCollateral,
        Math.round(_flowCollateral * 100) / 10000,
        -Math.round(_flowBorrow * 100) / 10000,
      ]
    }
    return [
      (_flowBorrow - _flowCollateral) / amountCollateral,
      -Math.round(_flowCollateral * 100) / 10000,
      Math.round(_flowBorrow * 100) / 10000,
    ]
  }, [yieldCollateral, yieldBorrow, amountCollateral, amountBorrow, marginTradeType, priceCollateral, priceBorrow])

  // we assume that the used collateral will have threshold 0.75. Target health factor is 1.
  const marginRequirement = useMemo(() => {
    return Math.round(((1 * amountBorrow * priceBorrow - amountCollateral * priceCollateral * bLiq) * 100) / bLiq) / 100
  }, [amountBorrow, amountCollateral, priceBorrow, priceCollateral, bLiq])

  const mobileSize = isMobile ? 15 : 20
  return (
    <Container isMobile={isMobile}>
      <Container isMobile={isMobile}>
        <RiskParamContainer isMobile={isMobile}>
          <RowFixed>
            <IconContainer isMobile={isMobile}>
              {marginTradeType === MarginTradeType.Open ? (
                <TrendingUp size={mobileSize} />
              ) : (
                <TrendingDown size={mobileSize} />
              )}
            </IconContainer>
            <MouseoverTooltip
              text={'Holding this asset of the trade will cause this cash flow.'}
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text1}>
                Cash Flow p.a. Collateral
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <RowFixed>
            <RiskRow>
              <TextWithLoadingPlaceholder syncing={noTrade} width={65}>
                <ThemedText.DeprecatedBlack
                  minWidth={40}
                  textAlign="right"
                  fontSize={14}
                  color={flowCollateral > 0 ? 'green' : 'red'}
                >
                  {flowCollateral !== 0 ? (flowCollateral > 0 ? `+ $${flowCollateral}` : `- $${-flowCollateral}`) : '-'}
                </ThemedText.DeprecatedBlack>
              </TextWithLoadingPlaceholder>
            </RiskRow>
          </RowFixed>
        </RiskParamContainer>

        <RiskParamContainer isMobile={isMobile}>
          <RowFixed>
            <IconContainer isMobile={isMobile}>
              {marginTradeType === MarginTradeType.Open ? (
                <TrendingDown size={mobileSize} />
              ) : (
                <TrendingUp size={mobileSize} />
              )}
            </IconContainer>
            <MouseoverTooltip
              text={'Holding this debt of the trade will cause this cash flow.'}
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text1}>
                Cash Flow p.a. Borrow
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <RowFixed>
            <RiskRow>
              <TextWithLoadingPlaceholder syncing={noTrade} width={50}>
                <ThemedText.DeprecatedBlack
                  minWidth={40}
                  textAlign="right"
                  fontSize={14}
                  color={flowBorrow > 0 ? 'green' : 'red'}
                >
                  {flowBorrow !== 0 ? (flowBorrow > 0 ? `+ $${flowBorrow}` : `- $${-flowBorrow}`) : '-'}
                </ThemedText.DeprecatedBlack>
              </TextWithLoadingPlaceholder>
            </RiskRow>
          </RowFixed>
        </RiskParamContainer>
      </Container>
      {marginTradeType === MarginTradeType.Open && marginRequirement !== 0 && (
        <MarginRequirementRow>
          <RowFixed gap="20px">
            <MouseoverTooltip
              text={'The required amount of assets that are needed to be supplied if that position were opened.'}
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader
                color={theme.deprecated_text1}
                alignContent="center"
                textAlign="left"
                justifyContent="center"
                marginRight="20px"
              >
                Margin Requirement:
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
            <TextWithLoadingPlaceholder syncing={noTrade} width={50}>
              <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} minWidth={30}>
                {isNaN(marginRequirement) || !isFinite(marginRequirement) ? '\u221e' : `$${marginRequirement}`}
              </ThemedText.DeprecatedBlack>
            </TextWithLoadingPlaceholder>
          </RowFixed>
        </MarginRequirementRow>
      )}
      <Separator redesignFlag={redesignFlagEnabled} />
    </Container>
  )
}
