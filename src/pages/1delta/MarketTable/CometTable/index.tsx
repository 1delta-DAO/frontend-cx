import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
  useHandleDebtFilter,
  useInitializeDebtFilter
} from 'state/tableFilter/hooks'
import styled from 'styled-components/macro'
import { SupportedAssets } from 'types/1delta'
import {
  AssetHeader,
  BorrowAprHeader,
  CheckboxHeader,
  DebtHeader,
  DebtTableHeaderRow,
  LiquidityHeader,
  SubTableContainer,
  Table,
  TableContainer,
  TableHeader,
} from 'components/Styles/tableStyles'
import {
  Filter,
  FilterActive,
} from 'utils/tableUtils/filters'
import CometBorrowRow from './CometRow'
import { BorrowSeparator, TopBorrowSeparator } from 'components/Styles/Separator'



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
white-space:nowrap;
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
text-align: center;  
`};
`

const TableBody = styled.tbody``

interface MarketTableBorrowProps {
  chainId: number
  userBorrow: number
  userBorrowUsd: number
  userBorrowStable: number
  userBorrowStableUsd: number
  liquidity: number
  liquidityUsd: number
  borrowApr: number
  hasStable: boolean
  borrowAprStable: number
  price: number
  assetId: SupportedAssets
  isCheckEnabled: boolean
  borrowEnabled: boolean
  hasBorrowPosition: boolean
  onCheckMarkToggle: () => void
  // collateral 
  apr: number;
  totalSupply: number;
  totalSupplyUsd: number;
  userBalance: number;
  userBalanceUsd: number;
  hasPosition: boolean;
  collateralEnabled: boolean;
  walletBalance: number
  collateralFactor: number
}


interface MarketTabProps {
  isMobile: boolean
  isEditing?: boolean
  assetData: MarketTableBorrowProps[]
  hasBorrow: boolean
}

export default function CometTableColumn({
  isEditing,
  isMobile,
  hasBorrow,
  assetData
}: MarketTabProps) {
  const { account, chainId } = useChainIdAndAccount()

  const [show, setShowData] = useState(false)

  const setShow = useCallback(() => {
    setShowData(!show)
  }, [show])


  const [showBorrow, setShowBorrowData] = useState(true)

  const setShowBorrow = useCallback(() => {
    setShowBorrowData(!showBorrow)
  }, [showBorrow])



  const lendingProtocol = useCurrentLendingProtocol()
  const selectedAccount = useGetCurrentAccount(chainId)
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
  useHandleDebtFilter(lendingProtocol, assetData)

  const filteredData = useMemo(() => assetData
    .sort((a, b) => filterState.indexOf(a.assetId) - filterState.indexOf(b.assetId)),
    [assetData, filterState]
  )

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <DebtTableHeaderRow>
            {isEditing && (
              <CheckboxHeader hasFilter={false} isEditing>
                <StyledText>
                  Select
                </StyledText>
              </CheckboxHeader>
            )}
            <AssetHeader hasFilter={false}>
              <StyledText>
                Asset
              </StyledText>
            </AssetHeader>
            <LiquidityHeader hasFilter onClick={handleLiquidityFilter}>
              <SimpleRow>
                <StyledText>
                  Max Leverage
                </StyledText>
                {filterStateChevrons.filter === FilterActive.TOTAL && (
                  <ChevronContainer>
                    {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
                  </ChevronContainer>
                )}
              </SimpleRow>
            </LiquidityHeader>
            <HeaderYieldItem
              filterStateChevrons={filterStateChevrons}
              protocol={lendingProtocol}
              handleAprFilter={handleAprFilter}
              handleStableAprFilter={handleStableAprFilter}
            />
            {relevantAccount && (
              <DebtHeader hasFilter onClick={handleUserBorrowFilter}>
                <SimpleRow>
                  Deposits
                  {filterStateChevrons.filter === FilterActive.USER && (
                    <ChevronContainer>
                      {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
                    </ChevronContainer>
                  )}
                </SimpleRow>
              </DebtHeader>
            )}
            <LiquidityHeader hasFilter onClick={handleLiquidityFilter}>
              <SimpleRow>
                Collateral
                {filterStateChevrons.filter === FilterActive.TOTAL && (
                  <ChevronContainer>
                    {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
                  </ChevronContainer>
                )}
              </SimpleRow>
            </LiquidityHeader>
          </DebtTableHeaderRow>
        </TableHeader>
      </Table>
      {
        // !hasBorrow && 
        <Table>
          <TableBody>
            {
              filteredData
                .map((dat, i) => <CometBorrowRow isEditing={isEditing} isMobile={isMobile} {...dat} key={i} />)
            }
          </TableBody>
        </Table>}
      {/* {hasBorrow && <TopBorrowSeparator hasPosition={hasBorrow} show={showBorrow} setShow={setShowBorrow} />}
      <SubTableContainer collapsed={!(showBorrow && hasBorrow)}>
        {hasBorrow && <Table>
          <TableBody>
            {showBorrow && (

              filteredData.filter(x => x.borrowEnabled && x.hasBorrowPosition)
                .map((dat, i) => <CometBorrowRow isEditing={isEditing} isMobile={isMobile} {...dat} key={i} />)

            )}
          </TableBody>
        </Table>}
      </SubTableContainer>
      {hasBorrow && <BorrowSeparator hasPosition={hasBorrow} show={show} setShow={setShow} />}

      <SubTableContainer collapsed={!(show && hasBorrow)}>
        {hasBorrow && <Table>
          <TableBody>
            {filteredData.filter(x => x.borrowEnabled && !x.hasBorrowPosition)
              .map((dat, i) => <CometBorrowRow isEditing={isEditing} isMobile={isMobile} {...dat} key={i} />)
            }
          </TableBody>
        </Table>}
      </SubTableContainer> */}
    </TableContainer>
  )
}

interface BorrowHeaderProps {
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
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 15px;
  height: 15px;
  margin-left: 2px;
  `};
`

const ImageVariable = styled(BarChart2)`
  width: 20px;
  height: 20px;
  margin-left: 5px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 15px;
  height: 15px;
  margin-left: 2px;
  `};
`

const AprHeaderRow = styled(SimpleRow)`
`

const HeaderYieldItem = ({ filterStateChevrons, protocol, handleAprFilter, handleStableAprFilter }: BorrowHeaderProps) => {
  const isAave = protocol === LendingProtocol.AAVE
  return (
    <BorrowAprHeader hasFilter onClick={isAave ? () => null : handleAprFilter}>
      <AprHeaderRow>
        APR
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
      </AprHeaderRow>
    </BorrowAprHeader>
  )
}