import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useComments(postId) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('news_comments')
        .select('*, author:profiles(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) throw error
      setComments(data || [])
    } catch (err) {
      console.error('Kommentare konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const channel = supabase
      .channel(`news-comments-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'news_comments', filter: `post_id=eq.${postId}` },
        load
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, load])

  const addComment = useCallback(
    async (body) => {
      const { error } = await supabase
        .from('news_comments')
        .insert({ post_id: postId, body, author_id: user.id })
      if (error) throw error
      await load()
    },
    [postId, user, load]
  )

  const deleteComment = useCallback(async (id) => {
    const { error } = await supabase.from('news_comments').delete().eq('id', id)
    if (error) throw error
    setComments((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { comments, loading, addComment, deleteComment }
}
