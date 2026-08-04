/**
 * Badge — status pill with colour variants.
 * Variants: success | warning | error | info | neutral | primary
 */
export default function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    error:   'badge-error',
    info:    'badge-info',
    neutral: 'badge-neutral',
    primary: 'badge bg-primary-500/15 text-primary-400 ring-1 ring-primary-500/30',
  }

  return (
    <span className={`${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  )
}
