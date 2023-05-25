import { useAppSelector } from 'state/hooks'
import { SupportedAssets } from 'types/1delta'

export const useSelectedChart = (): SupportedAssets | undefined => {
  return useAppSelector(({ chart }) => chart.userChart?.chartShown)
}

export const useSelectedChartData = () => {
  return useAppSelector(({ chart }) => chart.userChart)
} 