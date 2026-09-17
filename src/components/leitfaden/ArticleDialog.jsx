import { useEffect, useRef, useState } from 'react'
import { Plus, X, Paperclip, ImagePlus } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { ICON_OPTIONS, resolveIcon } from '@/lib/iconMap'
import { uploadFile, sanitizeFileName } from '@/lib/upload'
import { FileTypeIcon } from '@/components/documents/FileTypeIcon'

const EMPTY_TILE = { icon: 'Info', title: '', text: '' }

const ALLOWED_ATTACHMENT_EXTENSIONS = ['pdf', 'xlsx', 'docx', 'pptx']
const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_IMAGES = 6

export function ArticleDialog({ open, onOpenChange, article, onSave }) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [icon, setIcon] = useState('FileText')
  const [externalLinkLabel, setExternalLinkLabel] = useState('')
  const [externalLinkUrl, setExternalLinkUrl] = useState('')
  const [infoTiles, setInfoTiles] = useState([])
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState([])
  const [attachmentDragOver, setAttachmentDragOver] = useState(false)
  const [images, setImages] = useState([])
  const [folderId, setFolderId] = useState(null)
  const attachmentInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(article?.title || '')
      setShortDescription(article?.short_description || '')
      setIcon(article?.icon || 'FileText')
      setExternalLinkLabel(article?.external_link_label || '')
      setExternalLinkUrl(article?.external_link_url || '')
      setInfoTiles(article?.info_tiles?.length ? article.info_tiles : [])
      setBody(article?.body || '')
      setAttachments(
        (article?.attachments || []).map((a) => ({ name: a.name, type: a.type, url: a.url, file: null }))
      )
      setImages((article?.images || []).map((img) => ({ url: img.url, file: null, previewUrl: null })))
      setFolderId(article?.id || crypto.randomUUID())
    }
  }, [open, article])

  function handleAttachmentFiles(fileList) {
    const files = Array.from(fileList || [])
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
        toast({ variant: 'destructive', title: 'Ungültiges Dateiformat', description: 'Erlaubt: PDF, XLSX, DOCX, PPTX.' })
        continue
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        toast({ variant: 'destructive', title: 'Datei zu groß', description: 'Maximale Dateigröße: 20 MB.' })
        continue
      }
      setAttachments((prev) => [...prev, { name: file.name, type: ext, url: null, file }])
    }
  }

  function removeAttachment(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  function handleImageFiles(fileList) {
    const files = Array.from(fileList || [])
    setImages((prev) => {
      const next = [...prev]
      for (const file of files) {
        if (next.length >= MAX_IMAGES) {
          toast({ variant: 'destructive', title: 'Maximale Anzahl erreicht', description: `Es sind maximal ${MAX_IMAGES} Bilder erlaubt.` })
          break
        }
        const ext = file.name.split('.').pop().toLowerCase()
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
          toast({ variant: 'destructive', title: 'Ungültiges Dateiformat', description: 'Erlaubt: JPG, PNG oder WEBP.' })
          continue
        }
        if (file.size > MAX_IMAGE_SIZE) {
          toast({ variant: 'destructive', title: 'Datei zu groß', description: 'Maximale Dateigröße: 5 MB.' })
          continue
        }
        next.push({ url: null, file, previewUrl: URL.createObjectURL(file) })
      }
      return next
    })
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  function updateTile(index, field, value) {
    setInfoTiles((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)))
  }

  function addTile() {
    if (infoTiles.length >= 4) return
    setInfoTiles((prev) => [...prev, { ...EMPTY_TILE }])
  }

  function removeTile(index) {
    setInfoTiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const uploadedAttachments = await Promise.all(
        attachments.map(async (att) => {
          if (att.file) {
            const path = `leitfaden-attachments/${folderId}/${sanitizeFileName(att.file.name)}`
            const url = await uploadFile('documents', att.file, path)
            return { name: att.name, url, type: att.type }
          }
          return { name: att.name, url: att.url, type: att.type }
        })
      )

      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          if (img.file) {
            const ext = img.file.name.split('.').pop().toLowerCase()
            const path = `${folderId}/${crypto.randomUUID()}.${ext}`
            const url = await uploadFile('leitfaden-images', img.file, path)
            return { url }
          }
          return { url: img.url }
        })
      )

      await onSave({
        title: title.trim(),
        short_description: shortDescription.trim() || null,
        icon,
        external_link_label: externalLinkLabel.trim() || null,
        external_link_url: externalLinkUrl.trim() || null,
        info_tiles: infoTiles.filter((t) => t.title.trim()),
        body,
        attachments: uploadedAttachments,
        images: uploadedImages,
      })
      onOpenChange(false)
    } catch (err) {
      console.error('Artikel konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Artikel konnte nicht gespeichert werden.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{article ? 'Artikel bearbeiten' : 'Neuer Artikel'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_140px] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="art-title">Titel</Label>
              <Input id="art-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="art-icon">Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger id="art-icon">
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="art-desc">Kurzbeschreibung</Label>
            <Textarea
              id="art-desc"
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="art-link-label">Link-Button-Text (optional)</Label>
              <Input
                id="art-link-label"
                value={externalLinkLabel}
                onChange={(e) => setExternalLinkLabel(e.target.value)}
                placeholder="z.B. Zu Timetape"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="art-link-url">Externer Link (optional)</Label>
              <Input
                id="art-link-url"
                type="url"
                value={externalLinkUrl}
                onChange={(e) => setExternalLinkUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Info-Kacheln (max. 4)</Label>
              {infoTiles.length < 4 && (
                <Button type="button" variant="ghost" size="sm" onClick={addTile}>
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Kachel hinzufügen
                </Button>
              )}
            </div>
            {infoTiles.map((tile, index) => (
              <div key={index} className="grid grid-cols-[100px_1fr_1fr_auto] items-start gap-2 rounded-[10px] border border-border p-3">
                <Select value={tile.icon} onValueChange={(v) => updateTile(index, 'icon', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Titel"
                  value={tile.title}
                  onChange={(e) => updateTile(index, 'title', e.target.value)}
                />
                <Input
                  placeholder="Text"
                  value={tile.text}
                  onChange={(e) => updateTile(index, 'text', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeTile(index)}
                  className="flex h-9 w-9 items-center justify-center text-text-muted hover:text-primary"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="art-body">Inhalt (Markdown)</Label>
            <Textarea id="art-body" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            <p className="text-[12px] text-text-muted">
              Nummerierte Listen (1. 2. 3. …) werden automatisch als rote Schritt-Kacheln dargestellt.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Bilder (optional)</Label>
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-[10px] border border-border">
                  <img src={img.file ? img.previewUrl : img.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
                  >
                    <X className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border text-center hover:border-border-strong"
                >
                  <ImagePlus className="h-5 w-5 text-text-muted" strokeWidth={1.5} />
                  <span className="text-[11px] text-text-muted">Bild hinzufügen</span>
                </div>
              )}
            </div>
            <p className="text-[12px] text-text-muted">JPG, PNG oder WEBP, max. 5 MB pro Bild, bis zu {MAX_IMAGES} Bilder</p>
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                handleImageFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Dateianhänge (optional)</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setAttachmentDragOver(true)
              }}
              onDragLeave={() => setAttachmentDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setAttachmentDragOver(false)
                handleAttachmentFiles(e.dataTransfer.files)
              }}
              onClick={() => attachmentInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors ${
                attachmentDragOver ? 'border-primary bg-primary-light' : 'border-border hover:border-border-strong'
              }`}
            >
              <Paperclip className="h-6 w-6 text-text-muted" strokeWidth={1.5} />
              <p className="text-[13px] text-text-sub">
                Dateien hierher ziehen oder <span className="font-medium text-primary">durchsuchen</span>
              </p>
              <p className="text-[12px] text-text-muted">PDF, XLSX, DOCX oder PPTX, max. 20 MB pro Datei</p>
              <input
                ref={attachmentInputRef}
                type="file"
                multiple
                accept=".pdf,.xlsx,.docx,.pptx"
                className="hidden"
                onChange={(e) => {
                  handleAttachmentFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((att, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-md border border-border p-3">
                    <FileTypeIcon fileType={att.type} className="h-5 w-5 shrink-0" />
                    <span className="flex-1 truncate text-[13px] text-text">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-text-muted hover:text-primary"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
