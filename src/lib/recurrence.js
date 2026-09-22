/**
 * Berechnet die tatsächlichen (virtuellen) Vorkommen wiederkehrender
 * calendar_events, ohne dass dafür mehrere Datenbank-Zeilen existieren.
 * Wird sowohl vom Firmenkalender als auch vom "Anstehende Termine"-Widget
 * auf der Startseite verwendet, damit beide dieselbe Logik teilen.
 */

const MAX_ITERATIONS = 1000

export function parseDateOnly(dateStr) {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function addMonthsClamped(date, months, dayOfMonth) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDayOfTargetMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(dayOfMonth, lastDayOfTargetMonth))
  return target
}

/**
 * Gibt alle Vorkommen eines einzelnen calendar_event innerhalb von
 * [rangeStart, rangeEnd] (inklusive) als Date-Objekte zurück, unter
 * Berücksichtigung von recurrence ('none' | 'weekly' | 'biweekly' | 'monthly')
 * und recurrence_end_date (unbegrenzt, falls nicht gesetzt).
 */
export function getEventOccurrences(event, rangeStart, rangeEnd) {
  const start = parseDateOnly(event.event_date)
  if (!start) return []

  const recurrence = event.recurrence || 'none'
  if (recurrence === 'none') {
    return start >= rangeStart && start <= rangeEnd ? [start] : []
  }

  const seriesEnd = event.recurrence_end_date ? parseDateOnly(event.recurrence_end_date) : null
  const dayOfMonth = start.getDate()
  const occurrences = []
  let cursor = start
  let iterations = 0

  while (cursor <= rangeEnd && iterations < MAX_ITERATIONS) {
    iterations++
    if (seriesEnd && cursor > seriesEnd) break
    if (cursor >= rangeStart) occurrences.push(cursor)

    if (recurrence === 'weekly') {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7)
    } else if (recurrence === 'biweekly') {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 14)
    } else if (recurrence === 'monthly') {
      cursor = addMonthsClamped(cursor, 1, dayOfMonth)
    } else {
      break
    }
  }

  return occurrences
}

/**
 * Erweitert eine Liste von calendar_events zu ihren tatsächlichen Vorkommen
 * im gegebenen Zeitraum. Jeder Eintrag ist eine Kopie des Ursprungs-Events
 * plus occurrenceDate — es werden keine neuen Datenbank-Zeilen erzeugt.
 */
export function expandEvents(events, rangeStart, rangeEnd) {
  const result = []
  for (const event of events) {
    for (const date of getEventOccurrences(event, rangeStart, rangeEnd)) {
      result.push({ ...event, occurrenceDate: date })
    }
  }
  return result
}
