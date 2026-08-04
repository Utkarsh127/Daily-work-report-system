import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  submitReportThunk,
  updateReportThunk,
  getTodayReportThunk,
  selectTodayReport,
  selectReportsLoading,
} from '../reports/reportsSlice'
import { MOODS, MOOD_LABELS, TASK_STATUS } from '../../shared/utils/constants'
import { todayISO } from '../../shared/utils/formatDate'
import Spinner from '../../shared/components/UI/Spinner'

const DEFAULT_TASK = { title: '', description: '', hoursSpent: 1, status: 'in-progress' }

export default function SubmitReport() {
  const dispatch    = useDispatch()
  const navigate    = useNavigate()
  const todayReport = useSelector(selectTodayReport)
  const isLoading   = useSelector(selectReportsLoading)
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      date:     todayISO(),
      tasks:    [{ ...DEFAULT_TASK }],
      mood:     'good',
      blockers: '',
      notes:    '',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'tasks' })
  const tasks = watch('tasks')
  const totalHours = tasks?.reduce((s, t) => s + (parseFloat(t.hoursSpent) || 0), 0).toFixed(1)

  // Fetch today's report on mount
  useEffect(() => {
    dispatch(getTodayReportThunk())
  }, [dispatch])

  // Pre-fill form if editing an existing report
  useEffect(() => {
    if (todayReport) {
      setIsEditing(true)
      reset({
        date:     todayISO(),
        tasks:    todayReport.tasks || [{ ...DEFAULT_TASK }],
        mood:     todayReport.mood || 'good',
        blockers: todayReport.blockers || '',
        notes:    todayReport.notes || '',
      })
    }
  }, [todayReport, reset])

  const onSubmit = async (data) => {
    const thunk  = isEditing
      ? updateReportThunk({ id: todayReport._id, data })
      : submitReportThunk(data)

    const result = await dispatch(thunk)

    if ((isEditing ? updateReportThunk : submitReportThunk).fulfilled.match(result)) {
      toast.success(isEditing ? 'Report updated successfully!' : 'Report submitted successfully!')
      navigate('/employee/dashboard')
    } else {
      toast.error(result.payload || 'Failed to save report')
    }
  }

  return (
    <div className="page-container max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">
          {isEditing ? 'Edit Today\'s Report' : 'Submit Daily Report'}
        </h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Tasks section */}
        <div className="card p-6 mb-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-200">Tasks</h2>
              <p className="text-xs text-slate-500 mt-0.5">Total: <span className="text-primary-400 font-medium">{totalHours}h</span></p>
            </div>
            <button
              type="button"
              onClick={() => append({ ...DEFAULT_TASK })}
              className="btn-secondary btn-sm"
            >
              + Add Task
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-lg bg-surface-900/60 border border-slate-700/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Task {index + 1}</span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input
                    {...register(`tasks.${index}.title`, { required: 'Title is required' })}
                    placeholder="e.g. Code review for auth module"
                    className={`form-input ${errors.tasks?.[index]?.title ? 'border-red-500' : ''}`}
                  />
                  {errors.tasks?.[index]?.title && (
                    <p className="form-error">{errors.tasks[index].title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    {...register(`tasks.${index}.description`)}
                    placeholder="Brief description of what you did"
                    className="form-input"
                  />
                </div>

                {/* Hours + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Hours Spent *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="12"
                      {...register(`tasks.${index}.hoursSpent`, {
                        required: 'Required',
                        min: { value: 0.5, message: 'Min 0.5h' },
                        max: { value: 12,  message: 'Max 12h' },
                      })}
                      className={`form-input ${errors.tasks?.[index]?.hoursSpent ? 'border-red-500' : ''}`}
                    />
                    {errors.tasks?.[index]?.hoursSpent && (
                      <p className="form-error">{errors.tasks[index].hoursSpent.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select
                      {...register(`tasks.${index}.status`, { required: 'Required' })}
                      className="form-input"
                    >
                      {Object.entries(TASK_STATUS).map(([key, val]) => (
                        <option key={key} value={val}>
                          {val === 'completed' ? '✅ Completed' : val === 'in-progress' ? '🔄 In Progress' : '🚧 Blocked'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood, Blockers, Notes */}
        <div className="card p-6 mb-4 space-y-5">
          <h2 className="text-base font-semibold text-slate-200">Daily Wrap-up</h2>

          {/* Mood */}
          <div className="form-group">
            <label className="form-label">How are you feeling today?</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MOOD_LABELS).map(([val, label]) => {
                const [emoji, text] = label.split(' ')
                return (
                  <label key={val} className="cursor-pointer">
                    <input type="radio" value={val} {...register('mood')} className="sr-only" />
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                      ${watch('mood') === val
                        ? 'bg-primary-600/20 border-primary-500 text-primary-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}>
                      {emoji} {text}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Blockers */}
          <div className="form-group">
            <label className="form-label">Blockers / Issues</label>
            <textarea
              {...register('blockers')}
              rows={2}
              placeholder="Any blockers or issues that slowed you down?"
              className="form-input resize-none"
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Anything else to note?"
              className="form-input resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/employee/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            id="submit-report-btn"
            type="submit"
            disabled={isSubmitting || isLoading}
            className="btn-primary"
          >
            {isSubmitting || isLoading ? (
              <><Spinner size="sm" /> Saving…</>
            ) : isEditing ? 'Update Report' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  )
}
