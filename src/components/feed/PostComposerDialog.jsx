import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
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
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/upload'
import { notifyActiveUsers } from '@/lib/notifications'
import { DEPARTMENTS } from '@/components/shared/DepartmentBadge'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

export function PostComposerDialog({ open, onOpenChange, scope, onCreated }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setTitle('')
    setBody('')
    setImageFile(null)
    setImagePreview(null)
  }

  function handleFile(file) {
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Ungültiges Dateiformat', description: 'Erlaubt sind JPG, PNG und WEBP.' })
      return
    }
    if (file.size > MAX_SIZE) {
      toast({ variant: 'destructive', title: 'Datei zu groß', description: 'Maximale Dateigröße: 5 MB.' })
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    try {
      let imageUrl = null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        imageUrl = await uploadFile('news-images', imageFile, `${crypto.randomUUID()}.${ext}`)
      }

      const { data: post, error } = await supabase
        .from('news_posts')
        .insert({ title, body, image_url: imageUrl, scope, author_id: user.id })
        .select('*, author:profiles(*)')
        .single()
      if (error) throw error

      const scopeLabel = scope === 'general' ? 'Allgemein' : DEPARTMENTS[scope]?.label || scope
      await notifyActiveUsers({
        department: scope === 'general' ? null : scope,
        excludeUserId: user.id,
        type: 'new_post',
        message: `Neuer Beitrag in ${scopeLabel}: ${title}`,
        refId: post.id,
      })

      toast({ title: 'Beitrag veröffentlicht' })
      onCreated?.(post)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      console.error('Beitrag konnte nicht erstellt werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Beitrag konnte nicht veröffentlicht werden.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Beitrag erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="post-title">Titel</Label>
            <Input id="post-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-body">Text</Label>
            <Textarea
              id="post-body"
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Bild (optional)</Label>
            {imagePreview ? (
              <div className="relative w-fit">
                <img src={imagePreview} alt="Vorschau" className="max-h-40 rounded-md border border-border" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  handleFile(e.dataTransfer.files?.[0])
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors ${
                  dragOver ? 'border-primary bg-primary-light' : 'border-border hover:border-border-strong'
                }`}
              >
                <ImagePlus className="h-6 w-6 text-text-muted" strokeWidth={1.5} />
                <p className="text-[13px] text-text-sub">
                  Bild hierher ziehen oder <span className="font-medium text-primary">durchsuchen</span>
                </p>
                <p className="text-[12px] text-text-muted">JPG, PNG oder WEBP, max. 5 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Wird veröffentlicht…' : 'Veröffentlichen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
