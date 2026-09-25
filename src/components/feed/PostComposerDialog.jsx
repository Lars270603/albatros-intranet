import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Paperclip, X } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { uploadFile, sanitizeFileName } from '@/lib/upload'
import { notifyActiveUsers } from '@/lib/notifications'
import { FileTypeIcon } from '@/components/documents/FileTypeIcon'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

const ALLOWED_DOC_EXTENSIONS = ['pdf', 'xlsx', 'docx', 'pptx', 'zip']
const MAX_DOC_SIZE = 20 * 1024 * 1024

export function PostComposerDialog({ open, onOpenChange, onCreated, post = null }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef(null)
  const docInputRef = useRef(null)
  const isEdit = Boolean(post)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [docFile, setDocFile] = useState(null)
  const [existingAttachmentName, setExistingAttachmentName] = useState(null)
  const [docDragOver, setDocDragOver] = useState(false)
  const [linkCalendar, setLinkCalendar] = useState(false)
  const [eventDate, setEventDate] = useState('')
  const [isRange, setIsRange] = useState(false)
  const [eventEndDate, setEventEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (post) {
      setTitle(post.title || '')
      setBody(post.body || '')
      setImagePreview(post.image_url || null)
      setImageFile(null)
      setExistingAttachmentName(post.attachment_name || null)
      setDocFile(null)
      setLinkCalendar(Boolean(post.event_date))
      setEventDate(post.event_date || '')
      setIsRange(Boolean(post.event_end_date))
      setEventEndDate(post.event_end_date || '')
    } else {
      resetForm()
    }
  }, [open, post])

  function resetForm() {
    setTitle('')
    setBody('')
    setImageFile(null)
    setImagePreview(null)
    setDocFile(null)
    setExistingAttachmentName(null)
    setLinkCalendar(false)
    setEventDate('')
    setIsRange(false)
    setEventEndDate('')
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

  function handleDocFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) {
      toast({ variant: 'destructive', title: 'Ungültiges Dateiformat', description: 'Erlaubt: PDF, XLSX, DOCX, PPTX, ZIP.' })
      return
    }
    if (file.size > MAX_DOC_SIZE) {
      toast({ variant: 'destructive', title: 'Datei zu groß', description: 'Maximale Dateigröße: 20 MB.' })
      return
    }
    setDocFile(file)
    setExistingAttachmentName(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    try {
      let imageUrl = post?.image_url || null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        imageUrl = await uploadFile('news-images', imageFile, `${crypto.randomUUID()}.${ext}`)
      } else if (imagePreview === null) {
        imageUrl = null
      }

      const eventDateValue = linkCalendar && eventDate ? eventDate : null
      const eventEndDateValue = linkCalendar && isRange && eventEndDate ? eventEndDate : null

      const payload = {
        title,
        body: body.trim() || null,
        image_url: imageUrl,
        event_date: eventDateValue,
        event_end_date: eventEndDateValue,
      }

      let currentPost
      if (isEdit) {
        const { data, error } = await supabase
          .from('news_posts')
          .update(payload)
          .eq('id', post.id)
          .select('*, author:profiles(*)')
          .single()
        if (error) throw error
        currentPost = data
      } else {
        const { data, error } = await supabase
          .from('news_posts')
          .insert({ ...payload, scope: 'general', author_id: user.id })
          .select('*, author:profiles(*)')
          .single()
        if (error) throw error
        currentPost = data
      }

      if (docFile) {
        const path = `post-attachments/${currentPost.id}/${sanitizeFileName(docFile.name)}`
        const attachmentUrl = await uploadFile('documents', docFile, path)
        const { error: attachError } = await supabase
          .from('news_posts')
          .update({ attachment_url: attachmentUrl, attachment_name: docFile.name })
          .eq('id', currentPost.id)
        if (attachError) throw attachError
      }

      if (!isEdit) {
        await notifyActiveUsers({
          excludeUserId: user.id,
          type: 'new_post',
          message: `Neuer Beitrag: ${title}`,
          refId: currentPost.id,
        })
        supabase.functions
          .invoke('notify-new-content', { body: { type: 'news_post', id: currentPost.id } })
          .catch((err) => console.error('E-Mail-Benachrichtigung konnte nicht ausgelöst werden:', err))
      }

      toast({ title: isEdit ? 'Beitrag gespeichert' : 'Beitrag veröffentlicht' })
      onCreated?.(currentPost)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      console.error('Beitrag konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Beitrag konnte nicht gespeichert werden.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Beitrag bearbeiten' : 'Beitrag erstellen'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="post-title">Titel</Label>
            <Input id="post-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-body">Text (optional)</Label>
            <Textarea
              id="post-body"
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

          <div className="space-y-1.5">
            <Label>Dokument beifügen (optional)</Label>
            {docFile || existingAttachmentName ? (
              <div className="flex items-center gap-3 rounded-md border border-border p-3">
                <FileTypeIcon
                  fileType={(docFile?.name || existingAttachmentName)?.split('.').pop()}
                  className="h-5 w-5 shrink-0"
                />
                <span className="flex-1 truncate text-[13px] text-text">
                  {docFile?.name || existingAttachmentName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDocFile(null)
                    setExistingAttachmentName(null)
                  }}
                  className="text-text-muted hover:text-primary"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDocDragOver(true)
                }}
                onDragLeave={() => setDocDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDocDragOver(false)
                  handleDocFile(e.dataTransfer.files?.[0])
                }}
                onClick={() => docInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors ${
                  docDragOver ? 'border-primary bg-primary-light' : 'border-border hover:border-border-strong'
                }`}
              >
                <Paperclip className="h-6 w-6 text-text-muted" strokeWidth={1.5} />
                <p className="text-[13px] text-text-sub">
                  Datei hierher ziehen oder <span className="font-medium text-primary">durchsuchen</span>
                </p>
                <p className="text-[12px] text-text-muted">PDF, XLSX, DOCX, PPTX oder ZIP, max. 20 MB</p>
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.docx,.pptx,.zip"
                  className="hidden"
                  onChange={(e) => handleDocFile(e.target.files?.[0])}
                />
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="post-link-calendar"
                checked={linkCalendar}
                onCheckedChange={(checked) => setLinkCalendar(Boolean(checked))}
              />
              <Label htmlFor="post-link-calendar" className="cursor-pointer font-normal normal-case tracking-normal">
                Diesen Beitrag im Kalender zeigen
              </Label>
            </div>

            {linkCalendar && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="post-event-date">Datum</Label>
                  <Input
                    id="post-event-date"
                    type="date"
                    required={linkCalendar}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="post-is-range"
                    checked={isRange}
                    onCheckedChange={(checked) => setIsRange(Boolean(checked))}
                  />
                  <Label htmlFor="post-is-range" className="cursor-pointer font-normal normal-case tracking-normal">
                    Zeitraum (bis-Datum angeben)
                  </Label>
                </div>
                {isRange && (
                  <div className="space-y-1.5">
                    <Label htmlFor="post-event-end-date">Bis</Label>
                    <Input
                      id="post-event-end-date"
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Wird gespeichert…' : isEdit ? 'Speichern' : 'Veröffentlichen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
