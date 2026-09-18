import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { BrandBadge, BRANDS } from '@/components/shared/BrandBadge'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { formatDate } from '@/lib/dateUtils'

export function ProductCard({ product, isAdmin = false, archived = false, onArchive, onRestore, onDelete }) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const mainImage = product.product_images?.[0]?.image_url
  const brandColors = BRANDS[product.brand]

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(product.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card onClick={() => navigate(`/products/${product.id}`)} className="group cursor-pointer overflow-hidden">
      <div className="relative">
        {mainImage ? (
          <img src={mainImage} alt={product.name} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div
            className="flex aspect-[4/3] w-full items-center justify-center"
            style={{ backgroundColor: brandColors?.bg || 'var(--surface-2)' }}
          >
            <Package
              className="h-10 w-10"
              style={{ color: brandColors?.fg || 'var(--text-muted)', opacity: 0.55 }}
              strokeWidth={1.5}
            />
          </div>
        )}

        {isAdmin && (
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            {archived ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRestore(product.id)
                }}
                title="Zurück in Neue Produkte"
                className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-black/60 text-white hover:bg-black/75"
              >
                <ArchiveRestore className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onArchive(product.id)
                }}
                title="Archivieren"
                className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-black/60 text-white hover:bg-black/75"
              >
                <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  title="Löschen"
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-black/60 text-white hover:bg-black/75"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Produkt löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Das Produkt inklusive aller Bilder und Fragen wird endgültig gelöscht. Diese Aktion kann nicht
                    rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-red-700"
                  >
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

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
