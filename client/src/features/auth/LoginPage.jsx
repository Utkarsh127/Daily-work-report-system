import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginThunk, clearError } from './authSlice'
import { useAuth } from '../../shared/hooks/useAuth'

export default function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isAuthenticated, isLoading, user } = useAuth()

  const from = location.state?.from?.pathname

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // If already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = from || (user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard')
      navigate(dest, { replace: true })
    }
  }, [isAuthenticated, user, navigate, from])

  const onSubmit = async (data) => {
    dispatch(clearError())
    const result = await dispatch(loginThunk(data))
    if (loginThunk.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.name}!`)
    } else {
      toast.error(result.payload || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 bg-grid flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 30% 50%, rgba(99,102,241,0.2), transparent)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Daily Work Report</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Track your work,<br />
            <span className="gradient-text">Grow your team.</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            A unified platform for employees to log daily progress
            and managers to monitor team performance in real time.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon: '📋', text: 'Daily report submission with task tracking' },
              { icon: '📊', text: 'Analytics with weekly and monthly insights' },
              { icon: '📁', text: 'CSV export for records and payroll' },
              { icon: '🔒', text: 'Role-based access for employees and managers' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">
          © {new Date().getFullYear()} Daily Work Report System
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Daily Work Report</span>
          </div>

          <div className="card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Sign in</h2>
              <p className="text-slate-400 text-sm">Enter your credentials to access your workspace.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={`form-input ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
                  })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`form-input ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                id="login-btn"
                type="submit"
                disabled={isSubmitting || isLoading}
                className="btn-primary w-full btn-lg mt-2"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 rounded-lg bg-primary-950/50 border border-primary-800/30">
              <p className="text-xs font-medium text-primary-400 mb-2">Demo credentials</p>
              <div className="space-y-1 text-xs text-slate-400">
                <p><span className="text-slate-300">Manager:</span> manager@wrs.local / Manager@123</p>
                <p><span className="text-slate-300">Employee:</span> alice@wrs.local / Employee@123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
