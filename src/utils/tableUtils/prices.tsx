import { TEN } from "constants/1delta";
import { ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { PriceHistAave, PriceWithHist } from "types/1delta";


export const getAavePriceWithHist = (price: string, hist: PriceHistAave[]): PriceWithHist => {
  return {
    price: formatAavePrice(price),
    hist
  }
}

export const formatAavePrice = (price: string): number => {
  return Number(formatEther(ethers.BigNumber.from(price ?? '0').mul(TEN.pow(10))))
}

export const answerToPrice = (answer?: string, decimals?: number): number => {
  return Number(formatEther(ethers.BigNumber.from(answer ?? '0').mul(TEN.pow(18 - (decimals ?? 18)))))
}

export const exoticAnswerToPrice = (answer?: string, decimals?: number, answer2?: string, decimals2?: number): number => {
  return Number(formatEther(ethers.BigNumber.from(answer ?? '0').mul(TEN.pow(18 - (decimals ?? 18))))) *
    Number(formatEther(ethers.BigNumber.from(answer2 ?? '0').mul(TEN.pow(18 - (decimals2 ?? 18)))))
}

