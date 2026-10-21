import {
  type AppContainer,
  createAppContainer,
  createLogger,
  createOrm,
  type Orm,
  parseEnv,
} from '@kompas/core';

interface Runtime {
  container: AppContainer;
  orm: Orm;
}

let runtime: Runtime | undefined;

/**
 * Lazily builds the process-wide container on the first request, so `next build` never needs
 * DATABASE_URL. The ORM connects through the pooler; web only sends jobs (spec §1.4).
 */
export const getRuntime = (): Runtime => {
  if (runtime === undefined) {
    const env = parseEnv();
    const logger = createLogger({ level: env.LOG_LEVEL, module: 'web' });
    runtime = { container: createAppContainer({ env, logger }), orm: createOrm(env.DATABASE_URL) };
  }
  return runtime;
};
