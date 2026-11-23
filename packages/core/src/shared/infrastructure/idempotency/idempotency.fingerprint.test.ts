import { describe, expect, it } from 'vitest';
import { idempotencyFingerprint } from './idempotency.fingerprint.ts';

describe('idempotencyFingerprint (spec §4.6)', () => {
  it('is stable regardless of object key order', () => {
    const a = idempotencyFingerprint({ path: ['bookings', 'holds'], payload: { a: 1, b: { d: 2, c: 3 } } });
    const b = idempotencyFingerprint({ path: ['bookings', 'holds'], payload: { b: { c: 3, d: 2 }, a: 1 } });
    expect(a).toBe(b);
  });

  it('changes when the body changes', () => {
    const base = idempotencyFingerprint({ path: ['checkout'], payload: { goal: 'x' } });
    expect(idempotencyFingerprint({ path: ['checkout'], payload: { goal: 'y' } })).not.toBe(base);
    expect(idempotencyFingerprint({ path: ['checkout'], payload: { goal: 'x', extra: 1 } })).not.toBe(base);
  });

  it('changes when the operation changes', () => {
    const payload = { id: 'b1' };
    expect(idempotencyFingerprint({ path: ['bookings', 'b1', 'cancel'], payload })).not.toBe(
      idempotencyFingerprint({ path: ['bookings', 'b1', 'reschedule'], payload }),
    );
  });

  it('ignores properties explicitly set to undefined', () => {
    const withUndefined = idempotencyFingerprint({ path: ['checkout'], payload: { a: 1, b: undefined } });
    const without = idempotencyFingerprint({ path: ['checkout'], payload: { a: 1 } });
    expect(withUndefined).toBe(without);
  });
});
