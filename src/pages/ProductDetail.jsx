import { useCallback, useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronRight, Package, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BrandBadge, BRANDS } from '@/components/shared/BrandBadge'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { ProductQA } from '@/components/products/ProductQA'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

export default function ProductDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', brand: '', description: '', specs: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, creator:profiles(*), product_images(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      data.product_images = [...(data.product_images || [])].sort((a, b) => a.sort_order - b.sort_order)
      setProduct(data)
      setForm({ name: data.name, brand: data.brand, description: data.description || '', specs: data.specs || '' })
    } catch (err) {
      console.error('Produkt konnte nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({ name: form.name, brand: form.brand, description: form.description, specs: form.specs })
        .eq('id', id)
      if (error) throw error
      toast({ title: 'Produkt aktualisiert' })
      setEditing(false)
      load()
    } catch (err) {
      console.error('Produkt konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Speichern fehlgeschlagen.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-[14px] text-text-muted">Wird geladen…</div>
  }

  if (!product) {
    return <div className="py-16 text-center text-[14px] text-text-muted">Produkt nicht gefunden.</div>
  }

  const canEdit = profile?.role === 'admin' || product.created_by === profile?.id
  const images = product.product_images
  const mainImage = images[activeImage]?.image_url

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px] text-text-muted">
          <Link to="/products" className="hover:text-text">
            Neue Produkte
          </Link>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="text-text">{product.name}</span>
        </div>
        {canEdit && !editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            Bearbeiten
          </Button>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
            <AnimatePresence mode="wait">
              {mainImage ? (
                <motion.img
                  key={mainImage}
                  src={mainImage}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Package className="h-16 w-16 text-gray-200" strokeWidth={1.5} />
              )}
            </AnimatePresence>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    'h-[60px] w-[60px] shrink-0 overflow-hidden rounded-lg border-2',
                    index === activeImage ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                  )}
                >
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {editing ? (
            <div className="space-y-3">
              <Select value={form.brand} onValueChange={(v) => setForm((f) => ({ ...f, brand: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BRANDS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <Textarea
                rows={10}
                className="font-mono text-[13px]"
                value={form.specs}
                onChange={(e) => setForm((f) => ({ ...f, specs: e.target.value }))}
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Wird gespeichert…' : 'Speichern'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <BrandBadge brand={product.brand} />
                <h1 className="font-display text-[26px] font-extrabold leading-tight text-text">{product.name}</h1>
                {product.description && <p className="text-[15px] text-text-sub">{product.description}</p>}
              </div>

              {product.specs && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-[13px] font-medium uppercase tracking-wide text-text-muted">
                      Technische Daten
                    </p>
                    <div className="prose-specs text-[14px] text-text">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{product.specs}</ReactMarkdown>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-2">
                <InitialsAvatar
                  firstName={product.creator?.first_name}
                  lastName={product.creator?.last_name}
                  avatarUrl={product.creator?.avatar_url}
                  size={28}
                />
                <p className="text-[13px] text-text-muted">
                  Eingestellt von {product.creator?.first_name} {product.creator?.last_name} ·{' '}
                  {formatDate(product.created_at)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <ProductQA productId={product.id} productName={product.name} />
    </div>
  )
}
