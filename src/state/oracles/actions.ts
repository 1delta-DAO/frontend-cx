import { createAction } from '@reduxjs/toolkit'

export const resetState = createAction<void>('oracles/resetState')

export const setOraclesToLoading = createAction('oracles/setOraclesToLoading')
