import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useActivePoll } from '@/hooks/usePoll'
import { useAuth } from '@/hooks/useAuth'
import { daysUntil } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

export function PollWidget() {
  const { profile } = useAuth()
  const scopes = useMemo(
    () => (profile ? ['general', profile.department] : ['general']),
    [profile]
  )
  const { poll, votes, myVote, loading, castVote } = useActivePoll(scopes)

  if (loading || !poll) return null

  const options = poll.options || []
  const totalVotes = votes.length

  return (
    <Card>
      <CardHeader className="pb-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted">Umfrage</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-display text-[16px] font-bold leading-snug text-text">{poll.question}</p>

        {!myVote ? (
          <div className="space-y-2">
            {options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => castVote(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option) => {
              const count = votes.filter((v) => v.option_id === option.id).length
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
              const isMine = myVote.option_id === option.id
              return (
                <div key={option.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-text">{option.label}</span>
                    <span className="font-medium text-text-sub">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn('h-full rounded-full', isMine ? 'bg-primary' : 'bg-border-strong')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {poll.expires_at ? (
            <p className="text-[12px] text-text-muted">Endet in {daysUntil(poll.expires_at)} Tagen</p>
          ) : (
            <span />
          )}
          <Link to={`/polls/${poll.id}`} className="text-[12px] font-medium text-primary hover:underline">
            Details
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
