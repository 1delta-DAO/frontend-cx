import { useMemo } from 'react'
import { Check } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import { PriceWithHist, SupportedAssets } from 'types/1delta'
import { AssetCell, BorrowAprCell, BorrowCell, Cell, CheckboxBox, CheckboxCell, CheckboxWrapper, Circle, LiquidityCell, RowWithBalance, RowWithDebt, SingleValueBox, SupplyBox, USDValueBox, YieldBox } from 'components/Styles/tableStyles'
import TokenDetail, { AnimatedTokenIcon } from 'pages/1delta/components/TokenDetail'
import { formatAbbreviatedNumber, formatAbbreviatedPrice, formatSmallUSDValue, formatSmallValue } from 'utils/tableUtils/format'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'

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

export interface MarketTableBorrowProps {
  chainId: number
  isMobile: boolean
  userBorrow: number
  userBorrowUsd: number
  liquidity: number
  liquidityUsd: number
  hasBorrowPosition: boolean
  borrowApr: number
  price: number
  isEditing?: boolean
  assetId: SupportedAssets
  isCheckEnabled: boolean
  onCheckMarkToggle: () => void
}

export default function CompoundBorrowRow(props: MarketTableBorrowProps) {
  const { account, chainId } = useChainIdAndAccount()

  const aprBorrow = useMemo(() => {
    if (!props.borrowApr) return '-'
    return `${props.borrowApr.toFixed(props.isMobile ? 2 : 3)}%`
  }, [chainId, props.borrowApr, props.isMobile])

  const hasAccount = Boolean(account)

  return (
    <RowWithDebt hasBalance={hasAccount && props.userBorrowUsd > 0}>
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
        <span>{`${aprBorrow}`}</span>
      </BorrowAprCell>
      {account && props.hasBorrowPosition && (
        <BorrowCell>
          <SupplyBox>
            <SingleValueBox>{formatSmallValue(props.userBorrow)}</SingleValueBox>
            <USDValueBox>{formatSmallUSDValue(props.userBorrowUsd)}</USDValueBox>
          </SupplyBox>
        </BorrowCell>
      )}
      <LiquidityCell>
        <SupplyBox>
          <SingleValueBox>{formatAbbreviatedNumber(props.liquidity)}</SingleValueBox>
          <USDValueBox>{formatAbbreviatedPrice(props.liquidityUsd)}</USDValueBox>
        </SupplyBox>
      </LiquidityCell>
    </RowWithDebt>
  )
}
