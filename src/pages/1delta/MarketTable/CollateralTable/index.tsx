
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { LendingProtocol } from 'state/1delta/actions'
import { useCurrentLendingProtocol, useGetCurrentAccount, useIsUserLoaded } from 'state/1delta/hooks'
import { DeltaState } from 'state/1delta/reducer'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import { useAppDispatch } from 'state/hooks'
import { setFilterCollateral } from 'state/tableFilter/actions'
import {
  useCollateralFilterHandlers,
  useCollateralFilterList,
  useCollateralFilterSetting,
  useHandleCollateralFilter,
  useInitializeCollateralFilter
} from 'state/tableFilter/hooks'
import styled from 'styled-components/macro'
import { Asset, SupportedAssets } from 'types/1delta'
import {
  AprHeader,
  AssetHeader,
  CheckboxHeader,
  CollateralSwitchHeader,
  DepositHeader,
  SubTableContainer,
  Table,
  TableContainer,
  TableHeader,
  TableHeaderRow,
  TotalsHeader,
  WalletHeader
} from 'components/Styles/tableStyles'
import {
  Filter,
  FilterActive,
} from 'utils/tableUtils/filters'
import AaveCollateralRow from './AaveCollateralRow'
import CompoundCollateralRow from './CompoundCollateralRow'
import { TopSeparator, Separator, WalletBalanceSeparator } from 'components/Styles/Separator'



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

const SimpleRow = styled.div<{ width: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: ${({ width }) => width};
`

const StyledText = styled.div`
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
text-align: center;  
`};
`


const TableBody = styled.tbody``

interface CollateralAssetData {
  chainId: number;
  price: number;
  apr: number;
  totalSupply: number;
  totalSupplyUsd: number;
  userBalance: number;
  userBalanceUsd: number;
  hasPosition: boolean
  assetId: SupportedAssets;
  isCheckEnabled: boolean;
  onCheckMarkToggle: () => void;
  collateralEnabled: boolean;
  walletBalance: number
}

interface MarketTabProps {
  isMobile: boolean
  hasNoImplementation: boolean
  isEditing?: boolean
  assets: DeltaState['assets']
  hasPosition: boolean
  assetData: CollateralAssetData[]
}

export default function CollateralTableColumn({
  isEditing,
  isMobile,
  hasNoImplementation,
  assets,
  hasPosition,
  assetData
}: MarketTabProps) {
  const { account, chainId } = useChainIdAndAccount()
  const [show, setShowData] = useState(false)

  const setShow = useCallback(() => {
    setShowData(!show)
  }, [show])


  const [showWallet, setShowWalletData] = useState(false)

  const setShowWallet = useCallback(() => {
    setShowWalletData(!showWallet)
  }, [showWallet])


  const [showDeposit, setShowDepositData] = useState(true)

  const setShowDeposit = useCallback(() => {
    setShowDepositData(!showDeposit)
  }, [showDeposit])



  const lendingProtocol = useCurrentLendingProtocol()
  const userLoaded = useIsUserLoaded(lendingProtocol)
  const { handleAprFilter, handleUserBalanceFilter, handleTotalSupplyFilter, handleUnInit } = useCollateralFilterHandlers(lendingProtocol)

  const selectedAccount = useGetCurrentAccount(chainId)

  const relevantAccount = lendingProtocol === LendingProtocol.COMPOUND ? selectedAccount : account

  // initializes filter when account data loaded and account switches
  const [initialize, setInitialize] = useState(false)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!initialize && userLoaded && assetData.map((d) => d.price).every(b => b > 0) && relevantAccount) {
      dispatch(setFilterCollateral({ protocol: lendingProtocol, filter: FilterActive.USER, filterState: Filter.DESC }))
      setInitialize(true)
    }
  }, [relevantAccount, lendingProtocol, userLoaded, initialize])

  useInitializeCollateralFilter(lendingProtocol, assetData.map(x => x.assetId))

  useEffect(() => {
    if (relevantAccount) {
      handleUnInit()
      setInitialize(false)
    }
  }, [lendingProtocol, relevantAccount])

  const filterState = useCollateralFilterList(lendingProtocol)
  const filterStateChevrons = useCollateralFilterSetting(lendingProtocol)

  // handles change to sorted items
  useHandleCollateralFilter(lendingProtocol, assetData)


  const hasWalletBalance = assetData.some(x => x.walletBalance > 0)

  useEffect(() =>
    setShowWalletData(true),
    [hasWalletBalance]
  )

  // the data will be sorted according to the filter
  const filteredData = useMemo(() => assetData.filter(a => a.assetId !== SupportedAssets.GHO)
    .sort((a, b) => filterState.indexOf(a.assetId) - filterState.indexOf(b.assetId)),
    [assetData, filterState,])


  // only when user has wallet balance
  const showMiddle = filteredData.some(d => !d.hasPosition && d.walletBalance > 0)

  // only when user has a position or no account / is not connected
  const showTop = useMemo(() => {
    return (!hasPosition && !hasWalletBalance) || hasPosition
  }, [hasPosition, hasWalletBalance, account]
  )

  // only when account exists OR when the top is NOT shown 
  // (i.e. user not connected, user has no position) 
  const showBottom = useMemo(() => {
    return hasNoImplementation || hasWalletBalance || ((Boolean(relevantAccount)) && (hasWalletBalance || hasPosition))
  }, [relevantAccount, hasWalletBalance, hasPosition, hasNoImplementation]
  )

  const hasNothing = useMemo(() => showTop && !showMiddle && !showBottom && !hasPosition,
    [showTop, showBottom, showMiddle, hasPosition]
  )

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableHeaderRow>
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
            <AprHeader hasFilter onClick={handleAprFilter}>
              <SimpleRow width='40px'>
                APR
                {filterStateChevrons.filter === FilterActive.APR && (
                  <ChevronContainer>
                    {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
                  </ChevronContainer>
                )}
              </SimpleRow>
            </AprHeader>
            {relevantAccount && (
              <DepositHeader hasFilter onClick={handleUserBalanceFilter}>
                <SimpleRow width='80px'>
                  Supplied
                  {filterStateChevrons.filter === FilterActive.USER && (
                    <ChevronContainer>
                      {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
                    </ChevronContainer>
                  )}
                </SimpleRow>
              </DepositHeader>
            )}
            {
              account && !isMobile &&
              <WalletHeader hasFilter={false}>
                <StyledText>
                  Wallet
                </StyledText>
              </WalletHeader>
            }
            <TotalsHeader hasFilter onClick={handleTotalSupplyFilter}>
              <SimpleRow width='60px'>
                Total
                {filterStateChevrons.filter === FilterActive.TOTAL && (
                  <ChevronContainer>
                    {filterStateChevrons.mode === Filter.DESC ? <ChevronDown /> : <ChevronUp />}
                  </ChevronContainer>
                )}
              </SimpleRow>
            </TotalsHeader>
            {relevantAccount && !isEditing && (
              <CollateralSwitchHeader hasFilter={false}>Collateral</CollateralSwitchHeader>
            )}
          </TableHeaderRow>
        </TableHeader>
      </Table>
      {hasNothing && <Table>
        <TableBody>
          {lendingProtocol === LendingProtocol.AAVE &&
            filteredData
              .map((dat, i) => <AaveCollateralRow isEditing={isEditing} isMobile={isMobile} {...dat} key={i} />)}
          {lendingProtocol === LendingProtocol.COMPOUND &&
            filteredData
              .map((dat, i) => <CompoundCollateralRow isEditing={isEditing} isMobile={isMobile}{...dat} key={i} />)}

        </TableBody>
      </Table>}
      {showTop && hasPosition && account && <TopSeparator hasPosition={hasPosition} show={showDeposit} setShow={setShowDeposit} />}
      <SubTableContainer collapsed={!(showDeposit)}>
        <Table>
          <TableBody>
            {lendingProtocol === LendingProtocol.AAVE ?
              (<>
                {filteredData.filter(d => d.hasPosition)
                  .map((dat, i) => <AaveCollateralRow isEditing={isEditing} isMobile={isMobile} {...dat} key={i} />)}
              </>)
              : (<>
                {filteredData.filter(d => d.hasPosition)
                  .map((dat, i) => <CompoundCollateralRow isEditing={isEditing} isMobile={isMobile}{...dat} key={i} />)}
              </>)
            }
          </TableBody>
        </Table>
      </SubTableContainer>
      {hasWalletBalance && showMiddle && <WalletBalanceSeparator hasPosition={hasWalletBalance} show={showWallet} setShow={setShowWallet} />}
      <SubTableContainer collapsed={!(showWallet && showMiddle && hasWalletBalance)}>
        {showWallet && hasWalletBalance && <Table>
          <TableBody>
            {
              lendingProtocol === LendingProtocol.AAVE ?
                filteredData.filter(d => !d.hasPosition && d.walletBalance > 0)
                  .map((dat, i) => <AaveCollateralRow isEditing={isEditing} isMobile={isMobile} {...dat} key={i} />) :
                filteredData.filter(d => !d.hasPosition && d.walletBalance > 0)
                  .map((dat, i) => <CompoundCollateralRow isEditing={isEditing} isMobile={isMobile}{...dat} key={i} />)
            }
          </TableBody>
        </Table>}
      </SubTableContainer>
      {showBottom && <Separator hasPosition={hasPosition} show={show} setShow={setShow} />}
      <SubTableContainer collapsed={!(showBottom && show)}>
        {
          showBottom && <Table>
            <TableBody>
              {lendingProtocol === LendingProtocol.AAVE ?
                (<>
                  {
                    filteredData.filter(d => !d.hasPosition && d.walletBalance === 0)
                      .map((dat, i) => <AaveCollateralRow isEditing={isEditing} isMobile={isMobile} {...dat} key={i} />)
                  }
                </>)
                : (<>

                  {
                    filteredData.filter(d => !d.hasPosition && d.walletBalance === 0)
                      .map((dat, i) => <CompoundCollateralRow isEditing={isEditing} isMobile={isMobile}{...dat} key={i} />)
                  }
                </>)
              }
            </TableBody>
          </Table>
        }
      </SubTableContainer>
    </TableContainer >
  )
}
