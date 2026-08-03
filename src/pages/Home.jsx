import { useMemo } from 'react'
import { MessageSquare } from 'lucide-react'
import { PostCard } from '@/components/feed/PostCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TeamWidget } from '@/components/home/TeamWidget'
import { PollWidget } from '@/components/home/PollWidget'
import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'
import { useToast } from '@/components/ui/use-toast'

export default function Home() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const scopes = useMemo(
    () => (profile ? ['general', profile.department] : ['general']),
    [profile]
  )
  const { posts, reactions, loading, toggleReaction, togglePin, deletePost } = usePosts(scopes)

  const pinnedPost = posts.find((p) => p.pinned) || null
  const feedPosts = pinnedPost ? posts.filter((p) => p.id !== pinnedPost.id) : posts
  const isAdmin = profile?.role === 'admin'

  async function handleDelete(postId) {
    try {
      await deletePost(postId)
      toast({ title: 'Beitrag gelöscht' })
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Beitrag konnte nicht gelöscht werden.' })
    }
  }

  async function handleTogglePin(post) {
    try {
      await togglePin(post)
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion fehlgeschlagen.' })
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[65%_1fr]">
      <div className="space-y-5">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {pinnedPost && (
              <PostCard
                post={pinnedPost}
                reactions={reactions[pinnedPost.id]}
                onToggleReaction={toggleReaction}
                isAdmin={isAdmin}
                onTogglePin={handleTogglePin}
                onDelete={handleDelete}
                pinnedStyle
              />
            )}

            {feedPosts.length === 0 && !pinnedPost ? (
              <EmptyState
                icon={MessageSquare}
                title="Noch keine Beiträge"
                description="Sobald jemand einen Beitrag veröffentlicht, erscheint er hier."
              />
            ) : (
              feedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  reactions={reactions[post.id]}
                  onToggleReaction={toggleReaction}
                  isAdmin={isAdmin}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                />
              ))
            )}
          </>
        )}
      </div>

      <div className="space-y-6">
        <TeamWidget />
        <PollWidget />
      </div>
    </div>
  )
}
