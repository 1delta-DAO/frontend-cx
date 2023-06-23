import React, { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { LendingProtocol } from 'state/1delta/actions'
import { useIsUserLoaded } from 'state/1delta/hooks'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { useAppDispatch } from 'state/hooks'
import { setFilterDebt } from 'state/tableFilter/actions'
import {
  useDebtFilterHandlers,
  useDebtFilterList,
  useDebtFilterSetting,
} from 'state/tableFilter/hooks'
import styled from 'styled-components/macro'
import {
  Filter,
  FilterActive,
} from 'utils/tableUtils/filters'
import PositionRow from './PositionRow'
import {
  AssetHeaderPro,
  TimeHeaderPro,
  TableContainerPro,
  TableHeaderPro,
  TableHeaderRowPro,
  PnLHeaderPro,
  PriceHeaderPro,
  CheckboxHeaderPro,
  PositionHeaderPro
} from 'components/Styles/tableStylesProfessional'
import { AaveInterestMode } from 'types/1delta'
import { ExtendedSlot } from 'state/slots/hooks'
import { PNL_FLAG_ON } from './config'
import { BaseButton } from 'components/Button'

const Table = styled.table`
  border-collapse: collapse;
  border-spacing: 0px;
  width: 100%;
  border: 1px solid;
  border-top: none;
  border-color: ${({ theme }) => theme.backgroundInteractive};
`

const ChevronContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 10px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  width: 10px;
`};
`

const SimpleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`

const StyledText = styled.div`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  text-align: center;  
  `};
`

const ConnectText = styled.div`
  width: 100%;
  padding: 10px;
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.textPrimary};
`



const ButtonRow = styled.div`
  height: 56x;
  padding: 8px;
  border-radius: 8px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  background: #0C0F12;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  border: 1px solid;
  border-bottom: none;
  border-color: ${({ theme }) => theme.backgroundInteractive};
`

export const ButtonLightBoring = styled(BaseButton) <{ redesignFlag?: boolean }>`
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentAction : theme.deprecated_primaryText1)};
  font-size: ${({ redesignFlag }) => (redesignFlag ? '20px' : '16px')};
  font-weight: ${({ redesignFlag }) => (redesignFlag ? '600' : '500')};

  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_primary5)};
      box-shadow: none;
      outline: none;
    }
  }
`

const TypeButton = styled(ButtonLightBoring) <{ selected: boolean }>`
  padding: 0px;
  border-radius: 8px;
  font-size: 14px;
  width: 140px;
  background: none;
  height: 40px;
`

const ModeSelectionCard = styled.div <{ selected: boolean }>`
    border-radius: 10px;
    width: 140px;
    height: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background: none;
  ${({ theme, selected }) =>
    selected ?
      `
    border: 1px solid ${({ theme }) => theme.backgroundInteractive};
    border-bottom: none;
    background-color: #242B33;
    font-weight: bold;
    `: `
    opacity: 0.5;
    background-color: transparent;
    `
  }
`

const HeaderText = styled.div`
 font-size: 14px;
 font-weight: 400;
`

const TableBody = styled.tbody`
`

export interface MappedSwapAmounts {
  [asset: string]: { amount: number, type: AaveInterestMode }
}

interface PositionTableProps {
  isMobile: boolean
  assetData: ExtendedSlot[]
  setShowCloseModal: () => void
  setSelectedSlot: (slot: ExtendedSlot) => void
}

export default function PositionTable({
  assetData,
  isMobile,
  setShowCloseModal,
  setSelectedSlot,
}: PositionTableProps) {
  const { account, chainId } = useChainIdAndAccount()

  const [show, setShowData] = useState(false)

  const setShow = useCallback(() => {
    setShowData(!show)
  }, [show])

  const lendingProtocol = LendingProtocol.COMPOUND
  const userLoaded = useIsUserLoaded(lendingProtocol)
  const { handleAprFilter, handleStableAprFilter, handleLiquidityFilter, handleUserBorrowFilter, handleUnInit } = useDebtFilterHandlers(lendingProtocol)

  const relevantAccount = account

  // initializes filter when account data loaded and account switches
  const [initialize, setInitialize] = useState(false)

  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!initialize && userLoaded && assetData.map((d) => d.price).every(b => b > 0) && relevantAccount) {
      dispatch(setFilterDebt({ protocol: lendingProtocol, filter: FilterActive.USER, filterState: Filter.DESC }))
      setInitialize(true)
    }
  }, [relevantAccount, lendingProtocol, userLoaded, initialize])

  // useInitializeDebtFilter(lendingProtocol, assetData.map(x => x.assetId))

  // if account changes we re-init
  useEffect(() => {
    if (relevantAccount) {
      handleUnInit()
      setInitialize(false)
    }
  }, [lendingProtocol, relevantAccount])

  const filterStateChevrons = useDebtFilterSetting(lendingProtocol)
  const [viewPositions, setViewPositions] = useState(true)
  // handles change to sorted items
  // useHandleDebtFilter(lendingProtocol, assetData)

  return (
    <TableContainerPro>
      <ButtonRow>
        <TypeButton
          onClick={() => !viewPositions && setViewPositions(true)}
          selected={viewPositions}
        >
          <ModeSelectionCard selected={viewPositions}>
            <HeaderText>
              Open Positions
            </HeaderText>
          </ModeSelectionCard>
        </TypeButton>
        <TypeButton
          onClick={() => viewPositions && setViewPositions(false)}
          selected={!viewPositions}
        >
          <ModeSelectionCard selected={!viewPositions}>
            <HeaderText>
              Trade History
            </HeaderText>
          </ModeSelectionCard>
        </TypeButton>
      </ButtonRow>
      <Table>
        <TableHeaderPro>
          <TableHeaderRowPro>
            <AssetHeaderPro hasFilter={false}>
              <StyledText>
                Symbol
              </StyledText>
            </AssetHeaderPro>
            {PNL_FLAG_ON && <PnLHeaderPro hasFilter onClick={handleUserBorrowFilter}>
              <SimpleRow>
                PnL
                {filterStateChevrons.filter === FilterActive.USER && (
                  <ChevronContainer>
                    {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
                  </ChevronContainer>
                )}
              </SimpleRow>
            </PnLHeaderPro>}
            <PositionHeaderPro hasFilter>
              Size
            </PositionHeaderPro>
            {PNL_FLAG_ON && <PriceHeaderPro hasFilter>
              Entry
            </PriceHeaderPro>}
            <PriceHeaderPro hasFilter>
              Market
            </PriceHeaderPro>
            <PriceHeaderPro hasFilter>
              Liq. Price
            </PriceHeaderPro>
            <TimeHeaderPro hasFilter>
              Rewards
            </TimeHeaderPro>
            <TimeHeaderPro hasFilter={false}>
              Time
            </TimeHeaderPro>
            <CheckboxHeaderPro hasFilter={false}>

            </CheckboxHeaderPro>
          </TableHeaderRowPro>
        </TableHeaderPro>
        <TableBody>
          {
            viewPositions && assetData.filter(d => d.closeTime === 0)
              .map((dat, i) => <PositionRow
                isMobile={isMobile}
                {...dat}
                key={i}
                selectSlot={() => {
                  setSelectedSlot(dat)
                  setShowCloseModal()
                }}
                topSep={false}
              />)
          }
          {!viewPositions && assetData.filter(d => d.closeTime > 0).length > 0 &&
            <>
              {
                assetData.filter(d => d.closeTime > 0)
                  .map((dat, i) => <PositionRow
                    isMobile={isMobile}
                    {...dat}
                    key={i}
                    selectSlot={() => {
                      setSelectedSlot(dat)
                      setShowCloseModal()
                    }}
                    topSep={true}
                  />)
              }
            </>
          }
          {
            !account && <TablRowPro >
              <ConnectText>
                <span style={{ fontWeight: 'bold' }}>
                  Connect to see your positions
                </span>
              </ConnectText>
            </TablRowPro>
          }
          {
            account && assetData.length === 0 && <TablRowPro >
              <ConnectText>
                You don’t have any open position. <span style={{ fontWeight: 'bold' }}>Kickstart your earnings by <span style={{ color: '#967CC9' }}>opening a position.</span></span>
              </ConnectText>
            </TablRowPro>
          }
        </TableBody>
      </Table>
    </TableContainerPro>
  )
}

const TablRowPro = styled.tr`
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
  border-bottom: none;
`
const SeparatorCell = styled.td`
  width: 100%;

`

const HistoryHeader = styled.div`
border-top: 1px solid  ${({ theme }) => theme.backgroundOutline};
border-bottom: none;
  color: ${({ theme }) => theme.textSecondary};
    font-weight: 400;
  text-align: left;
  padding: 10px;
`