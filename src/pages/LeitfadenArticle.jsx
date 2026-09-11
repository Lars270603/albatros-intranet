import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { supabase } from '@/lib/supabase'
import { resolveIcon } from '@/lib/iconMap'

export default function LeitfadenArticle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('leitfaden_articles').select('*').eq('id', id).single()
        if (error) throw error
        if (isMounted) setArticle(data)
      } catch (err) {
        console.error('Artikel konnte nicht geladen werden:', err)
        if (isMounted) setArticle(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="space-y-6">
        <EmptyState title="Artikel nicht gefunden" description="Dieser Artikel existiert nicht (mehr)." />
        <Button variant="outline" onClick={() => navigate('/leitfaden')}>
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Zurück zum Leitfaden
        </Button>
      </div>
    )
  }

  const HeroIcon = resolveIcon(article.icon)

  return (
    <div className="space-y-8">
      <Link
        to="/leitfaden"
        className="inline-flex items-center gap-1.5 text-[13px] text-text-sub hover:text-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Leitfaden
      </Link>

      {/* 1. Roter Hero-Bereich */}
      <div className="rounded-[10px] bg-primary p-8 text-white">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-white/15">
              <HeroIcon className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.03em]">
                {article.title}
              </h1>
              {article.short_description && (
                <p className="mt-1.5 max-w-xl text-[14px] text-white/85">{article.short_description}</p>
              )}
            </div>
          </div>
          {article.external_link_url && (
            <Button
              asChild
              variant="secondary"
              className="border-transparent bg-white text-primary hover:bg-white/90"
            >
              <a href={article.external_link_url} target="_blank" rel="noopener noreferrer">
                {article.external_link_label || 'Öffnen'}
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Info-Kacheln */}
      {article.info_tiles?.length > 0 && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(article.info_tiles.length, 4)}, minmax(0, 1fr))` }}
        >
          {article.info_tiles.map((tile, index) => {
            const TileIcon = resolveIcon(tile.icon)
            return (
              <div key={index} className="rounded-[10px] border border-border bg-bg p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-border bg-surface">
                  <TileIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                </div>
                <p className="mt-3 font-display text-[15px] font-bold text-text">{tile.title}</p>
                <p className="mt-1 text-[13px] text-text-sub">{tile.text}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. Markdown-Inhalt — nummerierte Listen als Schritt-Kacheln */}
      {article.body && (
        <div className="prose-specs max-w-[70ch]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              ol: ({ children }) => <ol className="leitfaden-steps">{children}</ol>,
              li: ({ children }) => <li className="leitfaden-step">{children}</li>,
            }}
          >
            {article.body}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
