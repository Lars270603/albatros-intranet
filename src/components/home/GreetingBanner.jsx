function greetingForHour(hour) {
  if (hour < 12) return 'Guten Morgen'
  if (hour < 18) return 'Guten Tag'
  return 'Guten Abend'
}

export function GreetingBanner({ firstName }) {
  const now = new Date()
  const greeting = greetingForHour(now.getHours())
  const dateLabel = now.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex h-40 overflow-hidden rounded-xl border border-border">
      <div className="flex flex-1 flex-col justify-center px-8">
        <h1 className="font-display text-[26px] font-extrabold leading-tight text-text">
          {greeting}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="mt-1 text-[13px] text-text-muted">{dateLabel}</p>
      </div>
      <div className="relative hidden w-[35%] shrink-0 sm:block">
        <img
          src="https://picsum.photos/800/320"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/[0.08]" />
      </div>
    </div>
  )
}
