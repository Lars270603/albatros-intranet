import { useEffect, useState } from 'react'
import { Mail, Phone, Hash, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { supabase } from '@/lib/supabase'

export default function Team() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('status', 'active')
          .order('first_name', { ascending: true })
        if (error) throw error
        setMembers(data || [])
      } catch (err) {
        console.error('Team konnte nicht geladen werden:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <h1 className="font-display text-[32px] font-extrabold tracking-tight text-text">Team</h1>
        {!loading && <Badge variant="secondary">{members.length} Mitglieder</Badge>}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <SkeletonCard variant="team" />
          <SkeletonCard variant="team" />
          <SkeletonCard variant="team" />
          <SkeletonCard variant="team" />
        </div>
      ) : members.length === 0 ? (
        <EmptyState icon={Users} title="Keine Mitglieder gefunden" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <Card key={member.id} className="hover:border-border-strong">
              <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
                <InitialsAvatar
                  firstName={member.first_name}
                  lastName={member.last_name}
                  avatarUrl={member.avatar_url}
                  size={64}
                  soft
                />
                <p className="font-display text-[16px] font-bold text-text">
                  {member.first_name} {member.last_name}
                </p>
                {member.role === 'admin' && (
                  <Badge className="border-transparent bg-primary text-white">Admin</Badge>
                )}
                <div className="space-y-1 pt-1">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center justify-center gap-1.5 text-[13px] text-text-sub hover:text-primary"
                  >
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {member.email}
                  </a>
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="flex items-center justify-center gap-1.5 text-[13px] text-text-sub hover:text-primary"
                    >
                      <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {member.phone}
                    </a>
                  )}
                  {member.extension && (
                    <p className="flex items-center justify-center gap-1.5 text-[13px] text-text-sub">
                      <Hash className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Durchwahl: {member.extension}
                    </p>
                  )}
                </div>
                {member.bio && (
                  <p className="line-clamp-2 pt-1 text-[13px] italic text-text-muted">{member.bio}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
