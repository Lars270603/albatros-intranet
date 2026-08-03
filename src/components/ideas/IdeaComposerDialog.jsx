import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export function IdeaComposerDialog({ open, onOpenChange, onSubmit }) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setTitle('')
    setBody('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({ title, body })
      reset()
      onOpenChange(false)
    } catch (err) {
      console.error('Idee konnte nicht eingereicht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Idee konnte nicht eingereicht werden.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Idee einreichen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="idea-title">Titel</Label>
            <Input
              id="idea-title"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="idea-body">Beschreibung</Label>
            <Textarea id="idea-body" required rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>

          <p className="text-[12px] text-text-muted">Deine Idee wird mit deinem Namen veröffentlicht.</p>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Wird eingereicht…' : 'Einreichen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
