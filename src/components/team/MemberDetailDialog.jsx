import { Mail, Phone, Hash, Cake } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'

export function MemberDetailDialog({ member, open, onOpenChange }) {
  if (!member) return null

  const birthdayLabel = member.birthday
    ? new Date(member.birthday).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex items-center gap-4">
          <InitialsAvatar
            firstName={member.first_name}
            lastName={member.last_name}
            avatarUrl={member.avatar_url}
            size={96}
          />
          <div>
            <p className="font-display text-[22px] font-extrabold leading-tight text-text">
              {member.first_name} {member.last_name}
            </p>
            {member.role === 'admin' && (
              <Badge className="mt-1.5 border-transparent bg-primary text-white">Admin</Badge>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <a
            href={`mailto:${member.email}`}
            className="flex items-center gap-2 text-[14px] text-text-sub hover:text-primary"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            {member.email}
          </a>
          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              className="flex items-center gap-2 text-[14px] text-text-sub hover:text-primary"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              {member.phone}
            </a>
          )}
          {member.extension && (
            <p className="flex items-center gap-2 text-[14px] text-text-sub">
              <Hash className="h-4 w-4" strokeWidth={1.5} />
              Durchwahl: {member.extension}
            </p>
          )}
          {birthdayLabel && (
            <p className="flex items-center gap-2 text-[14px] text-text-sub">
              <Cake className="h-4 w-4" strokeWidth={1.5} />
              Geburtstag: {birthdayLabel}
            </p>
          )}
        </div>

        {member.bio && (
          <div className="space-y-1.5 border-t border-border pt-4">
            <p className="label-micro">Über mich</p>
            <p className="text-[14px] leading-relaxed text-text">{member.bio}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
