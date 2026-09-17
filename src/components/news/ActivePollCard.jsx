import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

/**
 * Zeigt die aktive Umfrage oben im News-Feed. Bleibt nach dem Abstimmen
 * sichtbar und zeigt dann die Ergebnisbalken statt zu verschwinden.
 * Optionen sind auch nach dem Abstimmen weiterhin klickbar (Stimme ändern).
 */
export function ActivePollCard({ poll, votes = [], myVote = null, onVote }) {
  const { toast } = useToast()

  if (!poll) return null

  const options = poll.options || []
  const totalVotes = votes.length
  const hasImages = options.some((o) => o.image_url)

  async function handleVote(optionId) {
    try {
      await onVote?.(optionId)
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Stimme konnte nicht gespeichert werden.' })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <p className="label-micro">Umfrage</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-display text-[17px] font-bold leading-snug text-text">{poll.question}</p>

        {hasImages ? (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` }}
          >
            {options.map((option) => {
              const count = votes.filter((v) => v.option_id === option.id).length
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
              const isMine = myVote?.option_id === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVote(option.id)}
                  className={cn(
                    'group relative overflow-hidden rounded-[10px] border text-left transition-colors duration-150',
                    isMine ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary'
                  )}
                >
                  <div className="relative aspect-square w-full">
                    {option.image_url && (
                      <img
                        src={option.image_url}
                        alt={option.label}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {myVote && (
                      <span className="absolute bottom-1.5 right-1.5 rounded-[4px] bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
                        {pct}% · {count}
                      </span>
                    )}
                  </div>
                  <p className="p-2 text-[13px] font-medium text-text">{option.label}</p>
                </button>
              )
            })}
          </div>
        ) : !myVote ? (
          <div className="space-y-2">
            {options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleVote(option.id)}
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
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVote(option.id)}
                  className="block w-full space-y-1.5 text-left"
                >
                  <div className="flex items-center justify-between text-[13px]">
                    <span className={cn('text-text', isMine && 'font-medium text-primary')}>{option.label}</span>
                    <span className="font-medium text-text-sub">
                      {pct}% · {count} {count === 1 ? 'Stimme' : 'Stimmen'}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-[4px] bg-surface-2">
                    <div
                      className={cn('h-full rounded-[4px]', isMine ? 'bg-primary' : 'bg-text-muted')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="text-[12px] text-text-muted">
            {poll.expires_at ? `Endet am ${formatDate(poll.expires_at)}` : 'Kein Ablaufdatum'}
          </p>
          <Link to={`/polls/${poll.id}`} className="text-[12px] font-medium text-primary hover:underline">
            Details ansehen
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
