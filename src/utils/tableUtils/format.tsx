import { ONE_18, TEN } from 'constants/1delta'
import { ethers } from 'ethers'

const BLOCK_TIMES: { [chainId: number]: number } = {
  5: 12,
  1: 12,
}

export const formatPriceString = (price?: string) => (price ? formateDecimal(Number(price)) : '-')

export const formatAbbreviatedPrice = (amount?: number) => {
  if (!amount) return '-'
  const n = Number(amount)
  if (n < 1e3) return formateDecimal(n)
  if (n >= 1e3 && n < 1e6) return formateDecimal(n / 1e3) + 'K'
  if (n >= 1e6 && n < 1e9) return formateDecimal(n / 1e6) + 'M'
  if (n >= 1e9 && n < 1e12) return formateDecimal(n / 1e9) + 'B'
  if (n >= 1e12 && n < 1e15) return formateDecimal(n / 1e12) + 'T'
  if (n >= 1e15 && n < 1e18) return formateDecimal(n / 1e15) + 'P'
  if (n !== Infinity) return formateDecimal(n / 1e18) + 'E'
  return '-'
}


export const formatAbbreviatedGeneralPrice = (amount?: number) => {
  if (!amount) return '-'
  const sign = Number(amount) >= 0 ? '+' : '-'
  const n = Math.abs(Number(amount))
  if (n < 1e3) return sign + formateDecimal(n)
  if (n >= 1e3 && n < 1e6) return sign + formateDecimal(n / 1e3) + 'K'
  if (n >= 1e6 && n < 1e9) return sign + formateDecimal(n / 1e6) + 'M'
  if (n >= 1e9 && n < 1e12) return sign + formateDecimal(n / 1e9) + 'B'
  if (n >= 1e12 && n < 1e15) return sign + formateDecimal(n / 1e12) + 'T'
  if (n >= 1e15 && n < 1e18) return sign + formateDecimal(n / 1e15) + 'P'
  if (n !== Infinity) return sign + formateDecimal(n / 1e18) + 'E'
  return '-'
}

export const formatSmallValue = (amount?: number, mobile = false) => {
  if (!amount) return '-'
  const n = Number(amount)
  if (n < 0.0001) return '~0'
  if (n < 0.001) return '~0.001'
  if (n < 0.005) return '~0.005'
  return mobile ? amount.toLocaleString('en-EN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) : amount.toLocaleString()
}

export const formatSmallGeneralValue = (amount?: number, mobile = false) => {
  if (!amount) return '-'
  const n = Math.abs(Number(amount))
  if (n < 0.0001) return '~0'
  if (n < 0.001) return '~0.001'
  if (n < 0.005) return '~0.005'
  return mobile ? amount.toLocaleString('en-EN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) : amount.toLocaleString()
}

export const formatSmallUSDValue = (amount?: number) => {
  if (!amount) return '-'
  const n = Number(amount)
  if (n < 0.001) return '< $0.001'
  if (n < 0.01) return '< $0.01'
  return `$${(Math.round(amount * 100) / 100).toLocaleString()}`
}


export const formatUSDValuePanel = (amount?: number) => {
  if (!amount) return '-'
  const n = Number(amount)
  if (n < 0.001) return '< 0.001 USD'
  if (n < 0.01) return '< 0.01 USD'
  return `${(Math.round(amount * 100) / 100).toLocaleString()} USD`
}


export const formatSmallUSDValueRounded = (amount?: number) => {
  if (!amount) return '-'
  const n = Number(amount)
  if (n < 0.001) return '< $0.001'
  if (n < 0.01) return '< $0.01'
  return `$${(Math.round(amount)).toLocaleString()}`
}


export const formatSmallGeneralUSDValue = (amount?: number) => {
  if (!amount) return '-'
  const n = Math.abs(Number(amount))
  if (n < 0.0001) return amount > 0 ? '~$0' : '~$0.'
  if (n < 0.001) return amount > 0 ? '~$0.001' : '~-$0.001'
  if (n < 0.01) return amount > 0 ? '~$0.01' : '~-$0.01'
  return `${amount > 0 ? '' : '-'}$${(Math.round(n * 100) / 100).toLocaleString()}`
}


export const formateDecimal = (amount: number) =>
  amount.toLocaleString('en-EN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const formatAaveYield = (n: string): string => {
  return (Math.round(Number(ethers.utils.formatEther(ethers.BigNumber.from(n).div(1e7))) * 100) / 100).toLocaleString()
}

export const formatAaveYieldToNumber = (n: string): number => {
  return Number(ethers.utils.formatEther(ethers.BigNumber.from(n).div(1e7)))
}


export const formatAaveToNumber = (n: string): number => {
  return Math.round(Number(ethers.utils.formatEther(ethers.BigNumber.from(n).div(1e7))) * 100) / 100
}

export const formatCompoundYield = (n: string): string => {
  return (Math.round(Number(ethers.utils.formatEther(ethers.BigNumber.from(n).div(1e7))) * 100) / 100).toLocaleString()
}

export const convertRatePerBlockToRatePerYear = (n: string, chainId: number): string => {
  return (
    Math.round(
      Number(
        ethers.utils.formatEther(
          ethers.BigNumber.from(n)
            .mul(3600 * 24 * 365)
            .div(BLOCK_TIMES[chainId] ?? 1)
        )
      ) * 100
    ) / 100
  ).toLocaleString()
}

export enum TimeScale {
  BLOCK,
  MS,
}

export const calculateRate = (n: string, chainId: number, scale = TimeScale.BLOCK): string => {
  const rate = Number(ethers.utils.formatEther(n))
  if (scale === TimeScale.BLOCK)
    return ((Math.pow((rate * 60 * 60 * 24) / (BLOCK_TIMES[chainId] ?? 1) + 1, 365) - 1) * 100).toLocaleString()

  return ((Math.pow(rate * 60 * 60 * 24 + 1, 365) - 1) * 100).toLocaleString()
}

export const calculateRateToNumber = (n: string, chainId: number, scale = TimeScale.BLOCK): number => {
  const rate = Number(ethers.utils.formatEther(n))
  if (scale === TimeScale.BLOCK)
    return (Math.pow((rate * 60 * 60 * 24) / (BLOCK_TIMES[chainId] ?? 1) + 1, 365) - 1) * 100

  return (Math.pow(rate * 60 * 60 * 24 + 1, 365) - 1) * 100
}

export const calculateRateAlt = (n: string, m: string, decs: number, chainId: number): string => {
  const validatedM = m === '0' ? '1' : m
  return (
    Math.round(
      Number(
        ethers.utils.formatEther(
          ethers.BigNumber.from(n)
            .mul(TEN.pow(18 - decs)) // normalize to 18 decimals
            .mul(3600 * 24 * 365) // multiply to get seconds to year conversion
            .div(validatedM)
            .div(BLOCK_TIMES[chainId] ?? 1) // get rate per second
        )
      ) * 100
    ) / 100
  ).toLocaleString()
}

const formatNumber = (amount: number) =>
  amount.toLocaleString('en-EN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const formatAbbreviatedNumber = (amount?: number) => {
  if (!amount) return '-'
  const n = Number(amount)
  if (n < 1e3) return formatNumber(n)
  if (n >= 1e3 && n < 1e6) return formatNumber(n / 1e3) + 'K'
  if (n >= 1e6 && n < 1e9) return formatNumber(n / 1e6) + 'M'
  if (n >= 1e9 && n < 1e12) return formatNumber(n / 1e9) + 'B'
  if (n >= 1e12 && n < 1e15) return formatNumber(n / 1e12) + 'T'
  if (n >= 1e15 && n < 1e18) return formatNumber(n / 1e15) + 'P'
  if (n !== Infinity) return formatNumber(n / 1e18) + 'E'
  if (n === Infinity) return <>&infin;</>
  return '-'
}

export const formatAbbreviatedGeneralNumber = (amount?: number) => {
  if (!amount) return '-'
  const sign = Number(amount) >= 0 ? '+' : '-'
  const n = Math.abs(Number(amount))
  if (n < 1e3) return sign + formatNumber(n)
  if (n >= 1e3 && n < 1e6) return sign + formatNumber(n / 1e3) + 'K'
  if (n >= 1e6 && n < 1e9) return sign + formatNumber(n / 1e6) + 'M'
  if (n >= 1e9 && n < 1e12) return sign + formatNumber(n / 1e9) + 'B'
  if (n >= 1e12 && n < 1e15) return sign + formatNumber(n / 1e12) + 'T'
  if (n >= 1e15 && n < 1e18) return sign + formatNumber(n / 1e15) + 'P'
  if (n !== Infinity) return sign + formatNumber(n / 1e18) + 'E'
  if (n === Infinity) return sign + <>&infin;</>
  return '-'
}


interface AprData {
  apr: number
}

export function compareApr(a: AprData, b: AprData) {
  if (a.apr < b.apr) {
    return -1
  }
  if (a.apr > b.apr) {
    return 1
  }
  return 0
}


export const formatUnix = (unix: number): string => {
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date = new Date(unix * 1000);
  // Minutes part from the timestamp
  const minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  const seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  return date.getHours() + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

}

export const safeFormatUnix = (unix?: number): string | undefined => {
  if (!unix) return undefined
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date = new Date(unix * 1000);
  // Minutes part from the timestamp
  const minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  const seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  return date.getHours() + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

}