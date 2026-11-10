// Core entry point for apps: container, configuration and platform services.
// Module APIs are imported from `@kompas/core/<module>` (spec §2.4 rule 4).
export {
  type AppContainer,
  type AppCradle,
  createAppContainer,
  createRequestScope,
  type RequestCradle,
  type RequestScope,
} from './container.ts';
export * from './shared/domain/index.ts';
export type { DatabaseStatus } from './shared/infrastructure/db/orm.ts';
export { directDatabaseUrl, type Env, parseEnv } from './shared/infrastructure/env.ts';
export {
  type BossRole,
  createBoss,
  HEARTBEAT_CRON,
  HEARTBEAT_QUEUE,
  type PgBoss,
} from './shared/infrastructure/jobs/boss.ts';
export { createLogger, type Logger } from './shared/infrastructure/logger.ts';
export { SystemClock } from './shared/infrastructure/system-clock.ts';
