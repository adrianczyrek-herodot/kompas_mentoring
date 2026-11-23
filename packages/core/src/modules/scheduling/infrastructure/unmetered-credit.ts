import type { CreditReservation, CreditReservationOutcome } from '../application/ports.ts';

/** F4: no balance yet, so every later session is allowed; the ledger adapter arrives with F4. */
export class UnmeteredCredit implements CreditReservation {
  reserve(): Promise<CreditReservationOutcome> {
    return Promise.resolve({ kind: 'ok' });
  }
}
