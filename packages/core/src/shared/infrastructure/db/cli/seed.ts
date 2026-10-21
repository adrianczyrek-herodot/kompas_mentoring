// `pnpm db:seed` — seed data for local and preview environments (spec §3).
// TODO(F2): load mentors, students and bookings from kompas-mentoring/mockupy/src/mocks.ts
// once the catalog and scheduling tables exist. F0 only verifies the connection.
import { directDatabaseUrl, parseEnv } from '../../env.ts';
import { createLogger } from '../../logger.ts';
import { checkDatabase, createOrm } from '../orm.ts';

const env = parseEnv();
const logger = createLogger({ level: env.LOG_LEVEL, module: 'db' });
const orm = createOrm(directDatabaseUrl(env));
try {
  const status = await checkDatabase(orm);
  if (status === 'down') {
    throw new Error(
      'Database is not reachable — run `docker compose up -d` and `pnpm db:migrate`.',
    );
  }
  logger.info('seed: nothing to insert yet (F0 skeleton)');
} finally {
  await orm.close();
}
