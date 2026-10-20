// Reguły domenowe jako czyste funkcje — w docelowym systemie te same funkcje działają na serwerze.
import { Mentor, NOW, Session } from './mocks';

export const FREE_CANCEL_HOURS = 12;
export const MIN_NOTICE_HOURS = 6;
export const HOLD_MINUTES = 10;
export const JOIN_BEFORE_MIN = 10;

export interface Slot { iso: string; taken: boolean; }

const startOfWeek = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};

/** Sloty mentora w danym tygodniu (0 = bieżący). Deterministycznie oznacza część jako zajęte. */
export function weekSlots(m: Mentor, weekOffset: number, now = NOW): { day: Date; slots: Slot[] }[] {
  const start = startOfWeek(now);
  start.setDate(start.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const slots = (m.availability[i] ?? [])
      .map((h) => {
        const d = new Date(day);
        d.setHours(h, 0, 0, 0);
        return d;
      })
      .filter((d) => d.getTime() - now.getTime() >= MIN_NOTICE_HOURS * 36e5)
      .map((d) => ({ iso: d.toISOString(), taken: (d.getDate() * 7 + d.getHours() + m.id.length) % 5 === 0 }));
    return { day, slots };
  });
}

export function nextFreeWeek(m: Mentor, from: number): number | null {
  for (let w = from + 1; w < from + 6; w++) {
    if (weekSlots(m, w).some((d) => d.slots.some((s) => !s.taken))) return w;
  }
  return null;
}

export const canCancelFree = (s: Session, now = NOW): boolean =>
  new Date(s.startsAt).getTime() - now.getTime() >= FREE_CANCEL_HOURS * 36e5;

export const canJoin = (s: Session, now = NOW): boolean => {
  const start = new Date(s.startsAt).getTime();
  return s.status === 'scheduled' && now.getTime() >= start - JOIN_BEFORE_MIN * 6e4 && now.getTime() <= start + s.durationMin * 6e4;
};

export const hasStarted = (s: Session, now = NOW): boolean => new Date(s.startsAt).getTime() <= now.getTime();

/** Prowizja platformy malejąca z liczbą przepracowanych godzin (wartości robocze, Z5). */
export function commissionRate(hours: number): number {
  if (hours < 20) return 0.33;
  if (hours < 50) return 0.28;
  if (hours < 200) return 0.2;
  return 0.18;
}
export const nextTier = (hours: number): number | null => [20, 50, 200].find((t) => t > hours) ?? null;

export const planPrice = (rate60: number, perWeek: number, durationMin: number): number =>
  Math.round(rate60 * (durationMin / 60) * perWeek * 4);

/** Przeniesienie salda: wartość sesji przeliczana po stawkach (zaokrąglenie w dół). */
export const transferSessions = (sessions: number, fromRate: number, toRate: number): number =>
  Math.floor((sessions * fromRate) / toRate);

export const OFF_PLATFORM = /(\+?\d[\d\s-]{7,}\d)|([^\s@]+@[^\s@]+\.[a-z]{2,})|(whatsapp|telegram|revolut|blik na)/i;
