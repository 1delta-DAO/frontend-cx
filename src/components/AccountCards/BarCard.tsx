import React, { useMemo } from 'react'
import { LendingProtocol } from 'state/1delta/actions'
import styled from 'styled-components/macro'
import { Z_INDEX } from 'theme/zIndex'
import HelpCircleIcon from './HelpCircleIcon'
import { ArrowRight } from 'react-feather'
import { darken, lighten } from 'polished'

const HEALTH_FACTOR_CRITICAL = 1.05
const HEALTH_FACTOR_AT_RISK = 1.1

enum Level {
  CRITICAL,
  AT_RISK,
  OK
}

const AccountCard = styled.div<{ isAave: boolean }>`
width: 100%;
max-width: 300px;
box-shadow: ${({ theme }) => theme.shadow1};
border-radius: 7px;
height: 50%;
background: ${({ theme }) => theme.deprecated_bg2};
text-align: left;
padding: 1rem;
display: flex;
flex-direction: column;
height: 140px;
${({ theme, isAave }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 95%;
  height: 120px;
  max-width: unset;
  padding: 1.0rem;
  :nth-child(1) { order: 1; }
  :nth-child(2) { order: 2; }
  :nth-child(3) { order: 4; }
  :nth-child(4) { order: 3; }
`};
${({ theme, isAave }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
:nth-child(1) { order: 1; }
:nth-child(2) { order: 2; }
:nth-child(3) { order: 4; }
:nth-child(4) { order: 3; }
max-width: 400px;
`};
z-index: ${Z_INDEX.deprecated_zero};
`

const AccountCardHeading = styled.span`
font-size: 14px;
color: ${({ theme }) => theme.textSecondary};
`

const BarCol = styled.div`
margin-top: 5px;
padding: 2px;
display: flex;
flex-direction: column;
`

const ProgressWrapper = styled.div`
width: 100%;
height: 7px;
border-radius: 20px;
background-color: ${({ theme }) => theme.backgroundOutline};
position: relative;
`

const Progress = styled.div<{ percentageString?: string, level: Level }>`
height: 7px;
border-radius: 20px;
opacity: 0.6;
${({ theme, level }) => `
    background-color: ${(level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ? theme.accentFailure : theme.accentSuccess)};
    box-shadow: ${(level === Level.AT_RISK ? `
    0px 0px 0.1rem 0.1rem  ${theme.accentWarning};
    `  : level === Level.CRITICAL ? `
    0px 0px 2px 2px  ${theme.accentFailure};
    ` : `
    0px 0px 1px 1px ${theme.accentSuccess};
    ` )}`}
width: ${({ percentageString }) => percentageString ?? '0%'};
`

const ProgressValue = styled.span<{ level: Level }>`
color: ${({ theme, level }) =>
    (level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ? theme.accentFailure : theme.accentSuccess)};
font-size: 16px;
font-weight: 500;
`

const RowFromLeft = styled.div`
display: flex;
flex-direction: row;
justify-content: flex-start;
align-items: flex-start;
`

const RowSpaceBetween = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: flex-start;
`



export default function BarCard({
  notConnected,
  currentProtocol,
  hasBalance,
  ltv,
  healthFactor
}: {
  notConnected: boolean
  currentProtocol: LendingProtocol,
  hasBalance: boolean,
  ltv: number,
  healthFactor: number
}) {

  const [safeLtv, safeHf, state] = useMemo(() => {
    const _safeLtv = Number(ltv)
    const _safeHf = healthFactor === 0 ? 100 : Number(healthFactor)
    const _state = (_safeHf < HEALTH_FACTOR_CRITICAL) ? Level.CRITICAL :
      (_safeHf < HEALTH_FACTOR_AT_RISK) ? Level.AT_RISK : Level.OK
    return [_safeLtv, _safeHf, _state]
  }, [ltv, healthFactor])

  return (<AccountCard isAave={notConnected}>
    <BarCol>
      <RowSpaceBetween>
        <RowFromLeft>
          <AccountCardHeading>Loan-to-Value</AccountCardHeading>
          {HelpCircleIcon('Measures the $ value of your collateral in relation to your supplies. If it is higher than 100%, your account is flagged for liquidation.')}
        </RowFromLeft>
        <ProgressValue
          level={state}
        >{(!hasBalance || isNaN(safeLtv)) ? '-' : `${(ltv).toLocaleString(undefined, { minimumFractionDigits: 2 })}%`}</ProgressValue>{' '}
      </RowSpaceBetween>
      <ProgressWrapper>
        <Progress
          percentageString={`${ltv}%`}
          level={state}
        />
      </ProgressWrapper>
      <div style={{ height: '25px' }} />
      <RowSpaceBetween>
        <RowFromLeft>
          <AccountCardHeading>Health Factor</AccountCardHeading>
          {HelpCircleIcon('If the health factor is lower than 1.0, your account is flagged for liquidation.')}
        </RowFromLeft>
        <ProgressValue
          level={state}
        >
          {!hasBalance
            ? '-'
            : safeHf === 0
              ? '\u221e'
              : safeHf > 10e6
                ? '>1M'
                : healthFactor.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </ProgressValue>
      </RowSpaceBetween>
      <ProgressWrapper>
        <Progress
          percentageString={`${((safeHf - 1) / safeHf) * 100}%`}
          level={state}
        />
      </ProgressWrapper>
    </BarCol>
  </AccountCard>)
}





const ProgressFix = styled.div<{ percentageString?: string, level: Level }>`
  position: absolute;
  height: 7px;
  opacity: 0.5;
  border-radius: 20px;
  ${({ theme, level }) => `
      background-color: ${(level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ? theme.accentFailure : theme.accentSuccess)};
      box-shadow: ${(level === Level.AT_RISK ? `
      0px 0px 0.1rem 0.1rem  ${theme.accentWarning};
      `  : level === Level.CRITICAL ? `
      0px 0px 2px 2px  ${theme.accentFailure};
      ` : `
      0px 0px 1px 1px ${theme.accentSuccess};
      ` )}`}
  width: ${({ percentageString }) => percentageString ?? '0%'};
  z-index: 1;
`


const ProgressNew = styled.div<{ percentageString?: string, level: Level, isLow: boolean }>`
  position: absolute;
  height: 7px;
  opacity:  1;
  border-radius: 20px;
  ${({ theme, level }) => `
      background-color: ${darken(0.1, level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ?
  theme.accentFailure : theme.accentSuccess)};
      box-shadow: ${(level === Level.AT_RISK ? `
      0px 0px 0.1rem 0.1rem  ${theme.accentWarning};
      `  : level === Level.CRITICAL ? `
      0px 0px 2px 2px  ${theme.accentFailure};
      ` : `
      0px 0px 1px 1px ${theme.accentSuccess};
      ` )
    } `}
  width: ${({ percentageString }) => percentageString ?? '0%'};
  z-index: ${({ isLow }) => isLow ? 2 : 1};
  `

const ProgressOld = styled.div<{ percentageString?: string, level: Level, isLow: boolean }>`
  position: absolute;
  height: 7px;
  opacity:  0.5;
  border-radius: 20px;
  ${({ theme, level }) => `
      background-color: ${darken(0.5, level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ?
  theme.accentFailure : theme.accentSuccess)};
      box-shadow: ${(level === Level.AT_RISK ? `
      0px 0px 0.1rem 0.1rem  ${theme.accentWarning};
      `  : level === Level.CRITICAL ? `
      0px 0px 2px 2px  ${theme.accentFailure};
      ` : `
      0px 0px 1px 1px ${theme.accentSuccess};
      ` )
    } `}
  width: ${({ percentageString }) => percentageString ?? '0%'};
  z-index: ${({ isLow }) => isLow ? 2 : 1};
  `


const ProgressValueSmall = styled.span<{ level: Level, isActive: boolean }>`
  color: ${({ theme, level }) =>
    (level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ? theme.accentFailure : theme.accentSuccess)};
  font-size:  ${({ isActive }) => isActive ? '14px' : '12px'};
  opacity:  ${({ isActive }) => isActive ? '1' : '0.5'};
  font-weight: 500;
`


const ProgressContainer = styled.div`
  height: 7px;
  border-radius: 20px;
  width: 100%;
  display: flex;
  justify-contend: flex-start;
  align-items: flex-start;
  `

const ProgressValueContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: space-between;  
`


const AccountCardPro = styled(AccountCard)`
border: 1px solid;
width: 100%;
max-width: none;
border-color: ${({ theme }) => theme.backgroundInteractive};
background-color: ${({ theme }) => theme.deprecated_bg0};
`

export function BarCardWithChange({
  notConnected,
  currentProtocol,
  hasBalance,
  ltv,
  healthFactor,
  ltvNew,
  healthFactorNew
}: {
  notConnected: boolean
  currentProtocol: LendingProtocol,
  hasBalance: boolean,
  ltv: number,
  healthFactor: number,
  ltvNew: number,
  healthFactorNew: number,

}) {

  const [safeLtv, safeHf, state] = useMemo(() => {
    const _safeLtv = Number(ltv)
    const _safeHf = healthFactor === 0 ? 100 : Number(healthFactor)
    const _state = (_safeHf < HEALTH_FACTOR_CRITICAL) ? Level.CRITICAL :
      (_safeHf < HEALTH_FACTOR_AT_RISK) ? Level.AT_RISK : Level.OK
    return [_safeLtv, _safeHf, _state]
  }, [ltv, healthFactor])

  const isActive = useMemo(() => {
    const _safeLtv = Number(ltv)
    const _safeLtvNew = Number(ltvNew)
    return !notConnected && (Math.round(_safeLtv * 1000) / 1000 - Math.round(_safeLtvNew * 1000) / 1000) !== 0
  }, [ltv, ltvNew, notConnected])

  const safeHfNew = healthFactorNew === 0 ? 100 : Number(healthFactorNew)

  // const [parsedLtv, parsedLtvNew] = [Math.round(ltv * 100) / 100, Math.round(ltvNew * 100) / 100]
  const [parsedHf, parsedHfNew] = [Math.round(healthFactor * 100) / 100, Math.round(healthFactorNew * 100) / 100]
  const [lowHf, highHf, lowLtv, highLtv] = useMemo(() => {

    const [parsedLtv, parsedLtvNew] = [Math.round(ltv * 100) / 100, Math.round(ltvNew * 100) / 100]
    const [oldHf, newHf] = [Math.round(healthFactor * 100) / 100, Math.round(healthFactorNew * 100) / 100]

    return oldHf > newHf ? [scaleHf(newHf), scaleHf(oldHf), parsedLtv, parsedLtvNew] :
      [scaleHf(oldHf), scaleHf(newHf), parsedLtvNew, parsedLtv]

  },
    [healthFactor, healthFactorNew]
  )




  const [oldLtv, newLtv] = [Math.round(ltv * 100) / 100, Math.round(ltvNew * 100) / 100]
  const [oldHf, newHf] = [Math.round(healthFactor * 100) / 100, Math.round(healthFactorNew * 100) / 100]
  const [newState, oldState] = [getState(oldHf), getState(newHf)]
  const isLower = ltvNew > ltv

  return (<AccountCardPro isAave={notConnected}>
    <BarCol>
      <RowSpaceBetween>
        <RowFromLeft>
          <AccountCardHeading>Loan-to-Value</AccountCardHeading>
          {HelpCircleIcon('Measures the $ value of your collateral in relation to your supplies. If it is higher than 100%, your account is flagged for liquidation.')}
        </RowFromLeft>
        <ProgressValueContainer>
          <ProgressValueSmall
            isActive={!isActive}
            level={state}
          >
            {(!hasBalance || isNaN(safeLtv)) ? '-' : `${oldLtv}%`}

          </ProgressValueSmall>
          {isActive &&
            <>
              <ArrowRight size={15} />
              <ProgressValueSmall
                isActive
                level={state}
              >
                {(!hasBalance || isNaN(safeLtv)) ? '-' : `${newLtv}%`}

              </ProgressValueSmall>
            </>
          }
        </ProgressValueContainer>
      </RowSpaceBetween>
      <ProgressWrapper>
        <ProgressWithChange
          active={isActive}
          oldState={oldState}
          newState={newState}
          newVal={newLtv}
          oldVal={oldLtv}
        />
      </ProgressWrapper>
      <div style={{ height: '25px' }} />
      <RowSpaceBetween>
        <RowFromLeft>
          <AccountCardHeading>Health Factor</AccountCardHeading>
          {HelpCircleIcon('If the health factor is lower than 1.0, your account is flagged for liquidation.')}
        </RowFromLeft>
        <ProgressValueContainer>
          <ProgressValueSmall
            isActive={!isActive}
            level={state}
          >
            {!hasBalance
              ? '-'
              : parsedHf === 0
                ? '\u221e'
                : parsedHf > 1e4
                  ? '>1K'
                  : parsedHf}
          </ProgressValueSmall>
          {isActive &&
            <>
              <ArrowRight size={15} />
              <ProgressValueSmall
                isActive
                level={state}
              >
                {!hasBalance
                  ? '-'
                  : parsedHfNew === 0
                    ? '\u221e'
                    : parsedHfNew > 1e4
                      ? '>1K'
                      : parsedHfNew}
              </ProgressValueSmall>
            </>
          }
        </ProgressValueContainer>
      </RowSpaceBetween>
      <ProgressWrapper>
        <ProgressWithChange
          active={isActive}
          newState={newState}
          oldState={oldState}
          newVal={scaleHf(newHf)}
          oldVal={scaleHf(oldHf)}
        />
      </ProgressWrapper>
    </BarCol>
  </AccountCardPro>)
}


const scaleHf = (safeHf: number) => {
  return ((safeHf - 1) / safeHf) * 100
}

const getState = (hf: number) => {
  return (hf < HEALTH_FACTOR_CRITICAL) ? Level.CRITICAL :
    (hf < HEALTH_FACTOR_AT_RISK) ? Level.AT_RISK : Level.OK
}

interface ChangeProps {
  active: boolean
  newVal: number
  oldVal: number
  newState: Level
  oldState: Level
}

const ProgressWithChange = ({ newVal, oldVal, newState, oldState, active }: ChangeProps) => {

  return <ProgressContainer >
    <ProgressBase
      active={active}
      percentageString={`${Math.min(oldVal, newVal)}%`}
      level={newState}
    />
    <ProgressDelta
      active={active}
      isPositive={newVal > oldVal}
      percentageString={`${Math.abs(newVal - oldVal)}%`}
      level={oldState}
    />

  </ProgressContainer>
}


const ProgressBase = styled.div<{ percentageString?: string, level: Level, active: boolean }>`
  position: relative;
  height: 7px;
  opacity:  1;
  border-top-right-radius:${({ active }) => active ? '0px' : '20px'};
  border-bottom-right-radius:${({ active }) => active ? '0px' : '20px'};
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
    ${({ theme, level }) => `
      background-color: ${level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ?
      theme.accentFailure : theme.accentSuccess};
      box-shadow: ${(level === Level.AT_RISK ? `
      0px 0px 0.1rem 0.1rem  ${theme.accentWarning};
      `  : level === Level.CRITICAL ? `
      0px 0px 2px 2px  ${theme.accentFailure};
      ` : `
      0px 0px 1px 1px ${theme.accentSuccess};
      ` )
    } `}
  width: ${({ percentageString }) => percentageString ?? '0%'};
  z-index: 1;
  -webkit-transition: width 0.3s ease-in-out;
  -moz-transition: width 0.3s ease-in-out;
  -o-transition: width 0.3s ease-in-out;
  transition: width 0.3s ease-in-out;
  `

const ProgressDelta = styled.div<{ percentageString?: string, level: Level, isPositive: boolean, active: boolean }>`
  position: relative;
  height: 7px;
  opacity:  0.5;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  ${({ theme, level, isPositive }) => `
      background-color: ${isPositive ? lighten(0.1, level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ?
  theme.accentFailure : theme.accentSuccess) :
      darken(0.5, level === Level.AT_RISK ? theme.accentWarning : level === Level.CRITICAL ?
        theme.accentFailure : theme.accentSuccess)};
      box-shadow: ${(level === Level.AT_RISK ? `
      0px 0px 0.1rem 0.1rem  ${theme.accentWarning};
      `  : level === Level.CRITICAL ? `
      0px 0px 2px 2px  ${theme.accentFailure};
      ` : `
      0px 0px 1px 1px ${theme.accentSuccess};
      ` )
    } `}
  width: ${({ percentageString }) => percentageString ?? '0%'};
  ${({ theme, active }) => active ? `border-left: 1px solid ${theme.deprecated_bg4};` : ''}
  z-index: 1;
  -webkit-transition: width 0.3s ease-in-out;
  -moz-transition: width 0.3s ease-in-out;
  -o-transition: width 0.3s ease-in-out;
  transition: width 0.3s ease-in-out;
  `
