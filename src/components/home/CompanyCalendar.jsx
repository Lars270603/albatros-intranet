import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Trash2, Newspaper, CalendarDays, Cake } from 'lucide-react'
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
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const { toast } = useToast()
  const { events, addEvent, deleteEvent } = useCalendarEvents()
  const [birthdays, setBirthdays] = useState([])
  const [newsEvents, setNewsEvents] = useState([])
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

  useEffect(() => {
    async function loadNewsEvents() {
      try {
        const { data, error } = await supabase
          .from('news_posts')
          .select('id, title, event_date, event_end_date')
          .eq('archived', false)
          .not('event_date', 'is', null)
        if (error) throw error
        setNewsEvents(data || [])
      } catch (err) {
        console.error('Termine aus News konnten nicht geladen werden:', err)
      }
    }
    loadNewsEvents()
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

  const newsEventsByDay = useMemo(() => {
    const map = {}
    for (const post of newsEvents) {
      const start = new Date(post.event_date)
      const end = post.event_end_date ? new Date(post.event_end_date) : start
      const cursor = new Date(start)
      while (cursor <= end) {
        const key = toDateKey(cursor)
        if (!map[key]) map[key] = []
        map[key].push(post)
        cursor.setDate(cursor.getDate() + 1)
      }
    }
    return map
  }, [newsEvents])

  function birthdaysOn(date) {
    return birthdays.filter((p) => {
      const b = new Date(p.birthday)
      return b.getMonth() === date.getMonth() && b.getDate() === date.getDate()
    })
  }

  const selectedKey = toDateKey(selectedDate)
  const selectedEvents = eventsByDay[selectedKey] || []
  const selectedNewsEvents = newsEventsByDay[selectedKey] || []
  const selectedBirthdays = birthdaysOn(selectedDate)
  const hasAnySelected = selectedEvents.length + selectedNewsEvents.length + selectedBirthdays.length > 0

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
    <Card className="p-5">
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

      {/* Legende */}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
          <span className="h-[3px] w-3 rounded-full bg-primary" /> News-Termin
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
          <span className="h-[3px] w-3 rounded-full bg-info" /> Firmentermin
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
          <span className="h-[3px] w-3 rounded-full bg-warning" /> Geburtstag
        </span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
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
          const hasCompanyEvent = Boolean(eventsByDay[key]?.length)
          const hasNewsEvent = Boolean(newsEventsByDay[key]?.length)
          const hasBirthday = birthdaysOn(date).length > 0

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(date)}
              className={cn(
                'flex h-9 flex-col items-center justify-center gap-1 rounded-[8px] text-[12px] transition-colors duration-150',
                isToday && 'bg-primary font-bold text-white',
                !isToday && isSelected && 'bg-surface-2 text-text',
                !isToday && !isSelected && 'text-text hover:bg-primary/5'
              )}
            >
              <span>{date.getDate()}</span>
              <span className="flex h-[3px] items-center gap-[3px]">
                {hasNewsEvent && (
                  <span className={cn('h-[3px] w-2 rounded-full', isToday ? 'bg-white/70' : 'bg-primary')} />
                )}
                {hasCompanyEvent && (
                  <span className={cn('h-[3px] w-2 rounded-full', isToday ? 'bg-white/70' : 'bg-info')} />
                )}
                {hasBirthday && (
                  <span className={cn('h-[3px] w-2 rounded-full', isToday ? 'bg-white/70' : 'bg-warning')} />
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-text">
            {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              Termin hinzufügen
            </Button>
          )}
        </div>

        <div className="mt-3 space-y-4">
          {selectedNewsEvents.length > 0 && (
            <div className="space-y-1.5">
              {selectedNewsEvents.map((post) => (
                <Link
                  key={post.id}
                  to="/news"
                  className="flex items-center gap-2 text-[13px] text-text hover:text-primary"
                >
                  <Newspaper className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.5} />
                  {post.title}
                </Link>
              ))}
            </div>
          )}

          {selectedEvents.length > 0 && (
            <div className="space-y-1.5">
              {selectedEvents.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between text-[13px] text-text">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-info" strokeWidth={1.5} />
                    {ev.title}
                  </span>
                  {isAdmin && (
                    <button onClick={() => handleDeleteEvent(ev.id)} className="text-text-muted hover:text-primary">
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedBirthdays.length > 0 && (
            <div className="space-y-1.5">
              {selectedBirthdays.map((p) => (
                <p key={p.id} className="flex items-center gap-2 text-[13px] text-text-sub">
                  <Cake className="h-3.5 w-3.5 shrink-0 text-warning" strokeWidth={1.5} />
                  {p.first_name} Geburtstag
                </p>
              ))}
            </div>
          )}

          {!hasAnySelected && <p className="text-[13px] text-text-muted">Keine Termine an diesem Tag.</p>}
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
