import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
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

const EMPTY_TILE = { icon: 'Info', title: '', text: '' }

export function ArticleDialog({ open, onOpenChange, article, onSave }) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [icon, setIcon] = useState('FileText')
  const [externalLinkLabel, setExternalLinkLabel] = useState('')
  const [externalLinkUrl, setExternalLinkUrl] = useState('')
  const [infoTiles, setInfoTiles] = useState([])
  const [body, setBody] = useState('')
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
    }
  }, [open, article])

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
      await onSave({
        title: title.trim(),
        short_description: shortDescription.trim() || null,
        icon,
        external_link_label: externalLinkLabel.trim() || null,
        external_link_url: externalLinkUrl.trim() || null,
        info_tiles: infoTiles.filter((t) => t.title.trim()),
        body,
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
