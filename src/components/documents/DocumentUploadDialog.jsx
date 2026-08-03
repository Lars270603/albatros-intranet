import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
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
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { uploadFile, sanitizeFileName } from '@/lib/upload'
import { DOCUMENT_CATEGORIES } from '@/lib/documentCategories'

const ALLOWED_EXTENSIONS = ['pdf', 'xlsx', 'docx', 'pptx', 'png', 'jpg', 'jpeg', 'zip']
const MAX_SIZE = 50 * 1024 * 1024

export function DocumentUploadDialog({ open, onOpenChange, onUploaded }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setFile(null)
    setCategory('')
    setDescription('')
  }

  function handleFile(selected) {
    if (!selected) return
    const ext = selected.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast({ variant: 'destructive', title: 'Ungültiges Dateiformat', description: 'Erlaubt: PDF, XLSX, DOCX, PPTX, PNG, JPG, ZIP.' })
      return
    }
    if (selected.size > MAX_SIZE) {
      toast({ variant: 'destructive', title: 'Datei zu groß', description: 'Maximale Dateigröße: 50 MB.' })
      return
    }
    setFile(selected)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file || !category) return
    setSubmitting(true)

    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
      const fileUrl = await uploadFile('documents', file, path)

      const { error } = await supabase.from('documents').insert({
        name: file.name,
        description: description || null,
        file_url: fileUrl,
        file_type: ext,
        file_size_bytes: file.size,
        category,
        uploaded_by: user.id,
      })
      if (error) throw error

      toast({ title: 'Dokument hochgeladen' })
      onUploaded?.()
      reset()
      onOpenChange(false)
    } catch (err) {
      console.error('Dokument konnte nicht hochgeladen werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Upload fehlgeschlagen.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dokument hochladen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-8 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary-light' : 'border-border hover:border-border-strong'
            }`}
          >
            <UploadCloud className="h-6 w-6 text-text-muted" strokeWidth={1.5} />
            {file ? (
              <p className="text-[13px] font-medium text-text">{file.name}</p>
            ) : (
              <>
                <p className="text-[13px] text-text-sub">
                  Datei hierher ziehen oder <span className="font-medium text-primary">durchsuchen</span>
                </p>
                <p className="text-[12px] text-text-muted">PDF, XLSX, DOCX, PPTX, PNG, JPG, ZIP — max. 50 MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-category">Kategorie</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="doc-category">
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_CATEGORIES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-description">Beschreibung (optional)</Label>
            <Input id="doc-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={!file || !category || submitting}>
              {submitting ? 'Wird hochgeladen…' : 'Hochladen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
