import { useMemo } from 'react'
import { Anchor, BarChart2, Check } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import { SupportedAssets } from 'types/1delta'
import {
  AssetCell, BorrowAprCell,
  BorrowBox,
  BorrowCell,
  BorrowField,
  BorrowYieldBox,
  CheckboxBox,
  CheckboxCell,
  CheckboxWrapper,
  Circle,
  LiquidityCell,
  RowWithDebt,
  SingleValueBox,
  USDValueBox,
  YieldRow
} from 'components/Styles/tableStyles'
import { AnimatedTokenIcon } from 'pages/1delta/components/TokenDetail'
import { formatAbbreviatedNumber, formatAbbreviatedPrice, formatSmallValue } from 'utils/tableUtils/format'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { MouseoverTooltip } from 'components/Tooltip'

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

const ResponsiveCheck = styled(Check)`
`

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

export interface MarketTableBorrowProps {
  chainId: number
  isMobile: boolean
  userBorrow: number
  userBorrowUsd: number
  userBorrowStable: number
  userBorrowStableUsd: number
  hasBorrowPosition: boolean
  liquidity: number
  liquidityUsd: number
  borrowApr: number
  borrowAprStable: number
  hasStable: boolean
  price: number
  isEditing?: boolean
  assetId: SupportedAssets
  isCheckEnabled: boolean
  onCheckMarkToggle: () => void
}

export default function AaveBorrowRow(props: MarketTableBorrowProps) {
  const { account, chainId } = useChainIdAndAccount()

  const aprBorrow = useMemo(() => {
    if (!props.borrowApr) return '0%'
    return `${props.borrowApr.toFixed(props.isMobile ? 2 : 3)}%`
  }, [chainId, props.borrowApr, props.isMobile])

  const aprBorrowStable = useMemo(() => {
    if (!props.borrowAprStable) return '-'
    return `${props.borrowAprStable.toFixed(props.isMobile ? 2 : 3)}%`
  }, [chainId, props.borrowAprStable, props.isMobile])

  const hasAccount = Boolean(account)

  return (
    <RowWithDebt hasBalance={hasAccount && (props.userBorrowUsd > 0 || props.userBorrowStableUsd > 0)}>
      {props.isEditing && (
        <CheckboxCell>
          <CheckboxBox>
            <ButtonRadioChecked
              active={props.isCheckEnabled}
              onClick={props.onCheckMarkToggle}
              isMobile={props.isMobile}
            />
          </CheckboxBox>
        </CheckboxCell>
      )}
      <AssetCell>
        <AnimatedTokenIcon asset={props.assetId} isMobile={props.isMobile} />
      </AssetCell>
      <BorrowAprCell>
        <APRComp aprBorrow={aprBorrow} aprBorrowStable={aprBorrowStable} hasStable={props.hasStable} isMobile={props.isMobile} />
      </BorrowAprCell>
      {account && (
        <BorrowCell>
          <BorrowBox>
            <BorrowField>{formatSmallValue(props.userBorrow, props.isMobile)}</BorrowField>
            {props.hasStable && <BorrowField>{formatSmallValue(props.userBorrowStable, props.isMobile)}</BorrowField>}
          </BorrowBox>
        </BorrowCell>
      )}
      <LiquidityCell>
        <BorrowBox>
          <SingleValueBox>{formatAbbreviatedNumber(props.liquidity)}</SingleValueBox>
          <USDValueBox>{formatAbbreviatedPrice(props.liquidityUsd)}</USDValueBox>
        </BorrowBox>
      </LiquidityCell>
    </RowWithDebt>
  )
}

interface APRProps {
  aprBorrow: string
  isMobile: boolean
  aprBorrowStable: string
  hasStable: boolean
}

function APRComp(props: APRProps) {

  return (
    <BorrowYieldBox>
      <MouseoverTooltip
        text={
          <>
            <ImageVariable />
            {'Variable borrowing APR - will change based on market conditions.'}
          </>
        }
      >
        <YieldRow>
          {props.isMobile ?
            <ImageVariable />
            : <span>Variable:</span>}
          <span>{`${props.aprBorrow}`}</span>
        </YieldRow>
      </MouseoverTooltip >
      {props.hasStable && (
        <MouseoverTooltip
          text={
            <>
              <ImageStable />
              {'Stable APR for borrowing, usually higher than variable rates, however no fluctuations expected.'}
            </>
          }
        >
          <YieldRow>
            {props.isMobile ? <ImageStable /> : <span>Stable:</span>}
            <span>{`${props.aprBorrowStable}`}</span>
          </YieldRow>
        </MouseoverTooltip >
      )}
    </BorrowYieldBox>
  )
}