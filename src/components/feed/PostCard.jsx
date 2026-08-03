import { useState } from 'react'
import { Pin, Trash2, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { ReactionBar } from '@/components/feed/ReactionBar'
import { FileTypeIcon } from '@/components/documents/FileTypeIcon'
import { DEPARTMENTS } from '@/components/shared/DepartmentBadge'
import { cn, hexToRgba } from '@/lib/utils'

export function PostCard({ post, reactions, onToggleReaction, isAdmin, onTogglePin, onDelete, pinnedStyle = false }) {
  const [deleting, setDeleting] = useState(false)
  const author = post.author

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(post.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card
      className={cn(
        'overflow-hidden',
        pinnedStyle && 'border-l-4 border-l-primary bg-primary-light'
      )}
    >
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex items-center gap-3">
          <InitialsAvatar
            firstName={author?.first_name}
            lastName={author?.last_name}
            avatarUrl={author?.avatar_url}
            size={32}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-text">
                {author?.first_name} {author?.last_name}
              </span>
              <DepartmentBadge department={author?.department} />
            </div>
            <RelativeTime date={post.created_at} className="text-[12px] text-text-muted" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pinnedStyle && (
            <Badge className="gap-1 border-transparent bg-primary text-white">
              <Pin className="h-3 w-3 fill-current" strokeWidth={1.5} />
              Angepinnt
            </Badge>
          )}
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onTogglePin(post)}
                title={post.pinned ? 'Anpinnen lösen' : 'Anpinnen'}
              >
                <Pin className={cn('h-4 w-4', post.pinned && 'fill-current text-primary')} strokeWidth={1.5} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Löschen">
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Beitrag löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-red-700"
                    >
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="px-5 pb-2">
        <h3 className="font-display text-[17px] font-bold text-text">{post.title}</h3>
        <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-text">{post.body}</p>
      </div>

      {post.attachment_url && (
        <div className="mx-5 mb-3 flex items-center gap-3 rounded-md border border-border bg-surface p-3">
          <FileTypeIcon
            fileType={post.attachment_name?.split('.').pop()}
            className="h-5 w-5 shrink-0"
          />
          <span className="flex-1 truncate text-[13px] font-medium text-text">
            {post.attachment_name}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(post.attachment_url, '_blank')}
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            Herunterladen
          </Button>
        </div>
      )}

      {post.image_url ? (
        <img
          src={post.image_url}
          alt={post.title}
          className="max-h-[320px] w-full object-cover"
        />
      ) : (
        <div
          className="h-12 w-full"
          style={{ backgroundColor: hexToRgba(DEPARTMENTS[post.scope]?.text || '#9CA3AF', 0.06) }}
        />
      )}

      <div className="flex items-center justify-between p-5 pt-3">
        <ReactionBar postId={post.id} reactions={reactions} onToggle={onToggleReaction} />
      </div>
    </Card>
  )
}
