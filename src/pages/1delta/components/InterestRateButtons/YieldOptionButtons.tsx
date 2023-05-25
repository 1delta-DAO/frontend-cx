import { ButtonLight } from 'components/Button'
import { Box, CheckCircle, Circle } from 'react-feather'
import styled from 'styled-components/macro'
import { AaveInterestMode } from 'types/1delta'

export const YieldRowLeft = styled.div<{ marked: boolean }>`
  margin-right: 10px;
  flex-direction: row;
  display: flex;
  width: 100 %;
  gap: 10px;
  justify-content: space-between;
  ${({ marked }) =>
    marked
      ? `

  `
      : ''}
`

export const SelfCenteredText = styled.div<{ isMobile: boolean }>`
  align-self: center;
  font-size: ${({ isMobile }) => (isMobile ? '12px' : '14px')};
`

export const YieldRowRight = styled.div<{ marked: boolean }>`
  margin-left: 10px;
  flex-direction: row;
  display: flex;
  width: 100 %;
  justify-content: space-between;
  gap: 10px;
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

interface CollateralYield {
  liquidityRate: number
  isMobile: boolean
}

const ButtonRowBoxMarginTrade = styled.div`
  display: flex;
  flex-direction: row;
  align-items: space-between;
  justify-content: center;
  align-self: center;
      `

const ButtonBoxMarginTrade = styled.div<{ isMobile: boolean; height: string }>`
  display: flex;
  flex-direction: column;
  align-items: space-between;
  justify-content: center;
  align-self: center;
  ${({ height }) => height};
  ${({ isMobile }) =>
    isMobile
      ? `
      align-items: center;
  width: 100%;
  margin-top: 10px;
  `
      : ''}
`

export const DebtOptionButtonMarginTrade = ({
  handleSelectInterestMode,
  hasStableBorrow,
  selectedBorrowInterestMode,
  borrowRateStable,
  borrowRateVariable,
  isMobile,
}: DebtOptionButtonProps) => {
  return (
    <ButtonRowBoxMarginTrade>
      {hasStableBorrow && (
        <ButtonLight
          height={'30px'}
          onClick={handleSelectInterestMode}
          style={{
            borderTopLeftRadius: '10px',
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: hasStableBorrow ? '0px' : '10px',
            borderTopRightRadius: hasStableBorrow ? '0px' : '10px',
            width: isMobile ? '45%' : '50%',
          }}
        >
          <YieldRowRight marked={selectedBorrowInterestMode === AaveInterestMode.STABLE}>
            {selectedBorrowInterestMode === AaveInterestMode.STABLE ? <CheckCircle /> : <Circle />}
            <SelfCenteredText isMobile={isMobile}>Stable:</SelfCenteredText>
            <SelfCenteredText isMobile={isMobile}>{borrowRateStable.toLocaleString(undefined, { minimumFractionDigits: isMobile ? 2 : 3 })}%</SelfCenteredText>
          </YieldRowRight>
        </ButtonLight>
      )}
      <ButtonLight
        height={'30px'}
        onClick={handleSelectInterestMode}
        style={{
          borderTopLeftRadius: hasStableBorrow ? '0px' : '10px',
          borderBottomLeftRadius: hasStableBorrow ? '0px' : '10px',
          borderBottomRightRadius: '10px',
          borderTopRightRadius: '10px',
          width: hasStableBorrow ? isMobile ? '45%' : '50%' : isMobile ? '300px' : '350px',
        }}
      >
        <YieldRowRight marked={selectedBorrowInterestMode === AaveInterestMode.VARIABLE}>
          {selectedBorrowInterestMode === AaveInterestMode.VARIABLE ? <CheckCircle /> : <Circle />}
          <SelfCenteredText isMobile={isMobile}>Variable:</SelfCenteredText>
          <SelfCenteredText isMobile={isMobile}>{borrowRateVariable.toLocaleString(undefined, { minimumFractionDigits: isMobile ? 2 : 3 })}%</SelfCenteredText>
        </YieldRowRight>
      </ButtonLight>
    </ButtonRowBoxMarginTrade>
  )
}

export const DepositYieldMarginTrade = ({ liquidityRate, isMobile }: CollateralYield) => {
  return (
    <ButtonBoxMarginTrade isMobile={isMobile} height={isMobile ? '10px' : '100%'}>
      <ButtonLight
        height={'30px'}
        onClick={() => null}
        style={{
          borderTopLeftRadius: '10px',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          borderTopRightRadius: '10px',
          width: isMobile ? '300px' : '350px',
        }}
      >
        <YieldRowLeft marked={false}>
          <Box />
          <SelfCenteredText isMobile={isMobile}>Deposit rate:</SelfCenteredText>
          <SelfCenteredText isMobile={isMobile}>{liquidityRate.toLocaleString(undefined, { minimumFractionDigits: isMobile ? 2 : 3 })}%</SelfCenteredText>
        </YieldRowLeft>
      </ButtonLight>
    </ButtonBoxMarginTrade>
  )
}
