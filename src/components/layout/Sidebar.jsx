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

const NAV_ITEM_CLASS = ({ isActive }) =>
  cn(
    'flex h-9 items-center gap-2.5 border-l-2 px-3 text-[13px] transition-colors duration-150',
    isActive ? 'border-primary font-bold text-text' : 'border-transparent font-normal text-text-muted hover:text-text'
  )

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
      <div className="flex h-12 items-center gap-2 px-4">
        <img src={albatrosLogo} alt="Albatros" className="h-7 w-7 shrink-0 rounded-[6px]" />
        <span className="font-display text-[13px] font-bold tracking-[-0.01em] text-text">Albatros Intranet</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 pt-2">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={NAV_ITEM_CLASS}>
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}

        {profile?.role === 'admin' && (
          <NavLink to="/admin" onClick={onNavigate} className={NAV_ITEM_CLASS}>
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Admin
            {pendingCount > 0 && (
              <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] bg-primary px-1 text-[10px] font-medium text-white">
                {pendingCount}
              </span>
            )}
          </NavLink>
        )}
      </nav>

      <div className="flex items-center gap-2 border-t border-border px-3 py-3">
        <NotificationDropdown />
        <NavLink to="/profile" onClick={onNavigate} className="flex flex-1 items-center gap-2 overflow-hidden">
          <InitialsAvatar
            firstName={profile?.first_name}
            lastName={profile?.last_name}
            avatarUrl={profile?.avatar_url}
            size={28}
          />
          <p className="flex-1 truncate text-[12px] text-text-sub">
            <span className="font-medium text-text">{profile?.first_name} {profile?.last_name}</span>
            {' · '}
            {DEPARTMENTS[profile?.department]?.label || ''}
          </p>
        </NavLink>
      </div>
    </div>
  )
}
