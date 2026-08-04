/**
 * StatCard — KPI card for dashboards.
 *
 * Props:
 *   title     — label text
 *   value     — main number/string to display
 *   subtitle  — secondary line (optional)
 *   icon      — emoji or JSX icon
 *   trend     — { value: number, label: string } (optional)
 *   color     — 'primary' | 'success' | 'warning' | 'error' | 'info'
 */
export default function StatCard({ title, value, subtitle, icon, trend, color = 'primary' }) {
  const colorMap = {
    primary: { bg: 'bg-primary-500/10', text: 'text-primary-400', border: 'border-primary-500/20' },
    success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    warning: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20'   },
    error:   { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20'     },
    info:    { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/20'     },
  }
  const c = colorMap[color] || colorMap.primary

  return (
    <div className={`stat-card border ${c.border} hover:border-opacity-50 transition-all duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center text-xl flex-shrink-0`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.value >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
