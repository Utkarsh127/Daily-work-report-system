import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { managerAPI } from './managerAPI'

// ── Async Thunks ──────────────────────────────────────────

export const getOverviewThunk = createAsyncThunk(
  'manager/getOverview',
  async (_, { rejectWithValue }) => {
    try {
      const res = await managerAPI.getOverview()
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch overview')
    }
  }
)

export const getEmployeesThunk = createAsyncThunk(
  'manager/getEmployees',
  async (params, { rejectWithValue }) => {
    try {
      const res = await managerAPI.getEmployees(params)
      return { employees: res.data, pagination: res.pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees')
    }
  }
)

export const createEmployeeThunk = createAsyncThunk(
  'manager/createEmployee',
  async (data, { rejectWithValue }) => {
    try {
      const res = await managerAPI.createEmployee(data)
      return res.data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create employee')
    }
  }
)

export const updateEmployeeThunk = createAsyncThunk(
  'manager/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await managerAPI.updateEmployee(id, data)
      return res.data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update employee')
    }
  }
)

export const deactivateEmployeeThunk = createAsyncThunk(
  'manager/deactivateEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await managerAPI.deactivateEmployee(id)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to deactivate employee')
    }
  }
)

// Analytics summaries
export const getWeeklySummaryThunk = createAsyncThunk(
  'manager/getWeeklySummary',
  async (params, { rejectWithValue }) => {
    try {
      const res = await managerAPI.getWeeklySummary(params)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch weekly summary')
    }
  }
)

export const getMonthlySummaryThunk = createAsyncThunk(
  'manager/getMonthlySummary',
  async (params, { rejectWithValue }) => {
    try {
      const res = await managerAPI.getMonthlySummary(params)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch monthly summary')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────

const managerSlice = createSlice({
  name: 'manager',
  initialState: {
    overview: null,
    employees: [],
    employeesPagination: null,
    weeklySummary: null,
    monthlySummary: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearManagerError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => { state.loading = true; state.error = null }
    const setError = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      // Overview
      .addCase(getOverviewThunk.pending, setLoading)
      .addCase(getOverviewThunk.fulfilled, (state, action) => {
        state.loading = false
        state.overview = action.payload
      })
      .addCase(getOverviewThunk.rejected, setError)

      // Employees
      .addCase(getEmployeesThunk.pending, setLoading)
      .addCase(getEmployeesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.employees = action.payload.employees
        state.employeesPagination = action.payload.pagination
      })
      .addCase(getEmployeesThunk.rejected, setError)

      // Create Employee
      .addCase(createEmployeeThunk.fulfilled, (state, action) => {
        state.employees.unshift(action.payload)
      })

      // Update Employee
      .addCase(updateEmployeeThunk.fulfilled, (state, action) => {
        const idx = state.employees.findIndex(e => e._id === action.payload._id)
        if (idx !== -1) state.employees[idx] = action.payload
      })

      // Deactivate Employee
      .addCase(deactivateEmployeeThunk.fulfilled, (state, action) => {
        const idx = state.employees.findIndex(e => e._id === action.payload)
        if (idx !== -1) state.employees[idx].isActive = false
      })

      // Weekly Summary
      .addCase(getWeeklySummaryThunk.pending, setLoading)
      .addCase(getWeeklySummaryThunk.fulfilled, (state, action) => {
        state.loading = false
        state.weeklySummary = action.payload
      })
      .addCase(getWeeklySummaryThunk.rejected, setError)

      // Monthly Summary
      .addCase(getMonthlySummaryThunk.pending, setLoading)
      .addCase(getMonthlySummaryThunk.fulfilled, (state, action) => {
        state.loading = false
        state.monthlySummary = action.payload
      })
      .addCase(getMonthlySummaryThunk.rejected, setError)
  },
})

export const { clearManagerError } = managerSlice.actions

export const selectOverview = (state) => state.manager.overview
export const selectEmployees = (state) => state.manager.employees
export const selectEmployeesPagination = (state) => state.manager.employeesPagination
export const selectWeeklySummary = (state) => state.manager.weeklySummary
export const selectMonthlySummary = (state) => state.manager.monthlySummary
export const selectManagerLoading = (state) => state.manager.loading

export default managerSlice.reducer
