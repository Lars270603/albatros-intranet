import { cn } from '@/lib/utils'

export const DEPARTMENTS = {
  vertrieb: { label: 'Vertrieb', bg: 'var(--dept-vertrieb-bg)', fg: 'var(--dept-vertrieb-fg)' },
  einkauf: { label: 'Einkauf', bg: 'var(--dept-einkauf-bg)', fg: 'var(--dept-einkauf-fg)' },
  kundenservice: { label: 'Kundenservice', bg: 'var(--dept-kundenservice-bg)', fg: 'var(--dept-kundenservice-fg)' },
  geschaeftsfuehrung: {
    label: 'Geschäftsführung',
    bg: 'var(--dept-geschaeftsfuehrung-bg)',
    fg: 'var(--dept-geschaeftsfuehrung-fg)',
  },
}

export function DepartmentBadge({ department, className }) {
  const config = DEPARTMENTS[department]
  if (!config) return null

  return (
    <span
      className={cn('inline-flex items-center rounded-[4px] px-[6px] py-[2px] text-[11px] font-medium', className)}
      style={{ backgroundColor: config.bg, color: config.fg }}
    >
      {config.label}
    </span>
  )
}
