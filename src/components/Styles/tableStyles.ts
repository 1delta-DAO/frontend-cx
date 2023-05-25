import styled from 'styled-components/macro'
import {
  APR_CELL_WIDTH,
  ASSET_CELL_WIDTH,
  BORROW_APR_CELL_WIDTH,
  BORROW_CELL_WIDTH,
  COLLATERAL_SWITCH_CELL_WIDTH,
  DEPOSIT_CELL_WIDTH,
  LIQUIDITY_CELL_WIDTH,
  SELECT_CELL_WIDTH,
  TOTAL_CELL_WIDTH,
  WALLET_CELL_WIDTH,
  APR_CELL_WIDTH_MOBILE,
  ASSET_CELL_WIDTH_MOBILE,
  BORROW_APR_CELL_WIDTH_MOBILE,
  BORROW_CELL_WIDTH_MOBILE,
  COLLATERAL_SWITCH_CELL_WIDTH_MOBILE,
  DEPOSIT_CELL_WIDTH_MOBILE,
  LIQUIDITY_CELL_WIDTH_MOBILE,
  SELECT_CELL_WIDTH_MOBILE,
  TOTAL_CELL_WIDTH_MOBILE,
  WALLET_CELL_WIDTH_MOBILE
} from './cellSizes'

export const Row = styled.tr`
  box-shadow: ${({ theme }) => theme.shadow1};
  background: ${({ theme }) => theme.deprecated_bg2};
  width: 100%;
  margin: 0px;
`

export const RowWithBalance = styled.tr<{ hasBalance: boolean, hasWalletBalance: boolean }>`
  box-shadow: ${({ theme }) => theme.shadow1};
  background: ${({ theme, hasBalance, hasWalletBalance }) =>
    hasBalance
      ? `rgba(0, 255, 0, 0.1)` :
      hasWalletBalance ? 'rgba(0, 0, 255, 0.1)'
        : theme.deprecated_bg2};
  width: 100%;
  margin: 0px;
  display: flex;
  justify-content: space-between;
`


export const RowWithDebt = styled.tr<{ hasBalance: boolean }>`
  box-shadow: ${({ theme }) => theme.shadow1};
  background: ${({ theme, hasBalance }) =>
    hasBalance
      ? `rgba(255, 0, 0, 0.1)`
      : theme.deprecated_bg2};
  width: 100%;
  margin: 0px;
  display: flex;
  justify-content: space-between;
`


export const Cell = styled.td`
  border-collapse: separate;
  &:first-child {
    padding-left: 10px;
  }
  &:last-child {
    padding-right: 10px;
  }
  min-width: 60px;
  height: 45px;
`

// cell layouts


// collateral
export const CheckboxCell = styled(Cell)`
  width: ${SELECT_CELL_WIDTH};
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${SELECT_CELL_WIDTH_MOBILE};
  `};
`

export const AssetCell = styled(Cell)`
  width: ${ASSET_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${ASSET_CELL_WIDTH_MOBILE};
  `};
`

export const TotalCell = styled(Cell)`
  width: ${TOTAL_CELL_WIDTH};
  display: flex;
  align-items: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${TOTAL_CELL_WIDTH_MOBILE};
  `};
`

export const LiquidityCell = styled(Cell)`
  width: ${LIQUIDITY_CELL_WIDTH};
  display: flex;
  align-items: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${LIQUIDITY_CELL_WIDTH_MOBILE};
  `};
`

export const DepositCell = styled(Cell)`
  width: ${DEPOSIT_CELL_WIDTH};
  display: flex;
  align-items: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${DEPOSIT_CELL_WIDTH_MOBILE};
  `};
`

export const AprCell = styled(Cell)`
  width: ${APR_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 5px;
  font-size: 14px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${APR_CELL_WIDTH_MOBILE};
  `};
`


export const CollateralSwitchCell = styled(Cell)`
  width: ${COLLATERAL_SWITCH_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${COLLATERAL_SWITCH_CELL_WIDTH_MOBILE};
  `};
`

// debt

export const BorrowAprCell = styled(Cell)`
  width: ${BORROW_APR_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${BORROW_APR_CELL_WIDTH_MOBILE};
  `};
`

export const BorrowCell = styled(Cell)`
  width: ${BORROW_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${BORROW_CELL_WIDTH_MOBILE};
  `};
`

export const WalletCell = styled(Cell)`
  width: ${WALLET_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${WALLET_CELL_WIDTH_MOBILE};
  `};
`

export const LargeAprCell = styled(Cell)`
  width: ${BORROW_APR_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${BORROW_APR_CELL_WIDTH_MOBILE};
  `};
`


export const YieldBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: space-between;
  width: 80px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  width: 60px;
  `};
`

export const BorrowYieldBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
  width: 170px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  width: 60px;
  `};
`

export const SingleYieldBox = styled.div`
  text-justify: center;
  align-items: center;
  width: 50px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
font-size: 15px;
`};
`

export const SupplyBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
  width: 70px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  font-size: 12px;
  width: 70px;
  `};
`

export const WalletRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 70px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  font-size: 12px;
  width: 70px;
  `};
`


export const SingleValueBox = styled.div`
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
font-size: 15px;
`};
`


export const WalletValueBox = styled.div`
  margin-left: 5px;
  font-size: 12px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  font-size: 12px;
  `};
`


export const CheckboxBox = styled.div`
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
 padding-right: 0px;
`};
`

export const USDValueBox = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.textSecondary};
`

export const BorrowBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
`
export const BorrowField = styled.div`
  display: flex;
  flex-direction: row;
  align-self: left;
  justify-content: space-between;
  align-items: space-between;
  font-size: 14px;
  max-width: 120px;
`

export const YieldRow = styled.div`
  display: flex;
  flex-direction: row;
  align-self: left;
  justify-content: space-between;
  align-items: space-between;
  font-size: 14px;
  max-width: 120px;
`

export const Circle = styled.div<{ active: boolean; isMobile: boolean }>`
  height: 26px;
  width: 26px;
  border-radius: 50%;
  transition: 100ms ease-in;
  opacity: ${({ active }) => (active ? 1 : 0)};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.accentAction};
  &:hover {
    opacity: ${({ active, isMobile }) => (active ? 1 : isMobile ? 0 : 0.5)};
  }
`

export const CheckboxWrapper = styled.div`
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.accentActionSoft};
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 100ms ease-in;
  &:hover {
    border: 1px solid ${({ theme }) => theme.accentAction};
    cursor: pointer;
  }
`
export const ToggleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

export const TableContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  border-radius: 1em;
`

export const SubTableContainer = styled.div<{ collapsed: boolean }>`
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  max-height: ${({ collapsed }) => (collapsed ? '0px;' : '800px;')}
`

export const TableHeaderItem = styled.th<{ isEditing?: boolean; hasFilter: boolean }>`
  color: ${({ theme }) => theme.textSecondary};
  ${({ hasFilter }) => (hasFilter ? 'cursor: pointer;' : '')}
  font-weight: 400;
  text-align: left;
  padding: 10px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  display: flex;
  align-items: center;
  `};
`

export const Table = styled.table`
  border-spacing: 0 0em;
  width: 100%;
`
export const TableHeader = styled.thead``

export const TableHeaderRow = styled.tr`
  display: flex;
  justify-content: space-between;
  background: ${({ theme }) => theme.deprecated_bg2};
  &:last-child {
    padding-right: 10px;
  }
  &:first-child {

  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  font-size: 12px;
  height: 25px;
  `};
`

export const DebtTableHeaderRow = styled.tr`
  display: flex;
  justify-content: space-between;
  background: ${({ theme }) => theme.deprecated_bg2};
  &:last-child {
    padding-right: 10px;
  }
  &:first-child {
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  font-size: 12px;
  height: 25px;
  `};
`


// header components - same widths as cells

export const CheckboxHeader = styled(TableHeaderItem)`
  max-width: 100px;
  width: ${SELECT_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${SELECT_CELL_WIDTH_MOBILE};
  `};
`

export const AssetHeader = styled(TableHeaderItem)`
  width: ${ASSET_CELL_WIDTH};
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${SELECT_CELL_WIDTH_MOBILE};
  `};
`

// collateral 

export const AprHeader = styled(TableHeaderItem)`
  width: ${APR_CELL_WIDTH};
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${APR_CELL_WIDTH_MOBILE};
  `};
`

export const TotalsHeader = styled(TableHeaderItem)`
  width: ${TOTAL_CELL_WIDTH};
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${TOTAL_CELL_WIDTH_MOBILE};
  `};
`

export const DepositHeader = styled(TableHeaderItem)`
  width: ${DEPOSIT_CELL_WIDTH};
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${DEPOSIT_CELL_WIDTH_MOBILE};
  `};
`

export const WalletHeader = styled(TableHeaderItem)`
  width: ${WALLET_CELL_WIDTH};
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${WALLET_CELL_WIDTH_MOBILE};
  `};
`

export const CollateralSwitchHeader = styled(TableHeaderItem)`
  width: ${COLLATERAL_SWITCH_CELL_WIDTH};
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${COLLATERAL_SWITCH_CELL_WIDTH_MOBILE};
  `};
`


// debt

export const LiquidityHeader = styled(TableHeaderItem)`
  width: ${LIQUIDITY_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${LIQUIDITY_CELL_WIDTH_MOBILE};
  `};
`

export const BorrowAprHeader = styled(TableHeaderItem)`
  width: ${BORROW_APR_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${BORROW_APR_CELL_WIDTH_MOBILE};
  `};
`

export const DebtHeader = styled(TableHeaderItem)`
  width: ${BORROW_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${BORROW_CELL_WIDTH_MOBILE};
  `};
`
