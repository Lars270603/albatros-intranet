import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const EMOJIS = ['👍', '🎉', '👀']

export function usePosts(scopes) {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [reactions, setReactions] = useState({})
  const [loading, setLoading] = useState(true)

  const loadReactions = useCallback(async (postIds) => {
    if (postIds.length === 0) {
      setReactions({})
      return
    }
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('*')
        .in('post_id', postIds)
      if (error) throw error

      const map = {}
      for (const postId of postIds) {
        map[postId] = {}
        for (const emoji of EMOJIS) {
          map[postId][emoji] = { count: 0, reacted: false }
        }
      }
      for (const r of data || []) {
        if (!map[r.post_id]) continue
        map[r.post_id][r.emoji].count += 1
        if (r.user_id === user?.id) map[r.post_id][r.emoji].reacted = true
      }
      setReactions(map)
    } catch (err) {
      console.error('Reaktionen konnten nicht geladen werden:', err)
    }
  }, [user])

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*, author:profiles(*)')
        .in('scope', scopes)
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts(data || [])
      await loadReactions((data || []).map((p) => p.id))
    } catch (err) {
      console.error('Beiträge konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [scopes, loadReactions])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  useEffect(() => {
    const channel = supabase
      .channel('news-feed-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news_posts' }, () => {
        load()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, () => {
        setPosts((current) => {
          loadReactions(current.map((p) => p.id))
          return current
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [load, loadReactions])

  const toggleReaction = useCallback(
    async (postId, emoji) => {
      if (!user) return
      const alreadyReacted = reactions[postId]?.[emoji]?.reacted

      setReactions((prev) => {
        const next = { ...prev }
        const postReactions = { ...(next[postId] || {}) }
        const current = postReactions[emoji] || { count: 0, reacted: false }
        postReactions[emoji] = {
          count: alreadyReacted ? Math.max(0, current.count - 1) : current.count + 1,
          reacted: !alreadyReacted,
        }
        next[postId] = postReactions
        return next
      })

      try {
        if (alreadyReacted) {
          const { error } = await supabase
            .from('post_reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .eq('emoji', emoji)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('post_reactions')
            .insert({ post_id: postId, user_id: user.id, emoji })
          if (error) throw error
        }
      } catch (err) {
        console.error('Reaktion konnte nicht gespeichert werden:', err)
        loadReactions(posts.map((p) => p.id))
      }
    },
    [user, reactions, posts, loadReactions]
  )

  const togglePin = useCallback(async (post) => {
    try {
      const { error } = await supabase
        .from('news_posts')
        .update({ pinned: !post.pinned })
        .eq('id', post.id)
      if (error) throw error
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, pinned: !p.pinned } : p)))
    } catch (err) {
      console.error('Beitrag konnte nicht angepinnt werden:', err)
      throw err
    }
  }, [])

  const deletePost = useCallback(async (postId) => {
    try {
      const { error } = await supabase.from('news_posts').delete().eq('id', postId)
      if (error) throw error
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch (err) {
      console.error('Beitrag konnte nicht gelöscht werden:', err)
      throw err
    }
  }, [])

  return { posts, reactions, loading, toggleReaction, togglePin, deletePost, reload: load }
}

export { EMOJIS }
