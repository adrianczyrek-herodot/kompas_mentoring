import type { EntityManager, MikroORM } from '@mikro-orm/postgresql';

/**
 * Database access for module adapters inside core; apps never resolve these (spec §2.4 rule 4).
 * Kept apart from `orm.ts`, which imports module `di.ts` files for their entities and migrations.
 */
export interface DatabaseCradle {
  orm: MikroORM;
  /** Fork of the ORM's EntityManager with its own identity map, one per request / job scope. */
  em: EntityManager;
}
