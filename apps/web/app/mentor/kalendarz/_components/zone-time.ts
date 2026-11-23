/** A wall-clock time in an IANA zone → an ISO instant (the app layer's job; the domain only sees instants). */
const formatToParts = (date: Date, timeZone: string): Record<string, string> =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

/** Offset of `timeZone` at the given instant, in milliseconds east of UTC. */
const zoneOffsetMs = (date: Date, timeZone: string): number => {
  const parts = formatToParts(date, timeZone);
  const asUtc = Date.UTC(
    Number(parts['year']),
    Number(parts['month']) - 1,
    Number(parts['day']),
    Number(parts['hour']) % 24,
    Number(parts['minute']),
    Number(parts['second']),
  );
  return asUtc - (date.getTime() - date.getMilliseconds());
};

/**
 * `'YYYY-MM-DDTHH:MM'` read as wall-clock time in `timeZone` → ISO instant. The offset is resolved
 * at the guessed instant and re-checked once, so a DST edge lands on the nearest real time.
 */
export const zonedLocalToInstant = (local: string, timeZone: string): string => {
  const [datePart = '', timePart = ''] = local.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const guess = Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0);
  const offset = zoneOffsetMs(new Date(guess), timeZone);
  const second = zoneOffsetMs(new Date(guess - offset), timeZone);
  return new Date(guess - (offset === second ? offset : second)).toISOString();
};
