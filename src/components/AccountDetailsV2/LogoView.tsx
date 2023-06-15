import { UNI_ADDRESS } from 'constants/addresses'
import { TradeAction } from 'pages/Trading'
import { useChainId } from 'state/globalNetwork/hooks'
import { ApproveTransactionInfo, TransactionInfo, TransactionType } from 'state/transactions/types'
import styled, { css } from 'styled-components/macro'

import { nativeOnChain } from '../../constants/tokens'
import { useCurrency } from '../../hooks/Tokens'
import CurrencyLogo from '../CurrencyLogo'

const CurrencyWrap = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
`

const CurrencyWrapStyles = css`
  position: absolute;
  height: 24px;
`

const CurrencyLogoWrap = styled.span<{ isCentered: boolean }>`
  ${CurrencyWrapStyles};
  left: ${({ isCentered }) => (isCentered ? '50%' : '0')};
  top: ${({ isCentered }) => (isCentered ? '50%' : '0')};
  transform: ${({ isCentered }) => isCentered && 'translate(-50%, -50%)'};
`
const CurrencyLogoWrapTwo = styled.span`
  ${CurrencyWrapStyles};
  bottom: 0px;
  right: 0px;
`

interface CurrencyPair {
  currencyId0: string | undefined
  currencyId1: string | undefined
}

const getCurrency = ({ info, chainId }: { info: TransactionInfo; chainId: number | undefined }): CurrencyPair => {
  switch (info.type) {
    case TransactionType.LEVERAGED_POSITION:
      if (info.tradeAction === TradeAction.OPEN) {
        const { debtCurrencyId, collateralCurrencyId } = info
        return { currencyId0: debtCurrencyId, currencyId1: collateralCurrencyId }
      }
      const { collateralCurrencyId, debtCurrencyId } = info
      return { currencyId0: collateralCurrencyId, currencyId1: debtCurrencyId }
    case TransactionType.APPROVAL:
      return { currencyId0: (info as ApproveTransactionInfo).tokenAddress, currencyId1: undefined }
    default:
      return { currencyId0: undefined, currencyId1: undefined }
  }
}

const LogoView = ({ info }: { info: TransactionInfo }) => {
  const chainId = useChainId()
  const { currencyId0, currencyId1 } = getCurrency({ info, chainId })
  const currency0 = useCurrency(currencyId0)
  const currency1 = useCurrency(currencyId1)
  const isCentered = !(currency0 && currency1)

  return (
    <CurrencyWrap>
      <CurrencyLogoWrap isCentered={isCentered}>
        <CurrencyLogo size="24px" currency={currency0} />
      </CurrencyLogoWrap>
      {!isCentered && (
        <CurrencyLogoWrapTwo>
          <CurrencyLogo size="24px" currency={currency1} />
        </CurrencyLogoWrapTwo>
      )}
    </CurrencyWrap>
  )
}

export default LogoView
