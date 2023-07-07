import { center } from 'nft/css/common.css'
import styled from 'styled-components/macro'
import {
  PROFESSIONAL_APR_CELL_WIDTH as PROFESSIONAL_REWARDS_CELL_WIDTH,
  PROFESSIONAL_ASSET_CELL_WIDTH,
  PROFESSIONAL_TIME_CELL_WIDTH,
  PROFESSIONAL_PRICE_CELL_WIDTH,
  PROFESSIONAL_COLLATERAL_SWITCH_CELL_WIDTH as PROFESSIONAL_PNL_CELL_WIDTH,
  PROFESSIONAL_POSITION_CELL_WIDTH,
  PROFESSIONAL_LIQUIDITY_CELL_WIDTH,
  PROFESSIONAL_SELECT_CELL_WIDTH,
  PROFESSIONAL_TOTAL_CELL_WIDTH,
  PROFESSIONAL_WALLET_CELL_WIDTH,
  PROFESSIONAL_APR_CELL_WIDTH_MOBILE as PROFESSIONAL_REWARDS_CELL_WIDTH_MOBILE,
  PROFESSIONAL_TIME_CELL_WIDTH_MOBILE,
  PROFESSIONAL_PRICE_CELL_WIDTH_MOBILE,
  PROFESSIONAL_COLLATERAL_SWITCH_CELL_WIDTH_MOBILE as PROFESSIONAL_PNL_CELL_WIDTH_MOBILE,
  PROFESSIONAL_POSITION_CELL_WIDTH_MOBILE,
  PROFESSIONAL_LIQUIDITY_CELL_WIDTH_MOBILE,
  PROFESSIONAL_SELECT_CELL_WIDTH_MOBILE,
  PROFESSIONAL_TOTAL_CELL_WIDTH_MOBILE,
  PROFESSIONAL_WALLET_CELL_WIDTH_MOBILE,
  PROFESSIONAL_POSITION_EXPANDED_CELL_WIDTH
} from './cellSizes'

export const Row = styled.tr`
  box-shadow: ${({ theme }) => theme.shadow1};
  background-color: ${({ theme }) => theme.deprecated_bg0};
  width: 100%;
  margin: 0px;
`

export const PositionRowPro = styled.tr<{ hasBalance: boolean, topSep?: boolean }>`
  box-shadow: ${({ theme }) => theme.shadow1};
  background: ${({ theme, hasBalance }) =>
    hasBalance
      ? `#0C0F12` : '#13171B'};
  width: 100%;
  margin: 0px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid  ${({ theme }) => theme.backgroundOutline};
  ${({ topSep }) => !Boolean(topSep) ? '' : `
    &:first-child {
  border-top: none;
    }
  
  `}
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


export const CellPro = styled.td`
  border-collapse: separate;
  &:first-child {
    padding-left: 10px;
  }
  &:last-child {
    padding-right: 10px;
  }
  min-width: 60px;
`

// cellPro layouts


// collateral

export const TotalCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_TOTAL_CELL_WIDTH};
  display: flex;
  align-items: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_TOTAL_CELL_WIDTH_MOBILE};
  `};
`

export const PositionCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_POSITION_CELL_WIDTH};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_POSITION_CELL_WIDTH_MOBILE};
  `};
`

export const PositionCellWithChangePro = styled(CellPro)`
  width: ${PROFESSIONAL_POSITION_CELL_WIDTH};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_POSITION_CELL_WIDTH_MOBILE};
  `};
`


export const AprCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_REWARDS_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  font-size: 14px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_REWARDS_CELL_WIDTH_MOBILE};
  `};
`


export const CollateralSwitchCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_PNL_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_PNL_CELL_WIDTH_MOBILE};
  `};
`

// debt

export const BorrowAprCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_TIME_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_TIME_CELL_WIDTH_MOBILE};
  `};
`

export const BorrowCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_PRICE_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_PRICE_CELL_WIDTH_MOBILE};
  `};
`

export const WalletCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_WALLET_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_WALLET_CELL_WIDTH_MOBILE};
  `};
`

export const LargeAprCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_TIME_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_TIME_CELL_WIDTH_MOBILE};
  `};
`


export const YieldBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
  width: 150px;
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

export const TableContainerPro = styled.div`
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
export const TableHeaderPro = styled.thead``

export const TableHeaderRowPro = styled.tr`
  display: flex;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.deprecated_bg2};
  &:last-child {
    padding-right: -10px;
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
  background-color: ${({ theme }) => theme.deprecated_bg0};
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


// headerPro components - same widths as cells

export const CheckboxHeaderPro = styled(TableHeaderItem)`
  width: ${PROFESSIONAL_SELECT_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_SELECT_CELL_WIDTH_MOBILE};
  `};
`

export const AssetHeaderPro = styled(TableHeaderItem)`
  width: ${PROFESSIONAL_ASSET_CELL_WIDTH};
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_SELECT_CELL_WIDTH_MOBILE};
  `};
`

export const RewardsHeaderPro = styled(TableHeaderItem)`
display: flex;
flex-direction: row;
align-items: center;
justify-content: flex-start ;
  width: ${PROFESSIONAL_REWARDS_CELL_WIDTH};
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_REWARDS_CELL_WIDTH_MOBILE};
  `};
`

export const LiquidityHeaderPro = styled(TableHeaderItem)`
  width: ${PROFESSIONAL_LIQUIDITY_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_LIQUIDITY_CELL_WIDTH_MOBILE};
  `};
`

export const TimeHeaderPro = styled(TableHeaderItem)`
  width: ${PROFESSIONAL_TIME_CELL_WIDTH};
  display: flex;
  text-align: left;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_TIME_CELL_WIDTH_MOBILE};
  `};
`

export const PriceHeaderPro = styled(TableHeaderItem)`
  text-align: left;
  width: ${PROFESSIONAL_PRICE_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_PRICE_CELL_WIDTH_MOBILE};
  `};
`

export const PositionHeaderPro = styled(TableHeaderItem)`
  text-align: left;
  width: ${PROFESSIONAL_POSITION_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_POSITION_CELL_WIDTH_MOBILE};
  `};
`


export const PnLHeaderPro = styled(TableHeaderItem)`
  width: ${PROFESSIONAL_PNL_CELL_WIDTH};
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_PNL_CELL_WIDTH_MOBILE};
  `};
`


export const CheckboxCellPro = styled(CellPro)`
  display: flex;
  flex-direction:row;
  align-items: center;
  justify-content: center;
  width: ${PROFESSIONAL_SELECT_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_SELECT_CELL_WIDTH_MOBILE};
  `};
`

export const AssetCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_ASSET_CELL_WIDTH};
  display: flex;
  flex-direction: column;
  justify-content: center;
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_SELECT_CELL_WIDTH_MOBILE};
  `};
`

export const RewardsCellPro = styled(CellPro)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: ${PROFESSIONAL_REWARDS_CELL_WIDTH};
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_REWARDS_CELL_WIDTH_MOBILE};
  `};
`

export const LiquidityCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_LIQUIDITY_CELL_WIDTH};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_LIQUIDITY_CELL_WIDTH_MOBILE};
  `};
`

export const TimeCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_TIME_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_TIME_CELL_WIDTH_MOBILE};
  `};
`

export const PriceCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_PRICE_CELL_WIDTH};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_PRICE_CELL_WIDTH_MOBILE};
  `};
`

export const PnLCellPro = styled(CellPro)`
  width: ${PROFESSIONAL_PNL_CELL_WIDTH};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: ${PROFESSIONAL_PNL_CELL_WIDTH_MOBILE};
  `};
`