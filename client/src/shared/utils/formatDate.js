import { format, formatDistanceToNow, isToday, parseISO } from 'date-fns'

/**
 * Format a date for display.
 * @param {string|Date} date
 * @param {string} [fmt='MMM d, yyyy']
 */
export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, fmt)
  } catch {
    return String(date)
  }
}

/**
 * Returns "2 hours ago", "yesterday", etc.
 */
export const timeAgo = (date) => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return String(date)
  }
}

/**
 * Returns true if the given date (string or Date) is today (local calendar).
 */
export const isDateToday = (date) => {
  if (!date) return false
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return isToday(d)
  } catch {
    return false
  }
}

/**
 * Return the ISO date string for today (YYYY-MM-DD).
 */
export const todayISO = () => format(new Date(), 'yyyy-MM-dd')
