import { LendingProtocolLogo, LendingProtocolLogoGeneral, LendingProtocolLogoStandalone } from 'components/ProtocolLogo'
import { LendingProtocol } from 'state/1delta/actions'
import { ThemedText } from 'theme'
import styled from 'styled-components/macro'
import { useMemo } from 'react'
import { SupportedChainId } from 'constants/chains'
import { BaseButton } from 'components/Button'
import { POLYGON_CHAINS, toLenderText } from 'constants/1delta'

export const Container = styled.div`
  display: flex;
  align-items: space-between;
  justify-content: space-between;
  width: 90%;
  max-width: 300px;
  cursor: pointer;
`

export const RegularRow = styled.div`
  display: flex;
  align-items: space-between;
  justify-content: center;
  width: 100px;
`

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 5px;
  align-items: center;
  justify-content: center;
`

export const ContainerRight = styled.div`
  margin-left: -15px;
  z-index: 0;
`

export const ContainerLeft = styled.div`
  margin-right: 0px;
  z-index: 1;
`

const PROTOCOLS = [LendingProtocol.AAVE, LendingProtocol.COMPOUND, LendingProtocol.COMPOUNDV3]

export const ContainerCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;
`
export const LogoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

export const GeneralLogoContainer = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 50px;
  ${({ isSelected, }) => isSelected ? `
  height: 60px;
  width: 60px;
  `: `
  `}
`

interface LendingProtocolPickerProps {
  chainId: number
  currentProtocol: LendingProtocol
  isMobile: boolean
  handleProtocolSwitch: (target: LendingProtocol) => void
}


const SELECTABLE_LENDER: { [chainId: number]: LendingProtocol[] } = {
  [SupportedChainId.MAINNET]: [LendingProtocol.COMPOUND],
  [SupportedChainId.GOERLI]: [LendingProtocol.AAVE, LendingProtocol.COMPOUND],
  [SupportedChainId.POLYGON_MUMBAI]: [LendingProtocol.AAVE, LendingProtocol.COMPOUND, LendingProtocol.COMPOUNDV3],
  [SupportedChainId.POLYGON]: [LendingProtocol.AAVE, LendingProtocol.COMPOUND]
}


const WIDTHS: { [p in LendingProtocol] } = {
  [LendingProtocol.AAVE]: '80px',
  [LendingProtocol.COMPOUND]: '40px',
  [LendingProtocol.COMPOUNDV3]: '35px',
}

const HEIGHTS: { [p in LendingProtocol] } = {
  [LendingProtocol.AAVE]: '40px',
  [LendingProtocol.COMPOUND]: '40px',
  [LendingProtocol.COMPOUNDV3]: '100%',
}

export const LendingProtocolPicker = ({
  isMobile,
  chainId,
  currentProtocol,
  handleProtocolSwitch,
}: LendingProtocolPickerProps) => {

  return (
    <LogoRow>
      {
        SELECTABLE_LENDER[chainId].map((p, i) => {
          return (
            <GeneralLogoContainer isSelected={p === currentProtocol} key={p}  >
              <LendingProtocolLogoGeneral
                onClick={() => handleProtocolSwitch(p)}
                isSelected={p === currentProtocol}
                chainId={chainId}
                width={WIDTHS[p]}
                height={HEIGHTS[p]}
                protocol={p}
              />
            </GeneralLogoContainer>
          )
        })
      }
    </LogoRow>
  )
}


export const StandaloneLogoContainer = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1px;
  width: 50px;
  ${({ isSelected, }) => isSelected ? `
  height: 60px;
  `: `
  `}
`

export const ButtonLightBoring = styled(BaseButton) <{ redesignFlag?: boolean }>`
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentAction : theme.deprecated_primaryText1)};
  font-size: ${({ redesignFlag }) => (redesignFlag ? '20px' : '16px')};
  font-weight: ${({ redesignFlag }) => (redesignFlag ? '600' : '500')};

  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: ${({ theme, redesignFlag }) => (redesignFlag ? 'transparent' : theme.deprecated_primary5)};
      box-shadow: none;
      outline: none;
    }
  }
`


const LenderButton = styled(ButtonLightBoring) <{ selected: boolean }>`
border-radius: 0px;
font-size: 10px;
width: 110px;
display: flex;
padding: 1px;
flex-direction: row;
justify-content: cneter;
align-items: center;
white-space: nowrap;
&:first-child {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  padding-left: 10px;
}
&:last-child {
  border-top-right-radius: 10px;
  padding-right: 10px;
  border-bottom-right-radius: 10px;
}
height: 40px;
${({ theme, selected }) =>
    selected ?
      `
  background-color: ${theme.backgroundModule};
  font-weight: bold;
  `: `
  opacity: 0.5;
  background-color: ${theme.deprecated_bg3};
  `
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 100%;
`};
`

export const LendingProtocolPickerBoring = ({
  isMobile,
  chainId,
  currentProtocol,
  handleProtocolSwitch,
}: LendingProtocolPickerProps) => {

  return (
    <LogoRow>
      {
        SELECTABLE_LENDER[chainId].map((p, i) => {
          return (
            <LenderButton selected={p === currentProtocol} onClick={() => handleProtocolSwitch(p)} key={p}>
              <StandaloneLogoContainer isSelected={p === currentProtocol}   >
                <LendingProtocolLogoStandalone
                  isSelected={p === currentProtocol}
                  chainId={chainId}
                  protocol={p}
                  height='100%'
                  width='22px'
                />
              </StandaloneLogoContainer>
              {/* <ThemedText.DeprecatedSmall margin={0} > */}
              {toLenderText(p, chainId)}
              {/* </ThemedText.DeprecatedSmall> */}
            </LenderButton>
          )
        })
      }
    </LogoRow>
  )
}