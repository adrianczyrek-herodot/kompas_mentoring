// Pure date helpers for the week calendar. `weekStart` is a plain `YYYY-MM-DD` Monday in the
// mentor's zone; sessions/exceptions are ISO instants mapped into that zone for grouping.

/** `YYYY-MM-DD` + n days, calendar-safe (UTC arithmetic on a date-only string). */
function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The seven `YYYY-MM-DD` dates of the week starting at `weekStart` (Monday). */
export function weekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

/** Midday UTC instant for a plain date — formats to the same calendar day in every zone. */
export function noonInstant(isoDate: string): string {
  return `${isoDate}T12:00:00Z`;
}

/** The calendar date (YYYY-MM-DD) an instant falls on in the given IANA zone. */
export function dateKeyInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

const rangeFormat = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** „19–25 października 2026” for a Monday `weekStart`. */
export function weekRangeLabel(weekStart: string): string {
  const end = addDays(weekStart, 6);
  const startDay = new Date(noonInstant(weekStart)).getUTCDate();
  const endDay = new Date(noonInstant(end)).getUTCDate();
  return `${startDay}–${endDay} ${rangeFormat.format(new Date(noonInstant(end)))}`;
}
