import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper, Package, Pin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { supabase } from '@/lib/supabase'

export function NewsWidget() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const [{ data: posts, error: postsError }, { data: products, error: productsError }] = await Promise.all([
          supabase
            .from('news_posts')
            .select('id, title, pinned, created_at, author:profiles(first_name, last_name)')
            .order('created_at', { ascending: false })
            .limit(4),
          supabase
            .from('products')
            .select('id, name, created_at, creator:profiles(first_name, last_name)')
            .order('created_at', { ascending: false })
            .limit(4),
        ])
        if (postsError) throw postsError
        if (productsError) throw productsError

        const merged = [
          ...(posts || []).map((p) => ({ ...p, _type: 'post' })),
          ...(products || []).map((p) => ({ ...p, _type: 'product' })),
        ]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4)

        if (isMounted) setItems(merged)
      } catch (err) {
        console.error('Neuigkeiten konnten nicht geladen werden:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="label-micro">Neuigkeiten</p>
        <Link to="/news" className="text-[12px] font-medium text-primary hover:underline">
          Alle ansehen →
        </Link>
      </div>

      <div className="mt-3 space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        ) : items.length === 0 ? (
          <p className="text-[13px] text-text-muted">Noch keine Neuigkeiten.</p>
        ) : (
          items.map((item) => {
            const isProduct = item._type === 'product'
            const author = isProduct ? item.creator : item.author
            return (
              <Link
                key={`${item._type}-${item.id}`}
                to={isProduct ? `/products/${item.id}` : '/news'}
                className="flex items-start gap-2.5 border-b border-surface-2 pb-3 last:border-0 last:pb-0"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-surface-2">
                  {isProduct ? (
                    <Package className="h-3.5 w-3.5 text-text-sub" strokeWidth={1.5} />
                  ) : (
                    <Newspaper className="h-3.5 w-3.5 text-text-sub" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {isProduct && (
                      <Badge variant="destructive" className="shrink-0">
                        Neues Produkt
                      </Badge>
                    )}
                    {item.pinned && <Pin className="h-3 w-3 shrink-0 fill-current text-primary" strokeWidth={1.5} />}
                    <p className="truncate text-[13px] font-medium text-text">{item.title || item.name}</p>
                  </div>
                  <p className="text-[12px] text-text-muted">
                    {author?.first_name} {author?.last_name} · <RelativeTime date={item.created_at} className="inline" />
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </Card>
  )
}
