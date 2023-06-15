import { Trans } from '@lingui/macro'
import { Currency, Price } from '@uniswap/sdk-core'
import { useDollarPriceViaOracles } from 'hooks/useStablecoinPrice'
import { useCallback } from 'react'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatNumber, formatPercent } from 'utils/1delta/generalFormatters'

interface RiskEstimate {
  healthFactor: number
  ltv: number
  price: Price<Currency, Currency>
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

const HFBanner = styled.div<{ safe: boolean }>`
background: ${({ safe }) => safe ? 'linear-gradient(274.72deg, rgba(120, 255, 204, 0.5) 0%, rgba(120, 255, 204, 0.1) 51.56%, rgba(217, 217, 217, 0.1) 100%)' :
    'linear-gradient(274.72deg, rgba(255, 120, 120, 0.5) 0%, rgba(120, 255, 204, 0.1) 51.56%, rgba(217, 217, 217, 0.1) 100%)'
  };
border-radius: 16px;
width: 62px;
height: 30px;
color: ${({ theme }) => theme.textPrimary};
padding: 5px;
font-size: 15px;
text-align: center;
`

const StyledPriceContainer = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  grid-template-columns: 1fr auto;
  grid-gap: 0.25rem;
  display: flex;
  flex-direction: row;
  width: 220px;
  text-align: left;
  flex-wrap: wrap;
  padding: 5px;
  user-select: text;
`

export default function RiskEstimate({
  price,
  showInverted,
  setShowInverted,
  healthFactor,
  ltv
}: RiskEstimate) {
  const theme = useTheme()

  const usdcPrice = useDollarPriceViaOracles(showInverted ? price.baseCurrency : price.quoteCurrency)
  /*
   * calculate needed amount of decimal prices, for prices between 0.95-1.05 use 4 decimal places
   */
  const p = Number(usdcPrice?.toFixed())
  const visibleDecimalPlaces = p < 1.05 ? 4 : 2

  let formattedPrice: string
  try {
    formattedPrice = showInverted ? price.toSignificant(4) : price.invert()?.toSignificant(4)
  } catch (error) {
    formattedPrice = '0'
  }

  const label = showInverted ? `${ltv}` : `${healthFactor} `
  const labelInverted = showInverted ? `${price.baseCurrency?.symbol} ` : `${price.quoteCurrency?.symbol}`
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = `${!showInverted ? 'Health Factor: ' : 'Position LTV'} ${label}`

  return (
    <StyledPriceContainer
      onClick={(e) => {
        e.stopPropagation() // dont want this click to affect dropdowns / hovers
        flipPrice()
      }}
      title={text}
    >
      <Text fontWeight={500} color={theme.deprecated_text1}>
        {'Position Breakdown'}
      </Text>{' '}
      <HFBanner safe={healthFactor > 1.05} >
        {healthFactor > 1.05 ? 'Safe' : 'Risky'}
      </HFBanner>
    </StyledPriceContainer>
  )
}
