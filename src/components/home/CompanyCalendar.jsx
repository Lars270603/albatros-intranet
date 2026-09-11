import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTH_LABEL = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' })

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  // Montag = 0 statt Sonntag = 0
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day))
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }
  return cells
}

export function CompanyCalendar() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { events, addEvent, deleteEvent } = useCalendarEvents()
  const [birthdays, setBirthdays] = useState([])
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    async function loadBirthdays() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, birthday')
          .eq('status', 'active')
          .not('birthday', 'is', null)
        if (error) throw error
        setBirthdays(data || [])
      } catch (err) {
        console.error('Geburtstage konnten nicht geladen werden:', err)
      }
    }
    loadBirthdays()
  }, [])

  const today = new Date()
  const cells = useMemo(() => buildMonthGrid(viewDate), [viewDate])

  const eventsByDay = useMemo(() => {
    const map = {}
    for (const ev of events) {
      const key = ev.event_date
      if (!map[key]) map[key] = []
      map[key].push(ev)
    }
    return map
  }, [events])

  function birthdaysOn(date) {
    return birthdays.filter((p) => {
      const b = new Date(p.birthday)
      return b.getMonth() === date.getMonth() && b.getDate() === date.getDate()
    })
  }

  const selectedKey = toDateKey(selectedDate)
  const selectedEvents = eventsByDay[selectedKey] || []
  const selectedBirthdays = birthdaysOn(selectedDate)

  async function handleAddEvent(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      await addEvent({ title: newTitle.trim(), eventDate: selectedKey })
      setNewTitle('')
      setAddOpen(false)
      toast({ title: 'Termin hinzugefügt' })
    } catch (err) {
      console.error('Termin konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Termin konnte nicht gespeichert werden.' })
    }
  }

  async function handleDeleteEvent(id) {
    try {
      await deleteEvent(id)
      toast({ title: 'Termin gelöscht' })
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Termin konnte nicht gelöscht werden.' })
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <p className="label-micro">Firmenkalender</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-[7px] text-text-sub hover:bg-surface-2 hover:text-text"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <p className="w-36 text-center font-display text-[14px] font-bold text-text">
            {MONTH_LABEL.format(viewDate)}
          </p>
          <button
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-[7px] text-text-sub hover:bg-surface-2 hover:text-text"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((wd) => (
          <p key={wd} className="pb-1 text-center label-micro">
            {wd}
          </p>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const key = toDateKey(date)
          const isToday = date.toDateString() === today.toDateString()
          const isSelected = date.toDateString() === selectedDate.toDateString()
          const hasEvent = Boolean(eventsByDay[key]?.length)
          const hasBirthday = birthdaysOn(date).length > 0

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(date)}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[7px] text-[13px] transition-colors duration-150',
                isToday && 'bg-primary font-bold text-white',
                !isToday && isSelected && 'bg-surface-2 text-text',
                !isToday && !isSelected && 'text-text hover:bg-surface-2'
              )}
            >
              <span>{date.getDate()}</span>
              <span className="flex h-2.5 items-center gap-0.5">
                {hasEvent && (
                  <span className={cn('h-1 w-1 rounded-full', isToday ? 'bg-white' : 'bg-primary')} />
                )}
                {hasBirthday && <span className="text-[9px] leading-none">🎂</span>}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-text">
            {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Termin hinzufügen
          </Button>
        </div>

        <div className="mt-3 space-y-1.5">
          {selectedBirthdays.map((p) => (
            <p key={p.id} className="text-[13px] text-text-sub">
              🎂 {p.first_name} {p.last_name} hat Geburtstag
            </p>
          ))}
          {selectedEvents.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between text-[13px] text-text">
              <span>{ev.title}</span>
              {ev.created_by === user?.id && (
                <button onClick={() => handleDeleteEvent(ev.id)} className="text-text-muted hover:text-primary">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
          {selectedBirthdays.length === 0 && selectedEvents.length === 0 && (
            <p className="text-[13px] text-text-muted">Keine Termine an diesem Tag.</p>
          )}
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Termin hinzufügen</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="event-title">Titel</Label>
              <Input id="event-title" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <p className="text-[13px] text-text-sub">
              Datum: {selectedDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
