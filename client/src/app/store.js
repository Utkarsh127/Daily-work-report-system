import { configureStore } from '@reduxjs/toolkit'
import authReducer    from '../features/auth/authSlice'
import reportsReducer from '../features/reports/reportsSlice'
import managerReducer from '../features/manager/managerSlice'

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    reports: reportsReducer,
    manager: managerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['reports.filters.dateRange'],
      },
    }),
  devTools: import.meta.env.DEV,
})

export default store
