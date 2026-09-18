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

  const myVotes = votes.filter((v) => v.user_id === user?.id)
  const myVote = myVotes[0] || null

  const castVote = useCallback(
    async (optionId) => {
      if (!poll || !user) return
      try {
        if (poll.multiple_choice) {
          const alreadySelected = votes.some((v) => v.user_id === user.id && v.option_id === optionId)
          if (alreadySelected) {
            const { error } = await supabase
              .from('poll_votes')
              .delete()
              .eq('poll_id', poll.id)
              .eq('user_id', user.id)
              .eq('option_id', optionId)
            if (error) throw error
          } else {
            const { error } = await supabase
              .from('poll_votes')
              .insert({ poll_id: poll.id, user_id: user.id, option_id: optionId })
            if (error) throw error
          }
        } else {
          const { error: delError } = await supabase
            .from('poll_votes')
            .delete()
            .eq('poll_id', poll.id)
            .eq('user_id', user.id)
          if (delError) throw delError
          const { error: insError } = await supabase
            .from('poll_votes')
            .insert({ poll_id: poll.id, user_id: user.id, option_id: optionId })
          if (insError) throw insError
        }
        await load()
      } catch (err) {
        console.error('Stimme konnte nicht gespeichert werden:', err)
      }
    },
    [poll, user, votes, load]
  )

  return { poll, votes, myVote, myVotes, loading, castVote }
}
