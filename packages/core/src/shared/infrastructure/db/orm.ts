import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, MikroORM } from '@mikro-orm/postgresql';
import { Migration20261021000000Init } from './migrations/Migration20261021000000Init.ts';

/**
 * Migrations are listed explicitly (no file globbing), so they work the same under Node type
 * stripping, Vitest and bundlers. Module migrations from `modules/<x>/migrations/` are appended here.
 */
const migrationsList = [
  { name: 'Migration20261021000000Init', class: Migration20261021000000Init },
];

const createOrmConfig = (clientUrl: string) =>
  defineConfig({
    clientUrl,
    entities: [],
    discovery: { warnWhenNoEntities: false },
    extensions: [Migrator],
    migrations: { tableName: 'mikro_orm_migrations', migrationsList, transactional: true },
    // Connections come from the pooler in web; keep the per-process pool small.
    pool: { min: 0, max: 5 },
  });

export type Orm = MikroORM;

/** Creates the ORM without connecting; the first query opens the pool. */
export const createOrm = (clientUrl: string): Orm => new MikroORM(createOrmConfig(clientUrl));

export const migrateUp = async (orm: Orm): Promise<string[]> => {
  const applied = await orm.migrator.up();
  return applied.map((migration) => migration.name);
};

export type DatabaseStatus = 'up' | 'down';

export const checkDatabase = async (orm: Orm): Promise<DatabaseStatus> => {
  try {
    await orm.em.getConnection().execute('select 1');
    return 'up';
  } catch {
    return 'down';
  }
};
