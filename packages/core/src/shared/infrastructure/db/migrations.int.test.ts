import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EXTENSIONS, MODULE_SCHEMAS } from './migrations/Migration20261021000000Init.ts';
import { checkDatabase, createOrm, migrateUp, type Orm } from './orm.ts';
import { dockerAvailable, integrationSuite, POSTGRES_IMAGE } from './test-database.ts';

describe.skipIf(!dockerAvailable)(integrationSuite('migrations on PostgreSQL 17'), () => {
  let container: StartedPostgreSqlContainer;
  let orm: Orm;

  beforeAll(async () => {
    container = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
    orm = createOrm(container.getConnectionUri());
  });

  afterAll(async () => {
    await orm.close();
    await container.stop();
  });

  it('applies migrations once and is idempotent', async () => {
    expect(await migrateUp(orm)).toEqual([
      'Migration20261021000000Init',
      'Migration20261110000000IdentityAuth',
      'Migration20261110120000AccountRequests',
    ]);
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
});
