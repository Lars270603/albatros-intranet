import { Link } from 'react-router-dom'
import { Check, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

/**
 * Zeigt eine aktive Umfrage oben im News-Feed. Bleibt nach dem Abstimmen
 * sichtbar und zeigt dann die Ergebnisbalken statt zu verschwinden.
 * Bei Mehrfachauswahl-Umfragen (poll.multiple_choice) sind alle Optionen
 * jederzeit als Toggle klickbar, mehrere gleichzeitig aktiv.
 */
export function ActivePollCard({ poll, votes = [], myVotes = [], onVote, isAdmin = false, onEdit }) {
  const { toast } = useToast()

  if (!poll) return null

  const options = poll.options || []
  const totalVotes = votes.length
  const hasImages = options.some((o) => o.image_url)
  const multiple = Boolean(poll.multiple_choice)
  const hasVoted = myVotes.length > 0
  const showResults = multiple || hasVoted
  const isSelected = (optionId) => myVotes.some((v) => v.option_id === optionId)

  async function handleVote(optionId) {
    try {
      await onVote?.(optionId)
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Stimme konnte nicht gespeichert werden.' })
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <p className="label-micro">Umfrage{multiple ? ' · Mehrfachauswahl' : ''}</p>
        {isAdmin && onEdit && (
          <button
            onClick={() => onEdit(poll)}
            title="Umfrage bearbeiten"
            className="text-text-muted hover:text-text"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-display text-[17px] font-bold leading-snug text-text">{poll.question}</p>
          {multiple && poll.max_choices > 1 && (
            <p className="mt-1 text-[12px] text-text-muted">
              Wähle bis zu {poll.max_choices} Optionen
              {hasVoted && (
                <span className="font-medium text-primary">
                  {' '}
                  · Du hast noch {Math.max(poll.max_choices - myVotes.length, 0)} von {poll.max_choices} Stimmen übrig
                </span>
              )}
            </p>
          )}
        </div>

        {hasImages ? (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` }}
          >
            {options.map((option) => {
              const count = votes.filter((v) => v.option_id === option.id).length
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
              const selected = isSelected(option.id)
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVote(option.id)}
                  className={cn(
                    'group relative overflow-hidden rounded-[10px] border text-left transition-colors duration-150',
                    selected ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary'
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
                    {selected && (
                      <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                    )}
                    {showResults && (
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
        ) : !showResults ? (
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
              const selected = isSelected(option.id)
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVote(option.id)}
                  className="block w-full space-y-1.5 text-left"
                >
                  <div className="flex items-center justify-between text-[13px]">
                    <span className={cn('flex items-center gap-1.5 text-text', selected && 'font-medium text-primary')}>
                      {multiple && (
                        <span
                          className={cn(
                            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border',
                            selected ? 'border-primary bg-primary text-white' : 'border-border-strong'
                          )}
                        >
                          {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                        </span>
                      )}
                      {option.label}
                    </span>
                    <span className="font-medium text-text-sub">
                      {pct}% · {count} {count === 1 ? 'Stimme' : 'Stimmen'}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-[4px] bg-surface-2">
                    <div
                      className={cn('h-full rounded-[4px]', selected ? 'bg-primary' : 'bg-text-muted')}
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
