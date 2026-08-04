import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMonthlySummaryThunk, selectMonthlySummary, selectManagerLoading } from './managerSlice'
import Spinner from '../../shared/components/UI/Spinner'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function MonthlyReports() {
  const dispatch = useDispatch()
  const summaryData = useSelector(selectMonthlySummary)
  const isLoading = useSelector(selectManagerLoading)

  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1) // 1-12

  useEffect(() => {
    dispatch(getMonthlySummaryThunk({ year, month }))
  }, [dispatch, year, month])

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  // Prevent going into the future
  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth() + 1

  return (
    <div className="page-container">
      <div className="page-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Monthly Summary</h1>
          <p className="page-subtitle">{MONTHS[month - 1]} {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="btn-secondary btn-sm">← Prev</button>
          <button disabled={isCurrentMonth} onClick={handleNextMonth} className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Reports Submitted</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading && !summaryData ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center"><Spinner className="mx-auto" /></td>
                </tr>
              ) : summaryData?.employeeSummary?.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-500">No data for {MONTHS[month - 1]} {year}.</td>
                </tr>
              ) : (
                summaryData?.employeeSummary?.map((row) => (
                  <tr key={row.employeeId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-200">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.employeeId}</p>
                    </td>
                    <td className="p-4 text-right text-sm text-slate-300">{row.reportCount}</td>
                    <td className="p-4 text-right">
                      <span className="font-medium text-primary-400">{row.totalHours}h</span>
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
