import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, ArchiveRestore, Archive } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { PostCard } from '@/components/feed/PostCard'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/dateUtils'

export default function Documents() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openPost, setOpenPost] = useState(null)

  const isAdmin = profile?.role === 'admin'

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*, author:profiles(*)')
        .eq('archived', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Archiv konnte nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleUnarchive(post) {
    try {
      const { error } = await supabase.from('news_posts').update({ archived: false }).eq('id', post.id)
      if (error) throw error
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      toast({ title: 'Beitrag zurück in News verschoben' })
    } catch (err) {
      console.error('Beitrag konnte nicht wiederhergestellt werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion fehlgeschlagen.' })
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return posts
    const q = search.toLowerCase()
    return posts.filter((p) => p.title.toLowerCase().includes(q))
  }, [posts, search])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[32px] font-extrabold tracking-tight text-text">Archiv</h1>
      <p className="text-[13px] text-text-sub">Ältere, archivierte Beiträge aus News.</p>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
        <Input
          placeholder="Archiv durchsuchen…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Keine archivierten Beiträge"
          description="Beiträge, die aus News ins Archiv verschoben werden, erscheinen hier."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="group flex items-start gap-3 rounded-[10px] border border-border bg-bg p-4 transition-[border-color,transform] duration-150 ease-out hover:-translate-y-px hover:border-border-strong"
            >
              <button onClick={() => setOpenPost(post)} className="min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-[15px] font-bold text-text">{post.title}</p>
                  <p className="shrink-0 text-[12px] text-text-muted">{formatDate(post.created_at)}</p>
                </div>
                <p className="text-[12px] text-text-muted">
                  {post.author?.first_name} {post.author?.last_name}
                </p>
                {post.body && <p className="mt-1 line-clamp-2 text-[13px] text-text-sub">{post.body}</p>}
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleUnarchive(post)}
                  title="Zurück in News"
                  className="mt-0.5 shrink-0 text-text-muted hover:text-primary"
                >
                  <ArchiveRestore className="h-4 w-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(openPost)} onOpenChange={(open) => !open && setOpenPost(null)}>
        <DialogContent className="max-w-xl p-0">
          {openPost && <PostCard post={openPost} readOnly />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
