import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { useHomeStats } from '@/hooks/useHomeStats'

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
    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <h1 className="font-display text-[40px] font-extrabold leading-tight tracking-[-0.03em] text-text">
          {greeting}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="mt-1 text-[15px] text-text-sub">{dateLabel}</p>
      </motion.div>

      <div className="flex gap-4">
        {STAT_CARDS.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut', delay: index * 0.06 }}
          >
            <Card className="w-[120px] px-5 py-4">
              <p className="font-display text-[32px] font-extrabold leading-none text-text">
                {stats[stat.key]}
              </p>
              <p className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted">
                {stat.label}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
