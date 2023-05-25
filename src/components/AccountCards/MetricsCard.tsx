import React, { useState } from 'react'
import { LendingProtocol } from 'state/1delta/actions'
import { OneDeltaAccount } from 'state/1delta/reducer'
import styled, { keyframes } from 'styled-components/macro'
import { MouseoverTooltip } from 'components/Tooltip'
import { formatSmallUSDValue } from 'utils/tableUtils/format'
import { ETHEREUM_CHAINS } from 'constants/1delta'

const WideAccountCard = styled.div<{ isAave: boolean, hasAccount: boolean }>`
  width: 100%;
  max-width: 300px;
  box-shadow: ${({ theme }) => theme.shadow1};
  border-radius: 7px;
  background: ${({ theme }) => theme.deprecated_bg2};
  text-align: left;
  display: flex;
  flex-direction: column;
  height: 80px;
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

export default function MetricsCard({
  chainId,
  connectionIsSupported,
  currentProtocol,
  userWallet,
  userAccount,
  collateral,
  debt
}: {
  chainId: number
  connectionIsSupported: boolean
  currentProtocol: LendingProtocol
  userWallet: string | undefined
  userAccount?: {
    index: number;
    account: OneDeltaAccount | undefined;
  }
  collateral: number
  debt: number
}) {

  const [showLong, setShowLong] = useState(true)
  const nav = Number(collateral) - Number(debt)
  const showMessage = (nav === undefined) || isNaN(nav) || nav === 0
  const relevantAccount = currentProtocol === LendingProtocol.COMPOUND ?
    (Boolean(userAccount?.account) && Boolean(userWallet)) :
    Boolean(userWallet)
  return (<>
    {(connectionIsSupported) ? (
      <WideAccountCard isAave={false} hasAccount style={{ justifyContent: 'center', alignItems: 'center' }}>
        {(showMessage || !relevantAccount) ? <NavMessage>
          {`Supply initial collateral to be able to trade with leverage on ${currentProtocol === LendingProtocol.COMPOUND ? ETHEREUM_CHAINS.includes(chainId ?? 0) ? 'Compound' : '0VIX' : currentProtocol}.`}
        </NavMessage>
          : (relevantAccount && !showMessage) &&
          <RowCenteredSB style={{ width: '70%' }}>
            <NavAccountKey>NAV</NavAccountKey>
            <MouseoverTooltip
              text={
                'Your net asset value (NAV) - the $ value of your supply minus debt.'
              }
            >

              <AccountCardValueNoMargin>{relevantAccount && !isNaN(nav) ? formatSmallUSDValue(nav) : '-'}</AccountCardValueNoMargin>
            </MouseoverTooltip>
          </RowCenteredSB>}

        {relevantAccount && !showMessage &&
          <LeverageRowSB onClick={() => setShowLong(!showLong)} style={{ width: '70%' }}>
            <NavAccountKey>LEVERAGE / {showLong ? 'Long' : 'Short'}</NavAccountKey>
            <MouseoverTooltip
              text={
                'Your current leverage - calculated by collateral divided by NAV if observed from a long position perspective, and debt divided by NAV if seen as a short position'
              }
            >
              {showLong ?
                <AccountCardValueNoMargin>
                  {relevantAccount && !isNaN(nav) && nav > 0 ? `${Math.round(collateral / nav * 100) / 100}x` : '-'}
                </AccountCardValueNoMargin>
                : <AccountCardValueNoMargin>
                  {relevantAccount && !isNaN(nav) && nav > 0 ? `${Math.round(debt / nav * 100) / 100}x` : '-'}
                </AccountCardValueNoMargin>
              }
            </MouseoverTooltip>
          </LeverageRowSB>
        }
      </WideAccountCard >) :
      <></>
    }
  </>
  )
}