import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { DepartmentBadge } from '@/components/shared/DepartmentBadge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const STATUS_CONFIG = {
  active: { label: 'Aktiv', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  rejected: { label: 'Abgelehnt', variant: 'destructive' },
}

export function MembersTab({ members, onChanged }) {
  const { user } = useAuth()
  const { toast } = useToast()

  async function updateRole(profile, role) {
    try {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', profile.id)
      if (error) throw error
      toast({ title: 'Rolle aktualisiert' })
      onChanged()
    } catch (err) {
      console.error('Rolle konnte nicht aktualisiert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion fehlgeschlagen.' })
    }
  }

  async function toggleStatus(profile) {
    const nextStatus = profile.status === 'active' ? 'rejected' : 'active'
    try {
      const { error } = await supabase.from('profiles').update({ status: nextStatus }).eq('id', profile.id)
      if (error) throw error
      toast({ title: nextStatus === 'active' ? 'Account entsperrt' : 'Account gesperrt' })
      onChanged()
    } catch (err) {
      console.error('Status konnte nicht aktualisiert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion fehlgeschlagen.' })
    }
  }

  async function handleDelete(profile) {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', profile.id)
      if (error) throw error
      toast({ title: 'Mitarbeiter gelöscht' })
      onChanged()
    } catch (err) {
      console.error('Mitarbeiter konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>E-Mail</TableHead>
          <TableHead>Abteilung</TableHead>
          <TableHead>Rolle</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((profile) => {
          const isSelf = profile.id === user?.id
          const statusConfig = STATUS_CONFIG[profile.status]
          return (
            <TableRow key={profile.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <InitialsAvatar
                    firstName={profile.first_name}
                    lastName={profile.last_name}
                    avatarUrl={profile.avatar_url}
                    size={28}
                  />
                  <span className="font-medium text-text">
                    {profile.first_name} {profile.last_name}
                  </span>
                </div>
              </TableCell>
              <TableCell>{profile.email}</TableCell>
              <TableCell>
                <DepartmentBadge department={profile.department} />
              </TableCell>
              <TableCell>
                <Select value={profile.role} onValueChange={(v) => updateRole(profile, v)} disabled={isSelf}>
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Mitglied</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig?.variant}>{statusConfig?.label}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleStatus(profile)} disabled={isSelf}>
                    {profile.status === 'active' ? 'Sperren' : 'Entsperren'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isSelf}>
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mitarbeiter löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {profile.first_name} {profile.last_name} wird endgültig entfernt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(profile)}
                          className="bg-destructive text-destructive-foreground hover:bg-red-700"
                        >
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
