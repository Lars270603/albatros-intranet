import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useIdeas() {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*, submitter:profiles(*), idea_votes(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setIdeas(data || [])
    } catch (err) {
      console.error('Ideen konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const channel = supabase
      .channel('ideas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'idea_votes' }, load)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  const createIdea = useCallback(
    async ({ title, body }) => {
      const { error } = await supabase.from('ideas').insert({ title, body, submitted_by: user.id })
      if (error) throw error
      await load()
    },
    [user, load]
  )

  const toggleVote = useCallback(
    async (idea) => {
      if (!user) return
      const myVote = idea.idea_votes.find((v) => v.user_id === user.id)

      setIdeas((prev) =>
        prev.map((i) => {
          if (i.id !== idea.id) return i
          return {
            ...i,
            idea_votes: myVote
              ? i.idea_votes.filter((v) => v.user_id !== user.id)
              : [...i.idea_votes, { idea_id: idea.id, user_id: user.id }],
          }
        })
      )

      try {
        if (myVote) {
          const { error } = await supabase
            .from('idea_votes')
            .delete()
            .eq('idea_id', idea.id)
            .eq('user_id', user.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('idea_votes').insert({ idea_id: idea.id, user_id: user.id })
          if (error) throw error
        }
      } catch (err) {
        console.error('Stimme konnte nicht gespeichert werden:', err)
        load()
      }
    },
    [user, load]
  )

  const updateStatus = useCallback(
    async (id, status) => {
      const { error } = await supabase.from('ideas').update({ status }).eq('id', id)
      if (error) throw error
      setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
    },
    []
  )

  const deleteIdea = useCallback(async (id) => {
    const { error } = await supabase.from('ideas').delete().eq('id', id)
    if (error) throw error
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return { ideas, loading, createIdea, toggleVote, updateStatus, deleteIdea }
}
