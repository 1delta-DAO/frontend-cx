import { createAction } from '@reduxjs/toolkit'
import { SupportedAssets } from 'types/1delta'

export const selectChart = createAction<{ chartShown: SupportedAssets | undefined }>('user/selectChart')
