import { Button } from '@/components/ui/button'

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {Icon && <Icon className="h-12 w-12 text-gray-200" strokeWidth={1.5} />}
      <div className="space-y-1">
        <p className="text-[15px] font-medium text-text-sub">{title}</p>
        {description && <p className="text-[13px] text-text-muted">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
