import { ButtonLight } from 'components/Button'
import { Box, CheckCircle, Circle } from 'react-feather'
import styled from 'styled-components/macro'
import { AaveInterestMode } from 'types/1delta'

const ButtonBox = styled.div`
  margin-left: 20px;
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

interface DebtOptionButtonProps {
  handleSelectInterestMode: () => void
  hasStableBorrow: boolean
  selectedBorrowInterestMode: AaveInterestMode
  borrowRateStable: number
  borrowRateVariable: number
  isMobile: boolean
}

export const DebtOptionButton = ({
  handleSelectInterestMode,
  hasStableBorrow,
  selectedBorrowInterestMode,
  borrowRateStable,
  borrowRateVariable,
  isMobile,
}: DebtOptionButtonProps) => {
  const mobileSize = isMobile ? '12px' : '15px'
  return (
    <ButtonBox>
      {hasStableBorrow && (
        <ButtonLight
          height={'30px'}
          onClick={handleSelectInterestMode}
          style={{
            borderTopLeftRadius: '16px',
            borderBottomLeftRadius: '0px',
            marginLeft: '5px',
            marginRight: '3px',
            borderBottomRightRadius: '0px',
            borderTopRightRadius: '16px',
            width: !isMobile ? '350px' : '90%',
          }}
        >
          <YieldRowRight marked={selectedBorrowInterestMode === AaveInterestMode.STABLE}>
            {selectedBorrowInterestMode === AaveInterestMode.STABLE ? <CheckCircle /> : <Circle />}
            <SelfCenteredText fontSize={mobileSize}>Borrow rate stable:</SelfCenteredText>
            <SelfCenteredText fontSize={mobileSize}>{borrowRateStable.toLocaleString(undefined, { minimumFractionDigits: isMobile ? 2 : 3 })}%</SelfCenteredText>
          </YieldRowRight>
        </ButtonLight>
      )}
      <ButtonLight
        height={'30px'}
        onClick={handleSelectInterestMode}
        style={{
          borderTopLeftRadius: hasStableBorrow ? '0px' : '16px',
          borderBottomLeftRadius: '0px',
          marginLeft: '5px',
          marginRight: '3px',
          borderBottomRightRadius: '0px',
          borderTopRightRadius: hasStableBorrow ? '0px' : '16px',
          width: !isMobile ? '350px' : '90%',
        }}
      >
        <YieldRowRight marked={selectedBorrowInterestMode === AaveInterestMode.VARIABLE}>
          {selectedBorrowInterestMode === AaveInterestMode.VARIABLE ? <CheckCircle /> : <Circle />}
          <SelfCenteredText fontSize={mobileSize}>Borrow rate variable:</SelfCenteredText>
          <SelfCenteredText fontSize={mobileSize}>{borrowRateVariable.toLocaleString(undefined, { minimumFractionDigits: isMobile ? 2 : 3 })}%</SelfCenteredText>
        </YieldRowRight>
      </ButtonLight>
    </ButtonBox>
  )
}

interface CollateralYield {
  liquidityRate: number
  isMobile: boolean
}

export const DepositYield = ({ liquidityRate, isMobile }: CollateralYield) => {
  const mobileSize = isMobile ? '13px' : '15px'
  return (
    <ButtonBox>
      <ButtonLight
        height={'30px'}
        onClick={() => null}
        style={{
          borderTopLeftRadius: '16px',
          borderBottomLeftRadius: '0px',
          marginLeft: '5px',
          marginRight: '3px',
          borderBottomRightRadius: '0px',
          borderTopRightRadius: '16px',
          width: !isMobile ? '350px' : '250px',
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
