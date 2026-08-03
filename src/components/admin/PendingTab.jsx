import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { DepartmentBadge } from '@/components/shared/DepartmentBadge'
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
          <TableHead>Abteilung</TableHead>
          <TableHead>Registriert am</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pending.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell className="font-medium text-text">
              {profile.first_name} {profile.last_name}
            </TableCell>
            <TableCell>{profile.email}</TableCell>
            <TableCell>
              <DepartmentBadge department={profile.department} />
            </TableCell>
            <TableCell>{formatDate(profile.created_at)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="success" size="sm" onClick={() => handleAction(profile, 'active')}>
                  Freischalten
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-primary-light"
                  onClick={() => handleAction(profile, 'rejected')}
                >
                  Ablehnen
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
