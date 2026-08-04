import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from './shared/hooks/useAuth'
import { getMeThunk } from './features/auth/authSlice'
import { TOKEN_KEY } from './shared/utils/constants'

// Auth
import LoginPage from './features/auth/LoginPage'
import { ProtectedRoute, RoleRoute } from './features/auth/ProtectedRoute'

// Layout
import AppLayout from './shared/components/Layout/AppLayout'
import Spinner from './shared/components/UI/Spinner'

// Employee pages (M5 — stubs until M5 is built)
import EmployeeDashboard from './features/employee/EmployeeDashboard'
import SubmitReport      from './features/employee/SubmitReport'
import MyReports         from './features/employee/MyReports'
import Profile           from './features/employee/Profile'

// Manager pages (M6 — stubs until M6 is built)
import ManagerDashboard    from './features/manager/ManagerDashboard'
import EmployeeManagement  from './features/manager/EmployeeManagement'
import AllReports          from './features/manager/AllReports'
import WeeklyReports       from './features/manager/WeeklyReports'
import MonthlyReports      from './features/manager/MonthlyReports'
import Analytics           from './features/manager/Analytics'

function App() {
  const dispatch        = useDispatch()
  const { isAuthenticated, isLoading } = useAuth()

  // On mount: if token exists, validate it by fetching /auth/me
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      dispatch(getMeThunk())
    }
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={`/${localStorage.getItem('wrs_user') ? JSON.parse(localStorage.getItem('wrs_user'))?.role === 'manager' ? 'manager' : 'employee' : 'employee'}/dashboard`} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Employee routes */}
      <Route
        element={
          <RoleRoute allowedRoles={['employee', 'manager']}>
            <AppLayout />
          </RoleRoute>
        }
      >
        <Route path="employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="employee/report"    element={<SubmitReport />} />
        <Route path="employee/reports"   element={<MyReports />} />
        <Route path="employee/profile"   element={<Profile />} />
      </Route>

      {/* Manager routes */}
      <Route
        element={
          <RoleRoute allowedRoles={['manager']}>
            <AppLayout />
          </RoleRoute>
        }
      >
        <Route path="manager/dashboard"  element={<ManagerDashboard />} />
        <Route path="manager/employees"  element={<EmployeeManagement />} />
        <Route path="manager/reports"    element={<AllReports />} />
        <Route path="manager/weekly"     element={<WeeklyReports />} />
        <Route path="manager/monthly"    element={<MonthlyReports />} />
        <Route path="manager/analytics"  element={<Analytics />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
