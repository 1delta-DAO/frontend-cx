import { ConnectionType } from 'connection'
import { NavBarVariant, useNavBarFlag } from 'featureFlags/flags/navBar'
import styled from 'styled-components/macro'

import CoinbaseWalletIcon from '../../assets/images/coinbaseWalletIcon.svg'
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import sockImg from '../../assets/svg/socks.svg'
import Identicon from '../Identicon'
import { useWeb3React } from '@web3-react/core'

const IconWrapper = styled.div<{ size?: number }>`
  position: relative;
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    align-items: flex-end;
  `};
`

const SockContainer = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  bottom: -4px;
  right: -4px;
`

const SockImg = styled.img`
  width: 16px;
  height: 16px;
`

const Socks = () => {
  return (
    <SockContainer>
      <SockImg src={sockImg} />
    </SockContainer>
  )
}

const useIcon = (connectionType: ConnectionType) => {
  const { account } = useWeb3React()
  const isNavbarEnabled = useNavBarFlag() === NavBarVariant.Enabled

  if (connectionType === ConnectionType.INJECTED) {
    return <Identicon />
  } else if (connectionType === ConnectionType.WALLET_CONNECT) {
    return <img src={WalletConnectIcon} alt="WalletConnect" />
  } else if (connectionType === ConnectionType.COINBASE_WALLET) {
    return <img src={CoinbaseWalletIcon} alt="Coinbase Wallet" />
  }

  return undefined
}

export default function StatusIcon({ connectionType, size }: { connectionType: ConnectionType; size?: number }) {
  const isNavbarEnabled = useNavBarFlag() === NavBarVariant.Enabled
  const icon = useIcon(connectionType)

  return (
    <IconWrapper size={size ?? 16}>
      {icon}
    </IconWrapper>
  )
}
