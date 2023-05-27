import Loader from 'components/Loader'
import { NavBarVariant, useNavBarFlag } from 'featureFlags/flags/navBar'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation, BrowserRouter } from 'react-router-dom'
import { useIsDarkMode } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { Z_INDEX } from 'theme/zIndex'

import Professional from './Professional'
import { useAnalyticsReporter } from '../components/analytics'
import ErrorBoundary from '../components/ErrorBoundary'
import Header from '../components/Header'
import Polling from '../components/Header/Polling'
import NavBar from '../components/NavBar'
import Popups from '../components/Popups'
import { useIsExpertMode } from '../state/user/hooks'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'

// const Professional = lazy(() => import('./Professional'))
// const Home = lazy(() => import('./1delta'))


const AppWrapper = styled.div<{ redesignFlagEnabled: boolean }>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  font-feature-settings: ${({ redesignFlagEnabled }) =>
    redesignFlagEnabled ? undefined : "'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on"};
`

const BodyWrapper = styled.div<{ navBarFlag: NavBarVariant }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ navBarFlag }) => (navBarFlag === NavBarVariant.Enabled ? `72px 0px 0px 0px` : `120px 0px 0px 0px`)};
  align-items: center;
  flex: 1;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    padding: 52px 0px 16px 0px;
  `};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  position: fixed;
  top: 0;
  z-index: ${Z_INDEX.sticky};
`

const Marginer = styled.div`
  margin-top: 5rem;
`

function getCurrentPageFromLocation(locationPathname: string): string | undefined {
  switch (locationPathname) {
    case '/swap':
      return 'SWAP_PAGE'
    case '/vote':
      return 'VOTE_PAGE'
    case '/pool':
      return 'POOL_PAGE'
    case '/tokens':
      return 'TOKENS_PAGE'
    default:
      return undefined
  }
}

export default function App() {
  const navBarFlag = useNavBarFlag()
  const redesignFlagEnabled = useRedesignFlag() === RedesignVariant.Enabled

  const { pathname } = useLocation()
  const currentPage = getCurrentPageFromLocation(pathname)
  const isDarkMode = useIsDarkMode()
  const isExpertMode = useIsExpertMode()

  useAnalyticsReporter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <ErrorBoundary>
      <DarkModeQueryParamReader />
      <AppWrapper redesignFlagEnabled={redesignFlagEnabled}>
        <HeaderWrapper>{navBarFlag === NavBarVariant.Enabled ? <NavBar /> : <Header />}</HeaderWrapper>
        <BodyWrapper navBarFlag={navBarFlag}>
          <Popups />
          <Polling />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Professional />} />
            </Routes>
          </Suspense>
          <Marginer />
        </BodyWrapper>
      </AppWrapper>
    </ErrorBoundary>
  )
}
