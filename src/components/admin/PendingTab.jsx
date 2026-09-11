import { CheckCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { notifyUser } from '@/lib/notifications'
import { formatDate } from '@/lib/dateUtils'

export function PendingTab({ pending, onChanged }) {
  const { toast } = useToast()

  async function handleAction(profile, status) {
    try {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', profile.id)
      if (error) throw error

      if (status === 'active') {
        await notifyUser(profile.id, 'account_activated', 'Dein Account wurde freigeschaltet')
      }

      toast({ title: status === 'active' ? 'Account freigeschaltet' : 'Account abgelehnt' })
      onChanged()
    } catch (err) {
      console.error('Aktion fehlgeschlagen:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion konnte nicht ausgeführt werden.' })
    }
  }

  if (pending.length === 0) {
    return <EmptyState icon={CheckCircle} title="Keine ausstehenden Anfragen" />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>E-Mail</TableHead>
          <TableHead>Registriert am</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pending.map((profile, index) => (
          <motion.tr
            key={profile.id}
            className="h-12 border-b border-surface-2 transition-colors hover:bg-surface"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.035 }}
          >
            <TableCell className="font-medium text-text">
              {profile.first_name} {profile.last_name}
            </TableCell>
            <TableCell>{profile.email}</TableCell>
            <TableCell>{formatDate(profile.created_at)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="success" size="sm" onClick={() => handleAction(profile, 'active')}>
                  Freischalten
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary-light"
                  onClick={() => handleAction(profile, 'rejected')}
                >
                  Ablehnen
                </Button>
              </div>
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  )
}
