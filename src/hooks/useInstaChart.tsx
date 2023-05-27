import { formatUnix } from 'utils/tableUtils/format'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { LineChart, XAxis, Tooltip, CartesianGrid, Line, YAxis, TooltipProps, ResponsiveContainer } from "recharts"
import { useIsDarkMode } from 'state/user/hooks'
import { ThemedText } from 'theme'
import { useAllPricesWithHist, useOracleLoadingState } from 'state/oracles/hooks'
import { useOutsideAlerter } from './useOutsideClick'
import { useAppDispatch } from 'state/hooks'
import { useChainId } from 'state/globalNetwork/hooks'
import { chainIds } from 'constants/chains'
import { selectChart } from 'state/user/actions'
import Loader from 'components/Loader'
import { SupportedAssets } from 'types/1delta'
import _ from 'lodash'
import { Dots } from 'components/swap/styleds'
import { useSelectedChartData } from 'state/chart/hooks'
import { ReactComponent as CloseIcon } from '../assets/images/x.svg'
import Row from 'components/Row'

const ChartContainer = styled.div`
  width: 360px;
  height: 330px;
  position: fixed;
  bottom: 40px;
  right: 10px;
  padding: 5px;
  border-radius: 10px;
  z-index: 20;
  backdrop-filter: blur(5px);
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  align-items: center;
  justify-content: center;
`

const ChartBackground = styled.div`
  width: 360px;
  height: 330px;
  position: fixed;
  bottom: 40px;
  right: 10px;
  padding: 5px;
  border-radius: 10px;
  z-index: 19;
  backdrop-filter: blur(3px);
  opacity: 0.5;
  background: ${({ theme }) => theme.backgroundBackdrop};
  box-shadow: 2px 2px 2px rgba(30,30,30,0.5);
`

const TooltipContainer = styled.div`
font-size: 10px;
  border-radius: 10px;
  z-index: 99999999;
  background: ${({ theme }) => theme.backgroundBackdrop};
`

const Close = styled.div`
  margin-top: 6px;
  padding: 5px;
  color: ${({ theme }) => theme.accentActionSoft};
  transition: 150ms ease-in;
  &:hover {
    color: ${({ theme }) => theme.hoverState};
    cursor: pointer;
  }
`

const LOWER_VOLATILE = 0.998
const UPPER_VOLATILE = 1.002

const LOWER_STABLE = 0.9998
const UPPER_STABLE = 1.0002

const STABLECOINS = [
  SupportedAssets.DAI,
  SupportedAssets.USDC,
  SupportedAssets.USDT,
  SupportedAssets.MATICX,
  SupportedAssets.MAI,
  SupportedAssets.JEUR,
  SupportedAssets.EURS,
  SupportedAssets.AGEUR
]

// caches price range for chart
const CACHED_RANGES: { [chainId: number]: { [asset: string]: [number, number] } } = Object.assign({}, ...chainIds.map(c => { return { [c]: {} } }))
const produceAssetRange = (refPice: number, asset: SupportedAssets): [number, number] => {
  if (STABLECOINS.includes(asset))
    return [refPice * LOWER_STABLE, refPice * UPPER_STABLE]

  return [refPice * LOWER_VOLATILE, refPice * UPPER_VOLATILE]

}



// adjusts range if price out of range
const adjustRange = (chainId: number, price: number, asset: SupportedAssets) => {
  if (CACHED_RANGES[chainId][asset]) {
    if (STABLECOINS.includes(asset)) {

      if (price < CACHED_RANGES[chainId][asset][0]) {
        CACHED_RANGES[chainId][asset] = [price * LOWER_STABLE, CACHED_RANGES[chainId][asset][1]]
      }
      if (price > CACHED_RANGES[chainId][asset][1]) {
        CACHED_RANGES[chainId][asset] = [CACHED_RANGES[chainId][asset][0], price * UPPER_STABLE]
      }

      return;
    }

    if (price < CACHED_RANGES[chainId][asset][0]) {
      CACHED_RANGES[chainId][asset] = [price * LOWER_VOLATILE, CACHED_RANGES[chainId][asset][1]]
    }

    if (price > (CACHED_RANGES[chainId][asset][1])) {
      CACHED_RANGES[chainId][asset] = [CACHED_RANGES[chainId][asset][0], price * UPPER_VOLATILE]
    }
    return;
  }
}

export default function useChart() {
  const isDarkTheme = useIsDarkMode()
  const chainId = useChainId()
  const chartArgs = useSelectedChartData()
  const asset = chartArgs?.chartShown
  const loadingState = useOracleLoadingState()
  // assumes prices that are actually calculated
  const allPrices = useAllPricesWithHist(chainId)
  const ref = useRef(null)
  const dispatch = useAppDispatch()
  useOutsideAlerter(ref, () => dispatch(selectChart({ chartShown: undefined })))
  const prices = useMemo(() => allPrices[asset ?? ''], [allPrices[asset ?? '']])
  const base = useMemo(() => prices?.hist?.[0]?.price, [prices?.hist?.[0]?.price, asset])
  const price = useMemo(() => prices?.price, [prices?.price])

  const [load, setLoad] = useState(true)


  // update cache for refPrice
  useEffect(() => {
    if (!load && !loadingState.aave.publicLoaded && !loadingState.chainLink.publicLoaded) setLoad(true)
    if (load && loadingState.aave.publicLoaded && loadingState.chainLink.publicLoaded) {
      setLoad(false)
      Object.entries(allPrices).map(
        ([asset, p]) => {
          CACHED_RANGES[chainId][asset] = produceAssetRange(p.price, asset as SupportedAssets)
          if (CACHED_RANGES[chainId][asset][0] === 0) setLoad(true) // rerun as long as all ranges are calculted
        }
      )
    }
  }, [asset, chainId])

  // update cache for prices out of range
  useEffect(() => {
    if (asset && CACHED_RANGES[chainId][asset]) {
      adjustRange(chainId, price, asset)
    }
  }, [asset, price, CACHED_RANGES[chainId][asset ?? '']])

  const histStart = useMemo(() => prices?.hist?.[0]?.time, [prices?.hist?.[0]?.time])
  const histEnd = useMemo(() => Math.floor(Date.now() / 1000) + 100, [price])
  const selectedRange = useMemo(() => CACHED_RANGES[chainId][asset ?? ''], [CACHED_RANGES[chainId][asset ?? '']])
  const data = useMemo(() => prices?.hist?.map((x, i) => { return { time: x.time + i, price: x.price } }), [prices?.hist, asset])
  const currenTicks = useMemo(() => selectedRange && _.range(selectedRange[0], selectedRange[1], STABLECOINS.includes(asset as SupportedAssets) ? base * 0.0001 : base * 0.0005),
    [selectedRange, asset]
  )

  return useMemo(() => {
    if (!asset) return null

    // show loader when too few datapoints
    if (!histStart || !selectedRange || !data?.length || data?.length === 0 || !currenTicks)
      return <>
        <ChartBackground />
        <ChartContainer ref={ref} >
          <Close onClick={() => dispatch(selectChart({ chartShown: undefined }))}>
            <CloseIcon />
          </Close>
          <LoadingContainer>
            <Loader size={'30px'} />
            <Dots style={{ marginTop: '10px' }}>
              Loading Live Chart
            </Dots>
          </LoadingContainer>
        </ChartContainer>
      </>

    return <Suspense>
      <ChartBackground />
      <ChartContainer ref={ref} >
        <Row style={{ justifyContent: 'space-between', height: '25px' }}>
          <Close onClick={() => dispatch(selectChart({ chartShown: undefined }))} style={{ width: '1%' }}>
            <CloseIcon />
          </Close>
          <ThemedText.BodyPrimary textAlign='center' marginTop='1px' style={{ width: '95%' }}>
            {asset}
          </ThemedText.BodyPrimary>
        </Row>
        <ResponsiveContainer width="95%" height={300}>
          <LineChart
            width={330}
            height={250}
            data={data}
            margin={{ top: 3, right: 5, left: -10, bottom: 5 }}
            style={{ padding: '5px', alignSelf: 'center' }}
          >
            <XAxis dataKey="time" style={{
              fontSize: '10px'
            }}
              domain={[histStart, histEnd]}
              tickFormatter={(value) => formatUnix(value)}
            />
            <YAxis domain={selectedRange}
              ticks={currenTicks}
              type='number' style={{
                fontSize: '10px',
              }}
              tickFormatter={(value) => `${Math.round((value - base) / base * 10000)}bp`}
            />
            <Tooltip content={(props: TooltipProps<number, string>) => { return (<CustomTooltip {...props} />) }} />
            <CartesianGrid stroke="rgba(107, 107, 107, 0.8)" />
            <Line type="monotone" dataKey="price" stroke={isDarkTheme ? "white" : 'black'} markerWidth='1px' activeDot={true} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Suspense >
  }, [data, isDarkTheme, asset, chainId, selectedRange])
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>,) => {
  if (active) {
    return (
      <TooltipContainer>
        <p>{`$${Math.round((payload?.[0].value ?? 0) * 100000) / 100000}`}</p>
      </TooltipContainer>
    );
  }
  return null;
};
