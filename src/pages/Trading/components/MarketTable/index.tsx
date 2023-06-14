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
  assetData: ExtendedSlot[]
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
            assetData.filter(d => d.closeTime === 0)
              .map((dat, i) => <PositionRow isMobile={isMobile} {...dat} key={i} />)
          }
        </TableBody>
      </Table>
    </TableContainerPro>
  )
}