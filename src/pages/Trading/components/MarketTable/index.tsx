import React, { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { LendingProtocol } from 'state/1delta/actions'
import { useCurrentLendingProtocol, useGetCurrentAccount, useIsUserLoaded } from 'state/1delta/hooks'
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
import PositionRow, { SlotData } from './PositionRow'
import {
  AssetHeaderPro,
  TimeHeaderPro,
  TableContainerPro,
  TableHeaderPro,
  TableHeaderRowPro,
  PnLHeaderPro,
  PriceHeaderPro,
  CheckboxHeaderPro,
  PositionCellWithChangePro,
  PositionHeaderPro
} from 'components/Styles/tableStylesProfessional'
import { AaveInterestMode } from 'types/1delta'

const Table = styled.table`
  border-collapse: collapse;
  border-spacing: 0px;
  width: 100%;
  border: 1px solid;
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

const TableBody = styled.tbody`
`

export interface MappedSwapAmounts {
  [asset: string]: { amount: number, type: AaveInterestMode }
}

interface PositionTableProps {
  isMobile: boolean
  assetData: SlotData[]
}

export default function PositionTable({
  assetData,
  isMobile
}: PositionTableProps) {
  const { account, chainId } = useChainIdAndAccount()

  const [show, setShowData] = useState(false)

  const setShow = useCallback(() => {
    setShowData(!show)
  }, [show])

  const lendingProtocol = useCurrentLendingProtocol()
  const selectedAccount = useGetCurrentAccount(chainId)
  const userLoaded = useIsUserLoaded(lendingProtocol)
  const { handleAprFilter, handleStableAprFilter, handleLiquidityFilter, handleUserBorrowFilter, handleUnInit } = useDebtFilterHandlers(lendingProtocol)

  const relevantAccount = lendingProtocol === LendingProtocol.AAVE ? account : selectedAccount

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
  const filterState = useDebtFilterList(lendingProtocol)

  // handles change to sorted items
  // useHandleDebtFilter(lendingProtocol, assetData)

  return (
    <TableContainerPro>
      <Table>
        <TableHeaderPro>
          <TableHeaderRowPro>
            <AssetHeaderPro hasFilter={false}>
              <StyledText>
                Symbol
              </StyledText>
            </AssetHeaderPro>
            <PnLHeaderPro hasFilter onClick={handleUserBorrowFilter}>
              <SimpleRow>
                PnL
                {filterStateChevrons.filter === FilterActive.USER && (
                  <ChevronContainer>
                    {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
                  </ChevronContainer>
                )}
              </SimpleRow>
            </PnLHeaderPro>
            <PositionHeaderPro hasFilter>
              Size
            </PositionHeaderPro>
            <PriceHeaderPro hasFilter>
              Entry
            </PriceHeaderPro>
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
            assetData
              // .sort((a, b) => filterState.indexOf(a.pair[0]) - filterState.indexOf(b.assetId))
              .map((dat, i) => <PositionRow isMobile={isMobile} {...dat} key={i} />)
          }
        </TableBody>
      </Table>
    </TableContainerPro>
  )
}