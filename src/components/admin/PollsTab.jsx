import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, BarChart3, Eye, Pencil, ChevronDown, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'

export function PollsTab() {
  const { toast } = useToast()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingPoll, setEditingPoll] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

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
              <TableHead className="w-8"></TableHead>
              <TableHead>Frage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt von</TableHead>
              <TableHead>Läuft bis</TableHead>
              <TableHead>Stimmen</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {polls.map((poll, index) => {
              const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date()
              const isExpanded = expandedId === poll.id
              const options = poll.options || []
              const voteList = poll.poll_votes || []
              const totalVotes = voteList.length

              return (
                <Fragment key={poll.id}>
                  <motion.tr
                    className="h-12 border-b border-surface-2 transition-colors hover:bg-surface"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.035 }}
                  >
                    <TableCell>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : poll.id)}
                        className="text-text-muted hover:text-text"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-text">{poll.question}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {isExpired ? (
                          <Badge className="border-transparent bg-warning-light text-warning">Abgelaufen</Badge>
                        ) : (
                          <Badge className="border-transparent bg-success-light text-success">Aktiv</Badge>
                        )}
                        {poll.multiple_choice && (
                          <Badge className="border-transparent bg-surface-2 text-text-sub">
                            Mehrfachauswahl ({poll.max_choices} {poll.max_choices === 1 ? 'Stimme' : 'Stimmen'})
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {poll.creator?.first_name} {poll.creator?.last_name}
                    </TableCell>
                    <TableCell>{poll.expires_at ? formatDate(poll.expires_at) : '—'}</TableCell>
                    <TableCell>{totalVotes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/polls/${poll.id}`} title="Details">
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Bearbeiten"
                          onClick={() => setEditingPoll(poll)}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.5} />
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
                  {isExpanded && (
                    <tr className="border-b border-surface-2 bg-surface">
                      <TableCell colSpan={7}>
                        <div className="space-y-2 py-2">
                          {options.map((option) => {
                            const count = voteList.filter((v) => v.option_id === option.id).length
                            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
                            return (
                              <div key={option.id} className="space-y-1">
                                <div className="flex items-center justify-between text-[13px]">
                                  <span className="text-text">{option.label}</span>
                                  <span className="text-text-sub">
                                    {pct}% · {count} {count === 1 ? 'Stimme' : 'Stimmen'}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-[4px] bg-surface-2">
                                  <div
                                    className={cn('h-full rounded-[4px]', 'bg-text-muted')}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      )}

      <PollCreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={load} />
      <PollCreateDialog
        open={Boolean(editingPoll)}
        onOpenChange={(open) => !open && setEditingPoll(null)}
        onCreated={load}
        poll={editingPoll}
      />
    </div>
  )
}
