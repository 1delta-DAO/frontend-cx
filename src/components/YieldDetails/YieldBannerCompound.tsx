import { ButtonLight } from 'components/Button'
import { BarChart2, Box } from 'react-feather'
import styled from 'styled-components/macro'

const ButtonBox = styled.div`
  margin-left: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: space-between;
  justify-content: center;
  align-self: center;
`

export const YieldRowLeft = styled.div<{ marked: boolean }>`
  margin-right: 10px;
  flex-direction: row;
  display: flex;
  width: 100%;
  justify-content: space-between;
  ${({ marked }) =>
    marked
      ? `

`
      : ''}
`

export const SelfCenteredText = styled.div<{ fontSize: string }>`
  align-self: center;
  font-size: ${({ fontSize }) => fontSize};
`

export const YieldRowRight = styled.div<{ marked: boolean }>`
  margin-left: 10px;
  flex-direction: row;
  display: flex;
  width: 100%;
  justify-content: space-between;
  ${({ marked }) =>
    marked
      ? `

`
      : ''}
`

interface DebtYieldProps {
  borrowRate: number
  isMobile: boolean
  single?: boolean
}

export const DebtYieldMoneyMarket = ({ borrowRate, isMobile, single = false }: DebtYieldProps) => {
  const mobileSize = isMobile ? '12px' : '14px'
  return (
    <ButtonBox>
      <ButtonLight
        height={'30px'}
        onClick={() => null}
        style={{
          borderTopLeftRadius: '10px',
          borderBottomLeftRadius: single ? '10px' : '0px',
          marginLeft: '5px',
          marginRight: '3px',
          borderBottomRightRadius: single ? '10px' : '0px',
          borderTopRightRadius: '10px',
          width: !isMobile ? '350px' : '90%',
        }}
        marginBottom={'0px'}
      >
        <YieldRowRight marked>
          <BarChart2 />
          <SelfCenteredText fontSize={mobileSize}>Borrow rate:</SelfCenteredText>
          <SelfCenteredText fontSize={mobileSize}>{borrowRate.toLocaleString(undefined, { minimumFractionDigits: isMobile ? 2 : 3 })}%</SelfCenteredText>
        </YieldRowRight>
      </ButtonLight>
    </ButtonBox>
  )
}

interface CollateralYield {
  liquidityRate: number
  isMobile: boolean
  single?: boolean
}

export const DepositYieldMoneyMarket = ({ liquidityRate, isMobile, single = false }: CollateralYield) => {
  const mobileSize = isMobile ? '17px' : '15px'
  return (
    <ButtonBox>
      <ButtonLight
        height={'30px'}
        onClick={() => null}
        style={{
          borderTopLeftRadius: '16px',
          borderBottomLeftRadius: single ? '16px' : '0px',
          marginLeft: '5px',
          marginRight: '3px',
          borderBottomRightRadius: single ? '16px' : '0px',
          borderTopRightRadius: '16px',
          width: !isMobile ? '350px' : '90%',
        }}
      >
        <YieldRowLeft marked={false}>
          <Box />
          <SelfCenteredText fontSize={mobileSize}>Deposit rate:</SelfCenteredText>
          <SelfCenteredText fontSize={mobileSize}>{liquidityRate.toLocaleString(undefined, { minimumFractionDigits: isMobile ? 2 : 3 })}%</SelfCenteredText>
        </YieldRowLeft>
      </ButtonLight>
    </ButtonBox>
  )
}
