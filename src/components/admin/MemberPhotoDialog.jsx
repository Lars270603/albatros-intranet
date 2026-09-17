import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/upload'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export function MemberPhotoDialog({ member, open, onOpenChange, onUploaded }) {
  const { toast } = useToast()
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Zustand zurücksetzen, wenn der Dialog geschlossen wird
  useEffect(() => {
    if (!open) {
      setFile(null)
      setPreviewUrl(null)
    }
  }, [open])

  // Object-URL der Vorschau wieder freigeben
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileSelect(selected) {
    if (!selected) return
    if (!ALLOWED_TYPES.includes(selected.type)) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Nur JPEG-, PNG- oder WebP-Bilder sind erlaubt.',
      })
      return
    }
    if (selected.size > MAX_SIZE_BYTES) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Die Datei darf maximal 5 MB groß sein.',
      })
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  async function handleUpload() {
    if (!file || !member) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const avatarUrl = await uploadFile('avatars', file, `${member.id}.${ext}`)
      const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', member.id)
      if (error) throw error
      onUploaded?.()
      toast({ title: 'Foto aktualisiert' })
      onOpenChange(false)
    } catch (err) {
      console.error('Foto konnte nicht hochgeladen werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Upload fehlgeschlagen.' })
    } finally {
      setUploading(false)
    }
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Foto ändern</DialogTitle>
          <DialogDescription>
            Neues Profilfoto für {member.first_name} {member.last_name}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {previewUrl ? (
            <img src={previewUrl} alt="Vorschau" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <InitialsAvatar
              firstName={member.first_name}
              lastName={member.last_name}
              avatarUrl={member.avatar_url}
              size={80}
            />
          )}

          <div className="w-full space-y-1.5">
            <Label htmlFor="member-photo">Bilddatei</Label>
            <Input
              id="member-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              disabled={uploading}
            />
            <p className="text-[12px] text-text-muted">JPEG, PNG oder WebP, max. 5 MB</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Abbrechen
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? 'Wird hochgeladen…' : 'Hochladen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
