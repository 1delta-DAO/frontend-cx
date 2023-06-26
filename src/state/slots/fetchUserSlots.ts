import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import { getSlotLensContract } from 'hooks/1delta/use1DeltaContract'
import { Slot } from './reducer'
import { slotFactoryAddresses } from 'hooks/1delta/addresses1Delta'
import { multicallSecondary } from 'utils/multicall'
import SLOT_LENS_ABI from 'abis/SlotLens.json'


export interface SlotData {
  chainId: number
  slots: Slot[]
}

export interface SlotQueryParams {
  chainId?: number
  account?: string
}

export const fetchUserSlots: AsyncThunk<SlotData, SlotQueryParams, any> =
  createAsyncThunk<SlotData, SlotQueryParams>(
    '1delta/fetchCompoundAccountDataAsync',

    async ({ chainId, account }) => {
      if (!account || !chainId) return { chainId: 0, slots: [] }

      const factory = slotFactoryAddresses[chainId]

      const lensContract = getSlotLensContract(chainId, account)
      let slotData: any = []
      try {
        slotData = await multicallSecondary(chainId, SLOT_LENS_ABI, [{
          address: lensContract.address,
          name: 'getUserSlots',
          params: [account, factory],
        }])
      } catch (e) {
        console.log("Error fetching protocol data:", e)
      }

      return {
        slots: slotData[0].userSlots.map(s => {
          return {
            slot: s.slot,
            owner: s.owner,
            collateralSymbol: s.collateralSymbol,
            collateral: s.collateral.toString(),
            collateralDecimals: Number(s.collateralDecimals),
            cCollateral: s.cCollateral.toString(),
            debtSymbol: s.debtSymbol,
            debt: s.debt.toString(),
            debtDecimals: Number(s.debtDecimals),
            cDebt: s.cDebt.toString(),
            collateralBalance: s.collateralBalance.toString(),
            debtBalance: s.debtBalance.toString(),
            creationTime: Number(s.creationTime.toString()),
            closeTime: Number(s.closeTime),
            collateralSwapped: s.collateralSwapped.toString(),
            debtSwapped: s.debtSwapped.toString(),
            feeDenominator: Number(s.feeDenominator)
          }

        }),
        chainId
      }
    }
  )
