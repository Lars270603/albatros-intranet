import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronUp, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
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
import { CategoryDialog } from '@/components/leitfaden/CategoryDialog'
import { ArticleDialog } from '@/components/leitfaden/ArticleDialog'
import { useLeitfaden } from '@/hooks/useLeitfaden'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { resolveIcon } from '@/lib/iconMap'
import { cn } from '@/lib/utils'

export default function Leitfaden() {
  const { profile, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const isAdmin = profile?.role === 'admin'
  const {
    categories,
    articles,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    createArticle,
    updateArticle,
    deleteArticle,
    moveArticle,
  } = useLeitfaden()

  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [articleDialogOpen, setArticleDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0] || null
  const categoryArticles = activeCategory
    ? articles.filter((a) => a.category_id === activeCategory.id).sort((a, b) => a.sort_order - b.sort_order)
    : []

  async function handleDeleteCategory(id) {
    try {
      await deleteCategory(id)
      toast({ title: 'Kategorie gelöscht' })
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Kategorie konnte nicht gelöscht werden.' })
    }
  }

  async function handleDeleteArticle(id) {
    try {
      await deleteArticle(id)
      toast({ title: 'Artikel gelöscht' })
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Artikel konnte nicht gelöscht werden.' })
    }
  }

  async function handleSaveArticle(payload) {
    if (editingArticle) {
      await updateArticle(editingArticle.id, payload)
    } else {
      await createArticle(activeCategory.id, payload, user?.id)
    }
    toast({ title: 'Artikel gespeichert' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[32px] font-extrabold tracking-[-0.04em] text-text">Leitfaden</h1>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => {
              setEditingCategory(null)
              setCategoryDialogOpen(true)
            }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Kategorie
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState title="Noch keine Kategorien" description="Lege die erste Kategorie an, um loszulegen." />
      ) : (
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <nav className="space-y-0.5">
            {categories.map((cat) => {
              const IconComp = resolveIcon(cat.icon)
              const active = activeCategory?.id === cat.id
              return (
                <div key={cat.id} className="group flex items-center gap-1">
                  <button
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={cn(
                      'flex flex-1 items-center gap-2.5 rounded-[7px] px-3 py-2 text-left text-[14px] transition-colors duration-150',
                      active ? 'bg-primary-light font-medium text-primary' : 'text-text-sub hover:bg-surface-2 hover:text-text'
                    )}
                  >
                    <IconComp className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                    {cat.name}
                  </button>
                  {isAdmin && (
                    <div className="hidden items-center gap-0.5 group-hover:flex">
                      <button
                        onClick={() => moveCategory(cat.id, -1)}
                        className="flex h-6 w-6 items-center justify-center text-text-muted hover:text-text"
                      >
                        <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => moveCategory(cat.id, 1)}
                        className="flex h-6 w-6 items-center justify-center text-text-muted hover:text-text"
                      >
                        <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(cat)
                          setCategoryDialogOpen(true)
                        }}
                        className="flex h-6 w-6 items-center justify-center text-text-muted hover:text-text"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="flex h-6 w-6 items-center justify-center text-text-muted hover:text-primary">
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Kategorie löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Alle Artikel dieser Kategorie werden ebenfalls gelöscht.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-red-700"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="space-y-2">
            {activeCategory && isAdmin && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingArticle(null)
                    setArticleDialogOpen(true)
                  }}
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Artikel
                </Button>
              </div>
            )}

            {categoryArticles.length === 0 ? (
              <EmptyState
                title="Noch keine Artikel"
                description={isAdmin ? 'Lege den ersten Artikel in dieser Kategorie an.' : 'In dieser Kategorie gibt es noch keine Artikel.'}
              />
            ) : (
              categoryArticles.map((article, index) => {
                const IconComp = resolveIcon(article.icon)
                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.035 }}
                    className="group flex items-center gap-3 rounded-[10px] border border-border bg-bg p-4 transition-[border-color,transform] duration-150 ease-out hover:-translate-y-px hover:border-border-strong"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-border bg-surface">
                      <IconComp className="h-4 w-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <button onClick={() => navigate(`/leitfaden/${article.id}`)} className="min-w-0 flex-1 text-left">
                      <p className="font-display text-[15px] font-bold text-text">{article.title}</p>
                      {article.short_description && (
                        <p className="truncate text-[13px] text-text-sub">{article.short_description}</p>
                      )}
                    </button>
                    {isAdmin && (
                      <div className="hidden items-center gap-0.5 group-hover:flex">
                        <button
                          onClick={() => moveArticle(article.id, -1)}
                          className="flex h-7 w-7 items-center justify-center text-text-muted hover:text-text"
                        >
                          <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => moveArticle(article.id, 1)}
                          className="flex h-7 w-7 items-center justify-center text-text-muted hover:text-text"
                        >
                          <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingArticle(article)
                            setArticleDialogOpen(true)
                          }}
                          className="flex h-7 w-7 items-center justify-center text-text-muted hover:text-text"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="flex h-7 w-7 items-center justify-center text-text-muted hover:text-primary">
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Artikel löschen?</AlertDialogTitle>
                              <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteArticle(article.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-red-700"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.5} />
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      )}

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSave={editingCategory ? (payload) => updateCategory(editingCategory.id, payload) : createCategory}
      />
      <ArticleDialog
        open={articleDialogOpen}
        onOpenChange={setArticleDialogOpen}
        article={editingArticle}
        onSave={handleSaveArticle}
      />
    </div>
  )
}
