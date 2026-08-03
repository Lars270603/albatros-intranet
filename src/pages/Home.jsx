import { useMemo } from 'react'
import { motion } from 'motion/react'
import { MessageSquare } from 'lucide-react'
import { PostCard } from '@/components/feed/PostCard'
import { ProductFeedCard } from '@/components/products/ProductFeedCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TeamWidget } from '@/components/home/TeamWidget'
import { PollWidget } from '@/components/home/PollWidget'
import { HomeHeader } from '@/components/home/HomeHeader'
import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'
import { useProductsFeed } from '@/hooks/useProductsFeed'
import { useToast } from '@/components/ui/use-toast'

export default function Home() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const scopes = useMemo(
    () => (profile ? ['general', profile.department] : ['general']),
    [profile]
  )
  const { posts, reactions, loading: postsLoading, toggleReaction, togglePin, deletePost } = usePosts(scopes)
  const { products, loading: productsLoading } = useProductsFeed()

  const loading = postsLoading || productsLoading
  const isAdmin = profile?.role === 'admin'

  const pinnedPost = posts.find((p) => p.pinned) || null
  const feedPosts = pinnedPost ? posts.filter((p) => p.id !== pinnedPost.id) : posts

  const feedItems = useMemo(() => {
    const items = [
      ...feedPosts.map((post) => ({ type: 'post', id: `post-${post.id}`, created_at: post.created_at, post })),
      ...products.map((product) => ({
        type: 'product',
        id: `product-${product.id}`,
        created_at: product.created_at,
        product,
      })),
    ]
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [feedPosts, products])

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
    <div className="space-y-10">
      <HomeHeader firstName={profile?.first_name} />

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
                  size="feature"
                />
              )}

              {feedItems.length === 0 && !pinnedPost ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Noch keine Beiträge"
                  description="Sobald jemand einen Beitrag oder ein Produkt veröffentlicht, erscheint es hier."
                />
              ) : (
                feedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.04 }}
                  >
                    {item.type === 'post' ? (
                      <PostCard
                        post={item.post}
                        reactions={reactions[item.post.id]}
                        onToggleReaction={toggleReaction}
                        isAdmin={isAdmin}
                        onTogglePin={handleTogglePin}
                        onDelete={handleDelete}
                        size="feature"
                      />
                    ) : (
                      <ProductFeedCard product={item.product} />
                    )}
                  </motion.div>
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
    </div>
  )
}
