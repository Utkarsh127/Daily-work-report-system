import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import StatCard from '../../shared/components/UI/StatCard'
import Badge from '../../shared/components/UI/Badge'
import Spinner from '../../shared/components/UI/Spinner'
import { getTodayReportThunk, getMyReportsThunk, selectTodayReport, selectMyReports, selectReportsLoading } from '../reports/reportsSlice'
import { formatDate, timeAgo } from '../../shared/utils/formatDate'
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, MOOD_LABELS } from '../../shared/utils/constants'

export default function EmployeeDashboard() {
  const dispatch    = useDispatch()
  const { user }    = useAuth()
  const todayReport = useSelector(selectTodayReport)
  const myReports   = useSelector(selectMyReports)
  const isLoading   = useSelector(selectReportsLoading)

  useEffect(() => {
    dispatch(getTodayReportThunk())
    dispatch(getMyReportsThunk({ limit: 5 }))
  }, [dispatch])

  // Compute stats from recent reports
  const weekReports  = myReports.slice(0, 5)
  const totalHours   = weekReports.reduce((s, r) => s + (r.totalHours || 0), 0).toFixed(1)
  const tasksDone    = weekReports.flatMap((r) => r.tasks || []).filter((t) => t.status === 'completed').length

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!todayReport && (
          <Link to="/employee/report" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Submit Today's Report
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Today's Report"
          value={todayReport ? 'Submitted ✓' : 'Pending'}
          subtitle={todayReport ? `${todayReport.totalHours}h logged` : 'Not submitted yet'}
          icon="📋"
          color={todayReport ? 'success' : 'warning'}
        />
        <StatCard
          title="Hours This Week"
          value={`${totalHours}h`}
          subtitle={`Across ${weekReports.length} report${weekReports.length !== 1 ? 's' : ''}`}
          icon="⏱️"
          color="info"
        />
        <StatCard
          title="Tasks Completed"
          value={tasksDone}
          subtitle="In recent reports"
          icon="✅"
          color="success"
        />
        <StatCard
          title="Today's Mood"
          value={todayReport ? MOOD_LABELS[todayReport.mood] || '—' : '—'}
          subtitle={todayReport ? 'Reported' : 'Submit to log'}
          icon="😊"
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's report detail */}
        <div className="xl:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-200">Today's Report</h2>
              {todayReport && (
                <Link to="/employee/reports" className="text-xs text-primary-400 hover:text-primary-300">
                  Edit →
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : todayReport ? (
              <div className="space-y-3">
                {todayReport.tasks?.map((task, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-900/50 border border-slate-700/30">
                    <Badge variant={
                      task.status === 'completed' ? 'success' :
                      task.status === 'in-progress' ? 'info' : 'error'
                    }>
                      {TASK_STATUS_LABELS[task.status]}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                      {task.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>}
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{task.hoursSpent}h</span>
                  </div>
                ))}
                {todayReport.blockers && (
                  <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <p className="text-xs font-medium text-red-400 mb-1">Blockers</p>
                    <p className="text-xs text-slate-400">{todayReport.blockers}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-slate-400 text-sm mb-4">You haven't submitted a report today.</p>
                <Link to="/employee/report" className="btn-primary btn-sm">
                  Submit Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent history */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-200">Recent Reports</h2>
            <Link to="/employee/reports" className="text-xs text-primary-400 hover:text-primary-300">
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : myReports.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-8">No reports yet.</p>
          ) : (
            <div className="space-y-3">
              {myReports.slice(0, 5).map((report) => (
                <div key={report._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center text-sm flex-shrink-0">
                    📋
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{formatDate(report.date)}</p>
                    <p className="text-xs text-slate-500">{report.totalHours}h · {report.tasks?.length} tasks</p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">{MOOD_LABELS[report.mood]?.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
