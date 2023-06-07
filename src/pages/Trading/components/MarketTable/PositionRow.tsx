import { useMemo } from 'react'
import { Anchor, ArrowRight, BarChart2, Check } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import {
  CheckboxWrapper,
  Circle,
  YieldBox
} from 'components/Styles/tableStyles'
import {
  AnimatedTokenPositionIcon, PairPosition
} from 'components/TokenDetail'
import {
  formatPriceString,
  formatSmallGeneralUSDValue,
  formatSmallGeneralValue,
  formatSmallValue
} from 'utils/tableUtils/format'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { MouseoverTooltip } from 'components/Tooltip'

import { LendingProtocol } from 'state/1delta/actions'
import { PreparedAssetData } from 'hooks/asset/useAssetData'
import { AssetCellPro, AssetHeaderPro, CheckboxCellPro, PnLCellPro, PnLHeaderPro, PositionCellPro, PositionCellWithChangePro, PositionRowPro, PriceCellPro, RewardsHeaderPro, TimeCellPro, TimeHeaderPro } from 'components/Styles/tableStylesProfessional'
import { AaveInterestMode, SupportedAssets } from 'types/1delta'
import { Mode } from 'pages/Trading'
import { TOKEN_SVGS } from 'constants/1delta'
import { default as ovixStandalone } from 'assets/svg/logos/logo-0vix.svg'
import { ExternalLinkIcon } from 'components/TokenSafety'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'

export const ValueText = styled.div<{ positive: boolean }>`
font-size: 14px;
text-align: left;
color: ${({ theme, positive }) => positive ? theme.deprecated_green1 : theme.deprecated_red2};
`

export const ValueTextMinor = styled.div<{ positive: boolean }>`
font-size: 12px;
text-align: left;
opacity: 0.7;
color: ${({ theme, positive }) => positive ? theme.deprecated_green1 : theme.deprecated_red2};
`


export const ChangeRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`
export const NewValWithArrow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`


const ImageStable = styled(Anchor)`
  width: 12px;
  height: 12px;
  margin-left: 5px;
`

const ImageVariable = styled(BarChart2)`
  width: 12px;
  height: 12px;
  margin-left: 5px;
`

const SimpleCol = styled.div`
  margin-left: -10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`

const PnLCell = styled.div<{ pos: boolean }>`
text-align: left;
  ${({ pos }) => pos ? `
    color: #4ADE80;
    ` : `
  color: #EF4444;
  `}
`

const PnLCellUSD = styled(PnLCell)`
opacity: 0.7;
font-size: 10px ;
`
const ResponsiveCheck = styled(Check)``

export function ButtonRadioChecked({
  active,
  onClick,
  isMobile,
}: {
  active: boolean
  onClick: () => void
  isMobile: boolean
}) {
  const theme = useTheme()

  return (
    <CheckboxWrapper onClick={onClick}>
      <Circle active={active} isMobile={isMobile}>
        <ResponsiveCheck size={13} stroke={theme.deprecated_white} />
      </Circle>
    </CheckboxWrapper>
  )
}

export interface SlotData {
  pair: [SupportedAssets, SupportedAssets]
  leverage: number
  direction: Mode
  pnl: number
  healthFactor: number,
  price: number
  size: number
  rewardApr: number
  supplyApr: number
  borrowApr: number
}

const PriceText = styled.div`
  text-align: left;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
`


const LiqPriceText = styled(PriceText)`
  text-align: left;
  color: #FBBF24;
  font-weight: 400;
  font-size: 12px;
`

const TimeText = styled.div`
  text-align: left;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 300;
`

const DateText = styled(TimeText)`
  font-weight: 400;
`


const AprText = styled.div<{ pos: boolean }>`
  text-align: left;
  margin-left: 4px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 200;
  ${({ pos }) => pos ? `
    color: #4ADE80;
    ` : `
  color: #EF4444;
  `}
`




export interface PositionProps extends SlotData {
  isMobile: boolean
}

export default function PositionRow(props: PositionProps) {
  const { account, chainId } = useChainIdAndAccount()


  const aprBorrow = useMemo(() => {
    return `${props.borrowApr.toFixed(props.isMobile ? 2 : 3)}%`
  }, [chainId, props.borrowApr, props.isMobile])

  const aprSupply = useMemo(() => {
    return `${props.supplyApr.toFixed(props.isMobile ? 2 : 3)}%`
  }, [chainId, props.supplyApr, props.isMobile])

  const aprReward = useMemo(() => {
    return `${props.rewardApr.toFixed(props.isMobile ? 2 : 3)}%`
  }, [chainId, props.rewardApr, props.isMobile])


  return (
    <PositionRowPro hasBalance={false} hasWalletBalance={false}>
      <AssetCellPro>
        <PairPosition pair={props.pair} isMobile={props.isMobile} leverage={props.leverage} direction={props.direction} />
      </AssetCellPro>
      <PnLCellPro  >
        <SimpleCol>
          <PnLCell pos={props.pnl > 0}>
            {props.pnl > 0 ? '+' : ''}{props.pnl}%
          </PnLCell>
          <PnLCellUSD pos={props.pnl > 0}>
            {props.pnl > 0 ? '+' : ''}{formatSmallGeneralUSDValue(props.pnl * props.price)}
          </PnLCellUSD>
        </SimpleCol>
      </PnLCellPro>
      <PriceCellPro  >
        <PriceText>
          {formatPriceString(String(props.price * 1.01))}
        </PriceText>
      </PriceCellPro>
      <PriceCellPro  >
        <PriceText>
          {formatPriceString(String(props.price))}
        </PriceText>
      </PriceCellPro>
      <PriceCellPro  >
        {/* <SimpleCol> */}
        {/* <LiqPriceText>
            Health:  {(Math.round(props.healthFactor * 10) / 10).toLocaleString()}
          </LiqPriceText> */}
        <LiqPriceText>
          {formatPriceString(String(props.price * 0.8))}
        </LiqPriceText>
        {/* </SimpleCol> */}
      </PriceCellPro>
      <RewardsHeaderPro hasFilter={false} isEditing={false}>
        <SimpleCol>
          <SimpelRow>
            <StyledLogo src={ovixStandalone} />
            <AprText pos>
              +{aprReward}
            </AprText>
          </SimpelRow>
          <SimpelRow>
            <StyledLogo src={TOKEN_SVGS[props.pair[props.direction === Mode.LONG ? 0 : 1]]} />
            <AprText pos>
              +{aprSupply}
            </AprText>
          </SimpelRow>
          <SimpelRow>
            <StyledLogo src={TOKEN_SVGS[props.pair[props.direction === Mode.LONG ? 1 : 0]]} />
            <AprText pos={false}>
              -{aprBorrow}
            </AprText>
          </SimpelRow>
        </SimpleCol>
      </RewardsHeaderPro>
      <TimeCellPro >
        <SimpleCol>
          <TimeText>
            {new Date(Date.now()).toLocaleTimeString()}
          </TimeText>
          <DateText>
            {td(new Date(Date.now()))}
          </DateText>
        </SimpleCol>
      </TimeCellPro>
      <CheckboxCellPro>
        <LinkOutContainer>
          <CloseButton>
            Close
          </CloseButton>
          <ExternalLinkIcon />
        </LinkOutContainer>
      </CheckboxCellPro>
    </PositionRowPro >
  )
}

const CloseButton = styled.button`
border: none;
color: ${({ theme }) => theme.textPrimary};
background: #967CC9;
width: 50px;
border-radius: 5px;
font-weight: 450;
&:hover{
  opacity: 0.6;
}
`

const td = (date: Date) => {

  return date.toLocaleDateString("en-US", { day: 'numeric' }) + "-"
    + date.toLocaleDateString("en-US", { month: 'short' }) + "-" +
    date.toLocaleDateString("en-US", { year: 'numeric' })
}

const LinkOutContainer = styled.div`
  display: flex;
  flex-direction:row;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
`
const SimpelRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`


const StyledLogo = styled.img`
  width: 15px;
  height: 15px;
`
