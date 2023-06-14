import { Trans } from '@lingui/macro'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { formatPercentInBasisPointsNumber, formatToDecimal, getTokenAddress } from 'analytics/utils'
import { ButtonLight, ButtonYellow } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Row from 'components/Row'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Text } from 'rebass'
import { InterfaceTrade } from 'state/routing/types'
import { computeRealizedPriceImpact } from 'utils/prices'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'
import styled from 'styled-components/macro'
import { opacify } from 'theme/utils'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'
import { WarningIcon } from 'nft/components/icons'
import { ExtendedSlot } from 'state/slots/hooks'
import { useDerivedSwapInfoMarginAlgebraClose } from 'state/professionalTradeSelection/tradeHooks'
import { assetToId } from 'pages/Trading'
import { useChainId } from 'state/globalNetwork/hooks'
import { LendingProtocol } from 'state/1delta/actions'
import { SupportedAssets } from 'types/1delta'
import { useCurrency } from 'hooks/Tokens'
import { UniswapTrade } from 'utils/Types'
import { useWeb3React } from '@web3-react/core'
import { useGetSlotContract } from 'hooks/1delta/use1DeltaContract'


let LAST_VALID_TRADE_CLOSE: UniswapTrade | undefined;
let LAST_VALID_AMOUNT_OUT: CurrencyAmount<Currency> | undefined;

export default function CloseModal({
  slot,
  attemptingTxn,
  txHash,
  onConfirm,
  onDismiss,
  isOpen,
}: {
  slot: ExtendedSlot
  isOpen: boolean
  attemptingTxn: boolean
  txHash: string | undefined
  onConfirm: () => void
  onDismiss: () => void
}) {
  const { account } = useWeb3React()

}

export const RowFlat = styled.div`
  display: flex;
  align-items: flex-end;
`

export const ColReverse = styled.div<{ isReverse: boolean }>`
  padding: 20px;
  min-height: 200px;
  width: 100%;
  display: flex;
  flex-direction: column ${({ isReverse }) => (isReverse ? '-reverse' : '')};
  justify-content: space-between;
  align-items: center;
`

export const Col = styled.div`
  padding: 20px;
  min-height: 170px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`

export const ColInner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`

const StyledButton = styled(ButtonLight)`
  border: 1px solid ${({ theme }) => opacify(24, theme.deprecated_error)};
  background: ${({ theme }) => theme.accentWarning};
`

const WarningText = styled(Text)`
  color: ${({ theme }) => theme.deprecated_warning};
`
