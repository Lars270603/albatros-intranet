import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'

export function CommentThread({ comments, onAddComment, onDeleteComment }) {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      await onAddComment(body.trim())
      setBody('')
    } catch (err) {
      console.error('Kommentar konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Kommentar konnte nicht gespeichert werden.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      await onDeleteComment(id)
    } catch (err) {
      console.error('Kommentar konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

  return (
    <div className="space-y-4 border-t border-border px-5 py-4">
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => {
            const canDelete = comment.author_id === profile?.id || profile?.role === 'admin'
            return (
              <div key={comment.id} className="flex items-start gap-2.5">
                <InitialsAvatar
                  firstName={comment.author?.first_name}
                  lastName={comment.author?.last_name}
                  avatarUrl={comment.author?.avatar_url}
                  size={32}
                />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-text">
                      {comment.author?.first_name} {comment.author?.last_name}
                    </span>
                    <RelativeTime date={comment.created_at} className="text-[12px] text-text-muted" />
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="ml-auto text-text-muted hover:text-primary"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                  <p className="text-[14px] text-text">{comment.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          rows={2}
          placeholder="Kommentar schreiben…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
            {submitting ? 'Wird gesendet…' : 'Kommentieren'}
          </Button>
        </div>
      </form>
    </div>
  )
}
