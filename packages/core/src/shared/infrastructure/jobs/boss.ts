import { type ConstructorOptions, PgBoss } from 'pg-boss';

export type BossRole = 'web' | 'worker';

/**
 * pg-boss is our outbox (spec §4.6). Only the worker (direct connection) fetches jobs, runs cron
 * and maintenance; autoscaled web instances only send jobs through the pooler (spec §1.4).
 */
export const bossOptionsFor = (role: BossRole, connectionString: string): ConstructorOptions =>
  role === 'worker'
    ? {
        connectionString,
        application_name: 'kompas-worker',
        supervise: true,
        schedule: true,
        migrate: true,
      }
    : {
        connectionString,
        application_name: 'kompas-web',
        supervise: false,
        schedule: false,
        migrate: false,
        max: 2,
      };

export const createBoss = (role: BossRole, connectionString: string): PgBoss =>
  new PgBoss(bossOptionsFor(role, connectionString));

export type { PgBoss } from 'pg-boss';

/** Platform heartbeat: proves cron and job processing work end to end. */
export const HEARTBEAT_QUEUE = 'platform.heartbeat';
export const HEARTBEAT_CRON = '*/5 * * * *';
