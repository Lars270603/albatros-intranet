import { supabase } from '@/lib/supabase'

/**
 * Erstellt eine Benachrichtigung für einen einzelnen User.
 */
export async function notifyUser(userId, type, message, refId = null) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, type, message, ref_id: refId })
    if (error) throw error
  } catch (err) {
    console.error('Benachrichtigung konnte nicht erstellt werden:', err)
  }
}

/**
 * Erstellt eine Benachrichtigung für mehrere User gleichzeitig.
 */
export async function notifyUsers(userIds, type, message, refId = null) {
  if (!userIds || userIds.length === 0) return
  try {
    const rows = userIds.map((userId) => ({ user_id: userId, type, message, ref_id: refId }))
    const { error } = await supabase.from('notifications').insert(rows)
    if (error) throw error
  } catch (err) {
    console.error('Benachrichtigungen konnten nicht erstellt werden:', err)
  }
}

/**
 * Lädt alle aktiven User (optional gefiltert nach Abteilung, optional ohne einen bestimmten User)
 * und benachrichtigt sie.
 */
export async function notifyActiveUsers({ department = null, excludeUserId = null, type, message, refId = null }) {
  try {
    let query = supabase.from('profiles').select('id').eq('status', 'active')
    if (department) query = query.eq('department', department)
    const { data, error } = await query
    if (error) throw error

    const userIds = (data || [])
      .map((p) => p.id)
      .filter((id) => id !== excludeUserId)

    await notifyUsers(userIds, type, message, refId)
  } catch (err) {
    console.error('Benachrichtigungen konnten nicht erstellt werden:', err)
  }
}
