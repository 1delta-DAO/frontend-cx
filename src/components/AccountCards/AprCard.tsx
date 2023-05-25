import { LendingProtocol } from 'state/1delta/actions'
import { OneDeltaAccount } from 'state/1delta/reducer'
import styled, { keyframes } from 'styled-components/macro'
import { MouseoverTooltip } from 'components/Tooltip'
import { AprData } from 'hooks/asset/useAssetData'
import { formatPercent } from 'utils/1delta/generalFormatters'
import { ETHEREUM_CHAINS } from 'constants/1delta'

const WideAccountCard = styled.div<{ isAave: boolean, hasAccount: boolean }>`
  width: 100%;
  max-width: 300px;
  box-shadow: ${({ theme }) => theme.shadow1};
  border-radius: 7px;
  background: ${({ theme }) => theme.deprecated_bg2};
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80px;
  padding: 3px;
  ${({ theme, isAave }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    :nth-child(1) { order: 1; }
    :nth-child(2) { order: 2; }
    :nth-child(3) { order: 4; }
    :nth-child(4) { order: 3; }
    max-width: 95%;
  `};
  ${({ theme, isAave }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
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


const AccountCardSmallValueNoMargin = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  opacity: 0.8;
  font-size: 15px;
  font-weight: 500;
  margin-top: 1px;
  height: 20px;
  text-align: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  font-size: 13px;
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

const RowCenteredSBSmall = styled(RowCentered)`
  align-self: center;
  justify-self: center;
  justify-content: space-between;
  width: 80%;
`

export default function AprCard({
  connectionIsSupported,
  currentProtocol,
  userWallet,
  userAccount,
  chainId,
  isMobile,
  collateral,
  debt,
  aprData,
  maxApr
}: {
  connectionIsSupported: boolean
  currentProtocol: LendingProtocol
  userWallet: string | undefined
  userAccount?: {
    index: number;
    account: OneDeltaAccount | undefined;
  }
  chainId: number
  isMobile: boolean
  collateral: number
  debt: number
  aprData: AprData | undefined,
  maxApr: number | undefined
}) {
  const nav = Number(collateral) - Number(debt)
  const showMessage = (nav === undefined) || isNaN(nav) || nav === 0
  const showAPR = Boolean(!isNaN(Number(aprData?.apr)))
  return (<>
    {
      (connectionIsSupported && userWallet) ? (
        <WideAccountCard isAave={false} hasAccount>
          {(!showAPR && showMessage || !userWallet) && <NavMessage>
            {`Earn up to ${formatPercent((maxApr ?? 0) / 100, 2)} by depositing crypto collateral assets into the ${currentProtocol === LendingProtocol.COMPOUND ? ETHEREUM_CHAINS.includes(chainId ?? 0) ? 'Compound' : '0VIX' : currentProtocol} protocol.`}
          </NavMessage>}
          {userWallet && showAPR &&
            <RowCenteredSB style={{ width: '70%' }}>
              <NavAccountKey>APR</NavAccountKey>
              <MouseoverTooltip
                text={
                  'Your APR based on the NAV.'
                }
              >
                <AccountCardValueNoMargin>{formatPercent((aprData?.apr ?? 0) / 100, 2)}</AccountCardValueNoMargin>
              </MouseoverTooltip>
            </RowCenteredSB>
          }

          {userWallet && showAPR &&
            <RowCenteredSBSmall style={{ width: '60%', margin: '0px' }}>
              <NavAccountKey> Deposit</NavAccountKey>
              <MouseoverTooltip
                text={
                  'Your deposit APR.'
                }
              >
                <AccountCardSmallValueNoMargin color={'green'}>
                  {formatPercent((aprData?.depositApr ?? 0) / 100, 2)}
                </AccountCardSmallValueNoMargin>
              </MouseoverTooltip>
            </RowCenteredSBSmall>
          }
          {userWallet && showAPR &&
            <RowCenteredSBSmall style={{ width: '60%', margin: '0px' }}>
              <NavAccountKey>Borrow</NavAccountKey>
              <MouseoverTooltip
                text={
                  'Your borrow APR.'
                }
              >
                <AccountCardSmallValueNoMargin color={'red'}>
                  {isNaN(aprData?.borrowApr ?? 0) ? '-' : formatPercent((-(aprData?.borrowApr ?? 0) / 100), 2)}
                </AccountCardSmallValueNoMargin>
              </MouseoverTooltip>
            </RowCenteredSBSmall>
          }

        </WideAccountCard >) :
        <></>
    }
  </>
  )
}