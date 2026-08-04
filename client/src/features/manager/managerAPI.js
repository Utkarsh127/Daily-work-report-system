import axiosInstance from '../../shared/utils/axiosInstance'

export const managerAPI = {
  // ── Employees ───────────────────────────────────────────
  getEmployees: async (params = {}) => {
    const response = await axiosInstance.get('/users', { params })
    return response.data
  },
  createEmployee: async (data) => {
    const response = await axiosInstance.post('/users', data)
    return response.data
  },
  updateEmployee: async (id, data) => {
    const response = await axiosInstance.put(`/users/${id}`, data)
    return response.data
  },
  deactivateEmployee: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`)
    return response.data
  },

  // ── Analytics ───────────────────────────────────────────
  getOverview: async () => {
    const response = await axiosInstance.get('/analytics/overview')
    return response.data
  },
  getWeeklySummary: async (params = {}) => {
    const response = await axiosInstance.get('/analytics/weekly', { params })
    return response.data
  },
  getMonthlySummary: async (params = {}) => {
    const response = await axiosInstance.get('/analytics/monthly', { params })
    return response.data
  },

  // ── Export ──────────────────────────────────────────────
  exportReportsCSV: async (params = {}) => {
    const response = await axiosInstance.get('/analytics/export/csv', {
      params,
      responseType: 'blob', // Important for file download
    })
    return response.data
  },
}
