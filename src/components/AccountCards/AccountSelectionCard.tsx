import React from 'react'
import { ButtonSecondary } from 'components/Button'
import { LendingProtocol } from 'state/1delta/actions'
import { OneDeltaAccount } from 'state/1delta/reducer'
import styled, { keyframes } from 'styled-components/macro'
import AccountList from 'components/AccountCreation/AccountList'

const WideAccountCard = styled.div<{ isAave: boolean, hasAccount: boolean }>`
  width: 100%;
  max-width: 350px;
  -mox-box-shadow: 0 0 2px ${({ theme }) => theme.backgroundOutline};
  -webkit-box-shadow: 0 0 2px ${({ theme }) => theme.backgroundOutline};
  box-shadow: 0 0 2px ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  background: ${({ theme }) => theme.accentTextLightTertiary};
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 60px;
  z-index:10000;  
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
 height: 60px;
`}
`

const AccountCardHeading = styled.span`
  color: ${({ theme }) => theme.textTertiary};
  margin-top: 0px;
  margin-left: 10px;
  font-size: 12px;
  font-weight: 700;
  height: 8px;
  letter-spacing: 0.1rem;
  text-align: left;
`


const AccountCol = styled.div`
margin-top: 5px;
display: flex;
flex-direction: column;
justify-content: center;
align-items:center;
z-index:10000;
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
    transform: scale( 1.03 );
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
    transform: scale( 1.03 );
    box-shadow: 0px -5px 5px -5px  ${colorFrom}, /* top
     0px  5px  5px  0px  ${colorFrom}, /* bottom */
     5px  0px  5px  0px  ${colorFrom}, /* right */
   -5px  0px  5px  0px   ${colorTo}; /* left */
  }
`

const AccountButtonNoAccount = styled(ButtonSecondary)`
  animation: ${({ theme }) => basic(theme.backgroundOutline, theme.backgroundOutline)} 4s infinite;
`

export default function AccountSelectionCard({
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
}) {

  return (<>
    {(currentProtocol === LendingProtocol.COMPOUND && connectionIsSupported && userWallet && userAccount) ? (
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
            selectedAccount={Number(userAccount?.index)}
            onCreateAccount={handleAccountModalOpen}
          />
          {Boolean(userWallet) && !Boolean(userAccount?.account) &&
            <AccountButtonNoAccount
              disabled={hasNoImplementationCompound || !connectionIsSupported}
              onClick={handleAccountModalOpen}
              style={{ height: '25px', fontSize: isMobile ? 11 : 12, width: '80%' }}
            >
              {hasNoImplementationCompound ? 'Coming soon!' : connectionIsSupported ? 'Create a new 1delta account' : 'Connect to supported network'}
            </AccountButtonNoAccount>
          }
        </AccountCol>
      </WideAccountCard>) :
      <></>
    }
  </>
  )
}