import type { PaymentGate, PaymentStart } from '../application/ports.ts';

/** Q1/F3: no payment — the trial is "paid" at once, so checkout completes in one transaction. */
export class NoPaymentGate implements PaymentGate {
  start(): Promise<PaymentStart> {
    return Promise.resolve({ kind: 'paid' });
  }
}
