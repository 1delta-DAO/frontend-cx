import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getAaveOracleContract, getGhoOracleContract,
} from 'hooks/1delta/use1DeltaContract'
import { SerializedBigNumber, SupportedAssets } from 'types/1delta'
import { getAAVETokenAddresses } from 'hooks/1delta/addressGetter'
import { SupportedChainId } from 'constants/chains'

export interface AAVEAggregatorResponse {
  chainId: number
  data: {
    [tokenSymbol: string]: {
      price: SerializedBigNumber,
      time: number
    }
  }
}

export interface AAVEAggregatorQueryParams {
  chainId: number
}

export const fetchAAVEAggregatorDataAsync: AsyncThunk<AAVEAggregatorResponse, AAVEAggregatorQueryParams, any> =
  createAsyncThunk<AAVEAggregatorResponse, AAVEAggregatorQueryParams>(
    'oracles/fetchAAVEAggregatorDataAsync',

    async ({ chainId }) => {
      const rawAddressDict = getAAVETokenAddresses(chainId)
      const filtered = Object.fromEntries(Object.entries(rawAddressDict).filter(([k, v]) => k !== SupportedAssets.GHO));
      const names = Object.keys(filtered)
      const addresses = Object.values(filtered)
      const oracleContract = getAaveOracleContract(chainId)
      let prices: any[]

      try {
        prices = await oracleContract.getAssetsPrices(addresses)
      } catch (err) {
        console.log(err)
        prices = []
      }
      const time = Math.floor(Date.now() / 1000)
      const result = Object.assign(
        {},
        ...prices.map((entry, index) => {
          return {
            [names[index]]: {
              price: entry.toString(), // && ethers.utils.formatEther(entry[0]?.mul(ethers.BigNumber.from(10).pow(10))),
              time
            },
          }
        })
      )

      let ghoPriceData = {}
      if (chainId === SupportedChainId.GOERLI)
        try {
          const ghoOracleContract = getGhoOracleContract(chainId)
          const rawGhoData = await ghoOracleContract.GHO_PRICE()
          ghoPriceData = {
            [SupportedAssets.GHO]: {
              price: rawGhoData?.toString(),
              time
            }
          }
        } catch (err) {
          console.log(err)
          ghoPriceData = {}
        }

      return { data: { ...result, ...ghoPriceData }, chainId }
    }
  )
