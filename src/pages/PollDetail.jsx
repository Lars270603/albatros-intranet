import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Lock, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { usePollById } from '@/hooks/usePollById'
import { formatDate, formatDateTime, daysUntil } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

const MAX_AVATARS = 5

export default function PollDetail() {
  const { id } = useParams()
  const { poll, votes, myVote, loading, castVote } = usePollById(id)
  const [selected, setSelected] = useState(null)

  if (loading) {
    return <div className="py-16 text-center text-[14px] text-text-muted">Wird geladen…</div>
  }

  if (!poll) {
    return <div className="py-16 text-center text-[14px] text-text-muted">Umfrage nicht gefunden.</div>
  }

  const options = poll.options || []
  const totalVotes = votes.length

  async function handleVote() {
    if (!selected) return
    await castVote(selected)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {poll.is_anonymous ? (
            <Badge className="border-transparent bg-surface-2 text-text-sub">
              <Lock className="mr-1 h-3 w-3" strokeWidth={1.5} />
              Anonyme Abstimmung
            </Badge>
          ) : (
            <Badge className="border-transparent bg-surface-2 text-text-sub">
              <Eye className="mr-1 h-3 w-3" strokeWidth={1.5} />
              Öffentliche Abstimmung
            </Badge>
          )}
        </div>
        <h1 className="font-display text-[26px] font-extrabold leading-tight text-text">{poll.question}</h1>
        <p className="text-[13px] text-text-muted">
          Erstellt von {poll.creator?.first_name} {poll.creator?.last_name} · {formatDate(poll.created_at)}
        </p>
      </div>

      {!myVote ? (
        <div className="space-y-3">
          {options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              onClick={() => setSelected(option.id)}
              className={cn(
                'w-full justify-start',
                selected === option.id && 'border-primary bg-primary-light text-primary'
              )}
            >
              {option.label}
            </Button>
          ))}
          <Button onClick={handleVote} disabled={!selected} className="w-full">
            Abstimmen
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {options.map((option) => {
            const optionVotes = votes.filter((v) => v.option_id === option.id)
            const count = optionVotes.length
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
            const isMine = myVote.option_id === option.id

            return (
              <div key={option.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="font-medium text-text">
                    {option.label}
                    {isMine && <span className="ml-2 text-[12px] font-medium text-primary">Deine Stimme</span>}
                  </span>
                  <span className="text-text-sub">
                    {pct}% · {count} {count === 1 ? 'Stimme' : 'Stimmen'}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-[4px] bg-surface-2">
                  <div
                    className={cn('h-full rounded-[4px]', isMine ? 'bg-primary' : 'bg-border-strong')}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {!poll.is_anonymous && optionVotes.length > 0 && (
                  <div className="flex items-center gap-1 pt-1">
                    {optionVotes.slice(0, MAX_AVATARS).map((v) => (
                      <Popover key={v.id}>
                        <PopoverTrigger asChild>
                          <button>
                            <InitialsAvatar
                              firstName={v.voter?.first_name}
                              lastName={v.voter?.last_name}
                              avatarUrl={v.voter?.avatar_url}
                              size={24}
                            />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <div className="flex items-center gap-2">
                            <InitialsAvatar
                              firstName={v.voter?.first_name}
                              lastName={v.voter?.last_name}
                              avatarUrl={v.voter?.avatar_url}
                              size={28}
                            />
                            <div>
                              <p className="text-[13px] font-medium text-text">
                                {v.voter?.first_name} {v.voter?.last_name}
                              </p>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                    {optionVotes.length > MAX_AVATARS && (
                      <span className="ml-1 text-[12px] text-text-muted">
                        +{optionVotes.length - MAX_AVATARS} weitere
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {poll.expires_at && (
        <p className="text-[13px] text-text-muted">Endet in {daysUntil(poll.expires_at)} Tagen</p>
      )}

      {!poll.is_anonymous && votes.length > 0 && (
        <div className="space-y-3 pt-4">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted">Gesamtübersicht</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gewählte Option</TableHead>
                <TableHead>Abgestimmt am</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {votes.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium text-text">
                    {v.voter?.first_name} {v.voter?.last_name}
                  </TableCell>
                  <TableCell>{options.find((o) => o.id === v.option_id)?.label}</TableCell>
                  <TableCell>{formatDateTime(v.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
