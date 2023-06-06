import { useMemo } from 'react'
import { Anchor, ArrowRight, BarChart2, Check } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import {
  CheckboxWrapper,
  Circle,
  YieldBox
} from 'components/Styles/tableStyles'
import {
  AnimatedTokenPositionIcon
} from 'components/TokenDetail'
import {
  formatSmallGeneralUSDValue,
  formatSmallGeneralValue,
  formatSmallValue
} from 'utils/tableUtils/format'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { MouseoverTooltip } from 'components/Tooltip'

import { LendingProtocol } from 'state/1delta/actions'
import { PreparedAssetData } from 'hooks/asset/useAssetData'
import { AssetCellPro, AssetHeaderPro, PnLCellPro, PnLHeaderPro, PositionCellPro, PositionCellWithChangePro, PositionRowPro, PriceCellPro, TimeCellPro, TimeHeaderPro } from 'components/Styles/tableStylesProfessional'
import { AaveInterestMode } from 'types/1delta'


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

const SimpleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
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

export interface PositionProps extends PreparedAssetData {
  isMobile: boolean
  lendingProtocol: LendingProtocol
  change?: { amount: number, type: AaveInterestMode }
}

export default function PositionRow(props: PositionProps) {
  const { account, chainId } = useChainIdAndAccount()

  const isLong = props.hasPosition

  const aprBorrow = useMemo(() => {
    return `${props.apr.toFixed(props.isMobile ? 2 : 3)}%`
  }, [chainId, props.apr, props.isMobile])

  const aprBorrowStable = useMemo(() => {
    return `${props.borrowAprStable.toFixed(props.isMobile ? 2 : 3)}%`
  }, [chainId, props.borrowAprStable, props.isMobile])

  const aprSupply = useMemo(() => {
    return `${props.apr.toFixed(props.isMobile ? 2 : 3)}%`
  }, [chainId, props.apr, props.isMobile])

  const [hasChange, valPlusChange, valPlusChangeUsd] = useMemo(() => {
    if (!props.change || props.change.amount === 0) return [false, 0, 0]

    switch (props.change.type) {
      case AaveInterestMode.NONE: {
        return [true, props.change.amount + props.userBalance, props.change.amount * props.price + props.userBalanceUsd]
      }
      case AaveInterestMode.VARIABLE: {
        return [true, props.change.amount + props.userBorrow, props.change.amount * props.price + props.userBorrowUsd]
      }
      case AaveInterestMode.STABLE: {
        return [true, props.change.amount + props.userBorrowStable, props.change.amount * props.price + props.userBorrowStableUsd]
      }
    }
  },
    [props.price, props.change]
  )

  return (
    <PositionRowPro hasBalance={false} hasWalletBalance={false}>
      <AssetCellPro>
        <AnimatedTokenPositionIcon asset={props.assetId} isMobile={props.isMobile} />
      </AssetCellPro>
      <PnLCellPro  >
        <SimpleRow>
          PnL
        </SimpleRow>
      </PnLCellPro>
      <PriceCellPro  >
        <SimpleRow>
          Entry
        </SimpleRow>
      </PriceCellPro>
      <PriceCellPro  >
        <SimpleRow>
          Market
        </SimpleRow>
      </PriceCellPro>
      <PriceCellPro  >
        <SimpleRow>
          Liq. Price
        </SimpleRow>
      </PriceCellPro>
      <TimeCellPro >
        Time
      </TimeCellPro>
    </PositionRowPro >
  )
}

interface APRProps {
  isLong: boolean
  changeType?: AaveInterestMode | undefined
  hasChange: boolean
  aprDeposit: string
  apr: string
  aprStable: string
  hasStable: boolean
  hasVariable: boolean
}


export const YieldRow = styled.div`
  display: flex;
  flex-direction: row;
  align-self: left;
  justify-content: space-between;
  align-items: space-between;
  font-size: 14px;
  max-width: 120px;
`


function APRComp(props: APRProps) {

  const changeFlags = useMemo(() => {
    if (!props.hasChange) return [false, false, false]
    return [
      props.changeType === AaveInterestMode.NONE,
      props.changeType === AaveInterestMode.VARIABLE,
      props.changeType === AaveInterestMode.STABLE,
    ]
  },
    [props.hasChange, props.changeType]
  )

  return (
    <YieldBox>
      {(props.isLong || changeFlags[0]) && <MouseoverTooltip
        text={
          <>
            <ImageVariable />
            {'Variable deposit APR - will change based on market conditions.'}
          </>
        }
      >
        <YieldRow>

          <ImageVariable />

          <div>{`${props.aprDeposit}`}</div>
        </YieldRow>
      </MouseoverTooltip >
      }
      {(props.hasVariable || changeFlags[1]) && <MouseoverTooltip
        text={
          <>
            <ImageVariable />
            {'Variable borrowing APR - will change based on market conditions.'}
          </>
        }
      >
        <YieldRow>

          <ImageVariable />

          <div>{`${props.apr}`}</div>
        </YieldRow>
      </MouseoverTooltip >
      }
      {(props.hasStable || changeFlags[2]) && (
        <MouseoverTooltip
          text={
            <>
              <ImageStable />
              {'Stable APR for borrowing, usually higher than variable rates, however no fluctuations expected.'}
            </>
          }
        >
          <YieldRow>
            <ImageStable />
            <div>{`${props.aprStable}`}</div>
          </YieldRow>
        </MouseoverTooltip >
      )}
    </YieldBox>
  )
}

const ArrowRightIcon = styled(ArrowRight) <{ pos: boolean }>`
    color: ${({ theme, pos }) => pos ? theme.deprecated_green1 : theme.deprecated_red2};
    width: 12px;
    height: 12px;
    `


interface RowWithChangeProps {
  isMobile: boolean
  hasChange: boolean;
  positive: boolean;
  amount: number;
  newAmount: number;
}

function RowWithChange(props: RowWithChangeProps) {

  return (
    (props.hasChange ?
      <ChangeRow>
        <ValueTextMinor positive={props.positive}>
          {props.amount != 0 ? `${props.positive ? '+' : '-'}${formatSmallGeneralValue(props.amount)}` : 0}</ValueTextMinor>
        <ArrowRightIcon pos={props.amount < props.newAmount} />
        <ValueText positive={props.positive}>
          {`${props.positive ? '+' : '-'}`}{formatSmallGeneralValue(props.newAmount)}</ValueText>
      </ChangeRow>
      : props.amount !== 0 ? <ValueText positive={props.positive}>
        {props.positive ? '+' : '-'}{formatSmallGeneralValue(props.amount)}</ValueText> : null
    )
  )
}


interface RowWithChangeUsdProps {
  isMobile: boolean
  hasChange: boolean;
  positive: boolean;
  amountUsd: number;
  newAmountUsd: number;

}

function RowWithChangeUsd(props: RowWithChangeUsdProps) {
  return (
    (props.hasChange ?
      <ChangeRow>
        <ValueTextMinor positive={props.positive}>
          {props.amountUsd != 0 ? `${props.positive ? '+' : '-'}${formatSmallGeneralUSDValue(props.amountUsd)}` : 0}</ValueTextMinor>
        <ArrowRightIcon pos={props.amountUsd < props.newAmountUsd} />
        <ValueText positive={props.positive}>
          {`${props.positive ? '+' : '-'}`}{formatSmallGeneralUSDValue(Math.abs(props.newAmountUsd))}</ValueText>
      </ChangeRow>
      : props.amountUsd != 0 ? <ValueText positive={props.positive}>
        {`${props.positive ? '+' : '-'}`}{formatSmallGeneralUSDValue(props.amountUsd)}</ValueText> : null
    )
  )
}