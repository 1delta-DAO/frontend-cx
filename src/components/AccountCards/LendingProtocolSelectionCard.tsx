import React from 'react'
import { LendingProtocolPickerBoring } from 'components/ProtocolSelection'
import { LendingProtocol } from 'state/1delta/actions'
import styled from 'styled-components/macro'

const AccountCardLowPadding = styled.div<{ isAave: boolean, notConnected: boolean }>`
  max-width: 360px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    width: 95%;
    max-width: unset;
  `};
`

const SelectorContainer = styled.div<{ isAave: boolean }>`
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  ${({ theme, isAave }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    max-width: 80%;
    margin-bottom: ${isAave ? '0px' : '10px'};
  `};
`

export default function LendingProtocolSelectionCard({
  notConnected,
  currentProtocol,
  handleProtocolSwitch,
  isMobile,
  chainId,
}: {
  notConnected: boolean
  currentProtocol: LendingProtocol,
  handleProtocolSwitch: (targetProtocol: LendingProtocol) => void,
  isMobile: boolean,
  chainId: number,
}) {
  return (
    <SelectorContainer isAave={currentProtocol === LendingProtocol.AAVE} >
      <AccountCardLowPadding isAave={currentProtocol === LendingProtocol.AAVE} notConnected={notConnected}>
        <LendingProtocolPickerBoring
          isMobile={isMobile}
          handleProtocolSwitch={handleProtocolSwitch}
          chainId={chainId}
          currentProtocol={currentProtocol}
        />
      </AccountCardLowPadding>
    </SelectorContainer>
  )
}