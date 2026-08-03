import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const AVATAR_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

function colorForName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initialsFor(firstName, lastName) {
  const a = (firstName || '').trim().charAt(0)
  const b = (lastName || '').trim().charAt(0)
  return `${a}${b}`.toUpperCase() || '?'
}

export function InitialsAvatar({ firstName, lastName, avatarUrl, size = 32, className }) {
  const name = `${firstName || ''} ${lastName || ''}`.trim()
  const initials = initialsFor(firstName, lastName)
  const bg = colorForName(name || 'Albatros')

  return (
    <Avatar className={cn('shrink-0', className)} style={{ width: size, height: size }}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback
        style={{ backgroundColor: bg, fontSize: size * 0.4 }}
        className="text-white"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
