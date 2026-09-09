import { useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { BrandBadge } from '@/components/shared/BrandBadge'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { formatDate } from '@/lib/dateUtils'

export function ProductCard({ product }) {
  const navigate = useNavigate()
  const mainImage = product.product_images?.[0]?.image_url

  return (
    <Card onClick={() => navigate(`/products/${product.id}`)} className="cursor-pointer overflow-hidden">
      {mainImage ? (
        <img src={mainImage} alt={product.name} className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-surface-2">
          <Package className="h-12 w-12 text-text-muted" strokeWidth={1.5} />
        </div>
      )}

      <div className="space-y-1.5 p-4">
        <BrandBadge brand={product.brand} />
        <h3 className="font-display text-[15px] font-bold leading-snug text-text">{product.name}</h3>
        <p className="text-[12px] text-text-muted">Eingestellt am {formatDate(product.created_at)}</p>
        <div className="flex items-center gap-2 pt-1">
          <InitialsAvatar
            firstName={product.creator?.first_name}
            lastName={product.creator?.last_name}
            avatarUrl={product.creator?.avatar_url}
            size={20}
          />
          <span className="text-[13px] text-text-sub">
            {product.creator?.first_name} {product.creator?.last_name}
          </span>
        </div>
      </div>
    </Card>
  )
}
