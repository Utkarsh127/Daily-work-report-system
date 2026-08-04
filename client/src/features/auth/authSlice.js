import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from './authAPI'
import { TOKEN_KEY, USER_KEY } from '../../shared/utils/constants'

// ── Helpers ───────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const user  = JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

// ── Async thunks ──────────────────────────────────────────
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authAPI.login(credentials)
      // Persist to localStorage
      localStorage.setItem(TOKEN_KEY, res.data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user))
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed. Please try again.'
      )
    }
  }
)

export const getMeThunk = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.getMe()
      return res.data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authAPI.logout()
})

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authAPI.changePassword(data)
      return res.message
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to change password'
      )
    }
  }
)

// ── Initial state ─────────────────────────────────────────
const { token, user } = loadFromStorage()

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
  loading:         false,
  error:           null,
}

// ── Slice ─────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem(USER_KEY, JSON.stringify(state.user))
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading         = false
        state.isAuthenticated = true
        state.token           = action.payload.token
        state.user            = action.payload.user
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    // getMe
    builder
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.user = action.payload
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload))
      })

    // logout
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user            = null
        state.token           = null
        state.isAuthenticated = false
        state.error           = null
      })

    // changePassword
    builder
      .addCase(changePasswordThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })
  },
})

export const { clearError, updateUser } = authSlice.actions

// ── Selectors ─────────────────────────────────────────────
export const selectAuth            = (state) => state.auth
export const selectCurrentUser     = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading     = (state) => state.auth.loading
export const selectAuthError       = (state) => state.auth.error

export default authSlice.reducer
