import { ETHEREUM_CHAINS, getSupportedAssets, GREEKS, POLYGON_CHAINS, TEN } from 'constants/1delta'
import { ethers } from 'ethers'
import { safeGetToken } from 'hooks/1delta/tokens'
import { useIsMobile } from 'hooks/useIsMobile'
import { lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { LendingProtocol, set1DeltaAccount, switchLendingProtocol } from 'state/1delta/actions'
import { fetchAAVEUserReserveDataAsync } from 'state/1delta/aave/fetchAAVEUserData'
import { convertAccountArray, useDeltaState, useHasPosition } from 'state/1delta/hooks'
import { useAppDispatch } from 'state/hooks'
import { fetchChainLinkData } from 'state/oracles/fetchChainLinkData'
import { useChainLinkPrice, useOracleState } from 'state/oracles/hooks'
import styled from 'styled-components/macro'
import {
  getAssetsOnSide,
  MarginTradeType,
  MarginTradeState,
  OneDeltaTradeType,
  PositionDirection,
  PositionSides,
  SupportedAssets,
} from 'types/1delta'
import { ReactComponent as CloseIcon } from 'assets/images/x.svg'
import BorrowTableColumn from './MarketTable/BorrowTable'
import CollateralTableColumn from './MarketTable/CollateralTable'
import MarginTradeModal from 'components/SwapModal/marginTradeModal'
import AccountCreationModal from '../../components/AccountCreation/AccountCreationModal'
import AccountCreation from '../../components/AccountCreation/AccountCreation'
import { fetch1DeltaUserAccountDataAsync } from 'state/1delta/fetch1DeltaAccountData'
import { fetchCompoundAccountDataAsync } from 'state/1delta/compound/fetchCompoundAccountData'
import { useGetAccountFactoryContractWithUserProvider } from 'hooks/1delta/use1DeltaContract'
import { AAVE_CHAINIDS, AAVE_VIEW_CHAINIDS, COMPOUNDV3_CHAINIDS, COMPOUND_CHAINIDS, COMPOUND_VIEW_CHAINIDS, PREFERRED_LENDERS, SupportedChainId } from 'constants/chains'
import { useNetworkState } from 'state/globalNetwork/hooks'
import { fetchAAVEAggregatorDataAsync } from 'state/oracles/fetchAaveAggregatorData'
import FeedbackButton from 'components/Button/FeedbackButton'
import BarCard from '../../components/AccountCards/BarCard'
import BorrowCard from '../../components/AccountCards/BorrowCard'
import AccountSelectionCard from '../../components/AccountCards/AccountSelectionCard'
import LendingProtocolSelectionCard from '../../components/AccountCards/LendingProtocolSelectionCard'
import { useBaseAsset, useGetMarginTradeSelection, useHandleToggleAsset, usePosition, useSetBaseAsset, useSetPosition } from 'state/marginTradeSelection/hooks'
import { usePollLendingData } from 'hooks/polling/pollData'
import SupplyCard from 'components/AccountCards/SupplyCard'
import { PositionEditingButton } from 'components/Button/PositionEditingButtons'
import { usePrepareAssetData } from 'hooks/asset/useAssetData'
import { fetchUserBalances } from 'state/1delta/fetchAssetBalances'
import { a } from 'react-spring'
import AprCard from 'components/AccountCards/AprCard'
import MetricsCard from 'components/AccountCards/MetricsCard'
import { fetchCometReserveDataAsync } from 'state/1delta/compound-v3/fetchCometPublicData'
import CometTableColumn from './MarketTable/CometTable'
import BaseCurrencyCard from './CometCard'
import { fetchCometUserDataAsync } from 'state/1delta/compound-v3/fetchCometUserData'
import GeneralMarginTrade from './components/TradeModals/MarginTrade'
import GeneralSingleSideSwap from './components/TradeModals/SingleSide'
import GeneralMoneyMarket from './components/TradeModals/MoneyMarket'
import { useGetRiskParameters } from 'hooks/riskParameters/useRiskParameters'
import { formatEther } from 'ethers/lib/utils'

const Chart = lazy(() => import('hooks/useInstaChart'))

const ModalContainer = styled.div<{ isMobile: boolean }>`
  padding: ${({ isMobile }) => (isMobile ? '1px' : '10px')};
  padding-bottom: 21px;
  width: 100%;
  ${({ isMobile }) => (isMobile ? `
  height: 70%;
  ` : '')}
`

const AccountModalContainer = styled.div<{ isMobile: boolean }>`
  padding: ${({ isMobile }) => (isMobile ? '1px' : '10px')};
  padding-bottom: 20px;
  width: ${({ isMobile }) => (isMobile ? '100vw' : '50vw')};
`

const Close = styled.div`
  margin-top: 6px;
  padding: 5px;
  color: ${({ theme }) => theme.accentActionSoft};
  transition: 150ms ease-in;
  &:hover {
    color: ${({ theme }) => theme.hoverState};
    cursor: pointer;
  }
`

const Container = styled.div`
  width: 100vw;
`

const TopContainer = styled.div`
  position: relative;
  width: 100%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const AccountContent = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  height: 100%;
  width: 100%;
  margin-bottom: 20px;
  gap: 10px;
  max-width: 1000px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: row;
    margin-bottom: 10px;
    max-width: 99vw;
  `};
`

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  height: 100%;
  width: 100%;
  gap: 10px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
flex-direction: column;
  `};
`


const ChartContainer = styled.div`
  position: absolute;
  height:100%
`

const MarketTableSection = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
  `};

  margin-top: 5px;
`


const CometContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: row;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
  `};

  margin-top: 5px;
`

const MarketTableContainer = styled.div`
  width: 50vw;
  max-width: 600px;
  margin 10px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    width: 100%;
    margin: auto;
    max-width: unset;
    margin-bottom: 30px
  `};
`

const MarketTableTitle = styled.div`
  margin: 10px 20px 5px 20px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    margin: 10px 15px 0px 15px;
  `};
`
const MarketTableTitleText = styled.h2`
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 24px;
  font-weight: 500;
  margin: 0;
`

const TopBarContainer = styled.div<{ isBorker: boolean, connected: boolean }>`
 width: 100%;
 max-width: 900px;
 display: flex;
 flex-direction: row;
 align-items: center;
 justify-content: space-between;
 margin-bottom: 20px;
 ${({ theme, isBorker, connected }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
 flex-direction: column;
 padding: 5px;
 height: ${isBorker || !connected ? '60px' : '130px'};
 ${isBorker ? 'margin-bottom: 0px;' : ''}
`};
`


function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}


const defaultState: MarginTradeState = {
  [PositionDirection.To]: undefined,
  [PositionDirection.From]: undefined,
  isSingle: false,
  baseCurrency: SupportedAssets.USDC,
  interaction: MarginTradeType.Supply
}

export default function Home() {
  // chainId will always be a supported one
  const { connectionIsSupported, chainId, account } = useNetworkState()
  const [isEditingPosition, setEditingPosition] = useState(false)

  const setPosition = useSetPosition()
  const position = usePosition()
  const [isSwapModalVisible, setSwapModalVisible] = useState(false)
  const [isAccountModalVisible, setAccountModalVisible] = useState(false)

  const [hasNoImplementationCompound, hasNoImplementationAave, hasNoImplementationCompoundV3] = useMemo(() => [
    !COMPOUND_CHAINIDS.includes(chainId),
    !AAVE_CHAINIDS.includes(chainId),
    !COMPOUNDV3_CHAINIDS.includes(chainId)
  ]
    , [chainId])

  const [hasCompoundView, hasAaveView] = useMemo(() => [
    COMPOUND_VIEW_CHAINIDS.includes(chainId),
    AAVE_VIEW_CHAINIDS.includes(chainId)
  ]
    , [chainId])


  const deltaState = useDeltaState()
  const oracleState = useOracleState()

  const [userAccount, userAccountData] = useMemo(() => [
    deltaState?.userMeta?.[chainId]?.selectedAccountData,
    deltaState?.userMeta?.[chainId]?.accounts1Delta
  ],
    [
      chainId,
      deltaState?.userMeta,
      account
    ])


  const currentProtocol = useMemo(
    () => deltaState.userState.selectedLendingProtocol,
    [deltaState.userState.selectedLendingProtocol]
  )

  const hasNoImplementation = currentProtocol === LendingProtocol.COMPOUND ? hasNoImplementationCompound : hasNoImplementationAave

  const compoundLoadingState = useMemo(() => deltaState.loadingState.compound, [deltaState.loadingState.compound])
  const aaveLoadingState = useMemo(() => deltaState.loadingState.aave, [deltaState.loadingState.aave])
  const oracleLoadingState = useMemo(() => oracleState.loadingState, [oracleState.loadingState])

  const isPositionValid = position[PositionDirection.From] || position[PositionDirection.To]

  const handleToggleAsset = useHandleToggleAsset(position)


  const [baseMarketInteraction, setBaseMarketInteraction] = useState(false)

  const confirmPosition = () => {
    setSwapModalVisible(true)
    // set model visible
  }

  const handleSwapModelDismissed = () => {
    setSwapModalVisible(false)
    setBaseMarketInteraction(false)
  }

  const handleAccountModalDismissed = () => {
    setAccountModalVisible(false)
  }

  const handleAccountModalOpen = () => {
    setAccountModalVisible(true)
  }

  const dispatch = useAppDispatch()

  usePollLendingData(
    account,
    userAccountData,
    deltaState.loadingState,
    deltaState.userMeta,
    chainId,
    connectionIsSupported,
    aaveLoadingState,
    compoundLoadingState,
    hasAaveView,
    currentProtocol,
    oracleLoadingState
  )

  const [repeater, setRepeater] = useState(0)

  const [accountsToBeLoaded, setAccountsToBeLoaded] = useState(false)

  useEffect(() => {
    if (account) {
      if (accountsToBeLoaded && chainId !== SupportedChainId.MAINNET && userAccountData) {
        dispatch(fetch1DeltaUserAccountDataAsync({ chainId, account }))
        setAccountsToBeLoaded(false)
      }

      if (currentProtocol === LendingProtocol.AAVE)
        dispatch(
          fetchAAVEUserReserveDataAsync({
            chainId,
            account,
            assetsToQuery: getSupportedAssets(chainId, LendingProtocol.AAVE),
          })
        )

      if (chainId !== SupportedChainId.MAINNET)
        if (currentProtocol === LendingProtocol.COMPOUND)
          dispatch(
            fetchCompoundAccountDataAsync({
              chainId,
              accounts: convertAccountArray(userAccountData),
              assetIds: getSupportedAssets(chainId, LendingProtocol.COMPOUND),
            })
          )

      if (chainId === SupportedChainId.POLYGON_MUMBAI)
        if (currentProtocol === LendingProtocol.COMPOUNDV3)
          dispatch(
            fetchCometUserDataAsync({
              chainId,
              account
            })
          )
    }

    if (chainId === SupportedChainId.POLYGON_MUMBAI)
      dispatch(
        fetchCometReserveDataAsync({
          chainId
        })
      )

    // fetch oracle data
    dispatch(fetchChainLinkData({ chainId }))
    dispatch(fetchAAVEAggregatorDataAsync({ chainId }))

    // fetch wallet balances
    if (account) {
      dispatch(fetchUserBalances({ chainId, account, lendingProtocol: currentProtocol }))
    }
    setTimeout(() => setRepeater((prevState) => prevState + 1), 10000)
  }, [repeater, deltaState?.userMeta?.[chainId]?.loaded, accountsToBeLoaded, chainId, currentProtocol, account])

  const { marginTradeType, entryFrom, entryTo } = useGetMarginTradeSelection()

  const isSingle = useMemo(() => entryFrom.asset === entryTo.asset && entryFrom.side === entryTo.side, [entryFrom, entryTo])

  const [cometMarginTradingActive, setCometMarginTradingActive] = useState(false)
  const [cometCollateralSwapActive, setCometCollateralSwapActive] = useState(false)

  const handlePositionEditing = () => {
    if (!isEditingPosition) {
      return setEditingPosition(true)
    } else {
      if (isPositionValid) {
        confirmPosition()
        setCometMarginTradingActive(false)
      }
    }
  }

  const handlePositionEditingCometMargin = () => {
    if (!isEditingPosition) {
      return setEditingPosition(true)
    } else {
      if (isPositionValid) {
        confirmPosition()
        if (isSingle)
          setCometMarginTradingActive(true)
        else
          setCometCollateralSwapActive(true)
      }
    }
  }

  const handleCancelPositionEditing = () => {
    setEditingPosition(false)
    setCometMarginTradingActive(false)
    setCometCollateralSwapActive(false)
    setPosition(defaultState)
  }

  const isMobile = useIsMobile()

  const filteredAssets = useMemo(() => {
    return Object.assign(
      {},
      ...getSupportedAssets(chainId, currentProtocol).map((x) => {
        return { [x]: deltaState.assets[x] }
      })
    )
  }, [deltaState, currentProtocol, chainId])

  const handleProtocolSwitch = useCallback((targetProtocol: LendingProtocol) => {
    if (currentProtocol !== targetProtocol)
      dispatch(
        switchLendingProtocol({
          targetProtocol,
        })
      )
  }, [dispatch, currentProtocol,])

  const selectAccount = useCallback(
    (index: number) => {
      if (currentProtocol === LendingProtocol.COMPOUND) dispatch(set1DeltaAccount({ chainId, index }))
    },
    [dispatch, currentProtocol, chainId]
  )

  // makes sure that non-implemented part is not shown
  useEffect(() => {
    if (currentProtocol === LendingProtocol.AAVE && !hasAaveView)
      dispatch(
        switchLendingProtocol({
          targetProtocol: LendingProtocol.COMPOUND,
        })
      )

    if (currentProtocol === LendingProtocol.COMPOUND && !hasCompoundView)
      dispatch(
        switchLendingProtocol({
          targetProtocol: LendingProtocol.AAVE,
        })
      )

  }, [hasAaveView, currentProtocol, hasCompoundView])

  // makes sure that non-implemented part is not shown
  useEffect(() => {
    if (currentProtocol !== PREFERRED_LENDERS[chainId])
      dispatch(
        switchLendingProtocol({
          targetProtocol: PREFERRED_LENDERS[chainId] as LendingProtocol
        })
      )

  }, [chainId])

  // makes sure that an account always is selected
  useEffect(() => {
    if (!userAccount?.account && userAccountData?.[0]) {
      dispatch(set1DeltaAccount({ chainId, index: 0 }))
    }
  }, [chainId, deltaState.userMeta])

  const [triggerTransaction, setTriggerTransaction] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [accountCreationPending, setAccountCreationPending] = useState(false)
  const [accountCreationHash, setAccountCreationHash] = useState('')
  const [textInput, typeText] = useState(`1Delta-${GREEKS[getRandomInt(31)]}-${getRandomInt(100)}`)
  const [selectingAccount, setSelectingAccount] = useState(false)

  const factoryContract = useGetAccountFactoryContractWithUserProvider(chainId, account)

  useEffect(() => {
    if (triggerTransaction) {
      const transact = async () => {
        setAccountsToBeLoaded(false)
        let receipt: any
        try {
          setAccountCreationPending(true)
          receipt = await factoryContract.createAccount(textInput, true)
          await receipt.wait()
          setAccountCreationHash(receipt.hash)
          setShowConfirmModal(true)
        } catch (e) {
          console.log('Account status:', e)
        } finally {
          setAccountCreationPending(false)
          setAccountsToBeLoaded(true)
        }
      }
      setTriggerTransaction(false)
      transact()
    }
  }, [triggerTransaction, chainId, account, factoryContract])

  const baseAsset = useBaseAsset()

  const relevantAccount = currentProtocol === LendingProtocol.COMPOUND ? userAccount.account?.accountAddress ?? account : account

  const riskParams = useGetRiskParameters(
    chainId,
    currentProtocol,
    relevantAccount,
    baseAsset
  )

  const ethPrice = useChainLinkPrice(ETHEREUM_CHAINS.includes(chainId) ? SupportedAssets.ETH : SupportedAssets.MATIC, chainId)

  const accountLiquidity = useMemo(() => {
    const liq = Number(
      ethers.utils.formatEther(
        userAccountData?.[userAccount?.index]
          ?.compoundSummary?.liquidity ?? 0
      )
    )
    if (POLYGON_CHAINS.includes(chainId))
      return (
        liq ?? 0
      )

    return (liq * ethPrice)
  }, [chainId, deltaState.userMeta?.[chainId], ethPrice])

  const { hasCollateral, hasDebt } = useHasPosition(chainId, entryFrom.asset)

  const { aprData, assetData, balanceData, baseMarketData } = usePrepareAssetData(currentProtocol, chainId, account)

  const [selectedCollateral, selectedDebt] = useMemo(
    () => {
      return [getAssetsOnSide(position, PositionSides.Collateral), getAssetsOnSide(position, PositionSides.Borrow)]
    },
    [position]
  )

  const maxApr = assetData.map(a => a.apr).reduce((a, b) => Math.max(a, b), -999)

  const setBaseAsset = useSetBaseAsset()

  return (
    <Container>
      <FeedbackButton />
      <ChartContainer>
        <Chart />
      </ChartContainer>
      <TopContainer>
        <TopBarContainer isBorker={currentProtocol !== LendingProtocol.COMPOUND} connected={Boolean(account)}>
          <LendingProtocolSelectionCard
            notConnected={!Boolean(account)}
            isMobile={isMobile}
            handleProtocolSwitch={handleProtocolSwitch}
            chainId={chainId}
            currentProtocol={currentProtocol}
          />
          <AccountSelectionCard
            currentProtocol={currentProtocol}
            connectionIsSupported={connectionIsSupported}
            userWallet={account}
            selectingAccount={selectingAccount}
            chainId={chainId}
            accounts={userAccountData}
            isMobile={isMobile}
            setSelectingAccount={setSelectingAccount}
            selectAccount={selectAccount}
            userAccount={userAccount}
            handleAccountModalOpen={handleAccountModalOpen}
            hasNoImplementationCompound={hasNoImplementationCompound}
          />
        </TopBarContainer>
        <AccountContent>
          <TopRow>
            <MetricsCard
              chainId={chainId}
              currentProtocol={currentProtocol}
              connectionIsSupported={connectionIsSupported}
              userWallet={account}
              userAccount={userAccount}
              collateral={balanceData.deposits}
              debt={balanceData.debt}
            />
            <AprCard
              aprData={aprData}
              currentProtocol={currentProtocol}
              connectionIsSupported={connectionIsSupported}
              userWallet={account}
              userAccount={userAccount}
              chainId={chainId}
              isMobile={isMobile}
              collateral={balanceData.deposits}
              debt={balanceData.debt}
              maxApr={maxApr}
            />

          </TopRow>
          <SupplyCard
            notConnected={!Boolean(account)}
            currentProtocol={currentProtocol}
            hasBalance={balanceData.deposits > 0}
            supply={balanceData.deposits}
            collateral={balanceData.collateral}
          />

          <BarCard
            notConnected={!Boolean(account)}
            currentProtocol={currentProtocol}
            hasBalance={balanceData.deposits > 0}
            ltv={Number(formatEther(riskParams?.currentLtv ?? '0')) * 100}
            healthFactor={Number(formatEther(riskParams?.healthFactor ?? '0'))}
          />

          <BorrowCard
            notConnected={!Boolean(account)}
            currentProtocol={currentProtocol}
            hasBalance={balanceData.deposits > 0}
            borrow={balanceData.debt}
            accountLiquidity={accountLiquidity}
            borrowLimit={balanceData.collateral - balanceData.debt}
          />

        </AccountContent>
        <PositionEditingButton
          baseAsset={baseAsset}
          currentProtocol={currentProtocol}
          isMobile={isMobile}
          hasPosition={(Boolean(account)) ? balanceData.deposits > 0 : true}
          hasCollateral={hasCollateral}
          hasDebt={hasDebt}
          position={position}
          isSingle={isSingle}
          asset={entryFrom.asset}
          singleSide={entryFrom.side}
          isPositionValid={isPositionValid}
          isEditingPosition={isEditingPosition}
          handleCancelPositionEditing={handleCancelPositionEditing}
          handlePositionEditing={handlePositionEditing}
          setCometMarginTradingActive={handlePositionEditingCometMargin}
        />
      </TopContainer>
      {currentProtocol === LendingProtocol.COMPOUNDV3 ?
        <CometContainer>
          <MarketTableContainer>
            <CometTableColumn
              assetData={assetData.map(a => {
                return {
                  ...a,
                  isCheckEnabled: selectedCollateral.includes(a.assetId),
                  chainId,
                  onCheckMarkToggle: () => {
                    handleToggleAsset(PositionSides.Collateral, a.assetId)
                    setBaseAsset(baseMarketData[0].assetId)
                  },
                }
              })}
              isMobile={isMobile}
              hasBorrow
              isEditing={isEditingPosition}
            />
          </MarketTableContainer>
          <BaseCurrencyCard
            chainId={chainId}
            userWallet={account}
            baseData={baseMarketData[0]}
            handlePositionEditing={() => {
              setBaseMarketInteraction(true)
              setBaseAsset(baseMarketData[0].assetId)
            }}
          />
        </CometContainer>

        : <MarketTableSection>
          <MarketTableContainer>
            <MarketTableTitle>
              <MarketTableTitleText>Collaterals</MarketTableTitleText>
            </MarketTableTitle>
            <CollateralTableColumn
              hasNoImplementation={hasNoImplementation}
              assetData={assetData.map(a => {
                return {
                  ...a,
                  isCheckEnabled: selectedCollateral.includes(a.assetId),
                  chainId,
                  onCheckMarkToggle: () => handleToggleAsset(PositionSides.Collateral, a.assetId),
                }
              })}
              hasPosition={balanceData.deposits > 0}
              isMobile={isMobile}
              assets={filteredAssets}
              isEditing={isEditingPosition}
            />
          </MarketTableContainer>
          <MarketTableContainer>
            <MarketTableTitle>
              <MarketTableTitleText>Borrowing</MarketTableTitleText>
            </MarketTableTitle>
            <BorrowTableColumn
              assetData={assetData.filter(a => a.borrowEnabled).map(a => {
                return {
                  ...a,
                  isCheckEnabled: selectedDebt.includes(a.assetId),
                  chainId,
                  onCheckMarkToggle: () => handleToggleAsset(PositionSides.Borrow, a.assetId),
                }
              })}
              isMobile={isMobile}
              hasBorrow={balanceData.debt > 0}
              isEditing={isEditingPosition}
            />
          </MarketTableContainer>
        </MarketTableSection>}
      <AccountCreationModal
        isMobile={isMobile}
        isOpen={isAccountModalVisible}
        onDismiss={handleAccountModalDismissed}
        maxHeight={90}
        minWidth={450}
        maxWidth={450}
      >
        <AccountModalContainer isMobile={isMobile}>
          <Close onClick={handleAccountModalDismissed} >
            <CloseIcon />
          </Close>
          {((isAccountModalVisible && account) || accountsToBeLoaded) && (
            <AccountCreation
              accountCreationPending={accountCreationPending}
              setAccountModalVisible={setAccountModalVisible}
              accountCreationHash={accountCreationHash}
              showConfirmModal={showConfirmModal}
              setShowConfirmModal={setShowConfirmModal}
              triggerTransaction={triggerTransaction}
              chainId={chainId}
              textInput={textInput}
              typeText={typeText}
              account={account ?? ''}
              handleCreateAccount={() => setTriggerTransaction(true)}
              isMobile={isMobile}
              redesignFlag
            />
          )}
        </AccountModalContainer>
      </AccountCreationModal>
      <MarginTradeModal
        isMobile={isMobile}
        isOpen={isSwapModalVisible || baseMarketInteraction}
        onDismiss={handleSwapModelDismissed}
        maxHeight={90}
        minWidth={marginTradeType === OneDeltaTradeType.MarginSwap || cometMarginTradingActive ? 800 : 450}
        maxWidth={marginTradeType === OneDeltaTradeType.MarginSwap || cometMarginTradingActive ? 800 : 450}
      >
        <ModalContainer isMobile={isMobile}>
          <Close onClick={handleSwapModelDismissed}>
            <CloseIcon />
          </Close>
          {(currentProtocol === LendingProtocol.COMPOUNDV3 && !cometMarginTradingActive &&
            (baseMarketInteraction || marginTradeType === OneDeltaTradeType.Single) ||
            (currentProtocol !== LendingProtocol.COMPOUNDV3 && marginTradeType === OneDeltaTradeType.Single)
          ) && (
              <GeneralMoneyMarket
                side={currentProtocol === LendingProtocol.COMPOUNDV3
                  ? (baseMarketInteraction ? PositionSides.Borrow : entryFrom.side)
                  : entryFrom.side}
                selectedAsset={safeGetToken(chainId, baseMarketInteraction ? baseAsset : entryFrom.asset, currentProtocol)}
                assetToInteractWith={deltaState.assets[baseMarketInteraction ? baseAsset : entryFrom.asset]}
              />
            )}
          {
            (((currentProtocol === LendingProtocol.COMPOUNDV3 && !baseMarketInteraction) || currentProtocol !== LendingProtocol.COMPOUNDV3) && marginTradeType === OneDeltaTradeType.SingleSide) && (
              <GeneralSingleSideSwap
                side={entryFrom.side}
                selectedAsset0={deltaState.assets[entryFrom.asset]}
                selectedAsset1={deltaState.assets[entryTo.asset]}
                selectedToken0={safeGetToken(chainId, entryFrom.asset, currentProtocol)}
                selectedToken1={safeGetToken(chainId, entryTo.asset, currentProtocol)}
              />
            )}
          {(
            (currentProtocol === LendingProtocol.COMPOUNDV3 && cometMarginTradingActive) ||
            (currentProtocol !== LendingProtocol.COMPOUNDV3 && marginTradeType === OneDeltaTradeType.MarginSwap)
          ) && (
              <GeneralMarginTrade
                assetCollateralSide={
                  deltaState.assets[entryFrom.side === PositionSides.Collateral ? entryFrom.asset : entryTo.asset]
                }
                assetBorrowSide={
                  deltaState.assets[entryFrom.side === PositionSides.Collateral ? entryTo.asset : entryFrom.asset]
                }
                selectedAssetCollateral={safeGetToken(
                  chainId,
                  currentProtocol === LendingProtocol.COMPOUNDV3 ? (entryTo?.asset)
                    : (entryFrom.side === PositionSides.Collateral ? entryFrom.asset : entryTo.asset),
                  currentProtocol
                )}
                selectedAssetBorrow={safeGetToken(
                  chainId,
                  currentProtocol === LendingProtocol.COMPOUNDV3 ? SupportedAssets.USDC
                    : entryFrom.side === PositionSides.Collateral ? entryTo.asset : entryFrom.asset,
                  currentProtocol
                )}
              />
            )}
        </ModalContainer>
      </MarginTradeModal>
    </Container>
  )
}
