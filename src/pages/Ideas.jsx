import { useMemo, useState } from 'react'
import { Plus, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { IdeaComposerDialog } from '@/components/ideas/IdeaComposerDialog'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useIdeas } from '@/hooks/useIdeas'
import { cn } from '@/lib/utils'

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
        <h1 className="font-display text-[28px] font-extrabold tracking-tight text-text">Ideenboard</h1>
        <Button onClick={() => setComposerOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Idee einreichen
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            onClick={() => setView(v.value)}
            className={cn(
              'rounded-full px-3 py-1 text-[13px] font-medium transition-colors',
              view === v.value ? 'bg-primary text-white' : 'bg-surface-2 text-text-sub hover:bg-surface'
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : visibleIdeas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Noch keine Ideen"
          description="Reiche die erste Idee ein."
          actionLabel="Idee einreichen"
          onAction={() => setComposerOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {visibleIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isAdmin={isAdmin}
              onToggleVote={toggleVote}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <IdeaComposerDialog open={composerOpen} onOpenChange={setComposerOpen} onSubmit={handleSubmitIdea} />
    </div>
  )
}
