import { NavLink } from 'react-router-dom'
import { Home, Newspaper, Archive, Package, BookOpen, Phone, Lightbulb, Users, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { DEPARTMENTS } from '@/components/shared/DepartmentBadge'
import { cn } from '@/lib/utils'
import albatrosLogo from '@/assets/albatros-logo.png'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/documents', label: 'Archiv', icon: Archive },
  { to: '/products', label: 'Neue Produkte', icon: Package },
  { to: '/onboarding', label: 'Onboarding', icon: BookOpen },
  { to: '/contacts', label: 'Kontakte', icon: Phone },
  { to: '/ideas', label: 'Ideen', icon: Lightbulb },
  { to: '/team', label: 'Team', icon: Users },
]

export function Sidebar({ onNavigate }) {
  const { profile } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (profile?.role !== 'admin') return

    async function loadPendingCount() {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (error) throw error
        setPendingCount(count || 0)
      } catch (err) {
        console.error('Anzahl ausstehender Anfragen konnte nicht geladen werden:', err)
      }
    }

    loadPendingCount()
  }, [profile?.role])

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src={albatrosLogo} alt="Albatros" className="h-10 w-10 shrink-0 rounded-md" />
        <span className="font-display text-[15px] font-bold text-text">Albatros Intranet</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-[14px] font-normal text-text-sub transition-colors',
                isActive
                  ? 'border-primary bg-primary-light font-medium text-primary'
                  : 'hover:bg-surface-2 hover:text-text'
              )
            }
          >
            <item.icon className="h-5 w-5" strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}

        {profile?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-[14px] font-normal text-text-sub transition-colors',
                isActive
                  ? 'border-primary bg-primary-light font-medium text-primary'
                  : 'hover:bg-surface-2 hover:text-text'
              )
            }
          >
            <Settings className="h-5 w-5" strokeWidth={1.5} />
            Admin
            {pendingCount > 0 && (
              <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-medium text-white">
                {pendingCount}
              </span>
            )}
          </NavLink>
        )}
      </nav>

      <div className="flex items-center gap-3 border-t border-border px-4 py-4">
        <NotificationDropdown />
        <NavLink to="/profile" onClick={onNavigate} className="flex flex-1 items-center gap-2 overflow-hidden">
          <InitialsAvatar
            firstName={profile?.first_name}
            lastName={profile?.last_name}
            avatarUrl={profile?.avatar_url}
            size={32}
          />
          <div className="flex-1 overflow-hidden text-left">
            <p className="truncate text-[13px] font-medium text-text">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="truncate text-[12px] text-text-muted">
              {DEPARTMENTS[profile?.department]?.label || ''}
            </p>
          </div>
        </NavLink>
      </div>
    </div>
  )
}
