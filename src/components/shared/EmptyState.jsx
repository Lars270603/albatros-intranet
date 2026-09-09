import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }) {
  return (
    <div className={cn('rounded-[10px] border border-border bg-surface px-6 py-8', className)}>
      <div className="flex max-w-[420px] flex-col items-start gap-3 text-left">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-border bg-bg">
            <Icon className="h-4 w-4 text-text-sub" strokeWidth={1.5} />
          </div>
        )}
        <div className="space-y-1">
          <p className="font-display text-[16px] font-bold text-text">{title}</p>
          {description && <p className="text-[13px] text-text-sub">{description}</p>}
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm" className="mt-1">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
