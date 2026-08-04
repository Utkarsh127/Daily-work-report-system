import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reportsAPI } from './reportsAPI'

// ── Async thunks ──────────────────────────────────────────

export const submitReportThunk = createAsyncThunk(
  'reports/submit',
  async (data, { rejectWithValue }) => {
    try {
      const res = await reportsAPI.submit(data)
      return res.data.report
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit report')
    }
  }
)

export const getTodayReportThunk = createAsyncThunk(
  'reports/getToday',
  async (_, { rejectWithValue }) => {
    try {
      const res = await reportsAPI.getToday()
      return res.data.report
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch today\'s report')
    }
  }
)

export const getMyReportsThunk = createAsyncThunk(
  'reports/getMyReports',
  async (params, { rejectWithValue }) => {
    try {
      const res = await reportsAPI.getMyReports(params)
      return { reports: res.data, pagination: res.pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch reports')
    }
  }
)

export const getAllReportsThunk = createAsyncThunk(
  'reports/getAllReports',
  async (params, { rejectWithValue }) => {
    try {
      const res = await reportsAPI.getAllReports(params)
      return { reports: res.data, pagination: res.pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch all reports')
    }
  }
)

export const updateReportThunk = createAsyncThunk(
  'reports/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await reportsAPI.update(id, data)
      return res.data.report
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update report')
    }
  }
)

export const deleteReportThunk = createAsyncThunk(
  'reports/delete',
  async (id, { rejectWithValue }) => {
    try {
      await reportsAPI.delete(id)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete report')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    todayReport: null,
    myReports:   [],
    allReports:  [],
    pagination:  null,
    loading:     false,
    error:       null,
  },
  reducers: {
    clearReportsError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => { state.loading = true; state.error = null }
    const setError   = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      // getToday
      .addCase(getTodayReportThunk.pending,   setLoading)
      .addCase(getTodayReportThunk.fulfilled,  (state, action) => { state.loading = false; state.todayReport = action.payload })
      .addCase(getTodayReportThunk.rejected,   setError)
      // submit
      .addCase(submitReportThunk.pending,   setLoading)
      .addCase(submitReportThunk.fulfilled, (state, action) => { state.loading = false; state.todayReport = action.payload })
      .addCase(submitReportThunk.rejected,  setError)
      // getMyReports
      .addCase(getMyReportsThunk.pending,   setLoading)
      .addCase(getMyReportsThunk.fulfilled, (state, action) => {
        state.loading    = false
        state.myReports  = action.payload.reports
        state.pagination = action.payload.pagination
      })
      .addCase(getMyReportsThunk.rejected, setError)
      // getAllReports
      .addCase(getAllReportsThunk.pending,   setLoading)
      .addCase(getAllReportsThunk.fulfilled, (state, action) => {
        state.loading    = false
        state.allReports = action.payload.reports
        state.pagination = action.payload.pagination
      })
      .addCase(getAllReportsThunk.rejected, setError)
      // update
      .addCase(updateReportThunk.fulfilled, (state, action) => {
        state.loading     = false
        state.todayReport = action.payload
        const idx = state.myReports.findIndex((r) => r._id === action.payload._id)
        if (idx !== -1) state.myReports[idx] = action.payload
      })
      // delete
      .addCase(deleteReportThunk.fulfilled, (state, action) => {
        state.loading     = false
        state.todayReport = null
        state.myReports   = state.myReports.filter((r) => r._id !== action.payload)
      })
  },
})

export const { clearReportsError } = reportsSlice.actions

export const selectTodayReport = (state) => state.reports.todayReport
export const selectMyReports   = (state) => state.reports.myReports
export const selectAllReports  = (state) => state.reports.allReports
export const selectPagination  = (state) => state.reports.pagination
export const selectReportsLoading = (state) => state.reports.loading
export const selectReportsError   = (state) => state.reports.error

export default reportsSlice.reducer
