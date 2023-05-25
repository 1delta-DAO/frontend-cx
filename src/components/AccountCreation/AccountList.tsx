import { PageWrapper } from 'components/swap/styleds'
import React, { useMemo, useRef } from 'react'
import styled from 'styled-components/macro'
import { ExternalLink, Plus } from 'react-feather'
import { BLOCK_EXPLORER_PREFIXES } from 'utils/getExplorerLink'
import { OneDeltaAccount } from 'state/1delta/reducer'
import { Z_INDEX } from 'theme/zIndex'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { formatEther } from 'ethers/lib/utils'
import { darken } from 'polished'
import { BaseButton } from 'components/Button'
import { ReactComponent as SwitchIcon } from 'assets/svg/switch-circle.svg'
import { ReactComponent as CloseIcon } from 'assets/images/x.svg'

export const PageWrapperDropdownValues = styled.div<{ redesignFlag: boolean; navBarFlag: boolean }>`
  padding: ${({ navBarFlag }) => (navBarFlag ? '68px 8px 0px' : '0px 8px')};
  max-width: 480px;
  width: 100%;
  height: 100%;
  z-index: ${Z_INDEX.modalBackdrop};

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: ${({ navBarFlag }) => (navBarFlag ? '48px' : '0px')};
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: ${({ navBarFlag }) => (navBarFlag ? '20px' : '0px')};
  }
`

const Box = styled.div<{ selected: boolean; isLast: boolean; isFirst: boolean }>`
  z-index:  ${Z_INDEX.modalBackdrop};
  position: relative;
  min-width: 340px;
  backdrop-filter: blur(3px);
  ${({ isFirst }) =>
    isFirst
      ? `border-top-left-radius: 7px;
    border-top-right-radius: 7px;`
      : ''}
  ${({ isLast }) =>
    isLast
      ? `border-bottom-left-radius: 7px;
  border-bottom-right-radius: 7px;`
      : ''}
  height: 30px;
  ${({ selected, theme }) =>
    selected
      ? ''
      : `
    &:hover{
    border-left: 7px solid ${theme.deprecated_advancedBG};
  }
  cursor: pointer; `}
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  align-self: center;
`

const Container = styled.div<{ isMobile: boolean }>`
  position: relative;
  ${({ isMobile }) =>
    isMobile
      ? `margin-top: 10px;
     max-width: 350px;`
      : ''}
  max-height:30px;
  z-index: ${Z_INDEX.modalBackdrop};
`

const LinkIconWrapper = styled.a`
  align-items: center;
  justify-content: center;
  display: flex;
  :hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
  :active {
    opacity: ${({ theme }) => theme.opacity.click};
  }
`

const AccountText = styled.p <{ stringLength: number, textAlign: string, width: string }>`
color: ${({ theme }) => theme.textPrimary};
font-size: ${({ stringLength }) => stringLength > 25 ? '10px' : '12px'};
margin-left: 15px;
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
margin-left: 10px;`}
text-align: ${({ textAlign }) => textAlign};
width: ${({ width }) => width};
margin-top: auto;
margin-bottom: auto;
`

export const SelectionButton = styled(BaseButton)`
  background-color: ${({ theme }) => theme.deprecated_primary5};
  color: ${({ theme }) => theme.deprecated_primaryText1};
  opacity: 0.8;
  font-size: 12px;
  &:focus {
      ${({ theme, disabled }) =>
    !disabled && darken(0.03, theme.deprecated_primary5)};
    background-color: ${({ theme, disabled }) =>
    !disabled && darken(0.03, theme.deprecated_primary5)};
  }
  &:hover {
    background-color: ${({ theme, disabled }) =>
    !disabled && darken(0.03, theme.deprecated_primary5)};
  }
  &:active {
      ${({ theme, disabled }) =>
    !disabled && darken(0.05, theme.deprecated_primary5)};
    background-color: ${({ theme, disabled }) =>
    !disabled && darken(0.05, theme.deprecated_primary5)};
  }
  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: ${({ theme }) => theme.deprecated_primary5};
      box-shadow: none;
      outline: none;
    }
  }
`

const Background = styled.div<{ selected: boolean; isLast: boolean; isFirst: boolean }>`
  position: absolute;
  width: 100%;
  height:100%;
  min-width: 250px;
  min-height: 30px;
  z-index: -99;
  backdrop-filter: blur(1px);
  opacity: 0.5;
  background: ${({ theme }) => theme.backgroundSurface};
  ${({ isFirst }) =>
    isFirst
      ? `border-top-left-radius: 7px;
  border-top-right-radius: 7px;`
      : ''}
${({ isLast }) =>
    isLast
      ? `border-bottom-left-radius: 7px;
border-bottom-right-radius: 7px;`
      : ''}
min-height: 30px;
`

const StyledLinkIcon = styled(ExternalLink) <{ isSelected: boolean }>`
  color: ${({ theme }) => theme.textPrimary};
  stroke: ${({ isSelected }) => isSelected ? '2px' : '1px'};
  padding: 3px;
  width: 20px;
  margin: 3px;
`

const Switch = styled(SwitchIcon)`
width: 20px;
height: 20px;
filter: ${({ theme }) => theme.darkMode ? 'invert(45%) sepia(75%) saturate(680%) hue-rotate(190deg) brightness(96%) contrast(106%);' :
    'invert(20%) sepia(51%) saturate(4056%) hue-rotate(313deg) brightness(91%) contrast(101%);'}
`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
`

interface AccountListProps {
  setSelectingAccount: (set: boolean) => void
  chainId: number
  userWallet?: string
  isMobile: boolean
  redesignFlag?: boolean
  accounts: { [index: number]: OneDeltaAccount }
  selectedAccount: number
  selectAccount: (index: number) => void
  selectingAccount: boolean
  onCreateAccount: () => void
}

interface AccountBannerProps {
  isOnlyAccount: boolean
  selectingAccount: boolean
  isFirst: boolean
  isLast: boolean
  isMobile: boolean
  index: number
  selectedAccount: number
  account: OneDeltaAccount
  explorerLink: string
  selectAccount: (index: number) => void
  setSelectingAccount?: (set: boolean) => void
  onCreateAccount: () => void
}

const AccountBanner = ({
  isOnlyAccount,
  index,
  selectedAccount,
  account,
  isMobile,
  isFirst,
  isLast,
  selectAccount,
  explorerLink,
  setSelectingAccount,
  selectingAccount,
  onCreateAccount
}: AccountBannerProps) => {
  const isSelected = index === selectedAccount

  const onClick = () => {
    if (!isOnlyAccount) {
      if (isSelected && setSelectingAccount) {
        if (selectingAccount) {
          setSelectingAccount(false)
        } else {
          return setSelectingAccount(true)
        }
      }

      selectAccount(index)
      if (setSelectingAccount) setSelectingAccount(false)
    }
  }

  const accountLiquidity = Number(formatEther(account?.compoundSummary?.liquidity ?? '0'))

  return (
    <Box selected={isSelected} key={account.accountAddress} isFirst={isFirst} isLast={isLast} onClick={onClick}>
      <Background selected={isSelected} isFirst={isFirst} isLast={isLast} onClick={onClick} />
      <Row key={account.accountAddress}>
        {/* {selectingAccount && isSelected && <Banner src={LOGO_ACCOUNT_SVG} />} */}

        <AccountText
          stringLength={account.accountName.length}
          textAlign={isSelected ? 'center' : 'left'}
          width="50%"
        >
          {account.accountName}
        </AccountText>
        {!isSelected && (
          <AccountText
            stringLength={account.accountName.length}
            textAlign={'left'}
            width={'30%'}
          >
            {accountLiquidity > 0 ? `$${accountLiquidity.toLocaleString()}` : '-'}
          </AccountText>
        )}
        <LinkIconWrapper type="Link" href={explorerLink ?? ''} target={'_blank'} rel={'noopener noreferrer'}>
          <StyledLinkIcon
            isSelected={isSelected}
            href={explorerLink ?? ''}
          />
        </LinkIconWrapper>
        {isSelected && (
          <ButtonContainer>
            <SelectionButton
              onClick={onClick}
              disabled={isOnlyAccount}
              style={{
                width: '45px',
                padding: '0px',
                height: '30px',
                marginLeft: '10px',
                borderRadius: '0px',
                marginRight: '0px',
                zIndex: Z_INDEX.modalBackdrop,
              }}
            >
              {selectingAccount && isSelected ? <CloseIcon /> : index !== selectedAccount ? 'Select' : <Switch />}
            </SelectionButton>

            <SelectionButton
              onClick={onCreateAccount}
              style={{
                width: '45px',
                padding: '0px',
                height: '30px',
                borderTopRightRadius: '7px',
                borderTopLeftRadius: '0px',
                borderBottomRightRadius: selectingAccount ? '0px' : '7px',
                marginRight: '0px',
                borderBottomLeftRadius: '0px',
                zIndex: Z_INDEX.modalBackdrop,
              }}
            >
              <Plus />
            </SelectionButton>
          </ButtonContainer>
        )}
      </Row>
    </Box>
  )
}

export default function AccountList({
  chainId,
  userWallet,
  accounts,
  isMobile,
  selectedAccount,
  redesignFlag,
  selectAccount,
  setSelectingAccount,
  selectingAccount,
  onCreateAccount
}: AccountListProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(wrapperRef, () => setSelectingAccount(false))

  const data = useMemo(
    () =>
      Object.keys(accounts).map((k) => {
        return {
          index: Number(k),
          account: accounts[Number(k)],
          explorerLink: `${BLOCK_EXPLORER_PREFIXES[chainId]}/address/${accounts[Number(k)].accountAddress}`,
        }
      }),
    [accounts, chainId, userWallet]
  )
  const isOnlyAccount = data.length === 1
  return (
    <Container isMobile={isMobile} ref={wrapperRef}>
      <PageWrapper redesignFlag={Boolean(redesignFlag)} navBarFlag={false}>
        {data[selectedAccount] &&
          AccountBanner({
            isOnlyAccount,
            isFirst: true,
            isLast: data.length > 0 && !selectingAccount,
            explorerLink: data[selectedAccount].explorerLink,
            selectAccount,
            account: accounts[selectedAccount],
            isMobile,
            index: selectedAccount,
            selectedAccount,
            setSelectingAccount,
            selectingAccount,
            onCreateAccount
          })}
      </PageWrapper>
      {selectingAccount && <PageWrapperDropdownValues redesignFlag={Boolean(redesignFlag)} navBarFlag={false}>
        {data
          .filter((_, i) => i !== selectedAccount)
          .map((x, index) => {
            return (
              <div key={x.account.accountAddress}>
                {AccountBanner({
                  isOnlyAccount,
                  isFirst: false,
                  isLast: data.length - 1 === index + 1,
                  explorerLink: x.explorerLink,
                  selectAccount,
                  account: x.account,
                  isMobile,
                  index: x.index,
                  selectedAccount,
                  setSelectingAccount,
                  selectingAccount,
                  onCreateAccount
                })}
              </div>
            )
          })}
      </PageWrapperDropdownValues>}
    </Container>
  )
}
