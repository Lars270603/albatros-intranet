import { useMemo, useState } from 'react'
import { Plus, MessageSquare } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/feed/PostCard'
import { PostComposerDialog } from '@/components/feed/PostComposerDialog'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'
import { useToast } from '@/components/ui/use-toast'

const TABS = [
  { value: 'general', label: 'Allgemein' },
  { value: 'vertrieb', label: 'Vertrieb' },
  { value: 'einkauf', label: 'Einkauf' },
  { value: 'kundenservice', label: 'Kundenservice' },
  { value: 'geschaeftsfuehrung', label: 'Geschäftsführung' },
]

export default function News() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('general')
  const [composerOpen, setComposerOpen] = useState(false)

  const scopes = useMemo(() => [activeTab], [activeTab])
  const { posts, reactions, loading, toggleReaction, togglePin, deletePost } = usePosts(scopes)

  const isAdmin = profile?.role === 'admin'
  const canPost = activeTab === 'general' || activeTab === profile?.department

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[28px] font-extrabold tracking-tight text-text">News</h1>
        {canPost && (
          <Button onClick={() => setComposerOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Beitrag erstellen
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-5">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Noch keine Beiträge in diesem Channel"
              description={canPost ? 'Erstelle den ersten Beitrag.' : 'Schau später noch einmal vorbei.'}
              actionLabel={canPost ? 'Beitrag erstellen' : undefined}
              onAction={canPost ? () => setComposerOpen(true) : undefined}
            />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                reactions={reactions[post.id]}
                onToggleReaction={toggleReaction}
                isAdmin={isAdmin}
                onTogglePin={handleTogglePin}
                onDelete={handleDelete}
                pinnedStyle={post.pinned}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <PostComposerDialog
        open={composerOpen}
        onOpenChange={setComposerOpen}
        scope={activeTab}
        onCreated={() => {}}
      />
    </div>
  )
}
