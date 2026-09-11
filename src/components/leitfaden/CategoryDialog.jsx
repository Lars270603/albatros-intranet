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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { ICON_OPTIONS, resolveIcon } from '@/lib/iconMap'

export function CategoryDialog({ open, onOpenChange, category, onSave }) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('BookOpen')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(category?.name || '')
      setIcon(category?.icon || 'BookOpen')
    }
  }, [open, category])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSave({ name: name.trim(), icon })
      onOpenChange(false)
    } catch (err) {
      console.error('Kategorie konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Kategorie konnte nicht gespeichert werden.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Kategorie bearbeiten' : 'Neue Kategorie'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger id="cat-icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((name) => {
                  const IconComp = resolveIcon(name)
                  return (
                    <SelectItem key={name} value={name}>
                      <span className="flex items-center gap-2">
                        <IconComp className="h-4 w-4" strokeWidth={1.5} />
                        {name}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
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
