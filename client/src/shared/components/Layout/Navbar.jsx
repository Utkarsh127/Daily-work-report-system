import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth'
import { logoutThunk } from '../../../features/auth/authSlice'

export default function Navbar({ onMenuToggle }) {
  const { user, isManager } = useAuth()
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    toast.info('Logged out')
    navigate('/login')
  }

  return (
    <header className="h-16 bg-surface-800/80 backdrop-blur border-b border-slate-700/50 flex items-center px-4 gap-4 flex-shrink-0 sticky top-0 z-10">
      {/* Hamburger */}
      <button
        onClick={onMenuToggle}
        className="btn-ghost p-2 rounded-lg"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title — comes from document title, overridden per page */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span className={`badge text-xs hidden sm:inline-flex ${isManager ? 'badge-primary' : 'badge-info'}`}>
          {isManager ? 'Manager' : 'Employee'}
        </span>

        {/* Avatar button */}
        <div className="relative group">
          <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-700/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-200 leading-none">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.employeeId || user?.role}</p>
            </div>
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 card shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-3 border-b border-slate-700/50">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <div className="p-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
