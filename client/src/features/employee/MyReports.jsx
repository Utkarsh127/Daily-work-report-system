import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { format, parseISO } from 'date-fns'
import {
  getMyReportsThunk,
  deleteReportThunk,
  selectMyReports,
  selectPagination,
  selectReportsLoading,
} from '../reports/reportsSlice'
import { formatDate } from '../../shared/utils/formatDate'
import { MOOD_LABELS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../../shared/utils/constants'
import Badge from '../../shared/components/UI/Badge'
import Spinner from '../../shared/components/UI/Spinner'
import Modal from '../../shared/components/UI/Modal'

export default function MyReports() {
  const dispatch   = useDispatch()
  const reports    = useSelector(selectMyReports)
  const pagination = useSelector(selectPagination)
  const isLoading  = useSelector(selectReportsLoading)

  const [page, setPage]             = useState(1)
  const [expandedId, setExpandedId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    dispatch(getMyReportsThunk({ page, limit: 10 }))
  }, [dispatch, page])

  const isToday = (dateStr) => {
    const today = new Date()
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    return (
      d.getUTCFullYear() === today.getUTCFullYear() &&
      d.getUTCMonth()    === today.getUTCMonth() &&
      d.getUTCDate()     === today.getUTCDate()
    )
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await dispatch(deleteReportThunk(deleteTarget._id))
    if (deleteReportThunk.fulfilled.match(result)) {
      toast.success('Report deleted')
      setDeleteTarget(null)
    } else {
      toast.error(result.payload || 'Failed to delete report')
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Reports</h1>
        <p className="page-subtitle">Your daily work report history</p>
      </div>

      {isLoading && reports.length === 0 ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-slate-300 font-medium mb-2">No reports yet</p>
          <p className="text-slate-500 text-sm">Submit your first daily report to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const today = isToday(report.date)
            const isExpanded = expandedId === report._id

            return (
              <div key={report._id} className={`card transition-all duration-200 ${isExpanded ? 'border-primary-500/30' : ''}`}>
                {/* Report header — clickable to expand */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-800/30 rounded-xl"
                  onClick={() => setExpandedId(isExpanded ? null : report._id)}
                >
                  {/* Date */}
                  <div className="w-14 text-center flex-shrink-0">
                    <p className="text-xs text-slate-500 uppercase">{formatDate(report.date, 'MMM')}</p>
                    <p className="text-2xl font-bold text-slate-200">{formatDate(report.date, 'd')}</p>
                    <p className="text-xs text-slate-500">{formatDate(report.date, 'EEE')}</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-200">
                        {report.tasks?.length} task{report.tasks?.length !== 1 ? 's' : ''}
                      </span>
                      {today && <Badge variant="success">Today</Badge>}
                      <Badge variant="neutral">{MOOD_LABELS[report.mood]}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {report.totalHours}h total · {report.tasks?.filter(t => t.status === 'completed').length} completed
                    </p>
                  </div>

                  {/* Actions — today's report only */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {today && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); window.location.href = '/employee/report' }}
                          className="btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(report) }}
                          className="btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded task list */}
                {isExpanded && (
                  <div className="border-t border-slate-700/50 p-4 space-y-2 animate-fade-in">
                    {report.tasks?.map((task, i) => (
                      <div key={i} className="flex items-start gap-3 py-2">
                        <Badge variant={
                          task.status === 'completed' ? 'success' :
                          task.status === 'in-progress' ? 'info' : 'error'
                        }>
                          {TASK_STATUS_LABELS[task.status]}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm text-slate-200">{task.title}</p>
                          {task.description && <p className="text-xs text-slate-500">{task.description}</p>}
                        </div>
                        <span className="text-xs text-slate-400">{task.hoursSpent}h</span>
                      </div>
                    ))}
                    {report.blockers && (
                      <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                        <p className="text-xs font-medium text-red-400 mb-1">Blockers</p>
                        <p className="text-xs text-slate-400">{report.blockers}</p>
                      </div>
                    )}
                    {report.notes && (
                      <div className="mt-2 p-3 rounded-lg bg-slate-800/50">
                        <p className="text-xs font-medium text-slate-400 mb-1">Notes</p>
                        <p className="text-xs text-slate-400">{report.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Report"
        size="sm"
      >
        <p className="text-slate-300 mb-6">
          Are you sure you want to delete the report for{' '}
          <span className="text-white font-medium">{deleteTarget ? formatDate(deleteTarget.date) : ''}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete Report</button>
        </div>
      </Modal>
    </div>
  )
}
