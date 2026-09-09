import { motion } from 'motion/react'
import { useHomeStats } from '@/hooks/useHomeStats'
import { cn } from '@/lib/utils'

function greetingForHour(hour) {
  if (hour < 12) return 'Guten Morgen'
  if (hour < 18) return 'Guten Tag'
  return 'Guten Abend'
}

const STAT_CARDS = [
  { key: 'activeEmployees', label: 'Aktive Mitarbeiter' },
  { key: 'products', label: 'Produkte' },
  { key: 'openIdeas', label: 'Offene Ideen' },
]

export function HomeHeader({ firstName }) {
  const { stats } = useHomeStats()
  const now = new Date()
  const greeting = greetingForHour(now.getHours())
  const dateLabel = now.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex flex-col items-start gap-10 md:flex-row md:items-end">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      >
        <h1 className="font-display text-[40px] font-extrabold leading-tight tracking-[-0.03em] text-text">
          {greeting}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="mt-1 text-[15px] text-text-sub">{dateLabel}</p>
      </motion.div>

      <div className="flex items-stretch">
        {STAT_CARDS.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut', delay: index * 0.04 }}
            className={cn('px-6', index > 0 && 'border-l border-border')}
          >
            <p className="font-display text-[30px] font-extrabold leading-none tracking-[-0.02em] text-text tabular-nums">
              {stats[stat.key]}
            </p>
            <p className="label-micro mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
