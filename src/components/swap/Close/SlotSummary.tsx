import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { TEN, TOKEN_SVGS } from 'constants/1delta'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { ReactNode } from 'react'
import { Text } from 'rebass'
import { InterfaceTrade } from 'state/routing/types'
import { ExtendedSlot } from 'state/slots/hooks'
import { useClientSideRouter, useUserSlippageTolerance } from 'state/user/hooks'
import styled from 'styled-components'
import { SupportedAssets } from 'types/1delta'
import { formatPriceString, formatSmallUSDValue } from 'utils/tableUtils/format'
import { LightCard } from '../../Card'
import { ButtonError } from '../../Button'
import { AutoRow } from '../../Row'
import { Dots, SwapCallbackError } from '../styleds'
import { getTokenPath, RoutingDiagramEntry } from '../SwapRoute'
import { Separator, ThemedText } from '../../../theme'
import { NewSlot } from 'pages/Trading'


export const LoaderDots = (): React.ReactNode => {
  return (
    <Dots key={'loadingMM'} >
      Calculating Trade
    </Dots>
  )
}

const Column = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  align-items: center;
  width: 100%;
  padding: 5px;
`

const ValueRow = styled.div`
  display: flex;
  flex-direction: row;
  padding: 1px;
  justify-content: space-between;
  width: 100%;
  margin: 2px;

`

const Label = styled.div`

`

const Value = styled.div`

`

export const SeparatorBase = styled(Separator)`
 height: 2px;
 opacity: 0.3;
 background-color: ${({ theme }) => theme.deprecated_bg0};
`

export const SeparatorLight = styled(Separator)`
 opacity: 0.7;
 width: 70%;
 margin-left: 50px;
 margin-top: 5px;
 margin-bottom: 5px;
`



const HeaderLabel = styled.div`
  color: ${({ theme }) => theme.deprecated_text1};
  position: relative;
  font-weight: bold;
  opacity: 0.8;
`

const HeaderValue = styled.div`
  color: ${({ theme }) => theme.deprecated_green1};
  position: relative;
  font-weight: bold;
  opacity: 0.8;
`

const StyledLightCard = styled(LightCard)`
  margin-top: 10px;
`

const ValueWithIcon = styled.div`
  display: flex;
  flex-direction: row;
`

const Logo = styled.img`
  height: 20px;
  width: 20px;
  margin-right: 8px;
`

export default function SlotSummary({
  slot,
  onClose,
  buttonDisabled,
}: {
  slot?: ExtendedSlot,
  onClose: () => void
  buttonDisabled: boolean
}) {
  return (
    <StyledLightCard>
      <AutoRow>
        {slot && <Column>
          <ValueRow>
            <HeaderLabel>
              Cash-out value
            </HeaderLabel>
            <HeaderValue>
              ${Math.round(slot.size * 100) / 100}
            </HeaderValue>
          </ValueRow>
          <SeparatorBase />
          <ValueRow>
            <Label>
              Collateral
            </Label>
            <ValueWithIcon>
              <Logo src={TOKEN_SVGS[slot.collateralSymbol]} />
              <Value>
                {toNumber(slot.collateralBalance, slot.collateralDecimals, 4)}  / {formatSmallUSDValue(slot.collateralBalanceUsd)}
              </Value>
            </ValueWithIcon>
          </ValueRow>
          <ValueRow>
            <Label>
              Debt
            </Label>
            <ValueWithIcon>
              <Logo src={TOKEN_SVGS[slot.debtSymbol]} />
              <Value>
                {toNumber(slot.debtBalance, slot.debtDecimals, 4)} / {formatSmallUSDValue(slot.debtBalanceUsd)}
              </Value>
            </ValueWithIcon>
          </ValueRow>
        </Column>}
        <ButtonError
          onClick={onClose}
          disabled={buttonDisabled}
          style={{ margin: '10px 0 0 0' }}
          id={"CONFIRM_SWAP_BUTTON"}
        >
          <Text fontSize={20} fontWeight={500}>
            {slot ? <Trans>Confirm Closing Your Position</Trans> : <>{LoaderDots()}</>}
          </Text>
        </ButtonError>
      </AutoRow>
    </StyledLightCard>
  )
}


export const toNumber = (val: string, decs = 18, show = 2) => {
  return Number(formatEther(BigNumber.from(val).mul(TEN.pow(18 - decs)))).toLocaleString(undefined, { maximumFractionDigits: show })
}


export function NewSlotSummary({
  slot
}: {
  slot?: NewSlot
}) {
  return (
    <StyledLightCard>
      {slot && <Column>
        <ValueRow>
          <HeaderLabel>
            Size
          </HeaderLabel>
          <HeaderValue>
            ${Math.round(slot.size * 100) / 100}
          </HeaderValue>
        </ValueRow>
        <SeparatorBase />
        <ValueRow>
          <Label>
            Collateral
          </Label>
          <ValueWithIcon>
            <Logo src={TOKEN_SVGS[slot.pair[0]]} />
            <Value>
              {slot.collateralBalance.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 4 })}  / {formatSmallUSDValue(slot.collateralBalanceUsd)}
            </Value>
          </ValueWithIcon>
        </ValueRow>
        <ValueRow>
          <Label>
            Debt
          </Label>
          <ValueWithIcon>
            <Logo src={TOKEN_SVGS[slot.pair[1]]} />
            <Value>
              {slot.debtBalance.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 4 })} / {formatSmallUSDValue(slot.debtBalanceUsd)}
            </Value>
          </ValueWithIcon>
        </ValueRow>
        <ValueRow>
          <Label>
            Liquidation Price
          </Label>

          <Value>
            {formatPriceString(String(slot.liquidationPrice))}
          </Value>
        </ValueRow>
      </Column>}
    </StyledLightCard>
  )
}
