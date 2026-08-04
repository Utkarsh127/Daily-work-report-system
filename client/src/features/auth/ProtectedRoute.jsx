import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import Spinner from '../../shared/components/UI/Spinner'

/**
 * ProtectedRoute — blocks unauthenticated access.
 * Saves the attempted URL so we can redirect back after login.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * RoleRoute — restricts access to specified roles.
 * Redirects unauthenticated users to /login and wrong-role users to their dashboard.
 */
export const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to correct dashboard based on role
    const dashboardPath = user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'
    return <Navigate to={dashboardPath} replace />
  }

  return children
}
