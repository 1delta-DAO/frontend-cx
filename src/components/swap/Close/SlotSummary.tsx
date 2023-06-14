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
import { formatSmallUSDValue } from 'utils/tableUtils/format'

import { ButtonError } from '../../Button'
import { AutoRow } from '../../Row'
import { Dots, SwapCallbackError } from '../styleds'
import { getTokenPath, RoutingDiagramEntry } from '../SwapRoute'


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

`

const Label = styled.div`

`

const Value = styled.div`

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
  slot
}: {
  slot?: ExtendedSlot
}) {
  return (
    <>
      <AutoRow>
        <ButtonError
          onClick={() => null}
          disabled={false}
          style={{ margin: '10px 0 0 0' }}
          id={"CONFIRM_SWAP_BUTTON"}
        >
          <Text fontSize={20} fontWeight={500}>
            {slot ? <Trans>Confirm Closing Your Position</Trans> : <>{LoaderDots()}</>}
          </Text>
        </ButtonError>
        {slot && <Column>
          <ValueRow>
            <Label>
              Position Value
            </Label>
            <Value>
              ${Math.round(slot.size * 100) / 100}
            </Value>
          </ValueRow>
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
        {/* {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null} */}
      </AutoRow>
    </>
  )
}


const toNumber = (val: string, decs = 18, show = 2) => {
  return Number(formatEther(BigNumber.from(val).mul(TEN.pow(18 - decs)))).toLocaleString(undefined, { maximumFractionDigits: show })
} 