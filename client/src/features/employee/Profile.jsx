import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useAuth } from '../../shared/hooks/useAuth'
import { updateUser } from '../auth/authSlice'
import axiosInstance from '../../shared/utils/axiosInstance'
import { USER_KEY } from '../../shared/utils/constants'
import Spinner from '../../shared/components/UI/Spinner'

export default function Profile() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPwd, setIsChangingPwd]       = useState(false)

  // Profile form
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({ defaultValues: { name: user?.name || '', avatar: user?.avatar || '' } })

  // Password form
  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: pwdSubmitting },
    watch,
  } = useForm()

  const onProfileSubmit = async (data) => {
    try {
      const res = await axiosInstance.put('/users/me/profile', data)
      dispatch(updateUser(res.data.data.user))
      localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...res.data.data.user }))
      toast.success('Profile updated!')
      setIsEditingProfile(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  }

  const onPwdSubmit = async (data) => {
    try {
      await axiosInstance.put('/auth/me/password', data)
      toast.success('Password changed successfully!')
      resetPwd()
      setIsChangingPwd(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <div className="page-container max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and password</p>
      </div>

      {/* Profile Card */}
      <div className="card p-6 mb-6">
        {/* Avatar + info */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-700/50">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {user?.employeeId && (
                <span className="badge badge-neutral text-xs">{user.employeeId}</span>
              )}
              <span className={`badge text-xs ${user?.role === 'manager' ? 'badge-primary' : 'badge-info'}`}>
                {user?.role === 'manager' ? '👔 Manager' : '👤 Employee'}
              </span>
              {user?.department?.name && (
                <span className="badge badge-neutral text-xs">{user.department.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Profile info / edit form */}
        {!isEditingProfile ? (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Full Name',  value: user?.name },
                { label: 'Email',      value: user?.email },
                { label: 'Employee ID', value: user?.employeeId || '—' },
                { label: 'Department', value: user?.department?.name || '—' },
                { label: 'Role',       value: user?.role },
                { label: 'Status',     value: user?.isActive ? 'Active' : 'Inactive' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm text-slate-200">{value}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setIsEditingProfile(true)} className="btn-secondary btn-sm">
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleProfile(onProfileSubmit)} noValidate className="space-y-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                {...regProfile('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Min 2 characters' },
                })}
                className={`form-input ${profileErrors.name ? 'border-red-500' : ''}`}
              />
              {profileErrors.name && <p className="form-error">{profileErrors.name.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Avatar URL</label>
              <input
                {...regProfile('avatar')}
                placeholder="https://example.com/avatar.jpg"
                className="form-input"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={profileSubmitting} className="btn-primary btn-sm">
                {profileSubmitting ? <Spinner size="sm" /> : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setIsEditingProfile(false)} className="btn-secondary btn-sm">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-200">Change Password</h3>
          {!isChangingPwd && (
            <button onClick={() => setIsChangingPwd(true)} className="btn-secondary btn-sm">
              Change
            </button>
          )}
        </div>

        {isChangingPwd ? (
          <form onSubmit={handlePwd(onPwdSubmit)} noValidate className="space-y-4">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                {...regPwd('currentPassword', { required: 'Required' })}
                className={`form-input ${pwdErrors.currentPassword ? 'border-red-500' : ''}`}
              />
              {pwdErrors.currentPassword && <p className="form-error">{pwdErrors.currentPassword.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                {...regPwd('newPassword', {
                  required: 'Required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
                className={`form-input ${pwdErrors.newPassword ? 'border-red-500' : ''}`}
              />
              {pwdErrors.newPassword && <p className="form-error">{pwdErrors.newPassword.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                {...regPwd('confirmPassword', {
                  required: 'Required',
                  validate: (v) => v === watch('newPassword') || 'Passwords do not match',
                })}
                className={`form-input ${pwdErrors.confirmPassword ? 'border-red-500' : ''}`}
              />
              {pwdErrors.confirmPassword && <p className="form-error">{pwdErrors.confirmPassword.message}</p>}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={pwdSubmitting} className="btn-primary btn-sm">
                {pwdSubmitting ? <Spinner size="sm" /> : 'Update Password'}
              </button>
              <button type="button" onClick={() => setIsChangingPwd(false)} className="btn-secondary btn-sm">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500">
            Last changed: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
          </p>
        )}
      </div>
    </div>
  )
}
