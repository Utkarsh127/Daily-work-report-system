import axiosInstance from '../../shared/utils/axiosInstance'

export const reportsAPI = {
  /** POST /reports — submit today's report */
  submit: async (data) => {
    const response = await axiosInstance.post('/reports', data)
    return response.data
  },

  /** GET /reports/me/today */
  getToday: async () => {
    const response = await axiosInstance.get('/reports/me/today')
    return response.data
  },

  /** GET /reports/me?page=&limit=&startDate=&endDate= */
  getMyReports: async (params = {}) => {
    const response = await axiosInstance.get('/reports/me', { params })
    return response.data
  },

  /** PUT /reports/:id */
  update: async (id, data) => {
    const response = await axiosInstance.put(`/reports/${id}`, data)
    return response.data
  },

  /** DELETE /reports/:id */
  delete: async (id) => {
    const response = await axiosInstance.delete(`/reports/${id}`)
    return response.data
  },

  // ── Manager endpoints ───────────────────────────────────

  /** GET /reports?page=&limit=&startDate=&endDate=&employeeId=&mood= */
  getAllReports: async (params = {}) => {
    const response = await axiosInstance.get('/reports', { params })
    return response.data
  },

  /** GET /reports/employee/:id */
  getEmployeeReports: async (employeeId, params = {}) => {
    const response = await axiosInstance.get(`/reports/employee/${employeeId}`, { params })
    return response.data
  },
}
