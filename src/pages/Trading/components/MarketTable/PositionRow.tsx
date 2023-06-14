import { useMemo } from 'react'
import { Check } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import {
  CheckboxWrapper,
  Circle
} from 'components/Styles/tableStyles'
import {
  PairPosition
} from 'components/TokenDetail'
import {
  formatPriceString,
  formatSmallGeneralUSDValue,
  formatSmallUSDValue
} from 'utils/tableUtils/format'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { AssetCellPro, CheckboxCellPro, PnLCellPro, PositionCellPro, PositionRowPro, PriceCellPro, RewardsHeaderPro, TimeCellPro } from 'components/Styles/tableStylesProfessional'
import { SupportedAssets } from 'types/1delta'
import { Mode } from 'pages/Trading'
import { TOKEN_SVGS } from 'constants/1delta'
import { default as ovixStandalone } from 'assets/svg/logos/logo-0vix.svg'
import { ExternalLink as LinkIconFeather } from 'react-feather'
import { ExtendedSlot } from 'state/slots/hooks'
import { PNL_FLAG_ON } from './config'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

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

const ExplorerContainer = styled.div`
  width: 100%;
  height: 32px;
  font-size: 20px;
  border-radius: 8px;
  padding: 2px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const ExplorerLinkWrapper = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  cursor: pointer;

  :hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
  :active {
    opacity: ${({ theme }) => theme.opacity.click};
  }
`

const ExplorerLinkIcon = styled(LinkIconFeather)`
  height: 16px;
  width: 18px;
  margin-left: 8px;
`

const LinkIconWrapper = styled.div`
  justify-content: center;
  display: flex;
`


export function ExternalLinkIcon() {
  return (
    <LinkIconWrapper>
      <ExplorerLinkIcon />
    </LinkIconWrapper>
  )
}

function ExplorerView({ chainId, address, narrow }: { chainId: number, address: string, narrow?: boolean }) {
  if (address) {
    const explorerLink = getExplorerLink(chainId, address, ExplorerDataType.ADDRESS)
    return (
      <ExplorerContainer style={Boolean(narrow) ? { marginLeft: '-10px', width: '50px' } : {}}>
        <ExplorerLinkWrapper onClick={() => window.open(explorerLink, '_blank')}>
          <ExternalLinkIcon />
          {/* <CopyLinkIcon toCopy={explorerLink} /> */}
        </ExplorerLinkWrapper>
      </ExplorerContainer>
    )
  } else {
    return null
  }
}

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

const PositionText = styled.div`
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

export interface PositionProps extends ExtendedSlot {
  isMobile: boolean
  selectSlot: () => void
  topSep?: boolean
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
  const openInNewTab = (url) => {
    window.open(url, "_blank", "noreferrer");
  };

  return (
    <PositionRowPro hasBalance={false} hasWalletBalance={false} topSep={props?.topSep}>
      <AssetCellPro>
        <PairPosition pair={props.pair} isMobile={props.isMobile} leverage={props.leverage} direction={props.direction} />
      </AssetCellPro>
      {PNL_FLAG_ON && <PnLCellPro  >
        <SimpleCol>
          <PnLCell pos={props.pnl > 0}>
            {props.pnl > 0 ? '+' : ''}{props.pnl}%
          </PnLCell>
          <PnLCellUSD pos={props.pnl > 0}>
            {props.pnl > 0 ? '+' : ''}{formatSmallGeneralUSDValue(props.pnl * props.price)}
          </PnLCellUSD>
        </SimpleCol>
      </PnLCellPro>}
      <PositionCellPro>
        <PositionText>
          {formatSmallUSDValue(props.size)}
        </PositionText>
      </PositionCellPro>
      {/* // PRICES */}
      {PNL_FLAG_ON && <PriceCellPro  >
        <PriceText>
          {formatPriceString(String(props.price * 1.01))}
        </PriceText>
      </PriceCellPro>}
      <PriceCellPro  >
        <PriceText>
          {formatPriceString(String(props.price))}
        </PriceText>
      </PriceCellPro>
      <PriceCellPro  >
        <LiqPriceText>
          {isNaN(props.liquidationPrice) ? '-' : formatPriceString(String(props.liquidationPrice))}
        </LiqPriceText>
      </PriceCellPro>
      {/* // REWARDS */}
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
      {/* // TIME */}
      <TimeCellPro >
        <SimpleCol>
          <TimeText style={{ fontWeight: 'bold' }}>
            Open
          </TimeText>
          <TimeText>
            {new Date(props.creationTime * 1000).toLocaleTimeString()}
          </TimeText>
          <DateText>
            {td(new Date(props.creationTime * 1000))}
          </DateText>
        </SimpleCol>
      </TimeCellPro>
      {props.closeTime === 0 ? <CheckboxCellPro>
        <LinkOutContainer>
          <CloseButton onClick={props.selectSlot}>
            Close
          </CloseButton>
          <ExplorerView address={props.slot} chainId={chainId} />
        </LinkOutContainer>
      </CheckboxCellPro> : <CheckboxCellPro >
        <SimpleCol style={{ marginLeft: '-40px' }}>
          <TimeText style={{ fontWeight: 'bold' }}>
            Close
          </TimeText>
          <TimeText>
            {new Date(props.closeTime * 1000).toLocaleTimeString()}
          </TimeText>
          <DateText>
            {td(new Date(props.closeTime * 1000))}
          </DateText>
        </SimpleCol>
        <ExplorerView address={props.slot} chainId={chainId} narrow />
      </CheckboxCellPro>}
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
  cursor: pointer;
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
