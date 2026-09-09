import { cn } from '@/lib/utils'
import { CONTACT_CATEGORIES } from '@/lib/contactCategories'

export function ContactCategoryBadge({ category, className }) {
  const config = CONTACT_CATEGORIES[category]
  if (!config) return null

  return (
    <span
      className={cn('inline-flex items-center rounded-[4px] px-[6px] py-[2px] text-[11px] font-medium', className)}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}
