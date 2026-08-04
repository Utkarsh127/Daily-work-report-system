import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth'
import { logoutThunk } from '../../../features/auth/authSlice'
import { ROLES } from '../../utils/constants'

const EMPLOYEE_NAV = [
  { to: '/employee/dashboard', label: 'Dashboard',    icon: HomeIcon },
  { to: '/employee/report',    label: 'Submit Report', icon: PlusIcon },
  { to: '/employee/reports',   label: 'My Reports',   icon: ListIcon },
  { to: '/employee/profile',   label: 'Profile',      icon: UserIcon },
]

const MANAGER_NAV = [
  { to: '/manager/dashboard',  label: 'Dashboard',    icon: HomeIcon },
  { to: '/manager/employees',  label: 'Employees',    icon: UsersIcon },
  { to: '/manager/reports',    label: 'All Reports',  icon: ListIcon },
  { to: '/manager/weekly',     label: 'Weekly',       icon: CalendarIcon },
  { to: '/manager/monthly',    label: 'Monthly',      icon: ChartIcon },
  { to: '/manager/analytics',  label: 'Analytics',    icon: ChartBarIcon },
]

export default function Sidebar({ isOpen, onToggle }) {
  const { user, isManager } = useAuth()
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const navItems  = isManager ? MANAGER_NAV : EMPLOYEE_NAV

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    toast.info('Logged out')
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30
          bg-surface-800 border-r border-slate-700/50
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-16'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50 h-16 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          {isOpen && (
            <span className="font-bold text-white text-sm whitespace-nowrap overflow-hidden">
              Work Report
            </span>
          )}
        </div>

        {/* Role badge */}
        {isOpen && (
          <div className="px-4 py-3 border-b border-slate-700/50">
            <span className={`badge text-xs ${isManager ? 'badge-primary' : 'badge-info'}`}>
              {isManager ? '👔 Manager' : '👤 Employee'}
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-none">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium
                 transition-all duration-150 group
                 ${isActive
                   ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20'
                   : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                 }`
              }
              title={!isOpen ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User profile + Logout */}
        <div className="border-t border-slate-700/50 p-3 flex-shrink-0">
          {isOpen ? (
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400
                        hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150`}
            title={!isOpen ? 'Logout' : undefined}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Icon components ───────────────────────────────────────
function HomeIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
}
function PlusIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
}
function ListIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
}
function UserIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}
function UsersIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
}
function CalendarIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}
function ChartIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
}
function ChartBarIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}
