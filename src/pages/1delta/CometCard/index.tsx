import React, { useState } from 'react'
import { LendingProtocol } from 'state/1delta/actions'
import { OneDeltaAccount } from 'state/1delta/reducer'
import styled, { keyframes } from 'styled-components/macro'
import { MouseoverTooltip } from 'components/Tooltip'
import { formatAbbreviatedGeneralNumber, formatAbbreviatedGeneralPrice, formatAbbreviatedNumber, formatAbbreviatedPrice, formatSmallUSDValue, formatSmallValue } from 'utils/tableUtils/format'
import { ETHEREUM_CHAINS } from 'constants/1delta'
import { MarginTradeType, SupportedAssets } from 'types/1delta'
import { AnimatedTokenIcon } from '../components/TokenDetail'
import { BaseButton, ButtonPrimary } from 'components/Button'
import { SingleValueBox, SupplyBox, USDValueBox } from 'components/Styles/tableStyles'
import { useSetSingleInteraction } from 'state/marginTradeSelection/hooks'

const WideAccountCard = styled.div<{ isAave: boolean, hasAccount: boolean }>`
  width: 100%;
  margin 10px;
  max-width: 300px;
  box-shadow: ${({ theme }) => theme.shadow1};
  border-radius: 1em;
  background: ${({ theme }) => theme.deprecated_bg2};
  text-align: left;
  display: flex;
  flex-direction: column;
  max-height: 300px;
  ${({ theme, isAave, hasAccount }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    width: 95%;
    margin-top: 10px;
    max-width: unset;
    :nth-child(1) { order: 1; }
    :nth-child(2) { order: 2; }
    :nth-child(3) { order: 4; }
    :nth-child(4) { order: 3; }
`};
  z-index:2;
`

const AccountCardValueNoMargin = styled.span`
  color: ${({ theme }) => theme.textPrimary};
  opacity: 0.8;
  font-size: 18px;
  font-weight: 500;
  margin-top: 1px;
  height: 20px;
  text-align: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  font-size: 16px;
`};
`

const RowCentered = styled.div`
  margin-top: 3px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  z-index: -99;
`

const RowCenteredSB = styled(RowCentered)`
  align-self: center;
  justify-self: center;
  justify-content: space-between;
  width: 80%;
`

const LeverageRowSB = styled(RowCenteredSB)`
  height: 35px;
  padding: 1px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  margin-bottom: 10px;
`};
  :hover {
    cursor: pointer;
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;


const NavMessage = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1rem;
  margin-top: 2px;
  text-align: center;
  width: 70%;
  animation: ${fadeIn} .5s ease-in-out;
`

const Header = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  height: 45px;
  padding: 10px;
  width: 70%;
  animation: ${fadeIn} .5s ease-in-out;
`

const NavAccountKey = styled.span`
  color: ${({ theme }) => theme.textTertiary};
  font-size: 12px;
  font-weight: 700;
  height: 12px;
  letter-spacing: 0.1rem;
  margin-top: 2px;
  margin-right: 15px;
  text-align: right;
`


const ButtonRowSmall = styled.div`
  display: flex;
  padding: 2px;
  margin: 10px;
  flex-direction: row;
  width: 90%;
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

const AprText = styled.div`
  width: 70px;
`


interface BaseCurrencyData {
  assetId: SupportedAssets
  liquidity: number
  liquidityUsd: number
  borrowApr: number
  userBorrow: number
  userBorrowUsd: number
}

export default function BaseCurrencyCard({
  chainId,
  userWallet,
  baseData,
  handlePositionEditing
}: {
  chainId: number
  userWallet: string | undefined
  baseData: BaseCurrencyData
  handlePositionEditing: () => void
}) {

  const relevantAccount = Boolean(userWallet)

  const setSingle = useSetSingleInteraction()

  return (<>

    <WideAccountCard isAave={false} hasAccount style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Header>
        Base Market
      </Header>
      <AnimatedTokenIcon asset={baseData.assetId} isMobile={false} />

      <LeverageRowSB style={{ width: '70%', textAlign: 'left' }}>
        <NavAccountKey>Borrow APR</NavAccountKey>

        <AprText>   <MouseoverTooltip
          text={
            'The yield to be paid if funds are borrowed.'
          }
        >
          {baseData.borrowApr?.toLocaleString()}%
        </MouseoverTooltip>
        </AprText>
      </LeverageRowSB>



      <LeverageRowSB style={{ width: '70%' }}>
        <NavAccountKey>
          <MouseoverTooltip
            text={
              'The available funds to borrow from.'
            }
          >Liquidity
          </MouseoverTooltip>
        </NavAccountKey>
        <SupplyBox>
          <SingleValueBox>{formatAbbreviatedNumber(baseData.liquidity)}</SingleValueBox>
          <USDValueBox>{formatAbbreviatedPrice(baseData.liquidityUsd)}</USDValueBox>
        </SupplyBox>
      </LeverageRowSB>


      <LeverageRowSB style={{ width: '70%' }}>
        <NavAccountKey>
          <MouseoverTooltip
            text={
              'Your current debt - accrues interest that you will have to pay back on top of the notional.'
            }
          >Your debt
          </MouseoverTooltip>
        </NavAccountKey>

        <SupplyBox>
          <SingleValueBox>{formatSmallValue(baseData.userBorrow, false)}</SingleValueBox>
          <USDValueBox>{formatSmallUSDValue(baseData.userBorrowUsd)}</USDValueBox>
        </SupplyBox>
      </LeverageRowSB>
      <ButtonRowSmall>
        <SingleButtonSmall disabled={false} onClick={
          () => {
            setSingle(MarginTradeType.Borrow)
            handlePositionEditing()
          }
        }>
          Borrow
        </SingleButtonSmall>
        <SingleButtonSmall disabled={false} onClick={
          () => {
            setSingle(MarginTradeType.Repay)
            handlePositionEditing()
          }
        }>
          Repay
        </SingleButtonSmall>
      </ButtonRowSmall>

    </WideAccountCard >
    <></>

  </>
  )
}