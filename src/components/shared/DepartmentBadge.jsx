import { cn } from '@/lib/utils'

export const DEPARTMENTS = {
  vertrieb: { label: 'Vertrieb', bg: '#EDE9FE', text: '#5B21B6' },
  einkauf: { label: 'Einkauf', bg: '#CFFAFE', text: '#155E75' },
  kundenservice: { label: 'Kundenservice', bg: '#DCFCE7', text: '#166534' },
  geschaeftsfuehrung: { label: 'Geschäftsführung', bg: '#FFE4E6', text: '#9F1239' },
}

export function DepartmentBadge({ department, className }) {
  const config = DEPARTMENTS[department]
  if (!config) return null

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}
