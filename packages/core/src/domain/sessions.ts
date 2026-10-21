// Reguły sesji i rezerwacji (U1–U8) — czyste funkcje z jawnym `now`.
import { canCancelFree, hasStarted } from './rules';
import type { Session } from './types';

const endsAt = (s: Session): number => new Date(s.startsAt).getTime() + s.durationMin * 6e4;

/** Nadchodzące (zaplanowane lub czekające na mentora, jeszcze niezakończone) — rosnąco; minione — malejąco. */
export function splitSessions(sessions: Session[], now: Date): { upcoming: Session[]; past: Session[] } {
  const upcoming = sessions
    .filter((s) => (s.status === 'scheduled' || s.status === 'requested') && endsAt(s) > now.getTime())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = sessions.filter((s) => !upcoming.includes(s)).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return { upcoming, past };
}

export const isUpcomingStatus = (s: Session): boolean => s.status === 'scheduled' || s.status === 'requested';

/** Czy sesję można przełożyć / anulować i co się stanie z saldem. */
export function cancellationPolicy(s: Session, now: Date): { started: boolean; free: boolean; canReschedule: boolean; refundsBalance: boolean } {
  const started = hasStarted(s, now);
  const free = canCancelFree(s, now);
  return { started, free, canReschedule: !started && free, refundsBalance: free && s.type === 'plan' };
}

/** Termin zgłoszenia problemu: do 72 h po zakończeniu sesji. */
export const REPORT_WINDOW_HOURS = 72;
export const canReportProblem = (s: Session, now: Date): boolean =>
  s.status === 'completed' && (now.getTime() - endsAt(s)) / 36e5 <= REPORT_WINDOW_HOURS;


// ---- Płatność za sesję próbną ------------------------------------------------

export const SERVICE_FEE = 3;
export const PROMO_CODE = 'KOMPAS10';

/** Rabat dla kodu (10% ceny sesji) albo `null`, gdy kod jest nieprawidłowy. */
export const promoDiscount = (code: string, price: number): number | null =>
  code.trim().toUpperCase() === PROMO_CODE ? Math.round(price * 0.1) : null;

/** Kwoty sesji próbnej: cena, opłata serwisowa (gdy płatna), rabat i suma. */
export function trialCharge(price: number, discount = 0): { price: number; fee: number; discount: number; total: number } {
  const fee = price > 0 ? SERVICE_FEE : 0;
  return { price, fee, discount, total: Math.max(0, Math.round(price - discount + fee)) };
}
