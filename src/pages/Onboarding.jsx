import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BookOpen, Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionEditDialog } from '@/components/onboarding/SectionEditDialog'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useOnboarding } from '@/hooks/useOnboarding'

export default function Onboarding() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const { sections, loading, createSection, updateSection, deleteSection, moveSection } = useOnboarding()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingSection, setEditingSection] = useState(null)

  const isAdmin = profile?.role === 'admin'

  function openCreate() {
    setEditingSection(null)
    setEditorOpen(true)
  }

  function openEdit(section) {
    setEditingSection(section)
    setEditorOpen(true)
  }

  async function handleSave({ title, body }) {
    if (editingSection) {
      await updateSection(editingSection.id, { title, body })
      toast({ title: 'Sektion aktualisiert' })
    } else {
      await createSection({ title, body })
      toast({ title: 'Sektion hinzugefügt' })
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSection(id)
      toast({ title: 'Sektion gelöscht' })
    } catch (err) {
      console.error('Sektion konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight text-text">
            Onboarding — Willkommen bei Albatros International
          </h1>
          <p className="text-[15px] text-text-sub">
            Alles was du für deinen Start wissen musst.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Sektion hinzufügen
          </Button>
        )}
      </div>

      {!loading && sections.length === 0 ? (
        <EmptyState icon={BookOpen} title="Onboarding-Inhalte werden bald hinzugefügt." />
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={section.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{section.title}</CardTitle>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === 0}
                      onClick={() => moveSection(section.id, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === sections.length - 1}
                      onClick={() => moveSection(section.id, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(section)}>
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sektion löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            „{section.title}" wird endgültig entfernt.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(section.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-red-700"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="prose-specs text-[15px] leading-relaxed text-text">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.body}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SectionEditDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        section={editingSection}
        onSave={handleSave}
      />
    </div>
  )
}
