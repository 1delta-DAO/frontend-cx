import { Trans } from '@lingui/macro'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import AnimatedDropdown from 'components/AnimatedDropdown'
import Card, { OutlineCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { DepositMode } from 'components/Dropdown/depositTypeDropdown'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { useState } from 'react'
import { ChevronDown, Info } from 'react-feather'
import { useChainId } from 'state/globalNetwork/hooks'
import { InterfaceTrade } from 'state/routing/types'
import styled, { keyframes, useTheme } from 'styled-components/macro'
import { HideSmall, ThemedText } from 'theme'
import { SupportedAssets } from 'types/1delta'
import { AdvancedRiskDetails } from './AdvancedRiskDetails'

import { AdvancedSwapDetails } from '../AdvancedSwapDetails'
import GasEstimateBadge from '../GasEstimateBadge'
import RiskEstimate from './RiskEstimate'
import { ResponsiveTooltipContainer } from '../styleds'
import SwapRoute from '../SwapRoute'
import TradePrice from '../TradePrice'

const Wrapper = styled(Row)`
  width: 90%;
  justify-content: center;
`

const StyledInfoIcon = styled(Info)`
  height: 16px;
  width: 16px;
  margin-right: 4px;
  color: ${({ theme }) => theme.deprecated_text3};
`

const StyledCard = styled(OutlineCard) <{ redesignFlag: boolean }>`
  padding: 12px;
  border: 1px solid ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundOutline : theme.deprecated_bg3)};
`

const StyledHeaderRow = styled(RowBetween) <{ disabled: boolean; open: boolean; redesignFlag: boolean }>`
  padding: ${({ redesignFlag }) => (redesignFlag ? '8px 0px 0px 0px' : '4px 8px')};
  background-color: ${({ open, theme, redesignFlag }) =>
    open && !redesignFlag ? theme.deprecated_bg1 : 'transparent'};
  align-items: center;
  border-top: 1px solid ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundOutline : 'transparent')};
  margin-top: ${({ redesignFlag }) => redesignFlag && '8px'};
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
  max-height: 40px;
  border-radius: 5px;
`

const RotatingArrow = styled(ChevronDown) <{ open?: boolean }>`
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'none')};
  transition: transform 0.1s linear;
`

const StyledPolling = styled.div`
  display: flex;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-left: 10px;
  align-items: center;
  color: ${({ theme }) => theme.deprecated_text1};
  transition: 250ms ease color;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    display: none;
  `}
`

const StyledPollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  border-radius: 50%;
  position: relative;
  background-color: ${({ theme }) => theme.deprecated_bg2};
  transition: 250ms ease background-color;
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  transform: translateZ(0);
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme }) => theme.deprecated_text1};
  background: transparent;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  transition: 250ms ease border-color;
  left: -3px;
  top: -3px;
`

interface RiskDetailsProps {
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
  depositCurrency: SupportedAssets
  depositMode: DepositMode
  depositAmount: number
  ltv: number
  aprSupply: number
  aprDeposit: number
  aprBorrow: number
  rewardSupply: number
  rewardDeposit: number
  rewardBorrow: number
  healthFactor: number
  syncing: boolean
  loading: boolean
  showInverted: boolean
  setShowInverted: React.Dispatch<React.SetStateAction<boolean>>
  allowedSlippage: Percent
}

export default function RiskDetailsDropdown({
  trade,
  depositAmount,
  healthFactor,
  depositMode,
  depositCurrency,
  syncing,
  loading,
  aprSupply,
  aprDeposit,
  aprBorrow,
  rewardSupply,
  rewardDeposit,
  rewardBorrow,
  ltv,
  showInverted,
  setShowInverted,
  allowedSlippage,
}: RiskDetailsProps) {
  const theme = useTheme()
  const chainId = useChainId()
  const [showDetails, setShowDetails] = useState(true)
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === RedesignVariant.Enabled

  return (
    <Wrapper style={{ marginTop: '8px' }}>
      <AutoColumn gap={'8px'} style={{ width: '100%', marginBottom: '-8px' }}>
        <StyledHeaderRow
          redesignFlag={redesignFlagEnabled}
          onClick={() => setShowDetails(!showDetails)}
          disabled={!trade}
          open={showDetails}
        >
          <RowFixed style={{ position: 'relative' }}>
            {loading || syncing ? (
              <StyledPolling>
                <StyledPollingDot>
                  <Spinner />
                </StyledPollingDot>
              </StyledPolling>
            ) : (
              <HideSmall>
                <MouseoverTooltipContent
                  wrap={false}
                  content={
                    <ResponsiveTooltipContainer origin="top right" style={{ padding: '0', height: '40px' }}>
                      <Card padding="12px">
                        <AdvancedRiskDetails
                          aprSupply={aprSupply}
                          aprDeposit={aprDeposit}
                          aprBorrow={aprBorrow}
                          rewardSupply={rewardSupply}
                          rewardDeposit={rewardDeposit}
                          rewardBorrow={rewardBorrow}
                          depositMode={depositMode}
                          ltv={ltv}
                          depositAmount={depositAmount}
                          healthFactor={healthFactor}
                          depositCurrency={depositCurrency}
                          trade={trade}
                          allowedSlippage={allowedSlippage}
                          syncing={syncing}
                          hideInfoTooltips={true}
                        />
                      </Card>
                    </ResponsiveTooltipContainer>
                  }
                  placement="bottom"
                  disableHover={showDetails}
                >
                  <StyledInfoIcon color={trade ? theme.deprecated_text3 : theme.deprecated_bg3} />
                </MouseoverTooltipContent>
              </HideSmall>
            )}
            {trade ? (
              <LoadingOpacityContainer $loading={syncing}>
                <RiskEstimate
                  ltv={ltv}
                  healthFactor={healthFactor}
                  price={trade.executionPrice}
                  showInverted={showInverted}
                  setShowInverted={setShowInverted}
                />
              </LoadingOpacityContainer>
            ) : loading || syncing ? (
              <ThemedText.DeprecatedMain fontSize={14}>
                <Trans>Calculating Risk...</Trans>
              </ThemedText.DeprecatedMain>
            ) : null}
          </RowFixed>
          <RowFixed>
            {!trade?.gasUseEstimateUSD ||
              showDetails ||
              !chainId ||
              !SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId) ? null : (
              <GasEstimateBadge
                trade={trade}
                loading={syncing || loading}
                showRoute={!showDetails}
                disableHover={showDetails}
              />
            )}
            <RotatingArrow
              stroke={trade ? theme.deprecated_text3 : theme.deprecated_bg3}
              open={Boolean(trade && showDetails)}
            />
          </RowFixed>
        </StyledHeaderRow>
        <AnimatedDropdown open={showDetails}>
          <AutoColumn gap={'8px'} style={{ padding: '0', paddingBottom: '8px' }}>
            {trade ? (
              <StyledCard redesignFlag={redesignFlagEnabled}>
                <AdvancedRiskDetails
                  aprSupply={aprSupply}
                  aprDeposit={aprDeposit}
                  aprBorrow={aprBorrow}
                  rewardSupply={rewardSupply}
                  rewardDeposit={rewardDeposit}
                  rewardBorrow={rewardBorrow}
                  depositMode={depositMode}
                  ltv={ltv}
                  depositAmount={depositAmount}
                  depositCurrency={depositCurrency}
                  healthFactor={healthFactor}
                  trade={trade}
                  allowedSlippage={allowedSlippage}
                  syncing={syncing} />
              </StyledCard>
            ) : null}
          </AutoColumn>
        </AnimatedDropdown>
      </AutoColumn>
    </Wrapper>
  )
}
