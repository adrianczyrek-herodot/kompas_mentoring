// Worker process: fetches pg-boss jobs, runs cron and exposes /health (spec §1.4).
import {
  createAppContainer,
  createBoss,
  createLogger,
  createRequestScope,
  directDatabaseUrl,
  HEARTBEAT_CRON,
  HEARTBEAT_QUEUE,
  MikroOrmIdempotencyStore,
  parseEnv,
  PURGE_IDEMPOTENCY_CRON,
  PURGE_IDEMPOTENCY_QUEUE,
  startEventSubscriptions,
} from '@kompas/core';
import {
  CLEANUP_ORPHAN_UPLOADS_CRON,
  CLEANUP_ORPHAN_UPLOADS_QUEUE,
} from '@kompas/core/catalog';
import { EXPIRE_HOLDS_CRON, EXPIRE_HOLDS_QUEUE } from '@kompas/core/scheduling';
import { createHealthServer } from './health-server.ts';

const SHUTDOWN_TIMEOUT_MS = 30_000;

const env = parseEnv();
const logger = createLogger({ level: env.LOG_LEVEL, module: 'worker' });
const boss = createBoss('worker', directDatabaseUrl(env));
// Same domain wiring as web (spec §1.4); handlers resolve their services from a job scope.
const container = createAppContainer({ env, logger, boss });
let ready = false;

boss.on('error', (error) => {
  logger.error({ err: error }, 'pg-boss error');
});

const server = createHealthServer({ isReady: () => ready });

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'shutting down: finishing active jobs');
  ready = false;
  // graceful: wait for running handlers before closing connections (Cloud Run sends SIGTERM).
  await boss.stop({ graceful: true, timeout: SHUTDOWN_TIMEOUT_MS });
  server.close();
  await container.cradle.orm.close();
  logger.info('worker stopped');
};

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    shutdown(signal).then(
      () => process.exit(0),
      (error: unknown) => {
        logger.fatal({ err: error }, 'shutdown failed');
        process.exit(1);
      },
    );
  });
}

server.listen(env.WORKER_PORT, () => {
  logger.info({ port: env.WORKER_PORT }, 'health endpoint listening');
});

try {
  await boss.start();
  await boss.createQueue(HEARTBEAT_QUEUE);
  await boss.work(HEARTBEAT_QUEUE, async ([job]) => {
    logger.debug({ jobId: job?.id }, 'heartbeat');
    await Promise.resolve();
  });
  await boss.schedule(HEARTBEAT_QUEUE, HEARTBEAT_CRON);
  // Requirement 2: files nobody pinned to a profile disappear after 24 h.
  await boss.createQueue(CLEANUP_ORPHAN_UPLOADS_QUEUE);
  await boss.schedule(CLEANUP_ORPHAN_UPLOADS_QUEUE, CLEANUP_ORPHAN_UPLOADS_CRON);
  await boss.work(CLEANUP_ORPHAN_UPLOADS_QUEUE, async () => {
    const scope = createRequestScope(container, { requestId: crypto.randomUUID() });
    const removed = await scope.cradle.cleanupOrphanUploads();
    logger.info({ removed }, 'orphan uploads removed');
  });
  // Rule 5: holds that were never confirmed expire after 10 minutes.
  await boss.createQueue(EXPIRE_HOLDS_QUEUE);
  await boss.schedule(EXPIRE_HOLDS_QUEUE, EXPIRE_HOLDS_CRON);
  await boss.work(EXPIRE_HOLDS_QUEUE, async () => {
    const scope = createRequestScope(container, { requestId: crypto.randomUUID() });
    const expired = await scope.cradle.expireHolds();
    if (expired > 0) logger.info({ expired }, 'holds expired');
  });
  // Idempotency keys expire after 24 h (spec §4.6); this cron drops them.
  await boss.createQueue(PURGE_IDEMPOTENCY_QUEUE);
  await boss.schedule(PURGE_IDEMPOTENCY_QUEUE, PURGE_IDEMPOTENCY_CRON);
  await boss.work(PURGE_IDEMPOTENCY_QUEUE, async () => {
    const scope = createRequestScope(container, { requestId: crypto.randomUUID() });
    const removed = await new MikroOrmIdempotencyStore({ em: scope.cradle.em }).purgeExpired();
    logger.info({ removed }, 'expired idempotency keys removed');
  });
  await startEventSubscriptions(boss, container.cradle.eventSubscriptions);
  ready = true;
  logger.info('worker ready');
} catch (error) {
  logger.fatal({ err: error }, 'worker failed to start (is the database reachable?)');
  server.close();
  process.exit(1);
}
