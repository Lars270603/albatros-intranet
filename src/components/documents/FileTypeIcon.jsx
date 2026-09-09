import { FileText, Table, Presentation, Image, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

const CONFIG = {
  pdf: { icon: FileText, className: 'text-primary' },
  xlsx: { icon: Table, className: 'text-success' },
  docx: { icon: FileText, className: 'text-info' },
  pptx: { icon: Presentation, className: 'text-warning' },
  png: { icon: Image, className: 'text-violet' },
  jpg: { icon: Image, className: 'text-violet' },
  jpeg: { icon: Image, className: 'text-violet' },
}

export function FileTypeIcon({ fileType, className }) {
  const config = CONFIG[fileType?.toLowerCase()] || { icon: Archive, className: 'text-text-muted' }
  const Icon = config.icon
  return <Icon className={cn(config.className, className)} strokeWidth={1.5} />
}
