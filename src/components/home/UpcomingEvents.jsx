import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { supabase } from '@/lib/supabase'
import { expandEvents, parseDateOnly, toDateKey } from '@/lib/recurrence'
import { isSameDay, nextBirthday } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

const RANGE_DAYS = 14
const MAX_ITEMS = 5

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function formatEventDay(date) {
  const today = startOfToday()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (isSameDay(date, today)) return 'Heute'
  if (isSameDay(date, tomorrow)) return 'Morgen'
  return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
}

/**
 * Kompakte Übersicht der nächsten 5 Termine (14-Tage-Fenster) aus denselben
 * drei Quellen wie CompanyCalendar: Firmentermine (inkl. Serientermine über
 * src/lib/recurrence.js), News-Termine und Geburtstage.
 */
export function UpcomingEvents() {
  const { events } = useCalendarEvents()
  const [birthdays, setBirthdays] = useState([])
  const [newsEvents, setNewsEvents] = useState([])

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

  const items = useMemo(() => {
    const today = startOfToday()
    const rangeEnd = new Date(today)
    rangeEnd.setDate(rangeEnd.getDate() + RANGE_DAYS)

    const companyItems = expandEvents(events, today, rangeEnd).map((ev) => ({
      key: `company-${ev.id}-${toDateKey(ev.occurrenceDate)}`,
      type: 'company',
      date: ev.occurrenceDate,
      time: ev.event_time,
      title: ev.title,
    }))

    const newsItems = []
    for (const post of newsEvents) {
      const start = parseDateOnly(post.event_date)
      const end = post.event_end_date ? parseDateOnly(post.event_end_date) : start
      const occurrence = start < today ? today : start
      if (occurrence <= end && occurrence <= rangeEnd) {
        newsItems.push({ key: `news-${post.id}`, type: 'news', date: occurrence, title: post.title })
      }
    }

    const birthdayItems = birthdays
      .map((p) => ({ ...p, next: nextBirthday(p.birthday) }))
      .filter((p) => p.next && p.next >= today && p.next <= rangeEnd)
      .map((p) => ({ key: `birthday-${p.id}`, type: 'birthday', date: p.next, title: `${p.first_name} Geburtstag` }))

    return [...companyItems, ...newsItems, ...birthdayItems].sort((a, b) => a.date - b.date).slice(0, MAX_ITEMS)
  }, [events, newsEvents, birthdays])

  function scrollToCalendar(e) {
    e.preventDefault()
    document.getElementById('company-calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (items.length === 0) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-text-sub" strokeWidth={1.5} />
          <p className="label-micro">Anstehende Termine</p>
        </div>
        <p className="mt-3 text-[13px] text-text-muted">Nichts Anstehendes in den nächsten zwei Wochen.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-text-sub" strokeWidth={1.5} />
        <p className="label-micro">Anstehende Termine</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => {
          const dot = item.type === 'news' ? 'bg-primary' : item.type === 'company' ? 'bg-info' : 'bg-warning'
          const itemClassName =
            'flex items-center gap-2 rounded-[8px] border border-border bg-bg px-3 py-2 transition-[border-color,transform] duration-150 ease-out'
          const content = (
            <>
              <span className={cn('h-2 w-2 shrink-0 rounded-full', dot)} />
              <span className="min-w-0 truncate text-[13px] font-medium text-text">{item.title}</span>
              <span className="shrink-0 text-[12px] text-text-muted">
                {formatEventDay(item.date)}
                {item.time && ` · ${item.time.slice(0, 5)}`}
              </span>
            </>
          )

          if (item.type === 'news') {
            return (
              <Link key={item.key} to="/news" className={cn(itemClassName, 'hover:-translate-y-px hover:border-border-strong')}>
                {content}
              </Link>
            )
          }
          if (item.type === 'company') {
            return (
              <a
                key={item.key}
                href="#company-calendar"
                onClick={scrollToCalendar}
                className={cn(itemClassName, 'hover:-translate-y-px hover:border-border-strong')}
              >
                {content}
              </a>
            )
          }
          return (
            <div key={item.key} className={itemClassName}>
              {content}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
