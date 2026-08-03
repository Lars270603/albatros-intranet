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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { CONTACT_CATEGORIES } from '@/lib/contactCategories'

const EMPTY_FORM = { name: '', company: '', role: '', email: '', phone: '', category: 'sonstige', notes: '' }

export function ContactDialog({ open, onOpenChange, contact, onSave }) {
  const { toast } = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        contact
          ? {
              name: contact.name || '',
              company: contact.company || '',
              role: contact.role || '',
              email: contact.email || '',
              phone: contact.phone || '',
              category: contact.category || 'sonstige',
              notes: contact.notes || '',
            }
          : EMPTY_FORM
      )
    }
  }, [open, contact])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSave(form)
      onOpenChange(false)
    } catch (err) {
      console.error('Kontakt konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Speichern fehlgeschlagen.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? 'Kontakt bearbeiten' : 'Kontakt hinzufügen'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-company">Firma</Label>
              <Input
                id="contact-company"
                required
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-role">Rolle (optional)</Label>
            <Input id="contact-role" value={form.role} onChange={(e) => update('role', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">E-Mail (optional)</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-phone">Telefon (optional)</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-category">Kategorie</Label>
            <Select value={form.category} onValueChange={(v) => update('category', v)}>
              <SelectTrigger id="contact-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTACT_CATEGORIES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-notes">Notizen (optional)</Label>
            <Textarea id="contact-notes" rows={3} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
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
