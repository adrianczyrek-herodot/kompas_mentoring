import { type AppContainer, createAppContainer, createLogger, parseEnv } from '@kompas/core';
import { nextCookies } from 'better-auth/next-js';

let container: AppContainer | undefined;

/**
 * Lazily builds the process-wide container on the first request, so `next build` never needs
 * DATABASE_URL. The ORM connects through the pooler; web only sends jobs (spec §1.4).
 */
export const getContainer = (): AppContainer => {
  if (container === undefined) {
    const env = parseEnv();
    const logger = createLogger({ level: env.LOG_LEVEL, module: 'web' });
    // nextCookies: auth calls from server actions set and clear the session cookie.
    container = createAppContainer({ env, logger, authPlugins: [nextCookies()] });
  }
  return container;
};
