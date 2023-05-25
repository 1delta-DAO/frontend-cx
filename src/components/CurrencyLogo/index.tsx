import { Currency } from '@uniswap/sdk-core'
import useCurrencyLogoURIs, { getTokenLogoURIBySymbol } from 'lib/hooks/useCurrencyLogoURIs'
import React, { useMemo } from 'react'
import styled from 'styled-components/macro'

import Logo from '../Logo'

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background: radial-gradient(white 50%, #ffffff00 calc(75% + 1px), #ffffff00 100%);
  border-radius: 50%;
  -mox-box-shadow: 0 0 1px black;
  -webkit-box-shadow: 0 0 1px black;
  box-shadow: 0 0 1px black;
  border: 0px solid rgba(255, 255, 255, 0);
`

const StyledNativeLogo = styled(StyledLogo)`
  -mox-box-shadow: 0 0 1px white;
  -webkit-box-shadow: 0 0 1px white;
  box-shadow: 0 0 1px white;
`

export default function CurrencyLogo({
  currency,
  symbol,
  size = '24px',
  style,
  src,
  ...rest
}: {
  currency?: Currency | null
  symbol?: string | null
  size?: string
  style?: React.CSSProperties
  src?: string | null
}) {
  let logoURIs: string[]

  const _logoURIsClassic = getTokenLogoURIBySymbol(currency?.symbol)
  const _logoURIsNew = useCurrencyLogoURIs(currency)
  if (_logoURIsClassic) {
    logoURIs = [_logoURIsClassic]
  } else {
    logoURIs = _logoURIsNew
  }
  const srcs = useMemo(() => (src ? [src] : logoURIs), [src, logoURIs])
  const props = {
    alt: `${currency?.symbol ?? 'token'} logo`,
    size,
    srcs,
    symbol: symbol ?? currency?.symbol,
    style,
    ...rest,
  }

  return currency?.isNative ? <StyledNativeLogo {...props} /> : <StyledLogo {...props} />
}
