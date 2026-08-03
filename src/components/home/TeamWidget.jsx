import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { DepartmentBadge } from '@/components/shared/DepartmentBadge'
import { supabase } from '@/lib/supabase'
import { nextBirthday, daysUntil } from '@/lib/dateUtils'

export function TeamWidget() {
  const [birthdays, setBirthdays] = useState([])
  const [newColleagues, setNewColleagues] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('status', 'active')
        if (error) throw error

        const now = new Date()

        const withBirthdays = (data || [])
          .filter((p) => p.birthday)
          .map((p) => ({ ...p, _daysUntil: daysUntil(nextBirthday(p.birthday)) }))
          .filter((p) => p._daysUntil <= 6)
          .sort((a, b) => a._daysUntil - b._daysUntil)

        const recent = (data || [])
          .filter((p) => (now - new Date(p.created_at)) / (1000 * 60 * 60 * 24) <= 30)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

        setBirthdays(withBirthdays)
        setNewColleagues(recent)
      } catch (err) {
        console.error('Team-Widget konnte nicht geladen werden:', err)
      } finally {
        setLoaded(true)
      }
    }
    load()
  }, [])

  if (!loaded || (birthdays.length === 0 && newColleagues.length === 0)) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">Team</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {birthdays.length > 0 && (
          <div className="space-y-2.5">
            {birthdays.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5">
                <InitialsAvatar firstName={p.first_name} lastName={p.last_name} avatarUrl={p.avatar_url} size={32} />
                <span className="flex-1 text-[14px] text-text">
                  {p.first_name} {p.last_name}
                </span>
                <span className={p._daysUntil === 0 ? 'text-[12px] font-medium text-primary' : 'text-[12px] text-text-muted'}>
                  {p._daysUntil === 0 ? '🎂 Heute' : `in ${p._daysUntil} Tagen`}
                </span>
              </div>
            ))}
          </div>
        )}

        {birthdays.length > 0 && newColleagues.length > 0 && <Separator />}

        {newColleagues.length > 0 && (
          <div className="space-y-2.5">
            {newColleagues.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5">
                <InitialsAvatar firstName={p.first_name} lastName={p.last_name} avatarUrl={p.avatar_url} size={32} />
                <span className="flex-1 text-[14px] text-text">
                  {p.first_name} {p.last_name}
                </span>
                <DepartmentBadge department={p.department} />
                <span className="text-[12px] font-medium text-primary">Neu</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
