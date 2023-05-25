/* eslint-disable */
import { DialogContent, DialogOverlay } from '@reach/dialog'
import { transparentize } from 'polished'
import React from 'react'
import { animated, useSpring, useTransition } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import styled, { css } from 'styled-components/macro'
import { Z_INDEX } from 'theme/zIndex'

// import { isMobile } from '../../../utils/userAgent'

const AnimatedDialogOverlay = animated(DialogOverlay)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: ${Z_INDEX.modalBackdrop};
    background-color: transparent;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: ${({ theme }) => theme.deprecated_modalBG};
  }
`

const AnimatedDialogContent = animated(DialogContent)
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, minWidth, maxWidth, ...rest }) => (
  <AnimatedDialogContent {...rest} />
)).attrs({
  'aria-label': 'dialog',
})`
  overflow-y: auto;

  &[data-reach-dialog-content] {
    margin: 0 0 2rem 0;
    background-color: ${({ theme }) => theme.deprecated_bg0};
    border: 1px solid ${({ theme }) => theme.deprecated_bg1};
    box-shadow: ${({ theme }) => `0 4px 8px 0 ${transparentize(0.95, theme.shadow1)}`};
    padding: 0px;
    width: 50vw;
    overflow-y: auto;
    overflow-x: hidden;

    align-self: ${({ mobile }) => (mobile ? 'flex-start' : 'center')};

    min-width: ${({ minWidth, mobile }) => (mobile ? '450px' : minWidth)}px;

    max-width: ${({ maxWidth, mobile }) => (mobile ? '450px' : maxWidth)}px;
    ${({ maxHeight }) =>
    maxHeight &&
    css`
        max-height: ${maxHeight}vh;
      `}
    ${({ minHeight }) =>
    minHeight &&
    css`
        min-height: ${minHeight}vh;
      `}
    display: flex;
    border-radius: 20px;
    ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
      width: 65vw;
      margin: 0;
    `}
    ${({ theme, mobile }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
      width: 99vw;
      ${mobile &&
    css`
          width: 97vw;
          border-radius: 20px;
          margin-top: 75px;
        `
    }
    `}
  }
`

interface ModalProps {
  isMobile: boolean
  isOpen: boolean
  onDismiss: () => void
  minHeight?: number | false
  maxHeight?: number
  minWidth?: number
  maxWidth?: number
  initialFocusRef?: React.RefObject<any>
  children?: React.ReactNode
  redesignFlag?: boolean
}

export default function AccountCreationModal({
  isMobile,
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 90,
  minWidth = 450,
  maxWidth = 450,
  initialFocusRef,
  children,
  redesignFlag,
}: ModalProps) {
  const fadeTransition = useTransition(isOpen, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  const [{ y }, set] = useSpring(() => ({ y: 0, config: { mass: 1, tension: 210, friction: 20 } }))
  const bind = useGesture({
    onDrag: (state) => {
      set({
        y: state.down ? state.movement[1] : 0,
      })
      if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
        onDismiss()
      }
    },
  })

  return (
    <>
      {fadeTransition(
        ({ opacity }, item) =>
          item && (
            <StyledDialogOverlay
              as={AnimatedDialogOverlay}
              style={{ opacity: opacity.to({ range: [0.0, 1.0], output: [0, 1] }) }}
              onDismiss={onDismiss}
              initialFocusRef={initialFocusRef}
              unstable_lockFocusAcrossFrames={false}
            >
              <StyledDialogContent
                {...(isMobile
                  ? {
                    // ...bind(),
                    style: { transform: y.interpolate((y) => `translateY(${(y as number) > 0 ? y : 0}px)`) },
                  }
                  : {})}
                aria-label="dialog content"
                minHeight={minHeight}
                maxHeight={maxHeight}
                mobile={isMobile}
                minWidth={minWidth}
                maxWidth={maxWidth}
              >
                {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                {children}
              </StyledDialogContent>
            </StyledDialogOverlay>
          )
      )}
    </>
  )
}
