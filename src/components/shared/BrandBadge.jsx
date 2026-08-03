import { cn } from '@/lib/utils'

export const BRANDS = {
  arensberger: { label: 'Arensberger', bg: '#DBEAFE', text: '#1E40AF' },
  sommertal: { label: 'Sommertal', bg: '#FEF3C7', text: '#92400E' },
  albatros: { label: 'Albatros', bg: '#FEE2E2', text: '#991B1B' },
  ravino: { label: 'Ravino', bg: '#F3F4F6', text: '#374151' },
  burggraf: { label: 'Burggraf', bg: '#FEF9C3', text: '#854D0E' },
  stahlmann: { label: 'Stahlmann', bg: '#1F2937', text: '#F9FAFB' },
}

export function BrandBadge({ brand, className }) {
  const config = BRANDS[brand]
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
