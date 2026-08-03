import { FileText, Table, Presentation, Image, Archive } from 'lucide-react'

const CONFIG = {
  pdf: { icon: FileText, color: '#DC2626' },
  xlsx: { icon: Table, color: '#16A34A' },
  docx: { icon: FileText, color: '#2563EB' },
  pptx: { icon: Presentation, color: '#D97706' },
  png: { icon: Image, color: '#7C3AED' },
  jpg: { icon: Image, color: '#7C3AED' },
  jpeg: { icon: Image, color: '#7C3AED' },
}

export function FileTypeIcon({ fileType, className }) {
  const config = CONFIG[fileType?.toLowerCase()] || { icon: Archive, color: '#9CA3AF' }
  const Icon = config.icon
  return <Icon className={className} style={{ color: config.color }} strokeWidth={1.5} />
}
