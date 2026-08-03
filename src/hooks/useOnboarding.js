import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useOnboarding() {
  const { user } = useAuth()
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_sections')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setSections(data || [])
    } catch (err) {
      console.error('Onboarding-Inhalte konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createSection = useCallback(
    async ({ title, body }) => {
      const nextOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.sort_order)) + 1 : 0
      const { error } = await supabase
        .from('onboarding_sections')
        .insert({ title, body, sort_order: nextOrder, created_by: user.id })
      if (error) throw error
      await load()
    },
    [sections, user, load]
  )

  const updateSection = useCallback(
    async (id, { title, body }) => {
      const { error } = await supabase
        .from('onboarding_sections')
        .update({ title, body, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      await load()
    },
    [load]
  )

  const deleteSection = useCallback(
    async (id) => {
      const { error } = await supabase.from('onboarding_sections').delete().eq('id', id)
      if (error) throw error
      setSections((prev) => prev.filter((s) => s.id !== id))
    },
    []
  )

  const moveSection = useCallback(
    async (id, direction) => {
      const index = sections.findIndex((s) => s.id === id)
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (index === -1 || targetIndex < 0 || targetIndex >= sections.length) return

      const current = sections[index]
      const target = sections[targetIndex]

      const reordered = [...sections]
      reordered[index] = target
      reordered[targetIndex] = current
      setSections(reordered)

      try {
        const { error: error1 } = await supabase
          .from('onboarding_sections')
          .update({ sort_order: target.sort_order })
          .eq('id', current.id)
        if (error1) throw error1
        const { error: error2 } = await supabase
          .from('onboarding_sections')
          .update({ sort_order: current.sort_order })
          .eq('id', target.id)
        if (error2) throw error2
      } catch (err) {
        console.error('Reihenfolge konnte nicht geändert werden:', err)
        load()
      }
    },
    [sections, load]
  )

  return { sections, loading, createSection, updateSection, deleteSection, moveSection, reload: load }
}
