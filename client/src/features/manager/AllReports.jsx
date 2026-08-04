import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  getAllReportsThunk, 
  selectAllReports, 
  selectPagination, 
  selectReportsLoading 
} from '../reports/reportsSlice'
import { formatDate } from '../../shared/utils/formatDate'
import { MOOD_LABELS } from '../../shared/utils/constants'
import Spinner from '../../shared/components/UI/Spinner'
import Badge from '../../shared/components/UI/Badge'

export default function AllReports() {
  const dispatch = useDispatch()
  const reports = useSelector(selectAllReports)
  const pagination = useSelector(selectPagination)
  const isLoading = useSelector(selectReportsLoading)

  const [page, setPage] = useState(1)
  const [moodFilter, setMoodFilter] = useState('')
  // Optional: date range filtering can be added here

  useEffect(() => {
    dispatch(getAllReportsThunk({ page, limit: 10, mood: moodFilter || undefined }))
  }, [dispatch, page, moodFilter])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">All Reports</h1>
        <p className="page-subtitle">View and filter company-wide submissions</p>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="p-4 border-b border-slate-700/50 flex gap-4 flex-wrap">
          <select 
            className="form-input max-w-xs" 
            value={moodFilter} 
            onChange={(e) => { setMoodFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Moods</option>
            {Object.entries(MOOD_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="p-4 space-y-3">
          {isLoading && reports.length === 0 ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : reports.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No reports found.</p>
          ) : (
            reports.map(report => (
              <div key={report._id} className="p-4 rounded-lg bg-surface-900/50 border border-slate-700/30 hover:border-primary-500/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {report.employee?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{report.employee?.name}</p>
                      <p className="text-xs text-slate-500">{report.employee?.employeeId} · {report.employee?.department?.name || 'No Dept'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <Badge variant="neutral">{formatDate(report.date)}</Badge>
                    <Badge variant="primary">{report.totalHours}h</Badge>
                    <span className="text-lg" title={MOOD_LABELS[report.mood]}>{MOOD_LABELS[report.mood]?.split(' ')[0]}</span>
                  </div>
                </div>

                <div className="text-sm text-slate-400 space-y-1">
                  <p><span className="text-slate-500">Tasks:</span> {report.tasks?.map(t => t.title).join(' | ')}</p>
                  {report.blockers && <p className="text-red-400"><span className="text-red-500/70 font-medium">Blocker:</span> {report.blockers}</p>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} reports
            </p>
            <div className="flex gap-2">
              <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">Prev</button>
              <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
