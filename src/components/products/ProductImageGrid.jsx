import { useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const MAX_IMAGES = 6

export function ProductImageGrid({ images, onChange }) {
  const inputRefs = useRef([])

  function handleSelect(index, file) {
    if (!file || !file.type.startsWith('image/')) return
    const next = [...images]
    next[index] = { file, previewUrl: URL.createObjectURL(file) }
    onChange(next)
  }

  function handleRemove(index) {
    const next = [...images]
    next.splice(index, 1)
    onChange(next)
  }

  const cells = Array.from({ length: MAX_IMAGES }, (_, i) => images[i] || null)

  return (
    <div className="grid grid-cols-3 gap-3">
      {cells.map((cell, index) => (
        <div
          key={index}
          onClick={() => !cell && inputRefs.current[index]?.click()}
          className={cn(
            'relative flex aspect-square items-center justify-center overflow-hidden rounded-md border',
            cell ? 'border-border' : 'cursor-pointer border-dashed border-border hover:border-border-strong'
          )}
        >
          {cell ? (
            <>
              <img src={cell.previewUrl} alt="" className="h-full w-full object-cover" />
              {index === 0 && (
                <Badge className="absolute left-1.5 top-1.5 border-transparent bg-primary text-[10px] text-white">
                  Hauptbild
                </Badge>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(index)
                }}
                className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </>
          ) : (
            <ImagePlus className="h-5 w-5 text-text-muted" strokeWidth={1.5} />
          )}
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleSelect(index, e.target.files?.[0])}
          />
        </div>
      ))}
    </div>
  )
}
