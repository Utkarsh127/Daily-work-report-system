import axios from 'axios'

/**
 * Axios instance pre-configured for the WRS API.
 *
 * - baseURL: /api (proxied to http://localhost:5000 in dev via vite.config.js)
 * - Request interceptor: injects Authorization Bearer token from localStorage
 * - Response interceptor: on 401, clears auth state and redirects to /login
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ── Request interceptor ───────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wrs_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ──────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored auth and redirect to login
      localStorage.removeItem('wrs_token')
      localStorage.removeItem('wrs_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
