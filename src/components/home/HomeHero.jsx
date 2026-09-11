import { motion } from 'motion/react'

function greetingForHour(hour) {
  if (hour < 12) return 'Guten Morgen'
  if (hour < 18) return 'Guten Tag'
  return 'Guten Abend'
}

export function HomeHero({ firstName }) {
  const now = new Date()
  const greeting = greetingForHour(now.getHours())
  const dateLabel = now.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[10px] bg-primary px-8 py-10 text-white"
    >
      {/* Dekorative, halbtransparente Kreise für Tiefe */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -left-10 -bottom-16 h-40 w-40 rounded-full bg-white/5" />

      <div className="relative">
        <p className="text-[13px] text-white/75">{dateLabel}</p>
        <h1 className="mt-1 font-display text-[32px] font-extrabold leading-tight tracking-[-0.04em]">
          Willkommen im Albatros Intranet
        </h1>
        <p className="mt-2 text-[15px] text-white/90">
          {greeting}{firstName ? `, ${firstName}` : ''} — schön, dass du da bist.
        </p>
      </div>
    </motion.div>
  )
}
