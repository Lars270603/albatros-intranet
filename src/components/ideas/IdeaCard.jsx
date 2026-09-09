import { ChevronUp, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { DepartmentBadge } from '@/components/shared/DepartmentBadge'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  offen: { label: 'Offen', className: 'border-transparent bg-surface-2 text-text-sub' },
  in_bearbeitung: { label: 'In Bearbeitung', className: 'border-transparent bg-blue-100 text-blue-700' },
  umgesetzt: { label: 'Umgesetzt', className: 'border-transparent bg-success-light text-success' },
  abgelehnt: { label: 'Abgelehnt', className: 'border-transparent bg-primary-light text-primary' },
}

export function IdeaCard({ idea, isAdmin, onToggleVote, onUpdateStatus, onDelete }) {
  const { user } = useAuth()
  const myVote = idea.idea_votes.some((v) => v.user_id === user?.id)
  const voteCount = idea.idea_votes.length
  const statusConfig = STATUS_CONFIG[idea.status]

  return (
    <Card className="flex gap-4 p-5">
      <button
        onClick={() => onToggleVote(idea)}
        className={cn(
          'flex h-14 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-[7px] border transition-colors',
          myVote
            ? 'border-primary bg-primary-light text-primary'
            : 'border-border text-text-sub hover:border-border-strong hover:text-text'
        )}
      >
        <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
        <span className="font-display text-[15px] font-bold leading-none">{voteCount}</span>
      </button>

      <div className="flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[16px] font-bold text-text">{idea.title}</h3>
          <Badge className={statusConfig?.className}>{statusConfig?.label}</Badge>
        </div>
        <p className="line-clamp-3 text-[15px] text-text">{idea.body}</p>
        <div className="flex items-center gap-2 pt-1">
          <InitialsAvatar
            firstName={idea.submitter?.first_name}
            lastName={idea.submitter?.last_name}
            avatarUrl={idea.submitter?.avatar_url}
            size={24}
          />
          <span className="text-[13px] text-text-sub">
            {idea.submitter?.first_name} {idea.submitter?.last_name}
          </span>
          <DepartmentBadge department={idea.submitter?.department} />
          <RelativeTime date={idea.created_at} className="text-[12px] text-text-muted" />
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 pt-2">
            <Select value={idea.status} onValueChange={(v) => onUpdateStatus(idea.id, v)}>
              <SelectTrigger className="h-8 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Idee löschen?</AlertDialogTitle>
                  <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(idea.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-red-700"
                  >
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </Card>
  )
}
