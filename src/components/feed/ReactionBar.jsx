import { cn } from '@/lib/utils'
import { EMOJIS } from '@/hooks/usePosts'

export function ReactionBar({ postId, reactions, onToggle }) {
  return (
    <div className="flex items-center gap-1.5">
      {EMOJIS.map((emoji) => {
        const state = reactions?.[emoji] || { count: 0, reacted: false }
        return (
          <button
            key={emoji}
            onClick={() => onToggle(postId, emoji)}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[13px] transition-colors',
              state.reacted
                ? 'border-primary-light bg-primary-light text-primary'
                : 'border-border text-text-sub hover:bg-surface'
            )}
          >
            <span>{emoji}</span>
            {state.count > 0 && <span className="font-medium">{state.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
