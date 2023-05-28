import React, { useCallback, useEffect, useState } from 'react'
import { Anchor, BarChart2, ChevronDown, ChevronUp } from 'react-feather'
import { LendingProtocol } from 'state/1delta/actions'
import { useCurrentLendingProtocol, useGetCurrentAccount, useIsUserLoaded } from 'state/1delta/hooks'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { useAppDispatch } from 'state/hooks'
import { setFilterDebt } from 'state/tableFilter/actions'
import {
  useDebtFilterHandlers,
  useDebtFilterList,
  useDebtFilterSetting,
  useInitializeDebtFilter
} from 'state/tableFilter/hooks'
import styled from 'styled-components/macro'
import {
  Filter,
  FilterActive,
} from 'utils/tableUtils/filters'
import { PreparedAssetData } from 'hooks/asset/useAssetData'
import PositionRow from './PositionRow'
import { AssetHeaderPro, BorrowAprHeaderPro, PositionHeaderPro, TableContainerPro, TableHeaderPro, TableHeaderRowPro } from 'components/Styles/tableStylesProfessional'
import { AaveInterestMode, SupportedAssets } from 'types/1delta'

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
  assetData: PreparedAssetData[]
  tradeImpact: MappedSwapAmounts
}

export default function PositionTable({
  assetData,
  isMobile,
  tradeImpact
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

  useInitializeDebtFilter(lendingProtocol, assetData.map(x => x.assetId))

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
                Asset
              </StyledText>
            </AssetHeaderPro>
            <PositionHeaderPro hasFilter onClick={handleUserBorrowFilter}>
              <SimpleRow>
                Position
                {filterStateChevrons.filter === FilterActive.USER && (
                  <ChevronContainer>
                    {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
                  </ChevronContainer>
                )}
              </SimpleRow>
            </PositionHeaderPro>
            <PositionHeaderPro hasFilter onClick={handleUserBorrowFilter}>
              <SimpleRow>
                Position($)
                {filterStateChevrons.filter === FilterActive.USER && (
                  <ChevronContainer>
                    {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
                  </ChevronContainer>
                )}
              </SimpleRow>
            </PositionHeaderPro>
            <HeaderYieldItem
              filterStateChevrons={filterStateChevrons}
              protocol={lendingProtocol}
              handleAprFilter={handleAprFilter}
              handleStableAprFilter={handleStableAprFilter}
            />
          </TableHeaderRowPro>
        </TableHeaderPro>
        <TableBody>
          {
            assetData.filter(x => ((x.hasPosition || x.hasBorrowPosition) && Object.keys(tradeImpact).includes(x.assetId)))
              .sort((a, b) => filterState.indexOf(a.assetId) - filterState.indexOf(b.assetId))
              .map((dat, i) => <PositionRow isMobile={isMobile} {...dat} key={i} lendingProtocol={lendingProtocol} change={tradeImpact[dat.assetId]} />)
          }
          {
            assetData.filter(x => (x.hasPosition || x.hasBorrowPosition) && !Object.keys(tradeImpact).includes(x.assetId))
              .sort((a, b) => filterState.indexOf(a.assetId) - filterState.indexOf(b.assetId))
              .map((dat, i) => <PositionRow isMobile={isMobile} {...dat} key={i} lendingProtocol={lendingProtocol} change={tradeImpact[dat.assetId]} />)
          }

        </TableBody>
      </Table>
    </TableContainerPro>
  )
}

interface YieldHeaderProps {
  filterStateChevrons: {
    filter: FilterActive;
    mode: Filter;
  }
  protocol: LendingProtocol
  handleAprFilter: () => any
  handleStableAprFilter: () => any
}



const ImageStable = styled(Anchor)`
  width: 20px;
  height: 20px;
  margin-left: 5px;
`

const ImageVariable = styled(BarChart2)`
  width: 20px;
  height: 20px;
  margin-left: 5px;
`


const HeaderYieldItem = ({ filterStateChevrons, protocol, handleAprFilter, handleStableAprFilter }: YieldHeaderProps) => {
  const isAave = protocol === LendingProtocol.AAVE
  return (
    <BorrowAprHeaderPro hasFilter onClick={isAave ? () => null : handleAprFilter}>
      <SimpleRow>
        Apr
        {isAave && <>{' '}
          <ImageVariable onClick={handleAprFilter}
            style={{
              strokeWidth: `${filterStateChevrons.filter === FilterActive.APR ? 2 : 1}px`,
            }}
          /> /
          <ImageStable onClick={handleStableAprFilter}
            style={{
              strokeWidth: `${filterStateChevrons.filter === FilterActive.APR_STABLE ? 2 : 1}px`,
            }}
          />
        </>}
        {(filterStateChevrons.filter === FilterActive.APR || filterStateChevrons.filter === FilterActive.APR_STABLE) && (
          <ChevronContainer>
            {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
          </ChevronContainer>
        )}
      </SimpleRow>
    </BorrowAprHeaderPro>
  )
}