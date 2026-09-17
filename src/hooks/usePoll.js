import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

/**
 * Lädt ALLE aktiven (nicht abgelaufenen) Umfragen, neueste zuerst.
 */
export function useActivePolls(scopes) {
  const { user } = useAuth()
  const [polls, setPolls] = useState([])
  const [votesByPoll, setVotesByPoll] = useState({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const nowIso = new Date().toISOString()
      const { data: activePolls, error } = await supabase
        .from('polls')
        .select('*')
        .in('scope', scopes)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('created_at', { ascending: false })
      if (error) throw error

      setPolls(activePolls || [])

      const pollIds = (activePolls || []).map((p) => p.id)
      if (pollIds.length > 0) {
        const { data: allVotes, error: votesError } = await supabase
          .from('poll_votes')
          .select('*')
          .in('poll_id', pollIds)
        if (votesError) throw votesError
        const grouped = {}
        for (const id of pollIds) grouped[id] = []
        for (const v of allVotes || []) {
          if (!grouped[v.poll_id]) grouped[v.poll_id] = []
          grouped[v.poll_id].push(v)
        }
        setVotesByPoll(grouped)
      } else {
        setVotesByPoll({})
      }
    } catch (err) {
      console.error('Umfragen konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [scopes])

  useEffect(() => {
    load()
  }, [load])

  const castVote = useCallback(
    async (pollId, optionId) => {
      if (!user) return
      setVotesByPoll((prev) => ({
        ...prev,
        [pollId]: [
          ...(prev[pollId] || []).filter((v) => v.user_id !== user.id),
          { poll_id: pollId, user_id: user.id, option_id: optionId },
        ],
      }))
      try {
        const { error } = await supabase
          .from('poll_votes')
          .upsert({ poll_id: pollId, user_id: user.id, option_id: optionId }, { onConflict: 'poll_id,user_id' })
        if (error) throw error
      } catch (err) {
        console.error('Stimme konnte nicht gespeichert werden:', err)
        load()
      }
    },
    [user, load]
  )

  return { polls, votesByPoll, myUserId: user?.id, loading, castVote, reload: load }
}
