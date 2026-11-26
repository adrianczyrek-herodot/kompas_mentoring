import type { CreditReservation, CreditReservationOutcome } from '../application/ports.ts';

/**
 * F4: no balance yet, so every later session is allowed. The ledger adapter arrives with F4 and
 * writes its entry through the checkout transaction's `em` (second argument of `reserve`).
 */
export class UnmeteredCredit implements CreditReservation {
  reserve(): Promise<CreditReservationOutcome> {
    return Promise.resolve({ kind: 'ok' });
  }
}
