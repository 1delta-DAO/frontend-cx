import { Trans } from '@lingui/macro'
import useScrollPosition from '@react-hook/window-scroll'
import { useWeb3React } from '@web3-react/core'
import { useGetNativeBalance } from 'lib/hooks/useCurrencyBalance'
import { Moon, Sun } from 'react-feather'
import { Text } from 'rebass'
import { useDarkModeManager } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { ReactComponent as LogoDark } from '../../assets/svg/logo_dark.svg'
import { ReactComponent as LogoLight } from '../../assets/svg/logo_light.svg'
import Web3Status from '../Web3Status'
import NetworkSelector from './NetworkSelector'

const HeaderFrame = styled.div<{ showBackground: boolean }>`
  display: grid;
  grid-template-columns: 120px 1fr 0px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding: 1rem;
  z-index: 21;
  position: relative;
  /* Background slide effect on scroll. */
  background-image: ${({ theme }) => `linear-gradient(to bottom, transparent 50%, ${theme.deprecated_bg0} 50% )}}`};
  background-position: ${({ showBackground }) => (showBackground ? '0 -100%' : '0 0')};
  background-size: 100% 200%;
  box-shadow: 0px 0px 0px 1px ${({ theme, showBackground }) => (showBackground ? theme.deprecated_bg2 : 'transparent;')};
  transition: background-position 0.1s, box-shadow 0.1s;
  background-blend-mode: hard-light;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    padding:  1rem;
    grid-template-columns: 36px 1fr;
  `};
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  &:not(:first-child) {
    margin-left: 0.5em;
  }

  /* addresses safaris lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    align-items: center;
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.deprecated_bg0 : theme.deprecated_bg0)};
  border-radius: 16px;
  white-space: nowrap;
  width: 100%;
  height: 40px;

  :focus {
    border: 1px solid blue;
  }
`

const UNIAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.deprecated_bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
`

const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const UniIcon = styled.div`
  position: relative;
`

const ToggleMenuItem = styled.button`
  background-color: transparent;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem 0.5rem;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.deprecated_text2};
  :hover {
    color: ${({ theme }) => theme.deprecated_text1};
    cursor: pointer;
    text-decoration: none;
  }
`

const StyledIconAbs = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  ${({ theme }) =>
    theme.darkMode
      ? `filter: drop-shadow(-0.1px -0.1px 2px rgba(255, 255, 255, 0.3)) 
  drop-shadow(0.1px -0.1px 2px rgba(255, 255, 255, 0.3)) 
  drop-shadow(0.1px 0.1px 2px rgba(255, 255, 255, 0.3))
  drop-shadow(-0.1px 0.1px 2px rgba(255, 255, 255, 0.3));`
      : `filter: drop-shadow(-0.1px -0.1px 2px rgba(0, 0, 0, 0.1)) 
  drop-shadow(0.1px -0.1px 2px rgba(0, 0, 0, 0.1)) 
  drop-shadow(0.1px 0.1px 2px rgba(0, 0, 0, 0.1))
  drop-shadow(-0.1px 0.1px 2px rgba(0, 0, 0, 0.1));`}
  align-items: center;
`

// can't be customized under react-router-dom v6
// so we have to persist to the default one, i.e., .active
export default function Header() {
  const { account, chainId } = useWeb3React()
  const userEthBalance = useGetNativeBalance()

  const scrollY = useScrollPosition()

  const [darkMode, toggleDarkMode] = useDarkModeManager()

  // work around https://github.com/remix-run/react-router/issues/8161
  // as we can't pass function `({isActive}) => ''` to className with styled-components

  const Logo = darkMode ? LogoDark : LogoLight

  return (
    <HeaderFrame showBackground={scrollY > 45}>
      <Title href=".">
        <StyledIconAbs>
          <Logo width="42px" height="100%" title="logo" />
        </StyledIconAbs>
      </Title>
      <HeaderControls>
        <HeaderElement>
          <NetworkSelector />
        </HeaderElement>
        <HeaderElement>
          <AccountElement active={!!account}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0, userSelect: 'none' }} pl="0.75rem" pr=".4rem" fontWeight={500}>
                <Trans>
                  {userEthBalance?.toSignificant(3)} {userEthBalance.currency.symbol}
                </Trans>
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElement>
          <ToggleMenuItem onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon opacity={0.6} size={16} /> : <Sun opacity={0.6} size={16} />}
          </ToggleMenuItem>
        </HeaderElement>
      </HeaderControls>
    </HeaderFrame>
  )
}
