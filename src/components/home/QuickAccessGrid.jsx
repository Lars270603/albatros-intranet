import { Link } from 'react-router-dom'
import { Newspaper, Users, Archive, Package, Compass, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const TILES = [
  { to: '/news', label: 'News', icon: Newspaper, bg: 'var(--info-light)', fg: 'var(--info)' },
  { to: '/team', label: 'Team', icon: Users, bg: 'var(--success-light)', fg: 'var(--success)' },
  { to: '/documents', label: 'Archiv', icon: Archive, bg: 'var(--warning-light)', fg: 'var(--warning)' },
  { to: '/products', label: 'Neue Produkte', icon: Package, bg: 'var(--violet-light)', fg: 'var(--violet)' },
  { to: '/leitfaden', label: 'Leitfaden', icon: Compass, bg: 'var(--accent-light)', fg: 'var(--accent)' },
]

export function QuickAccessGrid() {
  const { profile } = useAuth()
  const tiles = profile?.role === 'admin'
    ? [...TILES, { to: '/admin', label: 'Admin', icon: Settings, bg: 'var(--surface-2)', fg: 'var(--text-sub)' }]
    : TILES

  return (
    <div>
      <p className="label-micro">Schnellzugriff</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="flex flex-col items-start gap-3 rounded-[10px] border border-border bg-bg p-4 transition-[border-color,transform] duration-150 ease-out hover:-translate-y-px hover:border-border-strong"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[7px]"
              style={{ backgroundColor: tile.bg }}
            >
              <tile.icon className="h-[18px] w-[18px]" style={{ color: tile.fg }} strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-medium text-text">{tile.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
