import { AAVE_SVG, AAVE_SVG_STANDALONE, COMPOUNDV3_SVG, COMPOUNDV3_SVG_STANDALONE, PROTOCOL_SVGS, PROTOCOL_SVGS_STANDALONE } from 'constants/1delta'
import React, { useMemo } from 'react'
import { LendingProtocol } from 'state/1delta/actions'
import styled from 'styled-components/macro'

import Logo from '../Logo'

const StyledLogo = styled(Logo) <{ width: string; height: string }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  ${({ theme }) =>
    `filter: drop-shadow(0 0 0.25rem ${theme.deprecated_bg0});`}
`

const StyledLogoBlurred = styled(Logo) <{ width: string; height: string }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  filter: blur(2px);
`

// background: radial-gradient(white 50%, #ffffff00 calc(75% + 1px), #ffffff00 100%);
// border-radius: 50%;
// border: 0px solid rgba(255, 255, 255, 0);
// box-shadow: 0 0 1px black;

const StyledNativeLogo = styled(StyledLogo)`
  -mox-box-shadow: 0 0 1px white;
  -webkit-box-shadow: 0 0 1px white;
  box-shadow: 0 0 1px white;
`

export function LendingProtocolLogo({
  isSelected,
  chainId,
  protocol,
  symbol,
  width = '24px',
  height = '24px',
  style,
  src,
  ...rest
}: {
  isSelected: boolean
  chainId: number
  protocol: LendingProtocol
  symbol?: string | null
  width?: string
  height?: string
  style?: React.CSSProperties
  src?: string | null
}) {
  const logoURIs = protocol === LendingProtocol.AAVE ? [AAVE_SVG] : [PROTOCOL_SVGS[chainId]]

  const srcs = useMemo(() => (src ? [src] : logoURIs), [src, logoURIs])
  const props = {
    alt: 'protocol logo',
    width,
    height,
    srcs,
    style,
    ...rest,
  }

  return isSelected ? <StyledLogo  {...props} /> : <StyledLogoBlurred  {...props} />
}

export function LendingProtocolLogoRaw({
  chainId,
  protocol,
  symbol,
  width = '24px',
  height = '24px',
  style,
  src,
  ...rest
}: {
  isSelected: boolean
  chainId: number
  protocol: LendingProtocol
  symbol?: string | null
  width?: string
  height?: string
  style?: React.CSSProperties
  src?: string | null
}) {
  const logoURIs = protocol === LendingProtocol.AAVE ? [AAVE_SVG] :
    (protocol === LendingProtocol.COMPOUND ?
      [PROTOCOL_SVGS[chainId]] : [COMPOUNDV3_SVG]
    )
  const srcs = useMemo(() => (src ? [src] : logoURIs), [src, logoURIs])
  const props = {
    alt: 'protocol logo',
    width,
    height,
    srcs,
    style,
    ...rest,
  }

  return props.isSelected ? <StyledLogo  {...props} /> : <StyledLogoBlurred  {...props} />
}


const StyledLogoAltGeneral = styled.img <{ width: string; height: string, isSelected: boolean, marginLeft: string, marginRight: string }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  margin-left: ${({ marginLeft }) => marginLeft};
  margin-right: ${({ marginRight }) => marginRight};
  transition: transform 330ms ease-in-out;
  ${({ theme }) =>
    `filter: drop-shadow(0 0 0.05rem ${theme.darkMode ? 'white' : 'gray'});`}
  ${({ isSelected }) => isSelected ?
    `
   transform: scale(1.05);
   
   ` :
    `
    :hover{
      cursor: pointer;
    }
    filter: invert(91%) sepia(3%) saturate(17%) hue-rotate(325deg) brightness(82%) contrast(82%);
   transform: scale(0.95);
   opacity: 0.5;
   `}
`

export function LendingProtocolLogoGeneral({
  chainId,
  protocol,
  symbol,
  isSelected,
  width = '24px',
  height = '24px',
  marginLeft = '0px',
  marginRight = '0px',
  style,
  onClick,
  ...rest
}: {
  isSelected: boolean
  chainId: number
  protocol: LendingProtocol
  symbol?: string | null
  width?: string
  height?: string
  marginLeft?: string
  marginRight?: string
  style?: React.CSSProperties
  onClick: () => void
}) {
  const src = protocol === LendingProtocol.AAVE ? AAVE_SVG : (protocol === LendingProtocol.COMPOUND ? PROTOCOL_SVGS[chainId] : COMPOUNDV3_SVG)


  const props = {
    alt: 'protocol logo',
    width,
    height,
    src,
    style,
    isSelected,
    marginLeft,
    marginRight,
    ...rest,
  }

  return <StyledLogoAltGeneral  {...props} onClick={onClick} />
}


export function LendingProtocolLogoStandalone({
  chainId,
  protocol,
  symbol,
  isSelected,
  width = '24px',
  height = '24px',
  marginLeft = '0px',
  marginRight = '0px',
  style,
  onClick,
  ...rest
}: {
  isSelected: boolean
  chainId: number
  protocol: LendingProtocol
  symbol?: string | null
  width?: string
  height?: string
  marginLeft?: string
  marginRight?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  const src = protocol === LendingProtocol.AAVE ?
    AAVE_SVG_STANDALONE : (protocol === LendingProtocol.COMPOUND ?
      PROTOCOL_SVGS_STANDALONE[chainId] :
      COMPOUNDV3_SVG_STANDALONE)


  const props = {
    alt: 'protocol logo',
    width,
    height,
    src,
    style,
    isSelected,
    marginLeft,
    marginRight,
    ...rest,
  }

  return <StyledLogoAltGeneral  {...props} onClick={onClick} />
}
