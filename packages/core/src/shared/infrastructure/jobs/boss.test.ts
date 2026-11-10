import { describe, expect, it } from 'vitest';
import { bossOptionsFor } from './boss.ts';

describe('bossOptionsFor', () => {
  it('web only sends jobs: no supervision, no cron, no schema migration', () => {
    expect(bossOptionsFor('web', 'postgres://localhost/kompas')).toMatchObject({
      supervise: false,
      schedule: false,
      migrate: false,
    });
  });

  it('worker fetches jobs, runs cron and maintains the queue schema', () => {
    expect(bossOptionsFor('worker', 'postgres://localhost/kompas')).toMatchObject({
      supervise: true,
      schedule: true,
      migrate: true,
    });
  });
});
