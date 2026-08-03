import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function usePollById(pollId) {
  const { user } = useAuth()
  const [poll, setPoll] = useState(null)
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*, creator:profiles(*)')
        .eq('id', pollId)
        .single()
      if (pollError) throw pollError
      setPoll(pollData)

      const { data: voteData, error: voteError } = await supabase
        .from('poll_votes')
        .select('*, voter:profiles(*)')
        .eq('poll_id', pollId)
      if (voteError) throw voteError
      setVotes(voteData || [])
    } catch (err) {
      console.error('Umfrage konnte nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [pollId])

  useEffect(() => {
    load()
  }, [load])

  const myVote = votes.find((v) => v.user_id === user?.id) || null

  const castVote = useCallback(
    async (optionId) => {
      if (!poll || !user || myVote) return
      try {
        const { error } = await supabase
          .from('poll_votes')
          .insert({ poll_id: poll.id, user_id: user.id, option_id: optionId })
        if (error) throw error
        await load()
      } catch (err) {
        console.error('Stimme konnte nicht gespeichert werden:', err)
      }
    },
    [poll, user, myVote, load]
  )

  return { poll, votes, myVote, loading, castVote }
}
