import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import multicall from 'lib/state/multicall'
import { load, save } from 'redux-localstorage-simple'
import { isTestEnv } from 'utils/env'

import delta from './1delta/reducer'
import globalNetwork from './globalNetwork/reducer'
import oracles from './oracles/reducer'
import application from './application/reducer'
import connection from './connection/reducer'
import { updateVersion } from './global/actions'
import lists from './lists/reducer'
import logs from './logs/slice'
import { routingApi } from './routing/slice'
import swap from './swap/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'
import wallets from './wallets/reducer'
import chart from './chart/reducer'
import marginTradeSelection from './marginTradeSelection/reducer'
import professionalTradeSelection from './professionalTradeSelection/reducer'
import moneyMarket from './moneyMarket/reducer'
import tableFilter from './tableFilter/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists']

const store = configureStore({
  reducer: {
    application,
    user,
    connection,
    transactions,
    wallets,
    globalNetwork,
    swap,
    delta,
    oracles,
    chart,
    marginTradeSelection,
    professionalTradeSelection,
    moneyMarket,
    tableFilter,
    multicall: multicall.reducer,
    lists,
    logs,
    [routingApi.reducerPath]: routingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true, serializableCheck: false })
      .concat(routingApi.middleware)
      .concat(save({ states: PERSISTED_KEYS, debounce: 1000 })),
  preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: isTestEnv() }),
})

store.dispatch(updateVersion())

setupListeners(store.dispatch)

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
