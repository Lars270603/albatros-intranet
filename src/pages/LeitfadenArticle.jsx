import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, ExternalLink, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileTypeIcon } from '@/components/documents/FileTypeIcon'
import { supabase } from '@/lib/supabase'
import { resolveIcon } from '@/lib/iconMap'

export default function LeitfadenArticle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageUrl, setSelectedImageUrl] = useState(null)

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
          Zurück zu Allgemeine Infos
        </Button>
      </div>
    )
  }

  const HeroIcon = resolveIcon(article.icon)
  const backTo = article.category_id ? `/leitfaden?category=${article.category_id}` : '/leitfaden'

  return (
    <div className="space-y-8">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-[13px] text-text-sub hover:text-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Allgemeine Infos
      </Link>

      {/* 1. Roter Hero-Bereich */}
      <div className="rounded-[10px] bg-primary p-8 text-white">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-white/15">
              <HeroIcon className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-white">
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

      {/* Bildergalerie */}
      {article.images?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {article.images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImageUrl(image.url)}
              className="aspect-[4/3] overflow-hidden rounded-[10px] border border-border"
            >
              <img
                src={image.url}
                alt=""
                className="h-full w-full cursor-pointer object-cover transition-[filter] duration-150 hover:brightness-90"
              />
            </button>
          ))}
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

      {/* 4. Dateianhänge */}
      {article.attachments?.length > 0 && (
        <div className="space-y-3">
          <p className="label-micro">Dateien</p>
          <div className="space-y-1.5">
            {article.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
              >
                <FileTypeIcon fileType={attachment.type} className="h-5 w-5 shrink-0" />
                <span className="flex-1 truncate text-[13px] font-medium text-text">{attachment.name}</span>
                <Button variant="outline" size="sm" onClick={() => window.open(attachment.url, '_blank')}>
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Herunterladen
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bild-Lightbox */}
      <Dialog open={!!selectedImageUrl} onOpenChange={(open) => !open && setSelectedImageUrl(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <img src={selectedImageUrl} alt="" className="max-h-[80vh] w-auto rounded-[10px] object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
