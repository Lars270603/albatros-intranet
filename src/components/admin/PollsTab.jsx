import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, BarChart3, Eye } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { PollCreateDialog } from '@/components/admin/PollCreateDialog'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/dateUtils'

const SCOPE_LABELS = {
  general: 'Allgemein',
  vertrieb: 'Vertrieb',
  einkauf: 'Einkauf',
  kundenservice: 'Kundenservice',
  geschaeftsfuehrung: 'Geschäftsführung',
}

export function PollsTab() {
  const { toast } = useToast()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*, creator:profiles(*), poll_votes(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setPolls(data || [])
    } catch (err) {
      console.error('Umfragen konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('polls').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Umfrage gelöscht' })
      load()
    } catch (err) {
      console.error('Umfrage konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

  if (loading) return null

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Neue Umfrage
        </Button>
      </div>

      {polls.length === 0 ? (
        <EmptyState icon={BarChart3} title="Noch keine Umfragen" actionLabel="Neue Umfrage" onAction={() => setCreateOpen(true)} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Frage</TableHead>
              <TableHead>Zielgruppe</TableHead>
              <TableHead>Erstellt von</TableHead>
              <TableHead>Läuft bis</TableHead>
              <TableHead>Stimmen</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {polls.map((poll, index) => (
              <motion.tr
                key={poll.id}
                className="h-12 border-b border-surface-2 transition-colors hover:bg-surface"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.035 }}
              >
                <TableCell className="font-medium text-text">{poll.question}</TableCell>
                <TableCell>{SCOPE_LABELS[poll.scope]}</TableCell>
                <TableCell>
                  {poll.creator?.first_name} {poll.creator?.last_name}
                </TableCell>
                <TableCell>{poll.expires_at ? formatDate(poll.expires_at) : '—'}</TableCell>
                <TableCell>{poll.poll_votes?.length || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={`/polls/${poll.id}`} title="Details">
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Link>
                    </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Umfrage löschen?</AlertDialogTitle>
                        <AlertDialogDescription>Alle Stimmen werden ebenfalls entfernt.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(poll.id)}>
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      )}

      <PollCreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={load} />
    </div>
  )
}
