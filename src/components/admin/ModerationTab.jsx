import { useCallback, useEffect, useState } from 'react'
import { Trash2, Newspaper } from 'lucide-react'
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

export function ModerationTab() {
  const { toast } = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*, author:profiles(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Beiträge konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('news_posts').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Beitrag gelöscht' })
      load()
    } catch (err) {
      console.error('Beitrag konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

  if (loading) return null

  if (posts.length === 0) {
    return <EmptyState icon={Newspaper} title="Keine Beiträge vorhanden" />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titel</TableHead>
          <TableHead>Autor</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Datum</TableHead>
          <TableHead className="text-right">Löschen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post, index) => (
          <motion.tr
            key={post.id}
            className="h-12 border-b border-surface-2 transition-colors hover:bg-surface"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.035 }}
          >
            <TableCell className="font-medium text-text">{post.title}</TableCell>
            <TableCell>
              {post.author?.first_name} {post.author?.last_name}
            </TableCell>
            <TableCell>{SCOPE_LABELS[post.scope]}</TableCell>
            <TableCell>{formatDate(post.created_at)}</TableCell>
            <TableCell className="text-right">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Beitrag löschen?</AlertDialogTitle>
                    <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(post.id)}>
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  )
}
