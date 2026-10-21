import { contract } from '@kompas/contracts';
import { implement } from '@orpc/server';
import { getContainer } from './runtime.ts';

const os = implement(contract);

const health = os.health.handler(async () => {
  const { databaseHealth, clock } = getContainer().cradle;
  const db = await databaseHealth();
  return {
    status: db === 'up' ? 'ok' : 'degraded',
    app: 'ok',
    db,
    version: process.env['APP_VERSION'] ?? 'dev',
    time: clock.now().toString(),
  } as const;
});

export const router = os.router({ health });
