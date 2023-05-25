import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { RowBetween, RowFixed } from 'components/Row'
import SettingsTab from 'components/Settings'
import { POLYGON_CHAINS } from 'constants/1delta'
import { useMemo } from 'react'
import { LendingProtocol } from 'state/1delta/actions'
import { useCurrentLendingProtocol } from 'state/1delta/hooks'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { MarginTradeType, PositionSides } from 'types/1delta'

const StyledSwapHeader = styled.div`
  padding: 8px 12px;
  margin-bottom: 8px;
  width: 100%;
  color: ${({ theme }) => theme.deprecated_text2};
`

export default function MoneyMarketTradeHeader({
  allowedSlippage,
  side,
  interaction,
  chainId,
  isDirect
}: {
  isDirect: boolean,
  allowedSlippage: Percent
  side: PositionSides
  interaction: MarginTradeType
  chainId: number
}) {

  const protocol = useCurrentLendingProtocol()

  const validatedProtocol = useMemo(() =>
    protocol === LendingProtocol.COMPOUND && POLYGON_CHAINS.includes(chainId) ? '0VIX' : protocol,
    [protocol, chainId]
  )

  return (
    <StyledSwapHeader>
      <RowBetween>
        <RowFixed>
          <ThemedText.DeprecatedBlack fontWeight={500} fontSize={16} style={{ marginRight: '8px' }}>
            <Trans>
              {side === PositionSides.Collateral
                ? (interaction === MarginTradeType.Supply
                  ? `${isDirect ? 'Deposit' : 'Swap and deposit'} to ${validatedProtocol}`
                  : `Withdraw from ${validatedProtocol}${isDirect ? "" : " and swap"} to your wallet`) :
                (interaction === MarginTradeType.Borrow
                  ? `Borrow from ${validatedProtocol}${isDirect ? "" : " and swap"} to your wallet`
                  : `${isDirect ? "Repay" : "Swap and repay"} to ${validatedProtocol} from your wallet`)}
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
