import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductImageGrid } from '@/components/products/ProductImageGrid'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/upload'
import { notifyActiveUsers } from '@/lib/notifications'
import { BRANDS } from '@/components/shared/BrandBadge'

export default function ProductNew() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [specs, setSpecs] = useState('')
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!brand) {
      toast({ variant: 'destructive', title: 'Marke fehlt', description: 'Bitte wähle eine Marke aus.' })
      return
    }
    setSubmitting(true)

    try {
      const { data: product, error } = await supabase
        .from('products')
        .insert({ name, brand, description, specs, created_by: user.id })
        .select()
        .single()
      if (error) throw error

      for (let i = 0; i < images.length; i++) {
        const { file } = images[i]
        const ext = file.name.split('.').pop()
        const imageUrl = await uploadFile('product-images', file, `${product.id}/${crypto.randomUUID()}.${ext}`)
        const { error: imgError } = await supabase
          .from('product_images')
          .insert({ product_id: product.id, image_url: imageUrl, sort_order: i })
        if (imgError) throw imgError
      }

      await notifyActiveUsers({
        excludeUserId: user.id,
        type: 'new_product',
        message: `Neues Produkt: ${name}`,
        refId: product.id,
      })

      toast({ title: 'Produkt gespeichert' })
      navigate(`/products/${product.id}`)
    } catch (err) {
      console.error('Produkt konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Produkt konnte nicht gespeichert werden.' })
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5 text-[13px] text-text-muted">
        <Link to="/products" className="hover:text-text">
          Neue Produkte
        </Link>
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="text-text">Produkt anlegen</span>
      </div>

      <Card className="mx-auto max-w-[720px]">
        <CardContent className="space-y-5 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="product-name">Produktname</Label>
              <Input id="product-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-brand">Marke</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger id="product-brand">
                  <SelectValue placeholder="Marke wählen" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BRANDS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-description">Kurzbeschreibung</Label>
              <Textarea
                id="product-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-specs">Technische Daten</Label>
              <Textarea
                id="product-specs"
                rows={10}
                className="font-mono text-[13px]"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
              />
              <p className="text-[12px] text-text-muted">
                Markdown wird unterstützt (Tabellen, Listen, Fettschrift)
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Bilder</Label>
              <ProductImageGrid images={images} onChange={setImages} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Wird gespeichert…' : 'Produkt speichern'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
