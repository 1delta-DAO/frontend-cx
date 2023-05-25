import { BaseButton } from 'components/Button'
import { darken } from 'polished'
import { Minus, Plus } from 'react-feather'
import styled from 'styled-components/macro'

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

export const Button = styled(ButtonErrorStyle)`
  width: 170px;
  max-height: 15px;
  border-radius: 30px;
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
  display: flex;
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;
  justify-content: flex-start;
  padding-left: 5px;
  border-top-right-radius: 100px;
  border-bottom-right-radius: 100px;
  justify-content: flex-end;
  padding-right: 5px;
  justify-content: space-around;
  max-height: 13px;
  width: 100%;
  align-items: center;
  margin: auto;
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

export default function Separator(props: SeparatorProps) {


  return (
    <Button
      style={{
        width: '95%', display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between', alignSelf: 'center', justifySelf: 'center'
      }} onClick={props.setShow}

    >
      <ButtonCell >
        {props.show ? <MinusComponent size={12} /> : <PlusComponent size={12} />}

        <div style={{ fontSize: '12px' }}>
          {props.show ? 'Hide assets with no debt' : 'Show all borrowable assets'}
        </div>
        {props.show ? <MinusComponent size={12} /> : <PlusComponent size={12} />}
      </ButtonCell>
    </Button >
  )
}