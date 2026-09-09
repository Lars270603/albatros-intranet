import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
  'var(--avatar-1)',
  'var(--avatar-2)',
  'var(--avatar-3)',
  'var(--avatar-4)',
  'var(--avatar-5)',
  'var(--avatar-6)',
]

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
        style={{ background: bg, fontSize: size * 0.4 }}
        className="text-white"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
