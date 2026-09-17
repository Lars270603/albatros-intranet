import { useRef, useState } from 'react'
import { Plus, X, Lock, Eye, ImagePlus } from 'lucide-react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/upload'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

function emptyOption() {
  return { label: '', imageFile: null, imagePreview: null }
}

export function PollCreateDialog({ open, onOpenChange, onCreated }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRefs = useRef({})

  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState([emptyOption(), emptyOption()])
  const [expiresAt, setExpiresAt] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setQuestion('')
    setOptions([emptyOption(), emptyOption()])
    setExpiresAt('')
    setIsAnonymous(false)
  }

  function updateOptionLabel(index, value) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, label: value } : o)))
  }

  function updateOptionImage(index, file) {
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Ungültiges Dateiformat', description: 'Erlaubt sind JPG, PNG und WEBP.' })
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast({ variant: 'destructive', title: 'Datei zu groß', description: 'Maximale Dateigröße: 5 MB.' })
      return
    }
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, imageFile: file, imagePreview: URL.createObjectURL(file) } : o))
    )
  }

  function removeOptionImage(index) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, imageFile: null, imagePreview: null } : o)))
  }

  function addOption() {
    if (options.length >= 4) return
    setOptions((prev) => [...prev, emptyOption()])
  }

  function removeOption(index) {
    if (options.length <= 2) return
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanOptions = options.filter((o) => o.label.trim())
    if (cleanOptions.length < 2) {
      toast({ variant: 'destructive', title: 'Zu wenig Optionen', description: 'Mindestens 2 Antwortoptionen erforderlich.' })
      return
    }

    setSubmitting(true)
    try {
      const pollFolderId = crypto.randomUUID()
      const optionObjects = await Promise.all(
        cleanOptions.map(async (option, i) => {
          const optionId = `opt-${i}-${crypto.randomUUID().slice(0, 6)}`
          let imageUrl = null
          if (option.imageFile) {
            const ext = option.imageFile.name.split('.').pop()
            imageUrl = await uploadFile('poll-images', option.imageFile, `${pollFolderId}/${optionId}.${ext}`)
          }
          return imageUrl ? { id: optionId, label: option.label.trim(), image_url: imageUrl } : { id: optionId, label: option.label.trim() }
        })
      )

      const { error } = await supabase.from('polls').insert({
        question,
        options: optionObjects,
        scope: 'general',
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
            <p className="text-[12px] text-text-muted">Optional: Bild je Option hinzufügen.</p>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[index]?.click()}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[7px] border border-dashed border-border text-text-muted hover:border-border-strong"
                >
                  {option.imagePreview ? (
                    <img src={option.imagePreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  <input
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => updateOptionImage(index, e.target.files?.[0])}
                  />
                </button>
                {option.imagePreview && (
                  <button
                    type="button"
                    onClick={() => removeOptionImage(index)}
                    className="text-text-muted hover:text-primary"
                    title="Bild entfernen"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                )}
                <Input
                  required
                  value={option.label}
                  onChange={(e) => updateOptionLabel(index, e.target.value)}
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
