const RELATIVE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Gibt einen relativen Zeitstempel zurück ("vor 2 Stunden", "gestern"),
 * für ältere Daten (> 7 Tage) ein absolutes Datum in de-DE Locale.
 */
export function formatRelativeTime(dateInput) {
  const date = new Date(dateInput)
  const now = new Date()
  const diffMs = now - date

  if (diffMs > RELATIVE_THRESHOLD_MS || diffMs < 0) {
    return formatDate(date)
  }

  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'gerade eben'
  if (diffMin < 60) return `vor ${diffMin} ${diffMin === 1 ? 'Minute' : 'Minuten'}`
  if (diffHour < 24) return `vor ${diffHour} ${diffHour === 1 ? 'Stunde' : 'Stunden'}`
  if (diffDay === 1) return 'gestern'
  return `vor ${diffDay} Tagen`
}

export function formatDate(dateInput) {
  return new Date(dateInput).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(dateInput) {
  return new Date(dateInput).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Anzahl Tage bis zu einem zukünftigen Datum (aufgerundet, min. 0).
 */
export function daysUntil(dateInput) {
  const target = new Date(dateInput)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)))
}

/**
 * Nächster Geburtstag (Tag/Monat) ausgehend von einem gespeicherten Datum.
 * Gibt null zurück wenn kein Geburtstag gesetzt ist.
 */
export function nextBirthday(birthday) {
  if (!birthday) return null
  const b = new Date(birthday)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  let next = new Date(now.getFullYear(), b.getMonth(), b.getDate())
  if (next < now) {
    next = new Date(now.getFullYear() + 1, b.getMonth(), b.getDate())
  }
  return next
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
