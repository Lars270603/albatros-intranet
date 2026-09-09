import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProductCard } from '@/components/products/ProductCard'
import { BRANDS } from '@/components/shared/BrandBadge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { canCreateProducts } from '@/lib/permissions'
import { cn } from '@/lib/utils'

export default function Products() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBrand, setActiveBrand] = useState('all')

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

  const filtered = useMemo(
    () => (activeBrand === 'all' ? products : products.filter((p) => p.brand === activeBrand)),
    [products, activeBrand]
  )

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

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveBrand('all')}
          className={cn(
            'rounded-sm px-3 py-1 text-[13px] font-medium transition-colors',
            activeBrand === 'all' ? 'bg-primary text-white' : 'bg-surface-2 text-text-sub hover:bg-surface'
          )}
        >
          Alle
        </button>
        {Object.entries(BRANDS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveBrand(key)}
            className="rounded-sm px-3 py-1 text-[13px] font-medium transition-colors"
            style={
              activeBrand === key
                ? { backgroundColor: config.fg, color: '#fff' }
                : { backgroundColor: config.bg, color: config.fg }
            }
          >
            {config.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard variant="product" />
          <SkeletonCard variant="product" />
          <SkeletonCard variant="product" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Keine Produkte gefunden"
          description={canCreate ? 'Lege das erste Produkt an.' : 'Schau später noch einmal vorbei.'}
          actionLabel={canCreate ? 'Produkt anlegen' : undefined}
          onAction={canCreate ? () => navigate('/products/new') : undefined}
        />
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {filtered.map((product, index) => (
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
