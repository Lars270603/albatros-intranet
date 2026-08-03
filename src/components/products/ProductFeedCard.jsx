import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BrandBadge } from '@/components/shared/BrandBadge'
import { formatDate } from '@/lib/dateUtils'

export function ProductFeedCard({ product }) {
  const mainImage = product.product_images?.[0]?.image_url

  return (
    <Card className="overflow-hidden">
      <div className="space-y-3 p-5 pb-4">
        <Badge className="border-transparent bg-primary text-white">Neues Produkt</Badge>
        <div className="space-y-1.5">
          <BrandBadge brand={product.brand} />
          <h3 className="font-display text-[19px] font-bold text-text">{product.name}</h3>
        </div>
        {product.description && (
          <p className="line-clamp-2 text-[15px] text-text-sub">{product.description}</p>
        )}
      </div>

      {mainImage && (
        <img
          src={mainImage}
          alt={product.name}
          className="max-h-[280px] w-full object-cover"
        />
      )}

      <div className="flex items-center justify-between p-5 pt-4">
        <p className="text-[13px] text-text-muted">
          Von {product.creator?.first_name} {product.creator?.last_name} · {formatDate(product.created_at)}
        </p>
        <Link
          to={`/products/${product.id}`}
          className="text-[13px] font-medium text-primary hover:underline"
        >
          Zum Produkt →
        </Link>
      </div>
    </Card>
  )
}
