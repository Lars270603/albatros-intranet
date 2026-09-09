import { cn } from '@/lib/utils'

export const BRANDS = {
  arensberger: { label: 'Arensberger', bg: 'var(--brand-arensberger-bg)', fg: 'var(--brand-arensberger-fg)' },
  sommertal: { label: 'Sommertal', bg: 'var(--brand-sommertal-bg)', fg: 'var(--brand-sommertal-fg)' },
  albatros: { label: 'Albatros', bg: 'var(--brand-albatros-bg)', fg: 'var(--brand-albatros-fg)' },
  ravino: { label: 'Ravino', bg: 'var(--brand-ravino-bg)', fg: 'var(--brand-ravino-fg)' },
  burggraf: { label: 'Burggraf', bg: 'var(--brand-burggraf-bg)', fg: 'var(--brand-burggraf-fg)' },
  stahlmann: { label: 'Stahlmann', bg: 'var(--brand-stahlmann-bg)', fg: 'var(--brand-stahlmann-fg)' },
}

export function BrandBadge({ brand, className }) {
  const config = BRANDS[brand]
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
