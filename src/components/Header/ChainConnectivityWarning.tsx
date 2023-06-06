import { Trans } from '@lingui/macro'
import { getChainInfoOrDefault, L2ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { AlertOctagon, AlertTriangle } from 'react-feather'
import { useChainId } from 'state/globalNetwork/hooks'
import styled from 'styled-components/macro'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'
import { Z_INDEX } from 'theme/zIndex'

const BodyRow = styled.div<{ $redesignFlag?: boolean }>`
  color: ${({ theme, $redesignFlag }) => ($redesignFlag ? theme.textPrimary : theme.black)};
  font-size: 12px;
  font-weight: ${({ $redesignFlag }) => $redesignFlag && '400'};
  font-size: ${({ $redesignFlag }) => ($redesignFlag ? '14px' : '12px')};
  line-height: ${({ $redesignFlag }) => $redesignFlag && '20px'};
`
const CautionOctagon = styled(AlertOctagon)`
  color: ${({ theme }) => theme.deprecated_black};
`

const CautionTriangle = styled(AlertTriangle)`
  color: ${({ theme }) => theme.accentWarning};
`
const Link = styled(ExternalLink)`
  color: ${({ theme }) => theme.deprecated_black};
  text-decoration: underline;
`
const TitleRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
`
const TitleText = styled.div<{ redesignFlag?: boolean }>`
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.textPrimary : theme.black)};
  font-weight: ${({ redesignFlag }) => (redesignFlag ? '500' : '600')};
  font-size: 16px;
  line-height: ${({ redesignFlag }) => (redesignFlag ? '24px' : '20px')};
  margin: 0px 12px;
`
const Wrapper = styled.div<{ redesignFlag?: boolean }>`
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.backgroundSurface : theme.deprecated_yellow3)};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  bottom: 60px;
  display: none;
  max-width: 348px;
  padding: 16px 20px;
  position: fixed;
  right: 16px;
  z-index: ${Z_INDEX.modal};
  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToMedium}px) {
    display: block;
  }
`

export function ChainConnectivityWarning() {
  const chainId = useChainId()
  const info = getChainInfoOrDefault(chainId)
  const label = info?.label
  const redesignFlag = useRedesignFlag() === RedesignVariant.Enabled

  return (
    <Wrapper redesignFlag={redesignFlag}>
      <TitleRow>
        {redesignFlag ? <CautionTriangle /> : <CautionOctagon />}
        <TitleText redesignFlag={redesignFlag}>
          <>Network Warning</>
        </TitleText>
      </TitleRow>
      <BodyRow $redesignFlag={redesignFlag}>
        {chainId === SupportedChainId.MAINNET ? (
          <>You may have lost your network connection.</>
        ) : (
          <>{label} might be down right now, or you may have lost your network connection.</>
        )}{' '}
        {(info as L2ChainInfo).statusPage !== undefined && (
          <span>
            <>Check network status</>{' '}
            <Link href={(info as L2ChainInfo).statusPage || ''}>
              <>here.</>
            </Link>
          </span>
        )}
      </BodyRow>
    </Wrapper>
  )
}
