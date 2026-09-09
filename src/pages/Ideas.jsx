import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { IdeaComposerDialog } from '@/components/ideas/IdeaComposerDialog'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useIdeas } from '@/hooks/useIdeas'

const VIEWS = [
  { value: 'newest', label: 'Neueste' },
  { value: 'votes', label: 'Meiste Votes' },
  { value: 'offen', label: 'Offen' },
  { value: 'umgesetzt', label: 'Umgesetzt' },
]

export default function Ideas() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const { ideas, loading, createIdea, toggleVote, updateStatus, deleteIdea } = useIdeas()
  const [view, setView] = useState('newest')
  const [composerOpen, setComposerOpen] = useState(false)

  const isAdmin = profile?.role === 'admin'

  const visibleIdeas = useMemo(() => {
    let list = [...ideas]
    if (view === 'offen') list = list.filter((i) => i.status === 'offen')
    if (view === 'umgesetzt') list = list.filter((i) => i.status === 'umgesetzt')

    if (view === 'votes') {
      list.sort((a, b) => b.idea_votes.length - a.idea_votes.length)
    } else {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return list
  }, [ideas, view])

  async function handleSubmitIdea(form) {
    await createIdea(form)
    toast({ title: 'Idee eingereicht' })
  }

  async function handleUpdateStatus(id, status) {
    try {
      await updateStatus(id, status)
    } catch (err) {
      console.error('Status konnte nicht aktualisiert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion fehlgeschlagen.' })
    }
  }

  async function handleDelete(id) {
    try {
      await deleteIdea(id)
      toast({ title: 'Idee gelöscht' })
    } catch (err) {
      console.error('Idee konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[32px] font-extrabold tracking-tight text-text">Ideenboard</h1>
        <Button onClick={() => setComposerOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Idee einreichen
        </Button>
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          {VIEWS.map((v) => (
            <TabsTrigger key={v.value} value={v.value}>
              {v.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={view} className="space-y-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : visibleIdeas.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title="Noch keine Ideen"
              description="Reiche die erste Idee ein."
              actionLabel="Idee einreichen"
              onAction={() => setComposerOpen(true)}
            />
          ) : (
            visibleIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.035 }}
              >
                <IdeaCard
                  idea={idea}
                  isAdmin={isAdmin}
                  onToggleVote={toggleVote}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>

      <IdeaComposerDialog open={composerOpen} onOpenChange={setComposerOpen} onSubmit={handleSubmitIdea} />
    </div>
  )
}
