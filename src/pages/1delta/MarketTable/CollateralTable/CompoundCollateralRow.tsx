import { ToggleComponent } from 'pages/1delta/components/Toggle'
import { AnimatedTokenIcon } from 'pages/1delta/components/TokenDetail'
import { useWeb3React } from '@web3-react/core'
import { getCompoundCTokenAddress } from 'hooks/1delta/addressGetter'
import { getAdminAccountContract } from 'hooks/1delta/use1DeltaContract'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check } from 'react-feather'
import { useGetCurrentAccountSummary } from 'state/1delta/hooks'
import { useChainId } from 'state/globalNetwork/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { SupportedAssets } from 'types/1delta'
import {
  AprCell,
  AssetCell,
  CheckboxCell,
  CheckboxWrapper,
  Circle,
  CollateralSwitchCell,
  DepositCell,
  RowWithBalance,
  SingleValueBox,
  SupplyBox,
  TotalCell,
  USDValueBox,
  WalletCell,
  WalletRow,
  WalletValueBox
} from 'components/Styles/tableStyles'
import {
  formatAbbreviatedNumber,
  formatAbbreviatedPrice,
  formatSmallUSDValue,
  formatSmallValue
} from 'utils/tableUtils/format'
import WalletIcon from 'components/Wallet'

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

export interface MarketCollateralProps {
  chainId: number
  isMobile: boolean
  isEditing?: boolean
  apr: number
  totalSupply: number
  totalSupplyUsd: number
  collateralEnabled: boolean
  userBalance: number
  userBalanceUsd: number
  assetId: SupportedAssets
  isCheckEnabled: boolean
  walletBalance: number
  onCheckMarkToggle: () => void
}

export default function CompoundCollateralRow(props: MarketCollateralProps) {
  const { account, provider } = useWeb3React()
  const chainId = useChainId()
  const selectedAccount = useGetCurrentAccountSummary(chainId)
  const [transactionSubmitted, setTransactionSubmitted] = useState(false)

  const isActive = useMemo(() => Boolean(selectedAccount?.compoundSummary?.markets.map(
    x => x.toLocaleLowerCase()
  ).includes(
    (getCompoundCTokenAddress(chainId, props.assetId) ?? '').toLowerCase()
  )),
    [selectedAccount?.compoundSummary?.markets, props.assetId, chainId])

  const [isToggled, setToggled] = useState(false)
  const accountContract = getAdminAccountContract(chainId, provider, selectedAccount?.accountAddress, account)
  const [trigger, addToTrigger] = useState(0)

  useEffect(() => {
    if (!isToggled && isActive) {
      setToggled(true)
    }

    if (!isActive) {
      setToggled(false)
    }
  }, [isActive, isToggled])

  // this is the total supply, the conversion to USD is at the bottom

  const handleCollateralConfig = useCallback(async () => {
    if (!selectedAccount) return () => null
    setTransactionSubmitted(true)
    try {
      let tx;
      if (isActive) {
        tx = await accountContract.exitLendingMarkets(
          [getCompoundCTokenAddress(chainId, props.assetId)?.toLowerCase()]
        )
      } else {
        tx = await accountContract.enterLendingMarkets(
          [getCompoundCTokenAddress(chainId, props.assetId)?.toLowerCase()]
        )
      }
      await tx.wait()
      setTransactionSubmitted(false)
      setToggled(!isToggled)
      addToTrigger(trigger + 1)
      return tx.status
    } catch (e) {
      console.log(e)
      setTransactionSubmitted(false)
      return false
    }
  }, [accountContract, selectedAccount, isActive, props.assetId])

  const aprSupply = useMemo(() => {
    if (!props.apr) return '-'
    return `${props.apr.toFixed(props.isMobile ? 2 : 3)}%`
  }, [chainId, props.apr, props.isMobile])

  const hasAccount = Boolean(account)

  return (
    <RowWithBalance hasBalance={hasAccount && props.userBalanceUsd > 0} hasWalletBalance={hasAccount && props.walletBalance > 0}>
      {props.isEditing && (
        <CheckboxCell>
          <ButtonRadioChecked
            active={props.isCheckEnabled}
            onClick={props.onCheckMarkToggle}
            isMobile={props.isMobile}
          />
        </CheckboxCell>
      )}
      <AssetCell>
        <AnimatedTokenIcon asset={props.assetId} isMobile={props.isMobile} />
      </AssetCell>
      <AprCell>
        {aprSupply}
      </AprCell>
      {selectedAccount &&
        <DepositCell>
          <SupplyBox>
            <SingleValueBox>{formatSmallValue(props.userBalance)}</SingleValueBox>
            <USDValueBox>{formatSmallUSDValue(props.userBalanceUsd)}</USDValueBox>
          </SupplyBox>
        </DepositCell>
      }
      {account && !props.isMobile && (
        <WalletCell>
          {props.walletBalance > 0 ? <WalletRow>
            <WalletIcon size={15} />
            <WalletValueBox>{formatSmallValue(props.walletBalance, props.isMobile)}</WalletValueBox>
          </WalletRow> : '-'}
        </WalletCell>
      )}
      <TotalCell>
        <SupplyBox>
          <SingleValueBox>{formatAbbreviatedNumber(props.totalSupply)}</SingleValueBox>
          <USDValueBox>{formatAbbreviatedPrice(props.totalSupplyUsd)}</USDValueBox>
        </SupplyBox>
      </TotalCell>
      {account && selectedAccount && !props.isEditing && <CollateralSwitchCell>
        <ToggleComponent
          transactionSubmitted={transactionSubmitted}
          isToggled={isToggled}
          handleCollateralConfig={handleCollateralConfig} />
      </CollateralSwitchCell>}
    </RowWithBalance>
  )
}

