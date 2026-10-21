// `pnpm db:migrate` — applies pending migrations using the direct database connection.
import { directDatabaseUrl, parseEnv } from '../../env.ts';
import { createLogger } from '../../logger.ts';
import { createOrm, migrateUp } from '../orm.ts';

const env = parseEnv();
const logger = createLogger({ level: env.LOG_LEVEL, module: 'db' });
const orm = createOrm(directDatabaseUrl(env));
try {
  const applied = await migrateUp(orm);
  logger.info({ applied }, applied.length > 0 ? 'migrations applied' : 'database is up to date');
} finally {
  await orm.close();
}
