import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BrandBadge } from '@/components/shared/BrandBadge'
import { useProductsFeed } from '@/hooks/useProductsFeed'

export function ProductsWidget() {
  const { products, loading } = useProductsFeed()

  if (loading || products.length === 0) return null

  const recent = products.slice(0, 4)

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted">Neue Produkte</p>
      </CardHeader>
      <CardContent className="space-y-1">
        {recent.map((product) => {
          const thumb = product.product_images?.[0]?.image_url
          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="flex items-center gap-3 rounded-md p-2 -mx-2 transition-colors hover:bg-surface"
            >
              {thumb ? (
                <img src={thumb} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-2">
                  <Package className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-text">{product.name}</p>
                <BrandBadge brand={product.brand} />
              </div>
            </Link>
          )
        })}

        <Link
          to="/products"
          className="block pt-2 text-[13px] font-medium text-primary hover:underline"
        >
          Alle Produkte →
        </Link>
      </CardContent>
    </Card>
  )
}
