import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const unreadCount = notifications.filter((n) => !n.read).length

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Benachrichtigungen konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 10))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('Benachrichtigung konnte nicht aktualisiert werden:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
      if (error) throw error
    } catch (err) {
      console.error('Benachrichtigungen konnten nicht aktualisiert werden:', err)
    }
  }, [user])

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, reload: load }
}
