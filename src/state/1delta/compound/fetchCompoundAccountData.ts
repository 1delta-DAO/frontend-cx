import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import { SupportedChainId } from 'constants/chains'
import { ethers } from 'ethers'
import { getOVixOTokens } from 'hooks/1delta/addresses0Vix'
import { getCompoundCTokens } from 'hooks/1delta/addressesCompound'
import { getCompoundComptrollerContract, getCompoundLensContract } from 'hooks/1delta/use1DeltaContract'
import { SerializedBigNumber, SupportedAssets } from 'types/1delta'
import multicall, { Call, multicallSecondary } from 'utils/multicall'
import COMPOUND_LENS_ABI from 'abis/compound-v2/CompoundLens.json'
import OVIX_LENS_ABI from 'abis/compound-v2/OVixLens.json'

interface ReplyEntry {
  balanceOf: SerializedBigNumber
  borrowBalanceCurrent: SerializedBigNumber
  balanceOfUnderlying: SerializedBigNumber
  tokenBalance: SerializedBigNumber
  tokenAllowance: SerializedBigNumber
}

interface ResponseData {
  [tokenSymbol: string]: {
    [accountAddress: string]: ReplyEntry
  }
}

interface Summary {
  [accountAddress: string]: {
    markets: string[]
    liquidity: SerializedBigNumber
    shortfall: SerializedBigNumber
  }
}

export interface CompoundPublicResponse {
  chainId: number
  data?: ResponseData
  summary?: Summary
}

export interface CompoundAccountQueryParams {
  chainId?: number
  accounts: {
    [index: number]: string
  }
  assetIds: SupportedAssets[]
}

export const fetchCompoundAccountDataAsync: AsyncThunk<CompoundPublicResponse, CompoundAccountQueryParams, any> =
  createAsyncThunk<CompoundPublicResponse, CompoundAccountQueryParams>(
    '1delta/fetchCompoundAccountDataAsync',

    async ({ chainId, accounts, assetIds }) => {
      if (!accounts || Object.values(accounts).length === 0 || !chainId) return { chainId: 0 }

      const isEthereum = chainId === SupportedChainId.MAINNET || chainId === SupportedChainId.GOERLI
      const accountsArray = Object.values(accounts)
      const cTokens = isEthereum ? getCompoundCTokens(chainId, assetIds) : getOVixOTokens(chainId, assetIds)
      const lensContract = getCompoundLensContract(chainId)
      const comptroller = getCompoundComptrollerContract(chainId)
      const calls: Call[] = []
      for (let i = 0; i < assetIds.length; i++) {
        const cToken = cTokens[assetIds[i]]
        for (let k = 0; k < accountsArray.length; k++) {
          calls.push({
            address: lensContract.address,
            name: 'cTokenBalances',
            params: [cToken, accountsArray[k]],
          })
        }
      }

      const callsSummary: Call[] = []
      for (let k = 0; k < accountsArray.length; k++) {
        callsSummary.push({
          address: lensContract.address,
          name: 'getAccountLimits',
          params: [comptroller.address, accountsArray[k]],
        })
      }

      let multicallResult: ethers.utils.Result[]
      try {
        multicallResult = await multicallSecondary(chainId, isEthereum ? COMPOUND_LENS_ABI : OVIX_LENS_ABI, [
          ...calls,
          ...callsSummary,
        ])
      } catch (err) {
        multicallResult = []
        console.log('Error fetching data', err)
      }

      const balsData = multicallResult.slice(0, calls.length)
      const finalData: ResponseData = {}
      let currentIndex = 0
      for (let i = 0; i < assetIds.length; i++) {
        finalData[assetIds[i]] = {}
        for (let k = 0; k < accountsArray.length; k++) {
          finalData[assetIds[i]][accountsArray[k]] = {
            balanceOf: balsData[currentIndex][0]?.balanceOf.toString(),
            borrowBalanceCurrent: balsData[currentIndex][0]?.borrowBalanceCurrent.toString(),
            balanceOfUnderlying: balsData[currentIndex][0]?.balanceOfUnderlying.toString(),
            tokenBalance: balsData[currentIndex][0]?.tokenBalance.toString(),
            tokenAllowance: balsData[currentIndex][0]?.tokenAllowance.toString(),
          }
          currentIndex += 1
        }
      }

      const summaryData = multicallResult.slice(calls.length, calls.length + callsSummary.length)
      const finalSummary: Summary = {}
      for (let k = 0; k < accountsArray.length; k++) {
        finalSummary[accountsArray[k]] = {
          markets: summaryData[k][0]?.markets,
          liquidity: summaryData[k][0]?.liquidity.toString(),
          shortfall: summaryData[k][0]?.shortfall.toString(),
        }
      }

      return { data: finalData, summary: finalSummary, chainId }
    }
  )
