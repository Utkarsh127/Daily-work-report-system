import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { getMonthlySummaryThunk, selectMonthlySummary, selectManagerLoading } from './managerSlice'
import { managerAPI } from './managerAPI'
import Spinner from '../../shared/components/UI/Spinner'
import { toast } from 'react-toastify'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Analytics() {
  const dispatch = useDispatch()
  const summaryData = useSelector(selectMonthlySummary)
  const isLoading = useSelector(selectManagerLoading)
  const [isExporting, setIsExporting] = useState(false)

  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    dispatch(getMonthlySummaryThunk({ year, month }))
  }, [dispatch, year, month])

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      // Get the range for the current selected month
      const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0]
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString().split('T')[0]
      
      const blob = await managerAPI.exportReportsCSV({ startDate: start, endDate: end })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `wrs_export_${year}_${String(month).padStart(2, '0')}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      toast.error('Failed to export CSV')
    } finally {
      setIsExporting(false)
    }
  }

  // Format data for chart
  const chartData = summaryData?.dailyTrend?.map(d => ({
    date: d.date.split('-').slice(1).join('/'), // format MM/DD
    hours: d.totalHours,
    reports: d.reportCount,
  })) || []

  return (
    <div className="page-container">
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Monthly trends and CSV export</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={month} 
            onChange={e => setMonth(Number(e.target.value))}
            className="form-input bg-surface-900 border-slate-700 py-1.5 text-sm"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={e => setYear(Number(e.target.value))}
            className="form-input bg-surface-900 border-slate-700 py-1.5 text-sm"
          >
            {[year - 1, year, year + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button 
            onClick={handleExportCSV} 
            disabled={isExporting}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            {isExporting ? <Spinner size="sm" /> : '📥 Export CSV'}
          </button>
        </div>
      </div>

      <div className="card p-6 min-h-[400px]">
        <h2 className="text-base font-semibold text-slate-200 mb-6">Daily Hours Logged</h2>
        {isLoading && !summaryData ? (
          <div className="flex justify-center h-64 items-center"><Spinner size="lg" /></div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center h-64 items-center text-slate-500">
            No data available for this month
          </div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  axisLine={{stroke: '#475569'}}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9'}}
                  itemStyle={{color: '#38bdf8'}}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar 
                  dataKey="hours" 
                  name="Total Hours" 
                  fill="#38bdf8" 
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
