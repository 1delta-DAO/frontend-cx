import { ToggleComponent } from 'pages/1delta/components/Toggle'
import { AnimatedTokenIcon } from 'pages/1delta/components/TokenDetail'
import { safeGetToken } from 'hooks/1delta/tokens'
import { useGetAavePoolContractWithUserProvider } from 'hooks/1delta/use1DeltaContract'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check } from 'react-feather'
import { useChainIdAndAccount } from 'state/globalNetwork/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { SupportedAssets } from 'types/1delta'
import {
  AprCell,
  AssetCell,
  CheckboxBox,
  CheckboxCell,
  CheckboxWrapper,
  Circle,
  CollateralSwitchCell,
  DepositCell,
  RowWithBalance,
  SingleValueBox,
  SupplyBox,
  USDValueBox,
  WalletCell,
  WalletRow,
  WalletValueBox
} from 'components/Styles/tableStyles'
import {
  formatAbbreviatedNumber,
  formatAbbreviatedPrice,
  formatSmallUSDValue,
  formatSmallValue,
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

export interface AaveMarketCollateralProps {
  collateralEnabled: boolean
  chainId: number
  isMobile: boolean
  isEditing?: boolean
  apr: number
  totalSupply: number
  totalSupplyUsd: number
  userBalance: number
  userBalanceUsd: number
  assetId: SupportedAssets
  isCheckEnabled: boolean
  walletBalance: number
  onCheckMarkToggle: () => void
}

export default function AaveCollateralRow(props: AaveMarketCollateralProps) {
  const [isToggled, setToggled] = useState(props.collateralEnabled)
  const [transactionSubmitted, setTransactionSubmitted] = useState(false)
  const { chainId, account } = useChainIdAndAccount()

  const poolContract = useGetAavePoolContractWithUserProvider(chainId, account)
  const [trigger, addToTrigger] = useState(0)


  useEffect(() => {
    if (!isToggled && props.collateralEnabled) {
      setToggled(true)
    }

    if (!props.collateralEnabled) {
      setToggled(false)
    }
  }, [props.collateralEnabled, isToggled])


  const handleCollateralConfig = useCallback(async () => {
    if (!account) return () => null
    if (props.userBalance === 0) return () => null
    setTransactionSubmitted(true)
    try {
      const tx = await (poolContract as any).setUserUseReserveAsCollateral(
        safeGetToken(chainId, props.assetId).address,
        !isToggled
      )
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
  }, [poolContract, account])

  const aprSupply = useMemo(() => {
    return `${props.apr.toLocaleString()}%`
  }, [chainId, props.apr])

  const hasAccount = Boolean(account)

  return (
    <RowWithBalance hasBalance={hasAccount && props.userBalanceUsd > 0} hasWalletBalance={hasAccount && props.walletBalance > 0}>
      {props.isEditing && (
        <CheckboxCell>
          <CheckboxBox>
            <ButtonRadioChecked
              active={props.isCheckEnabled}
              onClick={props.onCheckMarkToggle}
              isMobile={props.isMobile}
            />
          </CheckboxBox>
        </CheckboxCell>
      )}
      <AssetCell>
        <AnimatedTokenIcon asset={props.assetId} isMobile={props.isMobile} />
      </AssetCell>
      <AprCell>
        <span>{aprSupply}</span>
      </AprCell>
      {account && (
        <DepositCell>
          <SupplyBox>
            <SingleValueBox>{formatSmallValue(props.userBalance, props.isMobile)}</SingleValueBox>
            <USDValueBox>{formatSmallUSDValue(props.userBalanceUsd)}</USDValueBox>
          </SupplyBox>
        </DepositCell>
      )}
      {account && !props.isMobile && (
        <WalletCell>
          {props.walletBalance > 0 ? <WalletRow>
            <WalletIcon size={15} />
            <WalletValueBox>{formatSmallValue(props.walletBalance, props.isMobile)}</WalletValueBox>
          </WalletRow> : '-'}
        </WalletCell>
      )}
      <DepositCell>
        <SupplyBox>
          <SingleValueBox>{formatAbbreviatedNumber(props.totalSupply)}</SingleValueBox>
          <USDValueBox>{formatAbbreviatedPrice(props.totalSupplyUsd)}</USDValueBox>
        </SupplyBox>
      </DepositCell>
      {account && !props.isEditing && <CollateralSwitchCell>
        <ToggleComponent transactionSubmitted={transactionSubmitted} isToggled={isToggled} handleCollateralConfig={handleCollateralConfig} />
      </CollateralSwitchCell>}
    </RowWithBalance>
  )
}
