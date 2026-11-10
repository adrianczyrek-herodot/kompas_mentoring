// Worker process: fetches pg-boss jobs, runs cron and exposes /health (spec §1.4).
import {
  createBoss,
  createLogger,
  directDatabaseUrl,
  HEARTBEAT_CRON,
  HEARTBEAT_QUEUE,
  parseEnv,
} from '@kompas/core';
import { createHealthServer } from './health-server.ts';

const SHUTDOWN_TIMEOUT_MS = 30_000;

const env = parseEnv();
const logger = createLogger({ level: env.LOG_LEVEL, module: 'worker' });
const boss = createBoss('worker', directDatabaseUrl(env));
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
  ready = true;
  logger.info('worker ready');
} catch (error) {
  logger.fatal({ err: error }, 'worker failed to start (is the database reachable?)');
  server.close();
  process.exit(1);
}
