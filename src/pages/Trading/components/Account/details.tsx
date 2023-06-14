import React, { useMemo, useState } from 'react'
import { ButtonSecondary } from 'components/Button'
import { LendingProtocol } from 'state/1delta/actions'
import { OneDeltaAccount } from 'state/1delta/reducer'
import styled, { keyframes } from 'styled-components/macro'
import AccountList from 'components/AccountCreation/AccountList'
import { MouseoverTooltip } from 'components/Tooltip'
import { formatSmallUSDValue, formatSmallUSDValueRounded } from 'utils/tableUtils/format'
import Row from 'components/Row'
import { number } from '@lingui/core/cjs/formats'
import { TradeImpact } from 'hooks/riskParameters/types'
import { ArrowRight } from 'react-feather'
import { formatEther } from 'ethers/lib/utils'

const WideAccountCard = styled.div<{ isAave: boolean, hasAccount: boolean }>`
  width: 100%;
  max-width: 400px;
  box-shadow: ${({ theme }) => theme.shadow1};
  border-radius: 7px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.backgroundInteractive};
  background-color: ${({ theme }) => theme.deprecated_bg0};
  text-align: left;
  padding: 1rem;
  display: flex;
  flex-direction: column;

  margin-top: 2px;
  margin-bottom: 2px;
`

const AccountCardHeading = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
`

const RowFromLeft = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
`

const AccountCol = styled.div`
margin-top: 5px;
padding: 2px;
display: flex;
flex-direction: column;
justify-content: center;
align-items:center;
`

const basic = (colorFrom: string, colorTo: string) => keyframes`
  0%
  {
    box-shadow: 0px -5px 5px -5px  ${colorTo}, /* top
    0px  5px  5px  0px  ${colorTo}, /* bottom */
    5px  0px  5px  0px  ${colorTo}, /* right */
   -5px  0px  5px  0px  ${colorFrom}; /* left */
  }
  33%
  {
    transform: scale( 1.05 );
    box-shadow: 0px -5px 5px -5px  ${colorTo}, /* top
    0px  5px  5px  0px  ${colorFrom}, /* bottom */
    5px  0px  5px  0px  ${colorTo}, /* right */
    0p  -5px  px  5px  0px   ${colorTo}; /* left */
  }
  66%
  {
    transform: scale( 1 );
    box-shadow:  0px -5px 5px -5px  ${colorTo}, /* top
     0px  5px  5px  0px  ${colorFrom}, /* bottom */
    5px  0px  5px  0px  ${colorFrom}, /* right */
    -5px  0px  5px  0px   ${colorTo}; /* left */
  }
  100%
  {
    transform: scale( 1.05 );
    box-shadow: 0px -5px 5px -5px  ${colorFrom}, /* top
     0px  5px  5px  0px  ${colorFrom}, /* bottom */
     5px  0px  5px  0px  ${colorFrom}, /* right */
   -5px  0px  5px  0px   ${colorTo}; /* left */
  }
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
`

const RowCenteredSB = styled(RowCentered)`
  align-self: center;
  justify-self: center;
  justify-content: space-between;
  width: 80%;
`

const LeverageRowSB = styled(RowCenteredSB)`
  margin-bottom: 10px;
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
  height: 20px;
  letter-spacing: 0.1rem;
  margin-top: 2px;
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
  animation: ${fadeIn} .5s ease-in-out;
`

const NavAccountKey = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  height: 12px;
  margin-top: 2px;
  margin-right: 15px;
  text-align: right;
`

const AccountButtonNoAccount = styled(ButtonSecondary)`
  animation: ${({ theme }) => basic(theme.backgroundOutline, theme.backgroundOutline)} 4s infinite;
`


const SubAccountCardValueNoMargin = styled.span<{ active: boolean }>`
  color: ${({ theme, active }) => active ? theme.textPrimary : theme.textSecondary};
  opacity: ${({ active }) => active ? 0.8 : 0.5};
  font-size: 14px;
  font-weight: 500;
  margin-top: 1px;
  height: 20px;
  text-align: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  font-size: 16px;
`};
`

export default function ProfessionalAccountSelectionCard({
  connectionIsSupported,
  currentProtocol,
  userWallet,
  accounts,
  chainId,
  selectingAccount,
  isMobile,
  setSelectingAccount,
  selectAccount,
  userAccount,
  handleAccountModalOpen,
  hasNoImplementationCompound,
  collateral,
  debt,
  liquidity,
  tradeImpact
}: {
  connectionIsSupported: boolean
  currentProtocol: LendingProtocol
  userWallet: string | undefined
  selectingAccount: boolean
  accounts: { [index: number]: OneDeltaAccount; }
  chainId: number
  isMobile: boolean
  setSelectingAccount: (set: boolean) => void
  selectAccount: (index: number) => void
  userAccount?: {
    index: number;
    account: OneDeltaAccount | undefined;
  }
  handleAccountModalOpen: () => void
  hasNoImplementationCompound: boolean,
  collateral: number
  debt: number
  liquidity: number
  tradeImpact?: TradeImpact
}) {

  const [showLong, setShowLong] = useState(true)
  const nav = Number(collateral) - Number(debt)
  const [collateralDelta, debtDelta, freeMarginDelta] = useMemo(() => {
    if (!tradeImpact) return [0, 0, 0]

    return [Number(formatEther(tradeImpact?.deltaCollateral)), Number(formatEther(tradeImpact?.deltaBorrow)), Number(formatEther(tradeImpact?.marginImpact))]
  },
    [tradeImpact])
  return (<>
    {currentProtocol === LendingProtocol.COMPOUND ?
      (connectionIsSupported && userWallet && userAccount) ? (
        <WideAccountCard isAave={false} hasAccount={Boolean(userAccount?.account)}>
          <AccountCardHeading>Your 1delta Account</AccountCardHeading>
          <AccountCol>
            <AccountList
              userWallet={userWallet}
              selectingAccount={selectingAccount}
              chainId={chainId}
              accounts={accounts}
              isMobile={isMobile}
              setSelectingAccount={setSelectingAccount}
              selectAccount={selectAccount}
              selectedAccount={userAccount?.index}
              onCreateAccount={handleAccountModalOpen}
            />
            {Boolean(userWallet) && !Boolean(userAccount?.account) &&
              <AccountButtonNoAccount
                disabled={hasNoImplementationCompound || !connectionIsSupported}
                onClick={handleAccountModalOpen}
                style={{ height: isMobile ? '30px' : '35px', marginTop: isMobile ? '10px' : '25px', fontSize: isMobile ? 11 : 12, width: '80%' }}
              >
                {hasNoImplementationCompound ? 'Coming soon!' : connectionIsSupported ? 'Create a new 1delta account' : 'Connect to supported network'}
              </AccountButtonNoAccount>
            }
          </AccountCol>
          {userAccount.account && userWallet && (nav !== undefined) && !isNaN(nav) &&

            <RowCenteredSB>
              <NavAccountKey>NAV</NavAccountKey>
              <MouseoverTooltip
                text={
                  'Your net asset value (NAV) - the $ value of your supply minus debt.'
                }
              >
                <AccountCardValueNoMargin>{userAccount.account && userWallet && !isNaN(nav) ? formatSmallUSDValue(nav) : '-'}</AccountCardValueNoMargin>
              </MouseoverTooltip>
            </RowCenteredSB>
          }
          {userAccount.account && userWallet && (nav !== undefined) && !isNaN(nav) &&

            <RowCenteredSB>
              <NavAccountKey>FREE MARGIN </NavAccountKey>
              <MouseoverTooltip
                text={
                  'Your net asset value (NAV) - the $ value of your supply minus debt.'
                }
              >
                <AccountCardValueNoMargin>{userAccount.account && userWallet && !isNaN(nav) ? formatSmallUSDValue(liquidity) : '-'}</AccountCardValueNoMargin>
              </MouseoverTooltip>
            </RowCenteredSB>
          }
          {userAccount.account && userWallet && (nav !== undefined) && !isNaN(nav) &&

            <LeverageRowSB onClick={() => setShowLong(!showLong)}>

              <NavAccountKey>LEVERAGE / {showLong ? 'Long' : 'Short'}</NavAccountKey>
              <MouseoverTooltip
                text={
                  'Your current leverage - calculated by collateral divided by NAV if observed from a long position perspective, and debt divided by NAV if seen as a short position'
                }
              >
                {showLong ?
                  <AccountCardValueNoMargin>
                    {userWallet && !isNaN(nav) && nav > 0 ? `${Math.round(collateral / nav * 100) / 100}x` : '-'}
                  </AccountCardValueNoMargin>
                  : <AccountCardValueNoMargin>
                    {userWallet && !isNaN(nav) && nav > 0 ? `${Math.round(debt / nav * 100) / 100}x` : '-'}
                  </AccountCardValueNoMargin>
                }

              </MouseoverTooltip>
            </LeverageRowSB>
          }
        </WideAccountCard>) :
        <></> :
      currentProtocol === LendingProtocol.AAVE &&
        (connectionIsSupported && userWallet) ? (
        <WideAccountCard isAave={false} hasAccount style={{ justifyContent: 'space-between' }}>
          {(nav !== undefined) && !isNaN(nav) && nav === 0 && <NavMessage>
            Supply initial collateral to be able to trade with leverage on AAVE.
          </NavMessage>}
          {userWallet && (nav !== undefined) && !isNaN(nav) &&
            <RowCenteredSB style={{ width: '95%' }}>
              <NavAccountKey>NAV</NavAccountKey>
              <MouseoverTooltip
                text={
                  'Your net asset value (NAV) - the $ value of your supply minus debt.'
                }
              >

                <AccountCardValueNoMargin>{userWallet && !isNaN(nav) ? formatSmallUSDValue(nav) : '-'}</AccountCardValueNoMargin>
              </MouseoverTooltip>
            </RowCenteredSB>
          }
          {userWallet && (nav !== undefined) && !isNaN(nav) &&
            <CollateralRow collateral={collateral} collateralDelta={collateralDelta} />}
          {userWallet && (nav !== undefined) && !isNaN(nav) &&
            <DebtRow debt={debt} debtDelta={debtDelta} />}
          {userWallet && (nav !== undefined) && !isNaN(nav) &&
            <LeverageRow
              collateralDelta={collateralDelta}
              debtDelta={debtDelta}
              collateral={collateral}
              nav={nav}
              debt={debt}
              showLong={showLong}
              setShowLong={setShowLong}
            />}
          {userWallet && (nav !== undefined) && !isNaN(nav) &&
            <FreeMarginRow
              freeMargin={liquidity}
              freeMarginDelta={freeMarginDelta}
            />
          }
          {/* {userWallet && (nav !== undefined) && !isNaN(nav) && <ExposureList chainId={chainId} />} */}
        </WideAccountCard >) :
        <></>
    }
  </>
  )
}


const ValueWithChangeDisplay = styled(RowCentered)`
    align-self: center;
    justify-self: center;
    justify-content: space-between;
    width: 100%;
    `


const ArrowRightIcon = styled(ArrowRight) <{ pos: boolean }>`
    color: ${({ theme, pos }) => pos ? theme.deprecated_green1 : theme.deprecated_red2};
    width: 12px;
    height: 12px;
    `


interface CollateralProps {
  collateral: number
  collateralDelta: number
}



const CollateralRow = (props: CollateralProps) => {
  const showChange = props.collateralDelta !== 0
  return <RowCenteredSB style={{ width: '85%' }}>
    <NavAccountKey>Collateral</NavAccountKey>
    <MouseoverTooltip
      text={
        'Your current leverage - calculated by collateral divided by NAV if observed from a long position perspective, and debt divided by NAV if seen as a short position'
      }
    >
      <ValueWithChangeDisplay>
        <SubAccountCardValueNoMargin active={!showChange}>{!isNaN(props.collateral) ? formatSmallUSDValueRounded(props.collateral) : '-'}</SubAccountCardValueNoMargin>
        {showChange &&
          <>
            <ArrowRightIcon pos={props.collateralDelta > 0} />
            <SubAccountCardValueNoMargin active>{!isNaN(props.collateralDelta) ? formatSmallUSDValueRounded(props.collateral + props.collateralDelta) : '-'}</SubAccountCardValueNoMargin>
          </>
        }
      </ValueWithChangeDisplay>
    </MouseoverTooltip>
  </RowCenteredSB>

}



interface DebtProps {
  debt: number
  debtDelta: number
}


const DebtRow = (props: DebtProps) => {
  const showChange = props.debtDelta !== 0
  return <RowCenteredSB style={{ width: '85%' }}>
    <NavAccountKey>Debt</NavAccountKey>
    <MouseoverTooltip
      text={
        'Your current leverage - calculated by collateral divided by NAV if observed from a long position perspective, and debt divided by NAV if seen as a short position'
      }
    >
      <ValueWithChangeDisplay>
        <SubAccountCardValueNoMargin active={!showChange}>{!isNaN(props.debt) ? formatSmallUSDValueRounded(props.debt) : '-'}</SubAccountCardValueNoMargin>
        {showChange &&
          <>
            <ArrowRightIcon pos={props.debtDelta < 0} />
            <SubAccountCardValueNoMargin active>{!isNaN(props.debtDelta) ? formatSmallUSDValueRounded(props.debt + props.debtDelta) : '-'}</SubAccountCardValueNoMargin>
          </>
        }
      </ValueWithChangeDisplay>
    </MouseoverTooltip>
  </RowCenteredSB>

}


interface LeverageRowProps {
  collateral: number
  nav: number
  debt: number
  debtDelta: number
  collateralDelta: number
  showLong: boolean
  setShowLong: (c: boolean) => void
}

const LeverageRow = (props: LeverageRowProps) => {
  const showChange = props.collateralDelta !== 0 || props.debtDelta !== 0

  const [longLeverage, newLongLeverage] = [
    Math.round((props.collateral) / props.nav * 100) / 100,
    Math.round((props.collateral + props.collateralDelta) / props.nav * 100) / 100
  ]
  return <LeverageRowSB onClick={() => props.setShowLong(!props.showLong)} style={{ width: '95%' }}>
    <NavAccountKey>Leverage / {props.showLong ? 'Long' : 'Short'}</NavAccountKey>
    <MouseoverTooltip
      text={
        'Your current leverage - calculated by collateral divided by NAV if observed from a long position perspective, and debt divided by NAV if seen as a short position'
      }
    >
      {props.showLong ?
        <ValueWithChangeDisplay>
          <SubAccountCardValueNoMargin active={!showChange}>
            {!isNaN(props.nav) && props.nav > 0 ? `${longLeverage}x` : '-'}
          </SubAccountCardValueNoMargin>
          {showChange &&
            <>
              <ArrowRightIcon pos={props.collateralDelta > 0} />
              <SubAccountCardValueNoMargin active>
                {!isNaN(props.collateralDelta) ? `${newLongLeverage}x` : '-'}
              </SubAccountCardValueNoMargin>

            </>
          }
        </ValueWithChangeDisplay>
        :
        <ValueWithChangeDisplay>
          <SubAccountCardValueNoMargin active={!showChange}>
            {!isNaN(props.nav) && props.nav > 0 ? `${longLeverage - 1}x` : '-'}
          </SubAccountCardValueNoMargin>
          {
            showChange && <>
              <ArrowRightIcon pos={props.debtDelta > 0} />
              <SubAccountCardValueNoMargin active>
                {!isNaN(props.debtDelta) && props.debtDelta > 0 ? `${newLongLeverage - 1}x` : '-'}
              </SubAccountCardValueNoMargin>
            </>
          }
        </ValueWithChangeDisplay>
      }
    </MouseoverTooltip>
  </LeverageRowSB>

}


interface FreeMarginProps {
  freeMargin: number
  freeMarginDelta: number
}



const FreeMarginRow = (props: FreeMarginProps) => {
  const showChange = props.freeMarginDelta !== 0
  return <LeverageRowSB style={{ width: '95%' }}>
    <NavAccountKey>Free Margin</NavAccountKey>
    <MouseoverTooltip
      text={
        'Your net asset value (NAV) - the $ value of your supply minus debt.'
      }
    >
      <ValueWithChangeDisplay>
        <SubAccountCardValueNoMargin active={!showChange}>{!isNaN(props.freeMargin) ? formatSmallUSDValueRounded(props.freeMargin) : '-'}</SubAccountCardValueNoMargin>
        {showChange &&
          <>
            <ArrowRightIcon pos={props.freeMarginDelta > 0} />
            <SubAccountCardValueNoMargin active>{!isNaN(props.freeMarginDelta) ? formatSmallUSDValueRounded(props.freeMargin + props.freeMarginDelta) : '-'}</SubAccountCardValueNoMargin>
          </>
        }
      </ValueWithChangeDisplay>
    </MouseoverTooltip>
  </LeverageRowSB>
}