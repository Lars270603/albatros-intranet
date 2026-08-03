import { useEffect, useState } from 'react'
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

export function SectionEditDialog({ open, onOpenChange, section, onSave }) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(section?.title || '')
      setBody(section?.body || '')
    }
  }, [open, section])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSave({ title, body })
      onOpenChange(false)
    } catch (err) {
      console.error('Sektion konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Speichern fehlgeschlagen.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{section ? 'Sektion bearbeiten' : 'Sektion hinzufügen'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="section-title">Titel</Label>
            <Input id="section-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="section-body">Inhalt</Label>
            <Textarea
              id="section-body"
              required
              rows={10}
              className="font-mono text-[13px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-[12px] text-text-muted">
              Markdown wird unterstützt — fett, # Überschriften, - Listen
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Wird gespeichert…' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
