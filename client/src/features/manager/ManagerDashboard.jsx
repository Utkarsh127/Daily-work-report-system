import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getOverviewThunk, selectOverview, selectManagerLoading } from './managerSlice'
import StatCard from '../../shared/components/UI/StatCard'
import Spinner from '../../shared/components/UI/Spinner'
import { MOOD_LABELS } from '../../shared/utils/constants'

export default function ManagerDashboard() {
  const dispatch = useDispatch()
  const overview = useSelector(selectOverview)
  const isLoading = useSelector(selectManagerLoading)

  useEffect(() => {
    dispatch(getOverviewThunk())
  }, [dispatch])

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-start">
        <div>
          <h1 className="page-title">Manager Dashboard</h1>
          <p className="page-subtitle">Team performance overview for today</p>
        </div>
      </div>

      {isLoading && !overview ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : overview ? (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Total Employees"  
              value={overview.totalEmployees} 
              icon="👥" 
              color="primary" 
            />
            <StatCard 
              title="Reported Today"   
              value={overview.reportedToday} 
              subtitle={`${overview.notReportedToday} pending`}
              icon="📋" 
              color="success" 
            />
            <StatCard 
              title="Not Reported"     
              value={overview.notReportedToday} 
              icon="⚠️" 
              color={overview.notReportedToday > 0 ? "warning" : "success"} 
            />
            <StatCard 
              title="Avg Hours / Week" 
              value={`${overview.avgHoursThisWeek}h`} 
              subtitle={`${overview.weeklyReports} reports this week`}
              icon="⏱️" 
              color="info"    
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-base font-semibold text-slate-200 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/manager/employees" className="flex items-center gap-3 p-4 rounded-lg bg-surface-900/50 border border-slate-700/50 hover:bg-slate-800/50 hover:border-primary-500/30 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-xl">👥</div>
                  <div>
                    <p className="font-medium text-slate-200 group-hover:text-primary-400 transition-colors">Manage Team</p>
                    <p className="text-xs text-slate-500">Add or edit employees</p>
                  </div>
                </Link>
                <Link to="/manager/reports" className="flex items-center gap-3 p-4 rounded-lg bg-surface-900/50 border border-slate-700/50 hover:bg-slate-800/50 hover:border-primary-500/30 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xl">📋</div>
                  <div>
                    <p className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">All Reports</p>
                    <p className="text-xs text-slate-500">View team submissions</p>
                  </div>
                </Link>
                <Link to="/manager/analytics" className="flex items-center gap-3 p-4 rounded-lg bg-surface-900/50 border border-slate-700/50 hover:bg-slate-800/50 hover:border-primary-500/30 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-xl">📊</div>
                  <div>
                    <p className="font-medium text-slate-200 group-hover:text-sky-400 transition-colors">Analytics</p>
                    <p className="text-xs text-slate-500">Detailed visualizations</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Today's Mood Distribution */}
            <div className="card p-6">
              <h2 className="text-base font-semibold text-slate-200 mb-4">Team Mood (Today)</h2>
              {Object.keys(overview.moodDistributionToday).length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No reports submitted today yet.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(overview.moodDistributionToday).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
                    <div key={mood} className="flex items-center gap-3">
                      <div className="w-8 text-center text-xl flex-shrink-0">{MOOD_LABELS[mood]?.split(' ')[0]}</div>
                      <div className="flex-1 h-3 bg-surface-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full" 
                          style={{ width: `${(count / overview.reportedToday) * 100}%` }}
                        />
                      </div>
                      <div className="w-8 text-right text-sm text-slate-400 font-medium flex-shrink-0">{count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-slate-500">Failed to load overview data.</p>
      )}
    </div>
  )
}
