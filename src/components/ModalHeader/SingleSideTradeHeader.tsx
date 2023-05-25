import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
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

export default function SingleSideTradeHeader({
  allowedSlippage,
  side,
}: {
  allowedSlippage: Percent
  side: PositionSides
}) {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <RowFixed>
          <ThemedText.DeprecatedBlack fontWeight={500} fontSize={16} style={{ marginRight: '8px' }}>
            <Trans>
              {side === PositionSides.Collateral
                ? 'Trade your collaterals against each other.'
                : 'Swap your debts against each other.'}
            </Trans>
          </ThemedText.DeprecatedBlack>
        </RowFixed>
        <RowFixed>
          <SettingsTab placeholderSlippage={allowedSlippage} />
        </RowFixed>
      </RowBetween>
    </StyledSwapHeader>
  )
}
