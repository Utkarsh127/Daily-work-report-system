// ── API base URL ────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// ── Local storage keys ──────────────────────────────────────
export const TOKEN_KEY = 'wrs_token'
export const USER_KEY  = 'wrs_user'

// ── User roles ──────────────────────────────────────────────
export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER:  'manager',
}

// ── Report task statuses ────────────────────────────────────
export const TASK_STATUS = {
  COMPLETED:   'completed',
  IN_PROGRESS: 'in-progress',
  BLOCKED:     'blocked',
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.COMPLETED]:   'Completed',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.BLOCKED]:     'Blocked',
}

export const TASK_STATUS_COLORS = {
  [TASK_STATUS.COMPLETED]:   'badge-success',
  [TASK_STATUS.IN_PROGRESS]: 'badge-info',
  [TASK_STATUS.BLOCKED]:     'badge-error',
}

// ── Mood options ────────────────────────────────────────────
export const MOODS = {
  GREAT:    'great',
  GOOD:     'good',
  NEUTRAL:  'neutral',
  BAD:      'bad',
  TERRIBLE: 'terrible',
}

export const MOOD_LABELS = {
  [MOODS.GREAT]:    '😄 Great',
  [MOODS.GOOD]:     '🙂 Good',
  [MOODS.NEUTRAL]:  '😐 Neutral',
  [MOODS.BAD]:      '😞 Bad',
  [MOODS.TERRIBLE]: '😫 Terrible',
}

export const MOOD_COLORS = {
  [MOODS.GREAT]:    'text-emerald-400',
  [MOODS.GOOD]:     'text-sky-400',
  [MOODS.NEUTRAL]:  'text-slate-400',
  [MOODS.BAD]:      'text-amber-400',
  [MOODS.TERRIBLE]: 'text-red-400',
}

// ── Pagination defaults ─────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10

// ── Chart colors ────────────────────────────────────────────
export const CHART_COLORS = [
  '#6366f1', // primary
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
]
