import { useState } from 'react'
import { Pin, Trash2, Download, MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
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
import { CommentThread } from '@/components/feed/CommentThread'
import { FileTypeIcon } from '@/components/documents/FileTypeIcon'
import { useComments } from '@/hooks/useComments'
import { cn } from '@/lib/utils'

export function PostCard({
  post,
  reactions,
  onToggleReaction,
  isAdmin,
  onTogglePin,
  onDelete,
  pinnedStyle = false,
  size = 'default',
}) {
  const [deleting, setDeleting] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const { comments, addComment, deleteComment } = useComments(post.id)
  const author = post.author
  const feature = size === 'feature'

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(post.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      {pinnedStyle && (
        <div className={cn('flex items-center gap-1.5 pt-4 text-primary label-micro !text-primary', feature ? 'px-6' : 'px-5')}>
          <Pin className="h-3 w-3 fill-current" strokeWidth={1.5} />
          Angepinnt
        </div>
      )}

      <div className={cn('flex items-start justify-between gap-3 pb-3', feature ? 'p-6' : 'p-5', pinnedStyle && 'pt-2')}>
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

      <div className={cn('pb-2', feature ? 'px-6' : 'px-5')}>
        <h3 className={cn('font-display font-bold text-text', feature ? 'text-[20px]' : 'text-[17px]')}>
          {post.title}
        </h3>
        <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-text">{post.body}</p>
      </div>

      {post.attachment_url && (
        <div className={cn('mb-3 flex items-center gap-3 rounded-md border border-border bg-surface p-3', feature ? 'mx-6' : 'mx-5')}>
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

      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className={cn('w-full object-cover', feature ? 'max-h-[380px]' : 'max-h-[320px]')}
        />
      )}

      <div className={cn('flex items-center justify-between pt-3', feature ? 'p-6' : 'p-5')}>
        <ReactionBar postId={post.id} reactions={reactions} onToggle={onToggleReaction} />
        <button
          onClick={() => setCommentsOpen((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[13px] transition-colors',
            commentsOpen
              ? 'border-primary-light bg-primary-light text-primary'
              : 'border-border text-text-sub hover:bg-surface'
          )}
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
          {comments.length > 0 && <span className="font-medium">{comments.length}</span>}
        </button>
      </div>

      {commentsOpen && (
        <CommentThread comments={comments} onAddComment={addComment} onDeleteComment={deleteComment} />
      )}
    </Card>
  )
}
