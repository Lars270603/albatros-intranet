import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

/**
 * Zeigt die aktive Umfrage oben im News-Feed. Bleibt nach dem Abstimmen
 * sichtbar und zeigt dann die Ergebnisbalken statt zu verschwinden.
 */
export function ActivePollCard({ poll, votes = [], myVote = null, onVote }) {
  const { toast } = useToast()

  if (!poll) return null

  const options = poll.options || []
  const totalVotes = votes.length

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

        {!myVote ? (
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
                <div key={option.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-text">{option.label}</span>
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
                </div>
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
