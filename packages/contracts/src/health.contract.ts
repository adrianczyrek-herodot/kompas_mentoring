import { oc } from '@orpc/contract';
import { z } from 'zod';

export const HealthStatus = z.object({
  status: z.enum(['ok', 'degraded']),
  app: z.literal('ok'),
  db: z.enum(['up', 'down']),
  version: z.string(),
  time: z.iso.datetime(),
});

export type HealthStatus = z.infer<typeof HealthStatus>;

/** GET /api/health — liveness of the app and its database (used by Cloud Run and e2e smoke). */
export const healthContract = oc
  .route({ method: 'GET', path: '/health', summary: 'Application and database health' })
  .output(HealthStatus);
