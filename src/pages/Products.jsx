import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProductCard } from '@/components/products/ProductCard'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { canCreateProducts } from '@/lib/permissions'

export default function Products() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const isAdmin = profile?.role === 'admin'

  const [tab, setTab] = useState('active')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const showArchived = isAdmin && tab === 'archived'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, creator:profiles(*), product_images(*)')
        .eq('archived', showArchived)
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
  }, [showArchived])

  useEffect(() => {
    load()
  }, [load])

  async function handleArchive(id) {
    if (!id) {
      console.error('handleArchive: keine Produkt-ID übergeben')
      return
    }
    try {
      const { data, error } = await supabase.from('products').update({ archived: true }).eq('id', id).select('id')
      if (error) throw error
      if (!data || data.length !== 1) {
        console.error('Archivieren: unerwartete Anzahl betroffener Zeilen:', data)
        throw new Error('Unerwartete Anzahl betroffener Zeilen')
      }
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast({ title: 'Produkt archiviert' })
    } catch (err) {
      console.error('Produkt konnte nicht archiviert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion fehlgeschlagen.' })
    }
  }

  async function handleRestore(id) {
    if (!id) {
      console.error('handleRestore: keine Produkt-ID übergeben')
      return
    }
    try {
      const { data, error } = await supabase.from('products').update({ archived: false }).eq('id', id).select('id')
      if (error) throw error
      if (!data || data.length !== 1) {
        console.error('Wiederherstellen: unerwartete Anzahl betroffener Zeilen:', data)
        throw new Error('Unerwartete Anzahl betroffener Zeilen')
      }
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast({ title: 'Produkt wiederhergestellt' })
    } catch (err) {
      console.error('Produkt konnte nicht wiederhergestellt werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion fehlgeschlagen.' })
    }
  }

  async function handleDelete(id) {
    if (!id) {
      console.error('handleDelete: keine Produkt-ID übergeben')
      return
    }
    try {
      const { data, error } = await supabase.from('products').delete().eq('id', id).select('id')
      if (error) throw error
      if (!data || data.length !== 1 || data[0].id !== id) {
        console.error('Löschen: unerwartete Anzahl betroffener Zeilen:', data)
        throw new Error('Unerwartete Anzahl betroffener Zeilen')
      }
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast({ title: 'Produkt gelöscht' })
    } catch (err) {
      console.error('Produkt konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

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

      {isAdmin && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="active">Aktuell</TabsTrigger>
            <TabsTrigger value="archived">Archiviert</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard variant="product" />
          <SkeletonCard variant="product" />
          <SkeletonCard variant="product" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={showArchived ? 'Keine archivierten Produkte' : 'Keine Produkte gefunden'}
          description={
            showArchived
              ? 'Archivierte Produkte erscheinen hier.'
              : canCreate
                ? 'Lege das erste Produkt an.'
                : 'Schau später noch einmal vorbei.'
          }
          actionLabel={!showArchived && canCreate ? 'Produkt anlegen' : undefined}
          onAction={!showArchived && canCreate ? () => navigate('/products/new') : undefined}
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
              <ProductCard
                product={product}
                isAdmin={isAdmin}
                archived={showArchived}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
