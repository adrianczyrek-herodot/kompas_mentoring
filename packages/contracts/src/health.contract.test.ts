import { describe, expect, it } from 'vitest';
import { HealthStatus } from './health.contract.ts';

describe('HealthStatus', () => {
  it('accepts a healthy payload and rejects unknown statuses', () => {
    const payload = {
      status: 'ok',
      app: 'ok',
      db: 'up',
      version: '0.0.0',
      time: '2026-10-20T12:00:00Z',
    };
    expect(HealthStatus.parse(payload)).toEqual(payload);
    expect(HealthStatus.safeParse({ ...payload, db: 'maybe' }).success).toBe(false);
  });
});
