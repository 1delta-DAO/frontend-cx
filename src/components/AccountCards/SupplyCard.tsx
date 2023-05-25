import React from 'react'
import { MouseoverTooltip } from 'components/Tooltip'
import { LendingProtocol } from 'state/1delta/actions'
import styled from 'styled-components/macro'
import { Z_INDEX } from 'theme/zIndex'
import { CardLine } from '../Styles'


const AccountCard = styled.div<{ isAave: boolean }>`
  width: 100%;
  max-width: 300px;
  box-shadow: ${({ theme }) => theme.shadow1};
  border-radius: 7px;
  height: 50%;
  background: ${({ theme }) => theme.deprecated_bg2};
  text-align: left;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  height: 140px;
  ${({ theme, isAave }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    width: 46%;
    height: 140px;
    max-width: unset;
    padding: 1.0rem;
 :nth-child(1) { order: 1; }
    :nth-child(2) { order: 2; }
    :nth-child(3) { order: 3; }
    :nth-child(4) { order: 5; }
    :nth-child(5) { order: 4; }
  `};
  ${({ theme, isAave }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
 :nth-child(1) { order: 1; }
      :nth-child(2) { order: 2; }
      :nth-child(3) { order: 3; }
      :nth-child(4) { order: 5; }
      :nth-child(5) { order: 4; }
`};
  z-index: ${Z_INDEX.deprecated_zero};
`

const AccountCardHeading = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
`

const AccountCardValueNoMargin = styled.span`
  color: ${({ theme }) => theme.textPrimary};
  opacity: 0.8;
  font-size: 20px;
  font-weight: 500;
  margin-top: 1px;
  height: 20px;
  text-align: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  font-size: 16px;
`};
`

const AccountCardKey = styled.span`
  color: ${({ theme }) => theme.textTertiary};
  font-size: 10px;
  font-weight: 700;
  height: 10px;
  letter-spacing: 0.1rem;
  margin-top: 2px;
  margin-right: 15px;
  text-align: left;
  width: 50px;
`

const AccountCardCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-around;
  color: ${({ theme }) => theme.textPrimary};
  opacity: 0.8;
  font-size: 24px;
  font-weight: 500;
`

const SupplyCol = styled.div`
  margin-top: 5px;
  padding: 2px;
  display: flex;
  flex-direction: column;
`

export default function SupplyCard({
  notConnected,
  currentProtocol,
  hasBalance,
  supply,
  collateral
}: {
  notConnected: boolean
  currentProtocol: LendingProtocol,
  hasBalance: boolean,
  supply: number,
  collateral: number,
}) {

  return (<AccountCard isAave={notConnected}>
    <AccountCardHeading>Supplied</AccountCardHeading>
    <SupplyCol>
      <MouseoverTooltip text={'The total amount supplied in $ to the protocol.'}>
        <AccountCardCol>
          <AccountCardKey>TOTAL</AccountCardKey>
          <AccountCardValueNoMargin>{hasBalance ? `$${supply.toLocaleString()}` : '-'}</AccountCardValueNoMargin>
        </AccountCardCol>
      </MouseoverTooltip>
      <CardLine />
      <MouseoverTooltip
        text={
          'The $ value of effective collateral that backs your loans. This amount represents your credit line.'
        }
      >
        <AccountCardCol>
          <AccountCardKey>COLLATERAL</AccountCardKey>
          <AccountCardValueNoMargin>{hasBalance ? `$${collateral.toLocaleString()}` : '-'}</AccountCardValueNoMargin>
        </AccountCardCol>
      </MouseoverTooltip>
    </SupplyCol>
  </AccountCard>)
}