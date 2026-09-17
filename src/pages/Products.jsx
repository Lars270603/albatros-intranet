import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProductCard } from '@/components/products/ProductCard'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { canCreateProducts } from '@/lib/permissions'

export default function Products() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, creator:profiles(*), product_images(*)')
          .order('created_at', { ascending: false })
        if (error) throw error
        const withSortedImages = (data || []).map((p) => ({
          ...p,
          product_images: [...(p.product_images || [])].sort((a, b) => a.sort_order - b.sort_order),
        }))
        setProducts(withSortedImages)
      } catch (err) {
        console.error('Produkte konnten nicht geladen werden:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const canCreate = canCreateProducts(profile)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[32px] font-extrabold tracking-[-0.04em] text-text">Neue Produkte</h1>
        {canCreate && (
          <Button onClick={() => navigate('/products/new')}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Produkt anlegen
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard variant="product" />
          <SkeletonCard variant="product" />
          <SkeletonCard variant="product" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Keine Produkte gefunden"
          description={canCreate ? 'Lege das erste Produkt an.' : 'Schau später noch einmal vorbei.'}
          actionLabel={canCreate ? 'Produkt anlegen' : undefined}
          onAction={canCreate ? () => navigate('/products/new') : undefined}
        />
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: Math.min(index * 0.035, 0.35) }}
              className="mb-5 break-inside-avoid"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
