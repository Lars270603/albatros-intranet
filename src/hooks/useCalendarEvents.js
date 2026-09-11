import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useCalendarEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*, creator:profiles(first_name, last_name)')
        .order('event_date', { ascending: true })
      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Termine konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addEvent({ title, eventDate }) {
    const { error } = await supabase
      .from('calendar_events')
      .insert({ title, event_date: eventDate, created_by: user.id })
    if (error) throw error
    await load()
  }

  async function deleteEvent(id) {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id)
    if (error) throw error
    await load()
  }

  return { events, loading, addEvent, deleteEvent }
}
