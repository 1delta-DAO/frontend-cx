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

  // collateral data

  apr: number
  totalSupply: number
  totalSupplyUsd: number
  collateralEnabled: boolean
  userBalance: number
  userBalanceUsd: number
  collateralFactor: number
  onCheckMarkToggle: () => void
}

export default function CometRow(props: MarketTableBorrowProps) {
  const { account, chainId } = useChainIdAndAccount()

  const aprSupply = useMemo(() => {
    if (props.apr === 0) return '-'
    return `${props.apr.toLocaleString()}%`
  }, [chainId, props.apr])

  const hasAccount = Boolean(account)

  const leverage = useMemo(() => {
    return `${(1 / (1 - props.collateralFactor)).toLocaleString()}x`
  }, [chainId, props.apr])


  return (
    <RowWithDebt hasBalance={false}>
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
        <span>{`${leverage}`}</span>
      </BorrowAprCell>
      <BorrowAprCell>
        <span>{`${aprSupply}`}</span>
      </BorrowAprCell>
      {account && (
        <BorrowCell>
          <SupplyBox>
            <SingleValueBox>{formatSmallValue(props.userBalance)}</SingleValueBox>
            <USDValueBox>{formatSmallUSDValue(props.userBalanceUsd)}</USDValueBox>
          </SupplyBox>
        </BorrowCell>
      )}
      <LiquidityCell>
        <SupplyBox>
          <SingleValueBox>{formatAbbreviatedNumber(props.totalSupply)}</SingleValueBox>
          <USDValueBox>{formatAbbreviatedPrice(props.totalSupplyUsd)}</USDValueBox>
        </SupplyBox>
      </LiquidityCell>
    </RowWithDebt>
  )
}
