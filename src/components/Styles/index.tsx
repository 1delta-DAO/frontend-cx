import styled from 'styled-components/macro'
import { Z_INDEX } from 'theme/zIndex'

export const MarginTradingButtonText = styled.div`
  text-align: center;
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
 font-size: 12px;
`};
`

export const SwapPanelContainer = styled.div<{ redesignFlag: boolean }>`
  min-height: ${({ redesignFlag }) => redesignFlag && '69px'};
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_bg0)};
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_bg2)};
  width: initial;
  ${({ theme, redesignFlag }) =>
    !redesignFlag &&
    `
    :focus,
    :hover {
      border: 1px solid  ${theme.deprecated_bg3};
    }
  `}
`


export const AutoColumnAdjusted = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  isMobile: boolean
}>`
  ${({ isMobile }) => (!isMobile ? 'flex-direction: row;' : 'flex-direction: row;')}
  width: 100%;
  justify-items: ${({ justify }) => justify && justify};
`


export const MarginTradeArrowWrapper = styled.div`
  position: absolute;
  z-index: ${Z_INDEX.modal};
  height: 30px;
  width: 40px;
  background: ${({ theme }) => (theme.deprecated_bg1)};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid  ${({ theme }) => (theme.deprecated_bg0)};
  &:hover {
    color: ${({ theme }) => theme.hoverState};
    cursor: pointer;
  }
`

export const PositionSideKey = styled.span<{ textAlign: string }>`
  color: ${({ theme }) => theme.textTertiary};
  font-size: 14px;
  font-weight: 700;
  height: 10px;
  letter-spacing: 0.1rem;
  margin-top: 2px;
  text-align: ${({ textAlign }) => textAlign};
  width: 80%;
  min-height: 18px;
`

export const PanelContainer = styled.div<{ isMobile: boolean }>`
  ${({ isMobile }) =>
    isMobile
      ? `
  display: flex;
  flex-direction: column;
  align-items: space-between;
  justify-content: center;
  margin: 5px;
`
      : `display: flex;
    flex-direction: row;
    align-items: space-between;
    justify-content: center;
    margin: 5px;
    width:100%;`}
`


export const CardLine = styled.hr`
margin-top: 10px;
margin-bottom: 5px;
height: 1px;
border: none;
background-color: ${({ theme }) => theme.textTertiary};
color: white;
width: 80%;
size: 0.2rem;
opacity: 0.1;
`