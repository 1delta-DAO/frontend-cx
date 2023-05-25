import { createAction } from '@reduxjs/toolkit'

export const setChainId = createAction<{ chainId: number }>('globalNetwork/setChainId')

export const setAccount = createAction<{ account: string | undefined }>('globalNetwork/setAccount')

export const setIsSupported = createAction<{ isSupported: boolean }>('globalNetwork/setIsSupported')

export const setBlockNumber = createAction<{ chainId: number, blockNumber: number }>('globalNetwork/setBlockNumber')
