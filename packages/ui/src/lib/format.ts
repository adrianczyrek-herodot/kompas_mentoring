// Formatowanie dat, godzin i kwot dla interfejsu (polski). Czyste funkcje — działają na serwerze i w przeglądarce.

const DAYS = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'nd'];
const DAYS_LONG = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];
const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

export const weekday = (d: Date): number => (d.getDay() + 6) % 7;
export const dayShort = (i: number): string => DAYS[i] ?? '';
export const fmtDate = (iso: string | Date): string => {
  const d = new Date(iso);
  return `${dayShort(weekday(d))}, ${d.getDate()} ${MONTHS[d.getMonth()] ?? ''}`;
};
export const fmtDateLong = (iso: string | Date): string => {
  const d = new Date(iso);
  return `${DAYS_LONG[weekday(d)] ?? ''}, ${d.getDate()} ${MONTHS[d.getMonth()] ?? ''} ${d.getFullYear()}`;
};
export const fmtTime = (iso: string | Date): string => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
export const money = (n: number): string => `${n.toLocaleString('pl-PL')} zł`;

export const initials = (name: string): string =>
  name.split(/\s+/).map((p) => p[0] ?? '').slice(0, 2).join('').toUpperCase();
