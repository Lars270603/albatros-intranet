import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Plus, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/feed/PostCard'
import { PostComposerDialog } from '@/components/feed/PostComposerDialog'
import { ActivePollCard } from '@/components/news/ActivePollCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'
import { useActivePoll } from '@/hooks/usePoll'
import { useToast } from '@/components/ui/use-toast'

const SCOPES = ['general']

export default function News() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [composerOpen, setComposerOpen] = useState(false)

  const { posts, reactions, loading, toggleReaction, togglePin, deletePost } = usePosts(SCOPES)
  const { poll, votes, myVote, castVote } = useActivePoll(SCOPES)

  const isAdmin = profile?.role === 'admin'

  const pinnedPosts = useMemo(() => posts.filter((p) => p.pinned), [posts])
  const restPosts = useMemo(() => posts.filter((p) => !p.pinned), [posts])

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
    <div className="max-w-[720px] space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[32px] font-extrabold tracking-tight text-text">News</h1>
        <Button onClick={() => setComposerOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Beitrag erstellen
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {pinnedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.035 }}
              >
                <PostCard
                  post={post}
                  reactions={reactions[post.id]}
                  onToggleReaction={toggleReaction}
                  isAdmin={isAdmin}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                  pinnedStyle
                />
              </motion.div>
            ))}

            {poll && <ActivePollCard poll={poll} votes={votes} myVote={myVote} onVote={castVote} />}

            {pinnedPosts.length === 0 && restPosts.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Noch keine Beiträge"
                description="Erstelle den ersten Beitrag."
                actionLabel="Beitrag erstellen"
                onAction={() => setComposerOpen(true)}
              />
            ) : (
              restPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.035 }}
                >
                  <PostCard
                    post={post}
                    reactions={reactions[post.id]}
                    onToggleReaction={toggleReaction}
                    isAdmin={isAdmin}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))
            )}
          </>
        )}
      </div>

      <PostComposerDialog
        open={composerOpen}
        onOpenChange={setComposerOpen}
        onCreated={() => {}}
      />
    </div>
  )
}
