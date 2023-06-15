import { formatPriceString } from 'utils/tableUtils/format'
import { getTokenIcon } from 'constants/1delta'
import { useMemo } from 'react'
import styled from 'styled-components'
import { SupportedAssets } from 'types/1delta'
import { useIsDarkMode } from 'state/user/hooks'
import { ArrowRight } from 'react-feather'
import { useAppDispatch } from 'state/hooks'
import { usePriceAndRef } from 'state/oracles/hooks'
import { useChainId } from 'state/globalNetwork/hooks'
import { selectChart } from 'state/user/actions'
import { Mode } from 'pages/Trading'

const Wrapper = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  flex-direction: column;
  `};
`
const Image = styled.img`
  padding-right: 8px;  
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  padding-right: 0px;  
  `};
`

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const AssetName = styled.span`
  font-weight: 500;
  font-size: 15px;
  padding-bottom: 2px;
`
const Price = styled.span`
  font-size: 12px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  text-align: center;;  
  `};
`

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 80px;
  -webkit-animation-duration: 8000ms !important;
  animation-duration: 8000ms !important;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  width: 100%;  
  `};
`

export default function TokenIcon({
  asset,
  price,
  chainLinkPrice,
}: {
  asset: SupportedAssets
  price?: string
  chainLinkPrice?: number
}) {
  return (
    <Wrapper>
      <Image src={getTokenIcon(asset)} />
      <TextContainer>
        <AssetName>{asset}</AssetName>
        <Price>
          {chainLinkPrice === 0
            ? Number(price) === 0
              ? '-'
              : formatPriceString(price)
            : formatPriceString(String(chainLinkPrice))}
        </Price>
      </TextContainer>
    </Wrapper>
  )
}

export function AnimatedTokenIcon({
  asset,
  isMobile,
}: {
  asset: SupportedAssets,
  isMobile: boolean
}) {
  const chainId = useChainId()
  const { price, refPrice } = usePriceAndRef(chainId, asset)
  const isDarkTheme = useIsDarkMode()
  const dispatch = useAppDispatch()
  const onCellClick = () => {
    dispatch(selectChart({ chartShown: asset }))
  }

  const [color, angle] = useMemo(() => {
    if (!price) return ['grey', 0]
    if (!refPrice) return ['grey', 0]
    const [color, angle] = refPrice === price ? ['grey', 0] : refPrice < price ? ['green', -45] : ['red', 45]
    return [color, angle]

  },
    [price, refPrice]
  )

  return useMemo(() => {

    return (<Wrapper >
      <Image src={getTokenIcon(asset)} width={isMobile ? '20px' : '40px'} height={isMobile ? '20px' : '40px'} onClick={onCellClick} />
      <TextContainer>
        {!isMobile && <AssetName>{asset}</AssetName>}
        <InnerWrapper>
          <Price>
            {formatPriceString(String(price))}
          </Price>
          <Arrow color={color} angle={angle} />
        </InnerWrapper>
      </TextContainer>
    </Wrapper>
    )
  },
    [price, isDarkTheme, asset, isMobile])
}



const Arrow = styled(ArrowRight) <{ color: string; angle: number }>`
${({ color, angle }) => `
${angle != 0 ? 'stroke-width: 1.5px;' : 'opacity: 0.3;'}
transform: rotate(${angle}deg);
color: ${color};
` }
  width: 12px;
  height: 12px;
`

const TextContainerPosition = styled.div`
  display: flex;
  flex-direction: row;
`

const PricePosition = styled(Price)`
  font-size: 14px;
`

const InnerWrapperPosition = styled(InnerWrapper)`
margin-left: 10px;
`

export function AnimatedTokenPositionIcon({
  asset,
  isMobile,
}: {
  asset: SupportedAssets,
  isMobile: boolean
}) {
  const chainId = useChainId()
  const { price, refPrice } = usePriceAndRef(chainId, asset)
  const isDarkTheme = useIsDarkMode()
  const dispatch = useAppDispatch()
  const onCellClick = () => {
    dispatch(selectChart({ chartShown: asset }))
  }

  const [color, angle] = useMemo(() => {
    if (!price) return ['grey', 0]
    if (!refPrice) return ['grey', 0]
    const [color, angle] = refPrice === price ? ['grey', 0] : refPrice < price ? ['green', -45] : ['red', 45]
    return [color, angle]

  },
    [price, refPrice]
  )

  return useMemo(() => {

    return (<Wrapper >
      <Image src={getTokenIcon(asset)} width={isMobile ? '20px' : '30px'} height={isMobile ? '20px' : '30px'} onClick={onCellClick} />
      <TextContainerPosition>
        {!isMobile && <AssetName>{asset}</AssetName>}
        <InnerWrapperPosition>
          <PricePosition>
            {formatPriceString(String(price))}
          </PricePosition>
          <Arrow color={color} angle={angle} />
        </InnerWrapperPosition>
      </TextContainerPosition>
    </Wrapper>
    )
  },
    [price, isDarkTheme, asset, isMobile])
}

const PairWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
`

const DirectionBanner = styled.div<{ isLong: boolean }>`
  border-radius: 5px;
  color: #ff005568;
  font-size: 10px;
  margin: 2px;
  height: 14px;
  margin-left: 5px;
  text-align: center;
  width: 70px;
  ${({ isLong }) => isLong ? `
    border: 1px solid green;
    color: #4ADE80;
  background: #16a34a36;
    ` : `
  border: 1px solid red;
  color: #EF4444;
  background: #ef444438;
  `}

`


const PairName = styled(AssetName)`
  font-weight: 500;
  font-size: 13px;
  width: 110px;
`
export function PairPosition({
  pair,
  direction,
  leverage,
  isMobile,
}: {
  pair: [SupportedAssets, SupportedAssets];
  direction: Mode;
  leverage: number;
  isMobile: boolean;
}) {
  return useMemo(() => {

    return (<PairWrapper >
      {isMobile ?
        <>
          <Image src={getTokenIcon(pair[1])} width={isMobile ? '20px' : '30px'} height={isMobile ? '20px' : '30px'} />
          <Image src={getTokenIcon(pair[0])} width={isMobile ? '20px' : '30px'} height={isMobile ? '20px' : '30px'} />
        </> :
        <PairName>
          {pair[0]} / {pair[1]}
        </PairName>
      }

      <DirectionBanner isLong={direction === Mode.LONG}>
        {isNaN(leverage) ? `${direction.toLocaleUpperCase()}` : `${direction.toLocaleUpperCase()} ${Math.round(leverage * 10) / 10}x`}
      </DirectionBanner>

    </PairWrapper>
    )
  },
    [pair, direction, leverage, isMobile])
}




export function PairPositionRow({
  pair,
  direction,
  leverage,
  isMobile,
}: {
  pair: [SupportedAssets, SupportedAssets];
  direction: Mode;
  leverage: number;
  isMobile: boolean;
}) {
  return useMemo(() => {

    return (<PairWrapper style={{ flexDirection: 'row' }} >
      {isMobile ?
        <>
          <Image src={getTokenIcon(pair[1])} width={isMobile ? '20px' : '30px'} height={isMobile ? '20px' : '30px'} />
          <Image src={getTokenIcon(pair[0])} width={isMobile ? '20px' : '30px'} height={isMobile ? '20px' : '30px'} />
        </> :
        <PairName>
          {pair[0]} / {pair[1]}
        </PairName>
      }

      <DirectionBanner isLong={direction === Mode.LONG}>
        {isNaN(leverage) ? '-' : `${direction.toLocaleUpperCase()} ${Math.round(leverage * 10) / 10}x`}
      </DirectionBanner>

    </PairWrapper>
    )
  },
    [pair, direction, leverage, isMobile])
}


