import { cn } from '@/lib/utils'
import { CONTACT_CATEGORIES } from '@/lib/contactCategories'

export function ContactCategoryBadge({ category, className }) {
  const config = CONTACT_CATEGORIES[category]
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
