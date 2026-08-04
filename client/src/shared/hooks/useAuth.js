import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsAuthenticated, selectAuthLoading } from '../../features/auth/authSlice'
import { ROLES } from '../utils/constants'

/**
 * useAuth — convenience hook for auth state.
 *
 * Returns:
 *   user           — current user object (or null)
 *   isAuthenticated
 *   isLoading
 *   isEmployee     — true if role === 'employee'
 *   isManager      — true if role === 'manager'
 */
export const useAuth = () => {
  const user            = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading       = useSelector(selectAuthLoading)

  return {
    user,
    isAuthenticated,
    isLoading,
    isEmployee: user?.role === ROLES.EMPLOYEE,
    isManager:  user?.role === ROLES.MANAGER,
  }
}
