import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useActivePoll(scopes) {
  const { user } = useAuth()
  const [poll, setPoll] = useState(null)
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const nowIso = new Date().toISOString()
      const { data: polls, error } = await supabase
        .from('polls')
        .select('*')
        .in('scope', scopes)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('created_at', { ascending: false })
        .limit(1)
      if (error) throw error

      const activePoll = polls?.[0] || null
      setPoll(activePoll)

      if (activePoll) {
        const { data: pollVotes, error: votesError } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('poll_id', activePoll.id)
        if (votesError) throw votesError
        setVotes(pollVotes || [])
      } else {
        setVotes([])
      }
    } catch (err) {
      console.error('Umfrage konnte nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [scopes])

  useEffect(() => {
    load()
  }, [load])

  const myVote = votes.find((v) => v.user_id === user?.id) || null

  const castVote = useCallback(
    async (optionId) => {
      if (!poll || !user || myVote) return
      setVotes((prev) => [...prev, { poll_id: poll.id, user_id: user.id, option_id: optionId }])
      try {
        const { error } = await supabase
          .from('poll_votes')
          .insert({ poll_id: poll.id, user_id: user.id, option_id: optionId })
        if (error) throw error
      } catch (err) {
        console.error('Stimme konnte nicht gespeichert werden:', err)
        load()
      }
    },
    [poll, user, myVote, load]
  )

  return { poll, votes, myVote, loading, castVote }
}
