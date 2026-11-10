import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { getContainerRuntimeClient } from 'testcontainers';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EXTENSIONS, MODULE_SCHEMAS } from './migrations/Migration20261021000000Init.ts';
import { checkDatabase, createOrm, migrateUp, type Orm } from './orm.ts';

const dockerAvailable = await getContainerRuntimeClient().then(
  () => true,
  () => false,
);

const SKIP_NOTE =
  'SKIPPED: Docker is not available — start Docker (or set DOCKER_HOST) to run Testcontainers integration tests; CI always runs them.';

if (!dockerAvailable) {
  // CI must never silently skip integration tests.
  if (process.env['CI'] === 'true') {
    throw new Error('Docker is required for integration tests in CI.');
  }
  process.stderr.write(`\n[integration] ${SKIP_NOTE}\n\n`);
}

describe.skipIf(!dockerAvailable)(
  `initial migration on PostgreSQL 17 ${dockerAvailable ? '' : `(${SKIP_NOTE})`}`,
  () => {
    let container: StartedPostgreSqlContainer;
    let orm: Orm;

    beforeAll(async () => {
      container = await new PostgreSqlContainer('postgres:17-alpine').start();
      orm = createOrm(container.getConnectionUri());
    });

    afterAll(async () => {
      await orm.close();
      await container.stop();
    });

    it('applies migrations once and is idempotent', async () => {
      expect(await migrateUp(orm)).toEqual(['Migration20261021000000Init']);
      expect(await migrateUp(orm)).toEqual([]);
      expect(await checkDatabase(orm)).toBe('up');
    });

    it('creates one schema per module and the required extensions', async () => {
      const connection = orm.em.getConnection();
      const schemas = await connection.execute<{ schema_name: string }[]>(
        'select schema_name from information_schema.schemata',
      );
      const extensions = await connection.execute<{ extname: string }[]>(
        'select extname from pg_extension',
      );
      expect(schemas.map((row) => row.schema_name)).toEqual(
        expect.arrayContaining([...MODULE_SCHEMAS]),
      );
      expect(extensions.map((row) => row.extname)).toEqual(expect.arrayContaining([...EXTENSIONS]));
    });
  },
);
