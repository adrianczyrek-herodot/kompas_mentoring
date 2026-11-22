/**
 * Demo clock. „Now” is fixed (like the grey mockups): 2026-10-20 14:00 Europe/Warsaw, so every run
 * looks the same. A review-bar scenario can move it by whole minutes; nothing reads the real clock.
 */
export const TZ = 'Europe/Warsaw';
export const DEMO_NOW = '2026-10-20T14:00:00+02:00';

const MINUTE = 60_000;

export function toMs(iso: string): number {
  return Date.parse(iso);
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(toMs(iso) + minutes * MINUTE).toISOString();
}

export function minutesBetween(fromIso: string, toIso: string): number {
  return Math.round((toMs(toIso) - toMs(fromIso)) / MINUTE);
}

/** Viewer time zones offered in U1 (KONCEPCJA §U1 „TimezoneSelect”). */
export const TIME_ZONES = [
  { value: 'Europe/Warsaw', label: 'Warszawa (czas polski)' },
  { value: 'Europe/London', label: 'Londyn' },
  { value: 'America/New_York', label: 'Nowy Jork' },
] as const;

export function timeZoneLabel(timeZone: string): string {
  return TIME_ZONES.find((zone) => zone.value === timeZone)?.label ?? timeZone;
}

/**
 * Local Warsaw time → ISO instant. Covers the demo range only (October–November 2026): summer
 * time ends on Sunday 25 October 2026 at 03:00.
 */
export function warsawIso(year: number, month: number, day: number, hour: number): string {
  const summer = month < 10 || (month === 10 && (day < 25 || (day === 25 && hour < 3)));
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${String(year)}-${pad(month)}-${pad(day)}T${pad(hour)}:00:00${summer ? '+02:00' : '+01:00'}`;
}

const shortFormat = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: TZ,
});

/** „22 października, 9:00” — for notification texts built in the reducer. */
export function formatShort(iso: string): string {
  return shortFormat.format(toMs(iso));
}
