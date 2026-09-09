import { useMemo } from 'react'
import { motion } from 'motion/react'
import { MessageSquare } from 'lucide-react'
import { PostCard } from '@/components/feed/PostCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TeamWidget } from '@/components/home/TeamWidget'
import { PollWidget } from '@/components/home/PollWidget'
import { ProductsWidget } from '@/components/home/ProductsWidget'
import { HomeHeader } from '@/components/home/HomeHeader'
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

  const isAdmin = profile?.role === 'admin'

  const pinnedPost = posts.find((p) => p.pinned) || null
  const feedPosts = pinnedPost ? posts.filter((p) => p.id !== pinnedPost.id) : posts

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
    <div className="space-y-12">
      <HomeHeader firstName={profile?.first_name} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
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
                  size="feature"
                />
              )}

              {feedPosts.length === 0 && !pinnedPost ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Noch keine Beiträge"
                  description="Sobald jemand einen Beitrag veröffentlicht, erscheint er hier."
                />
              ) : (
                feedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.04 }}
                  >
                    <PostCard
                      post={post}
                      reactions={reactions[post.id]}
                      onToggleReaction={toggleReaction}
                      isAdmin={isAdmin}
                      onTogglePin={handleTogglePin}
                      onDelete={handleDelete}
                      size="feature"
                    />
                  </motion.div>
                ))
              )}
            </>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <TeamWidget />
          <PollWidget />
          <ProductsWidget />
        </div>
      </div>
    </div>
  )
}
