// Display formatting for product components. Amounts arrive as minor units (`bigint`, grosze) and
// times as ISO strings; both are shown in the user's currency and time zone (brief rule 10, R01.3).

const LOCALE = 'pl-PL';

export type Currency = 'PLN';

/** Minor units → "49 zł" or "49,50 zł". Never pass floats (AGENTS.md: money is `bigint`). */
export function formatMoney(minor: bigint, currency: Currency = 'PLN'): string {
  const sign = minor < 0n ? '-' : '';
  const abs = minor < 0n ? -minor : minor;
  const major = abs / 100n;
  const cents = abs % 100n;
  const decimal = `${sign}${major.toString()}.${cents.toString().padStart(2, '0')}`;
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: cents === 0n ? 0 : 2,
    maximumFractionDigits: 2,
    // Intl accepts decimal strings, so no float rounding on the way.
  }).format(decimal as Intl.StringNumericLiteral);
}

export type DateTimeStyle = 'datetime' | 'date' | 'time' | 'weekday';

const dateTimeOptions: Record<DateTimeStyle, Intl.DateTimeFormatOptions> = {
  // "śr., 22 paź, 09:00"
  datetime: {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  },
  // "22 października 2026"
  date: { day: 'numeric', month: 'long', year: 'numeric' },
  // "09:00"
  time: { hour: '2-digit', minute: '2-digit' },
  // "śr., 22 paź"
  weekday: { weekday: 'short', day: 'numeric', month: 'short' },
};

/** ISO instant → text in the given IANA time zone, e.g. `Europe/Warsaw`. */
export function formatDateTime(iso: string, timeZone: string, style: DateTimeStyle = 'datetime') {
  return new Intl.DateTimeFormat(LOCALE, { ...dateTimeOptions[style], timeZone }).format(
    new Date(iso),
  );
}

export type CountForms = { one: string; few: string; many: string };

const plural = new Intl.PluralRules(LOCALE);

/** Polish plural: `formatCount(3, { one: 'mentor', few: 'mentorów', many: 'mentorów' })` → "3 mentorów". */
export function formatCount(count: number, forms: CountForms): string {
  const rule = plural.select(count);
  const noun = rule === 'one' ? forms.one : rule === 'few' ? forms.few : forms.many;
  return `${new Intl.NumberFormat(LOCALE).format(count)} ${noun}`;
}

/** „Kasia Nowicka” → „KN” — avatar fallback. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}
