import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Search, Plus, Download, Trash2, Archive } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { FileTypeIcon } from '@/components/documents/FileTypeIcon'
import { DocumentUploadDialog } from '@/components/documents/DocumentUploadDialog'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/dateUtils'
import { DOCUMENT_CATEGORIES } from '@/lib/documentCategories'
import { cn } from '@/lib/utils'

export default function Documents() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*, uploader:profiles(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setDocuments(data || [])
    } catch (err) {
      console.error('Archiv konnte nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('documents').delete().eq('id', id)
      if (error) throw error
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      toast({ title: 'Datei gelöscht' })
    } catch (err) {
      console.error('Datei konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

  const filtered = useMemo(() => {
    return documents
      .filter((d) => activeCategory === 'all' || d.category === activeCategory)
      .filter((d) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
      })
  }, [documents, activeCategory, search])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[32px] font-extrabold tracking-tight text-text">Archiv</h1>

      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <div className="space-y-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'flex w-full items-center rounded-md px-3 py-2 text-left text-[14px] transition-colors',
              activeCategory === 'all'
                ? 'bg-primary-light font-medium text-primary'
                : 'text-text-sub hover:bg-surface-2'
            )}
          >
            Alle
          </button>
          {Object.entries(DOCUMENT_CATEGORIES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                'flex w-full items-center rounded-md px-3 py-2 text-left text-[14px] transition-colors',
                activeCategory === key
                  ? 'bg-primary-light font-medium text-primary'
                  : 'text-text-sub hover:bg-surface-2'
              )}
            >
              {config.label}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
              <Input
                placeholder="Archiv durchsuchen…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Dokument hochladen
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="Keine Dateien gefunden"
              description="Lade die erste Datei in dieser Kategorie hoch."
              actionLabel="Dokument hochladen"
              onAction={() => setUploadOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Uploader</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Download</TableHead>
                  <TableHead className="text-right">Löschen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc, index) => {
                  const canDelete = profile?.role === 'admin' || doc.uploaded_by === profile?.id
                  return (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.035 }}
                      className="h-12 border-b border-surface-2 transition-colors hover:bg-surface"
                    >
                      <TableCell>
                        <FileTypeIcon fileType={doc.file_type} className="h-5 w-5" />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-text">{doc.name}</p>
                        {doc.description && <p className="text-[13px] text-text-muted">{doc.description}</p>}
                      </TableCell>
                      <TableCell>{DOCUMENT_CATEGORIES[doc.category]?.label}</TableCell>
                      <TableCell>
                        {doc.uploader?.first_name} {doc.uploader?.last_name}
                      </TableCell>
                      <TableCell>{formatDate(doc.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(doc.file_url, '_blank')}
                          title="Herunterladen"
                        >
                          <Download className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Löschen">
                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Datei löschen?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  „{doc.name}" wird endgültig entfernt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(doc.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-red-700"
                                >
                                  Löschen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={load} />
    </div>
  )
}
