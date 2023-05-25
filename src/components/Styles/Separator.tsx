import { BaseButton } from 'components/Button'
import WalletIcon, { BorrowIcon, BorrowIcon2, MoneyIcon } from 'components/Wallet'
import { darken } from 'polished'
import { Box, Minus, Plus, X } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'

export const SeparatorBlock = styled.div`
  width: 10px;
  margin: 0px;
  height: 5px;
  border-radius: 100px;
  padding: 0px;
  margin: 0px;
`

export const SeparatorCell = styled.div`
  height: 5px;
  width: 200px;
  border-radius: 30px;
`

export const MidCell = styled.div`
  max-height: 5px;
  width: 100%;
`


const ButtonErrorStyle = styled(BaseButton)`
  background-color: ${({ theme }) => theme.backgroundInteractive};
  border: 1px solid ${({ theme }) => theme.backgroundInteractive};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.backgroundInteractive)};
    background-color: ${({ theme }) => darken(0.05, theme.backgroundInteractive)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.backgroundModule)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.backgroundInteractive)};
    background-color: ${({ theme }) => darken(0.1, theme.backgroundInteractive)};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
    background-color: ${({ theme }) => theme.backgroundInteractive};
    border: 1px solid ${({ theme }) => theme.backgroundInteractive};
  }
`

export const Button = styled(ButtonErrorStyle) <{ show: boolean | undefined }>`
  width: 170px;
  height: 24px;
  border-radius: 0px;
  text-color: ${({ theme }) => theme.accentAction};
  align-items: center;
  justify-content: space-around;
  text-align:center;
  padding: 0px;
  margin: 0px;
  font-size: 13px;
  overflow: visible;
`
export const Row = styled.div`
  display: flex;
  width: 100%;
  flex-direction:row;
  border-radius: 100px;
`

export const ButtonCell = styled.div`
  text-align: left;
  display: flex;
  justify-content: space-between;
  padding-left: 5px;
  padding-right: 5px;
  max-height: 13px;
  width: 100%;
  align-items: center;
  margin: auto;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  justify-content: space-between;
  `};
`

const RotatingPlus = styled.div <{ selected: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
${({ selected }) => selected ? 'transform: rotate(45deg);' : ''}
  transition: transform .2s ease-out;
`

const HeaderText = styled.div`
  font-size: 15px;
  margin-left: 10px;
  width: 170px;
  font-weight: bold;
`

const IconAndHeaderContainer = styled.div`
  text-align: left;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`

const StyledBox = styled(Box)`
filter: ${({ theme }) => theme.darkMode ? 'invert(45%) sepia(75%) saturate(680%) hue-rotate(190deg) brightness(96%) contrast(106%);' :
    'invert(20%) sepia(51%) saturate(4056%) hue-rotate(313deg) brightness(91%) contrast(101%);'}
`

export interface SeparatorProps {
  hasPosition: boolean
  show?: boolean
  setShow?: () => void
}

export const PlusComponent = styled(Plus)`
  color: ${({ theme }) => theme.accentAction};
`

export const MinusComponent = styled(Minus)`
  color: ${({ theme }) => theme.accentAction};
`


export function TopSeparator(props: SeparatorProps) {
  return (
    <Button
      style={{
        width: '100%', display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between', alignSelf: 'center', justifySelf: 'center'
      }} onClick={props.setShow}
      show={props.show}
    >
      <ButtonCell >
        <IconAndHeaderContainer>
          <StyledBox size={20} strokeWidth={'1px'} />
          <HeaderText>
            {props.show ? 'Deposits' : 'Show deposits'}
          </HeaderText>
        </IconAndHeaderContainer>
        <RotatingPlus selected={Boolean(props.show)}  >
          <PlusComponent size={18} />
        </RotatingPlus>
      </ButtonCell>
    </Button >
  )
}


export function Separator(props: SeparatorProps) {
  return (
    <Button
      style={{
        width: '100%', display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between', alignSelf: 'center', justifySelf: 'center'
      }} onClick={props.setShow}
      show={props.show}
    >
      <ButtonCell >
        <IconAndHeaderContainer>
          <MoneyIcon size={20} />
          <HeaderText>
            {props.show ? 'Collaterals' : 'Show collaterals'}
          </HeaderText>
        </IconAndHeaderContainer>
        <RotatingPlus selected={Boolean(props.show)}  >
          <PlusComponent size={18} />
        </RotatingPlus>
      </ButtonCell>
    </Button >
  )
}


export function WalletBalanceSeparator(props: SeparatorProps) {
  return (
    <Button
      style={{
        width: '100%', display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between', alignSelf: 'center', justifySelf: 'center'
      }} onClick={props.setShow}
      show={props.show}
    >
      <ButtonCell >
        <IconAndHeaderContainer>
          <WalletIcon size={20} />
          <HeaderText>
            {props.show ? 'Wallet assets' : 'Show wallet assets'}
          </HeaderText>
        </IconAndHeaderContainer>
        <RotatingPlus selected={Boolean(props.show)}  >
          <PlusComponent size={18} />
        </RotatingPlus>
      </ButtonCell>
    </Button >
  )
}

export function TopBorrowSeparator(props: SeparatorProps) {
  return (
    <Button
      style={{
        width: '100%', display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between', alignSelf: 'center', justifySelf: 'center'
      }} onClick={props.setShow}
      show={props.show}
    >
      <ButtonCell >
        <IconAndHeaderContainer>
          <BorrowIcon2 size={20} />
          <HeaderText>
            {props.show ? 'Debt' : 'Show debt'}
          </HeaderText>
        </IconAndHeaderContainer>
        <RotatingPlus selected={Boolean(props.show)}  >
          <PlusComponent size={18} />
        </RotatingPlus>
      </ButtonCell>
    </Button >
  )
}


export function BorrowSeparator(props: SeparatorProps) {
  return (
    <Button
      style={{
        width: '100%', display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between', alignSelf: 'center', justifySelf: 'center'
      }} onClick={props.setShow}
      show={props.show}
    >
      <ButtonCell >
        <IconAndHeaderContainer>
          <BorrowIcon size={20} />
          <HeaderText>
            {props.show ? 'Borrowables' : 'Show borrowables'}
          </HeaderText>
        </IconAndHeaderContainer>
        <RotatingPlus selected={Boolean(props.show)}  >
          <PlusComponent size={18} />
        </RotatingPlus>
      </ButtonCell>
    </Button >
  )
}
