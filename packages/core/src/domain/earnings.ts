// Zarobki mentora (M5) i podgląd zarobku przy ustalaniu stawki (M1).
import { commissionRate } from './rules';
import type { Earning } from './types';

export const MIN_PAYOUT = 100;

const net = (e: Earning): number => e.gross - e.fee;

/** Kwota dostępna do wypłaty (0 po zleceniu wypłaty). */
export const availableForPayout = (earnings: Earning[], payoutDone: boolean): number =>
  payoutDone ? 0 : earnings.filter((e) => e.status === 'dostępne').reduce((a, e) => a + net(e), 0);

/** Kwota oczekująca (dostępna 48 h po sesji bez zgłoszenia). */
export const pendingEarnings = (earnings: Earning[]): number =>
  earnings.filter((e) => e.status === 'oczekujące').reduce((a, e) => a + net(e), 0);

/** Zarobek mentora za 60 min przy stawce `rate60` i liczbie przepracowanych godzin (prowizja wg progu). */
export const mentorNetFor = (rate60: number, hoursWorked: number): number => Math.round(rate60 * (1 - commissionRate(hoursWorked)));
