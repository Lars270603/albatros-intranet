import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { DepartmentBadge } from '@/components/shared/DepartmentBadge'
import { supabase } from '@/lib/supabase'
import { nextBirthday, daysUntil } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

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
          .filter((p) => p._daysUntil <= 7)
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
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted">Team</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {birthdays.length > 0 && (
          <div className="space-y-2">
            {birthdays.map((p) => {
              const isToday = p._daysUntil === 0
              return (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 rounded-md p-2.5',
                    isToday && 'bg-primary-light'
                  )}
                >
                  <InitialsAvatar firstName={p.first_name} lastName={p.last_name} avatarUrl={p.avatar_url} size={40} />
                  <div className="flex-1 space-y-0.5">
                    <p className={cn('text-[14px] font-medium', isToday ? 'text-primary' : 'text-text')}>
                      🎂 {p.first_name} {p.last_name}
                    </p>
                    <p className={cn('text-[12px]', isToday ? 'font-medium text-primary' : 'text-text-muted')}>
                      {isToday ? 'Heute ist Geburtstag!' : `Geburtstag in ${p._daysUntil} Tagen`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {birthdays.length > 0 && newColleagues.length > 0 && <Separator />}

        {newColleagues.length > 0 && (
          <div className="space-y-2.5">
            {newColleagues.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <InitialsAvatar firstName={p.first_name} lastName={p.last_name} avatarUrl={p.avatar_url} size={40} />
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
