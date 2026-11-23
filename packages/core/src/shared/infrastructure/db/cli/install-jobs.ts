// `pnpm db:jobs:install` — installs the pg-boss schema (the outbox transport, spec §4.6).
//
// The worker migrates it on its own start (spec §1.4); web only sends jobs and never migrates. An
// environment that has no worker — the Playwright e2e suite, which starts only the web app — needs
// the schema before the first publish, so its global setup runs this once.
import { directDatabaseUrl, parseEnv } from '../../env.ts';
import { createBoss } from '../../jobs/boss.ts';
import { createLogger } from '../../logger.ts';

const env = parseEnv();
const logger = createLogger({ level: env.LOG_LEVEL, module: 'db' });
const boss = createBoss('worker', directDatabaseUrl(env));
try {
  await boss.start();
  logger.info('pg-boss schema is installed');
} finally {
  await boss.stop({ graceful: false });
}
