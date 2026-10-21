import { contract } from '@kompas/contracts';
import { checkDatabase } from '@kompas/core';
import { implement } from '@orpc/server';
import { getRuntime } from './runtime.ts';

const os = implement(contract);

const health = os.health.handler(async () => {
  const { orm, container } = getRuntime();
  const db = await checkDatabase(orm);
  return {
    status: db === 'up' ? 'ok' : 'degraded',
    app: 'ok',
    db,
    version: process.env['APP_VERSION'] ?? 'dev',
    time: container.cradle.clock.now().toString(),
  } as const;
});

export const router = os.router({ health });
