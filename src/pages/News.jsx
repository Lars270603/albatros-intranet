import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Plus, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/feed/PostCard'
import { PostComposerDialog } from '@/components/feed/PostComposerDialog'
import { ActivePollCard } from '@/components/news/ActivePollCard'
import { PollCreateDialog } from '@/components/admin/PollCreateDialog'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'
import { useActivePolls } from '@/hooks/usePoll'
import { useToast } from '@/components/ui/use-toast'

const SCOPES = ['general']

export default function News() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [editingPoll, setEditingPoll] = useState(null)

  const { posts, loading, togglePin, deletePost, archivePost } = usePosts(SCOPES)
  const { polls, votesByPoll, myUserId, castVote, reload: reloadPolls } = useActivePolls(SCOPES)

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

  async function handleArchive(post) {
    try {
      await archivePost(post.id)
      toast({ title: 'Beitrag ins Archiv verschoben' })
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion fehlgeschlagen.' })
    }
  }

  async function handleTogglePin(post) {
    try {
      await togglePin(post)
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion fehlgeschlagen.' })
    }
  }

  function handleEdit(post) {
    setEditingPost(post)
    setComposerOpen(true)
  }

  function handleComposerOpenChange(open) {
    setComposerOpen(open)
    if (!open) setEditingPost(null)
  }

  return (
    <div className="max-w-[720px] space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[32px] font-extrabold tracking-tight text-text">News</h1>
        <Button
          onClick={() => {
            setEditingPost(null)
            setComposerOpen(true)
          }}
        >
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
                  isAdmin={isAdmin}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  pinnedStyle
                />
              </motion.div>
            ))}

            {polls.map((poll, index) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.035 }}
              >
                <ActivePollCard
                  poll={poll}
                  votes={votesByPoll[poll.id] || []}
                  myVotes={(votesByPoll[poll.id] || []).filter((v) => v.user_id === myUserId)}
                  onVote={(optionId) => castVote(poll.id, optionId)}
                  isAdmin={isAdmin}
                  onEdit={setEditingPoll}
                />
              </motion.div>
            ))}

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
                    isAdmin={isAdmin}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                  />
                </motion.div>
              ))
            )}
          </>
        )}
      </div>

      <PostComposerDialog
        open={composerOpen}
        onOpenChange={handleComposerOpenChange}
        onCreated={() => {}}
        post={editingPost}
      />

      <PollCreateDialog
        open={Boolean(editingPoll)}
        onOpenChange={(open) => !open && setEditingPoll(null)}
        onCreated={reloadPolls}
        poll={editingPoll}
      />
    </div>
  )
}
