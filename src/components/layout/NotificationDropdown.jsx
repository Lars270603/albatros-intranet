import { Bell, Package, FileText, CheckCircle, MessageCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

const TYPE_CONFIG = {
  new_product: { icon: Package, color: '#DC2626' },
  new_post: { icon: FileText, color: '#2563EB' },
  account_activated: { icon: CheckCircle, color: '#16A34A' },
  new_answer: { icon: MessageCircle, color: '#D97706' },
}

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-text-sub transition-colors hover:bg-surface-2 hover:text-text"
          aria-label="Benachrichtigungen"
        >
          <Bell className="h-5 w-5" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-none text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-[14px] font-medium text-text">Benachrichtigungen</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Alle lesen
            </button>
          )}
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-text-muted">
              Keine Benachrichtigungen
            </p>
          ) : (
            notifications.map((n) => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.new_post
              const Icon = config.icon
              return (
                <button
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface last:border-b-0',
                    !n.read && 'bg-surface'
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: config.color }} />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[13px] leading-snug text-text">{n.message}</p>
                    <RelativeTime date={n.created_at} className="text-[12px] text-text-muted" />
                  </div>
                </button>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
