import styled from "styled-components"
import { ButtonPrimary, ButtonSecondary, ButtonYellow } from "."
import { MarginTradeType, MarginTradeState, PositionEntry, PositionSides, SupportedAssets } from "types/1delta"
import { useMemo } from "react"
import { getTradeTypeDescription, useSetSingleInteraction } from "state/marginTradeSelection/hooks"
import { useCurrentLendingProtocol } from "state/1delta/hooks"
import { useChainId } from "state/globalNetwork/hooks"
import { SupportedChainId } from "constants/chains"
import { LendingProtocol } from "state/1delta/actions"



const ButtonContainer = styled.div`
  width: 810px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
  width: 650px;
`};
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 95vw;
`};
`

const ButtonTextBox = styled.div`
  letter-spacing: 2px;
  font-weight: bold;
  font-size: 14px;
`

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  max-width: 500px;
`

const ButtonRowFlex = styled.div<{ small: boolean }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: ${({ small }) => small ? 'flex-start' : 'space-between'};
  align-items: center;
  max-width: ${({ small }) => small ? '300px' : '500px'};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  max-width: 50%;
`};
`

const SingleButton = styled(ButtonPrimary) <{ disabled: boolean }>`
  border-radius: 12px;
  max-width: 280px;
  &:last-child {
    padding-left: 2px;
    margin-left: 2px;
    height: 52px;
  }
  &:first-child {
    padding-right: 2px;
    margin-right: 2px;
    height: 52px;
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  padding: 2px;
`};
`

const SingleButtonComet = styled(SingleButton) <{ disabled: boolean }>`
  border-radius: 12px;
  max-width: 180px;
  width: 180px;
  height: 52px;
  padding: 2px;
  &:last-child {
    padding-left: 2px;
    margin-left: 2px;
    height: 52px;
  }
  &:first-child {
    padding-right: 2px;
    margin-right: 2px;
    height: 52px;
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  padding: 2px;
`};
`

const Warning = styled(ButtonYellow) <{ disabled: boolean }>`
  border-radius: 12px;
  max-width: 250px;
  opacity: 0.7;
  height: 52px;
  margin-left: 10px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  padding: 2px;
  margin-top: 10px;
  max-width: 95vw;
  font-size: 15px;
  height: 25px;
`};
`


interface EditingProps {
  baseAsset: SupportedAssets
  currentProtocol: LendingProtocol
  asset: SupportedAssets
  isMobile: boolean
  isSingle: boolean
  hasPosition: boolean
  hasCollateral: boolean
  hasDebt: boolean
  position: MarginTradeState
  singleSide: PositionSides
  isPositionValid: PositionEntry | undefined
  isEditingPosition: boolean
  handleCancelPositionEditing: () => void
  handlePositionEditing: () => void
  setCometMarginTradingActive: () => void
}

export const PositionEditingButton = (
  {
    baseAsset,
    currentProtocol,
    asset,
    isSingle,
    isMobile,
    singleSide,
    hasPosition,
    hasCollateral,
    hasDebt,
    isPositionValid,
    position,
    isEditingPosition,
    handleCancelPositionEditing,
    handlePositionEditing,
    setCometMarginTradingActive
  }: EditingProps
) => {
  const protocol = useCurrentLendingProtocol()
  const chainId = useChainId()

  const buttonText = useMemo(() => {
    return getTradeTypeDescription(position).toLocaleUpperCase()
  }, [position])

  const isCollateral = singleSide === PositionSides.Collateral

  const [first, second, firstDisabled, secondDisabled] = useMemo(() => {
    if (!isSingle)
      return ['', '', false, false]
    if (isCollateral)
      return [`Supply ${asset}`, `Withdraw ${asset}`, false, !hasCollateral]
    else return [hasPosition ? `Borrow ${asset}` : 'Deposit collateral first', `Repay ${asset}`, !hasPosition, !hasDebt]

  },
    [position, singleSide, asset, hasPosition, hasCollateral, hasDebt, isSingle, isCollateral]
  )
  const setSingle = useSetSingleInteraction()

  return currentProtocol !== LendingProtocol.COMPOUNDV3 ? <ErrorContainer>
    <ButtonContainer>
      {isEditingPosition && (
        <ButtonSecondary
          disabled={false}
          padding="16px 16px"
          width="220px"
          $borderRadius="12px"
          marginRight="15px"
          height="52px"
          onClick={handleCancelPositionEditing}
        >
          Cancel
        </ButtonSecondary>
      )}
      {(asset && isSingle) ?
        (<ButtonRow>
          <SingleButton disabled={firstDisabled} onClick={
            () => {
              setSingle(isCollateral ? MarginTradeType.Supply : MarginTradeType.Borrow)
              handlePositionEditing()
            }
          }
            padding="16px 16px"
          >
            {first}
          </SingleButton>
          <SingleButton disabled={secondDisabled} onClick={
            () => {
              setSingle(isCollateral ? MarginTradeType.Withdraw : MarginTradeType.Repay)
              handlePositionEditing()
            }
          }
            padding="16px 16px"
          >
            {second}
          </SingleButton>
        </ButtonRow>) :
        (<ButtonPrimary
          disabled={isEditingPosition && !isPositionValid}
          padding="16px 16px"
          width="100%"
          $borderRadius="12px"
          height="52px"
          maxWidth='500px'
          onClick={handlePositionEditing}
        >
          <ButtonTextBox>{!isEditingPosition ? 'START TRADING' : buttonText}</ButtonTextBox>
        </ButtonPrimary>)}
      {!isMobile && chainId === SupportedChainId.POLYGON && protocol === LendingProtocol.COMPOUND && <Warning disabled={false}>
        0VIX was exploited - Do not deposit any funds!
      </Warning>}
    </ButtonContainer>
    {isMobile && chainId === SupportedChainId.POLYGON && protocol === LendingProtocol.COMPOUND && <Warning disabled={false}>
      0VIX was exploited - Do not deposit any funds!
    </Warning>}
  </ErrorContainer> :
    <ErrorContainer>
      <ButtonContainer>
        {isEditingPosition && (
          <ButtonSecondary
            disabled={false}
            padding="16px 16px"
            width="220px"
            $borderRadius="12px"
            marginRight="15px"
            height="52px"
            onClick={handleCancelPositionEditing}
          >
            Cancel
          </ButtonSecondary>
        )}

        {(<ButtonRowFlex small={isSingle && asset === baseAsset}>
          {((isSingle && asset !== baseAsset) || !isSingle) && <ButtonPrimary
            disabled={isEditingPosition && !isPositionValid}
            padding="16px 16px"
            width="100%"
            $borderRadius="12px"
            marginRight="10px;"
            height="52px"
            onClick={() => {
              handlePositionEditing()
              setCometMarginTradingActive()
            }}
          >
            <ButtonTextBox>{!isEditingPosition ? 'START TRADING' : (isSingle ? 'TRADE ON MARGIN' : 'SWAP COLLATERALS')}</ButtonTextBox>
          </ButtonPrimary>}
          {isSingle && isEditingPosition && asset && <SingleButtonComet disabled={firstDisabled} onClick={
            () => {
              setSingle(isCollateral ? MarginTradeType.Supply : MarginTradeType.Borrow)
              handlePositionEditing()
            }
          }
            padding="16px 16px"
          >
            {first}
          </SingleButtonComet>}
          {isSingle && isEditingPosition && asset && <SingleButtonComet disabled={secondDisabled} onClick={
            () => {
              setSingle(isCollateral ? MarginTradeType.Withdraw : MarginTradeType.Repay)
              handlePositionEditing()
            }
          }
            padding="16px 16px"
          >
            {second}
          </SingleButtonComet>}
        </ButtonRowFlex>)}
      </ButtonContainer>
    </ErrorContainer>
}


const ButtonContainerSmall = styled.div`
  padding: 2px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
  width: 95%;
`};
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 95vw;
`};
`

const ErrorContainer = styled.div`
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  display: flex;
  flex-direction: column;
  justify-content:center;
  align-items: center;
`};
`

const ButtonRowSmall = styled.div`
  display: flex;
  padding: 2px;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  max-width: 500px;
`

const SingleButtonSmall = styled(ButtonPrimary) <{ disabled: boolean }>`
  border-radius: 12px;
  max-height: 30px;
  max-width: 200px;
  &:last-child {
    padding-left: 2px;
    margin-left: 2px;
    height: 52px;
  }
  &:first-child {
    padding-right: 2px;
    margin-right: 2px;
    height: 52px;
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  padding: 2px;
`};
`


interface EditingPropsMinimal {
  hasPosition: boolean
  hasCollateral: boolean
  hasDebt: boolean
  onClick: () => void
}

export const MoneyMarketButtons = (
  {
    hasPosition,
    hasCollateral,
    hasDebt,
    onClick
  }: EditingPropsMinimal
) => {
  const protocol = useCurrentLendingProtocol()
  const chainId = useChainId()

  const [first, second, third, fourth, secondDisabled, thirdDisabled, fourthDisabled] = useMemo(() => {
    return [
      `Supply`,
      `Withdraw`,
      hasPosition ? `Borrow` : 'Deposit collateral first',
      `Repay`,
      !hasCollateral,
      !hasPosition,
      !hasDebt
    ]

  },
    [hasPosition, hasCollateral, hasDebt]
  )
  const setSingle = useSetSingleInteraction()

  return <ButtonContainerSmall>
    <ButtonRowSmall>
      <SingleButtonSmall disabled={false} onClick={
        () => {
          setSingle(MarginTradeType.Supply)
          onClick()
        }
      }
        padding="16px 16px"
      >
        {first}
      </SingleButtonSmall>
      <SingleButtonSmall disabled={secondDisabled} onClick={
        () => {
          setSingle(MarginTradeType.Withdraw)
          onClick()
        }
      }
        padding="16px 16px"
      >
        {second}
      </SingleButtonSmall>
    </ButtonRowSmall>
    <ButtonRowSmall>
      <SingleButtonSmall disabled={thirdDisabled} onClick={
        () => {
          setSingle(MarginTradeType.Borrow)
          onClick()
        }
      }
        padding="16px 16px"
      >
        {third}
      </SingleButtonSmall>
      <SingleButtonSmall disabled={fourthDisabled} onClick={
        () => {
          setSingle(MarginTradeType.Repay)
          onClick()
        }
      }
        padding="16px 16px"
      >
        {fourth}
      </SingleButtonSmall>
    </ButtonRowSmall>
    {chainId === SupportedChainId.POLYGON && protocol === LendingProtocol.COMPOUND && <Warning disabled={false}>
      0VIX was exploited - Do not deposit any funds!
    </Warning>}
  </ButtonContainerSmall>
}