import jazzicon from '@metamask/jazzicon'
import { NavBarVariant, useNavBarFlag } from 'featureFlags/flags/navBar'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components/macro'
import { useWeb3React } from '@web3-react/core'

const StyledIdenticon = styled.div<{ iconSize: number }>`
  height: ${({ iconSize }) => `${iconSize}px`};
  width: ${({ iconSize }) => `${iconSize}px`};
  border-radius: 1.125rem;
  background-color: ${({ theme }) => theme.deprecated_bg4};
  font-size: initial;
`

const StyledAvatar = styled.img`
  height: inherit;
  width: inherit;
  border-radius: inherit;
`

export default function Identicon({ size }: { size?: number }) {
  const { account } = useWeb3React()
  const [fetchable, setFetchable] = useState(true)
  const isNavbarEnabled = useNavBarFlag() === NavBarVariant.Enabled
  const iconSize = size ? size : isNavbarEnabled ? 24 : 16

  const icon = useMemo(() => account && jazzicon(iconSize, parseInt(account.slice(2, 10), 16)), [account, iconSize])
  const iconRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const current = iconRef.current
    if (icon) {
      current?.appendChild(icon)
      return () => {
        try {
          current?.removeChild(icon)
        } catch (e) {
          console.error('Avatar icon not found')
        }
      }
    }
    return
  }, [icon, iconRef])

  return (
    <StyledIdenticon iconSize={iconSize}>
      <span ref={iconRef} />
    </StyledIdenticon>
  )
}
