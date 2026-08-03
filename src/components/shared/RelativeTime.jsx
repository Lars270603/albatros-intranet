import { formatRelativeTime, formatDateTime } from '@/lib/dateUtils'

export function RelativeTime({ date, className }) {
  if (!date) return null
  return (
    <time
      dateTime={new Date(date).toISOString()}
      title={formatDateTime(date)}
      className={className}
    >
      {formatRelativeTime(date)}
    </time>
  )
}
