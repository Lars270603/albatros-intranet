import { useEffect, useState } from 'react'
import { Pin, Trash2, Download, MessageCircle, Pencil, Archive, ArchiveRestore, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
import { RelativeTime } from '@/components/shared/RelativeTime'
import { CommentThread } from '@/components/feed/CommentThread'
import { FileTypeIcon } from '@/components/documents/FileTypeIcon'
import { useComments } from '@/hooks/useComments'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function PostCard({
  post,
  isAdmin,
  onTogglePin,
  onDelete,
  onEdit,
  onArchive,
  onUnarchive,
  pinnedStyle = false,
  size = 'default',
  readOnly = false,
}) {
  const { user } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [readers, setReaders] = useState([])
  const { comments, addComment, deleteComment } = useComments(readOnly ? null : post.id)
  const author = post.author
  const feature = size === 'feature'
  const isAuthor = user?.id === post.author_id

  // Beim Rendern als gelesen markieren + Leserliste laden
  useEffect(() => {
    if (readOnly || !user) return

    async function markReadAndLoad() {
      try {
        await supabase
          .from('post_reads')
          .upsert({ post_id: post.id, user_id: user.id }, { onConflict: 'post_id,user_id', ignoreDuplicates: true })
      } catch (err) {
        console.error('Gelesen-Markierung konnte nicht gespeichert werden:', err)
      }
      try {
        const { data, error } = await supabase
          .from('post_reads')
          .select('user_id, read_at, reader:profiles(first_name, last_name, avatar_url)')
          .eq('post_id', post.id)
          .order('read_at', { ascending: true })
        if (error) throw error
        setReaders(data || [])
      } catch (err) {
        console.error('Leserliste konnte nicht geladen werden:', err)
      }
    }
    markReadAndLoad()
  }, [post.id, user, readOnly])

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
            </div>
            <RelativeTime date={post.created_at} className="text-[12px] text-text-muted" />
          </div>
        </div>

        {!readOnly && (
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
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(post)}
                    title="Bearbeiten"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                )}
                {onArchive && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onArchive(post)}
                    title="Ins Archiv verschieben"
                  >
                    <Archive className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                )}
                {onUnarchive && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUnarchive(post)}
                    title="Zurück in News"
                  >
                    <ArchiveRestore className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                )}
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
        )}
      </div>

      <div className={cn('pb-2', feature ? 'px-6' : 'px-5')}>
        <h3 className={cn('font-display font-bold text-text', feature ? 'text-[20px]' : 'text-[17px]')}>
          {post.title}
        </h3>
        {post.body && (
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-text">{post.body}</p>
        )}
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

      {!readOnly && (
        <div className={cn('flex items-center justify-between pt-3', feature ? 'p-6' : 'p-5')}>
          {readers.length > 0 ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text">
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Gesehen von {readers.length}
                </button>
              </PopoverTrigger>
              <PopoverContent className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {readers.map((r) => (
                    <div key={r.user_id} className="flex items-center gap-2">
                      <InitialsAvatar
                        firstName={r.reader?.first_name}
                        lastName={r.reader?.last_name}
                        avatarUrl={r.reader?.avatar_url}
                        size={24}
                      />
                      <span className="text-[13px] text-text">
                        {r.reader?.first_name} {r.reader?.last_name}
                      </span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : isAuthor ? (
            <p className="flex items-center gap-1.5 text-[12px] text-text-muted">
              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
              Noch von niemandem gesehen
            </p>
          ) : (
            <span />
          )}

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
      )}

      {!readOnly && commentsOpen && (
        <CommentThread comments={comments} onAddComment={addComment} onDeleteComment={deleteComment} />
      )}
    </Card>
  )
}
