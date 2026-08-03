import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { BrandBadge } from '@/components/shared/BrandBadge'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { formatDate } from '@/lib/dateUtils'

export function ProductCard({ product }) {
  const navigate = useNavigate()
  const mainImage = product.product_images?.[0]?.image_url

  return (
    <Card
      onClick={() => navigate(`/products/${product.id}`)}
      className="cursor-pointer overflow-hidden"
    >
      {mainImage ? (
        <img src={mainImage} alt={product.name} className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="relative aspect-[4/3] w-full">
          <img
            src={`https://picsum.photos/seed/${product.id}/400/300?grayscale`}
            alt=""
            className="h-full w-full object-cover"
          />
          <BrandBadge brand={product.brand} className="absolute left-2 top-2" />
        </div>
      )}

      <div className="space-y-2 p-4">
        {mainImage && <BrandBadge brand={product.brand} />}
        <h3 className="font-display text-[15px] font-bold text-text">{product.name}</h3>
        <p className="text-[13px] text-text-muted">Eingestellt am {formatDate(product.created_at)}</p>
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
