import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { ButtonSecondary } from 'components/Button'
import { RowBetween, RowFixed } from 'components/Row'
import SettingsTab from 'components/Settings'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { MarginTradeType, PositionSides } from 'types/1delta'

const StyledSwapHeader = styled.div`
  padding: 8px 12px;
  margin-bottom: 8px;
  width: 100%;
  color: ${({ theme }) => theme.deprecated_text2};
`

export const MarginTradingButtonText = styled.div`
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
 font-size: 13px;
`};
`


const HeaderButton = styled(ButtonSecondary)`
max-width: 200px;
max-height: 70px;
${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
 font-size: 13px;
`};
`

const HeaderRow = styled(RowBetween)`
  justify-content: space-around;
`

export default function MarginTradeHeader({
  allowedSlippage,
  sideIn,
  onClick,
  tradeType
}: {
  allowedSlippage: Percent
  sideIn: PositionSides
  onClick: () => void
  tradeType: MarginTradeType
}) {
  return (
    <StyledSwapHeader>
      <HeaderRow>
        <ThemedText.DeprecatedBlack fontWeight={500} fontSize={20} style={{ marginRight: '8px', textAlign: 'center', minWidth: '200px' }}>
          {sideIn === PositionSides.Collateral
            ? 'Trim your open margin position.'
            : 'Open or increase a margin position'}
        </ThemedText.DeprecatedBlack>
        <HeaderButton onClick={onClick}>
          {tradeType === MarginTradeType.Trim ? 'Open position instead' : 'Close position instead'}
        </HeaderButton>
        <SettingsTab placeholderSlippage={allowedSlippage} />
      </HeaderRow>
    </StyledSwapHeader>
  )
}
