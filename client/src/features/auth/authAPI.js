import axiosInstance from '../../shared/utils/axiosInstance'
import { TOKEN_KEY, USER_KEY } from '../../shared/utils/constants'

export const authAPI = {
  /** POST /auth/login */
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials)
    return response.data
  },

  /** POST /auth/logout */
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch {
      // Ignore server errors on logout — always clear local state
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  /** GET /auth/me */
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me')
    return response.data
  },

  /** PUT /auth/me/password */
  changePassword: async (data) => {
    const response = await axiosInstance.put('/auth/me/password', data)
    return response.data
  },
}
