import { useState } from 'react'
import { Plus, X, Lock, Eye } from 'lucide-react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const SCOPES = [
  { value: 'general', label: 'Allgemein' },
  { value: 'vertrieb', label: 'Vertrieb' },
  { value: 'einkauf', label: 'Einkauf' },
  { value: 'kundenservice', label: 'Kundenservice' },
  { value: 'geschaeftsfuehrung', label: 'Geschäftsführung' },
]

export function PollCreateDialog({ open, onOpenChange, onCreated }) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [scope, setScope] = useState('general')
  const [expiresAt, setExpiresAt] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setQuestion('')
    setOptions(['', ''])
    setScope('general')
    setExpiresAt('')
    setIsAnonymous(false)
  }

  function updateOption(index, value) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))
  }

  function addOption() {
    if (options.length >= 4) return
    setOptions((prev) => [...prev, ''])
  }

  function removeOption(index) {
    if (options.length <= 2) return
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean)
    if (cleanOptions.length < 2) {
      toast({ variant: 'destructive', title: 'Zu wenig Optionen', description: 'Mindestens 2 Antwortoptionen erforderlich.' })
      return
    }

    setSubmitting(true)
    try {
      const optionObjects = cleanOptions.map((label, i) => ({ id: `opt-${i}-${crypto.randomUUID().slice(0, 6)}`, label }))
      const { error } = await supabase.from('polls').insert({
        question,
        options: optionObjects,
        scope,
        created_by: user.id,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_anonymous: isAnonymous,
      })
      if (error) throw error

      toast({ title: 'Umfrage erstellt' })
      reset()
      onOpenChange(false)
      onCreated?.()
    } catch (err) {
      console.error('Umfrage konnte nicht erstellt werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Umfrage konnte nicht erstellt werden.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Umfrage</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="poll-question">Frage</Label>
            <Input id="poll-question" required value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Antwortoptionen</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  required
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-text-muted hover:text-primary"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            ))}
            {options.length < 4 && (
              <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                Option hinzufügen
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="poll-scope">Zielgruppe</Label>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger id="poll-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCOPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="poll-expires">Ablaufdatum (optional)</Label>
            <Input id="poll-expires" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Abstimmung</Label>
            <RadioGroup
              value={isAnonymous ? 'anonymous' : 'public'}
              onValueChange={(v) => setIsAnonymous(v === 'anonymous')}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="anonymous" id="poll-anonymous" />
                <Label
                  htmlFor="poll-anonymous"
                  className="flex cursor-pointer items-center gap-1.5 text-[14px] font-normal normal-case tracking-normal text-text"
                >
                  <Lock className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.5} />
                  Anonym — niemand sieht wer wie abgestimmt hat
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="public" id="poll-public" />
                <Label
                  htmlFor="poll-public"
                  className="flex cursor-pointer items-center gap-1.5 text-[14px] font-normal normal-case tracking-normal text-text"
                >
                  <Eye className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.5} />
                  Öffentlich — jeder sieht wer wie abgestimmt hat
                </Label>
              </div>
            </RadioGroup>
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
