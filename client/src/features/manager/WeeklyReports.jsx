import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getWeeklySummaryThunk, selectWeeklySummary, selectManagerLoading } from './managerSlice'
import Spinner from '../../shared/components/UI/Spinner'
import { formatDate } from '../../shared/utils/formatDate'
import { MOOD_LABELS } from '../../shared/utils/constants'

export default function WeeklyReports() {
  const dispatch = useDispatch()
  const summaryData = useSelector(selectWeeklySummary)
  const isLoading = useSelector(selectManagerLoading)

  // Use a simple local state to hold week offset (0 = current week, -1 = last week, etc.)
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    // Calculate date to send based on offset
    const d = new Date()
    d.setDate(d.getDate() + (weekOffset * 7))
    // Format to yyyy-MM-dd
    const weekOf = d.toISOString().split('T')[0]
    
    dispatch(getWeeklySummaryThunk({ weekOf }))
  }, [dispatch, weekOffset])

  return (
    <div className="page-container">
      <div className="page-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Weekly Summary</h1>
          <p className="page-subtitle">
            {summaryData?.weekRange 
              ? `${formatDate(summaryData.weekRange.start)} — ${formatDate(summaryData.weekRange.end)}` 
              : 'Loading week range...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(o => o - 1)} className="btn-secondary btn-sm">← Prev Week</button>
          <button disabled={weekOffset === 0} onClick={() => setWeekOffset(0)} className="btn-secondary btn-sm disabled:opacity-40">Current</button>
          <button disabled={weekOffset >= 0} onClick={() => setWeekOffset(o => o + 1)} className="btn-secondary btn-sm disabled:opacity-40">Next Week →</button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Reports</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Total Hours</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Avg Hours/Day</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Moods</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading && !summaryData ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center"><Spinner className="mx-auto" /></td>
                </tr>
              ) : summaryData?.summary?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No reports submitted this week.</td>
                </tr>
              ) : (
                summaryData?.summary?.map((row) => (
                  <tr key={row.employeeId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-200">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.department || 'No Dept'}</p>
                    </td>
                    <td className="p-4 text-right text-sm text-slate-300">{row.reportCount}</td>
                    <td className="p-4 text-right">
                      <span className="font-medium text-primary-400">{row.totalHours}h</span>
                    </td>
                    <td className="p-4 text-right text-sm text-slate-300">{row.avgHours}h</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {row.moods.map((m, i) => (
                          <span key={i} title={MOOD_LABELS[m]} className="text-lg">
                            {MOOD_LABELS[m]?.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
