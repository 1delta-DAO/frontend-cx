import { createAction } from '@reduxjs/toolkit'

export enum LendingProtocol {
  AAVE = 'AAVE',
  COMPOUND = 'Compound V2',
  COMPOUNDV3 = 'Compound V3'
}

export const resetState = createAction<void>('1delta/resetState')
export const switchLendingProtocol = createAction<{ targetProtocol: LendingProtocol }>('1delta/switchLendingProtocol')
export const set1DeltaAccount = createAction<{ chainId: number; index: number }>('1delta/set1DeltaAccount')
export const set1DeltaAccountMetaLoading = createAction<{ chainId: number; state: boolean }>(
  '1delta/set1DeltaAccountMetaLoading'
)
export const setToLoading = createAction('1delta/setToLoading')


export const flushAccount = createAction('1delta/flushAccount')