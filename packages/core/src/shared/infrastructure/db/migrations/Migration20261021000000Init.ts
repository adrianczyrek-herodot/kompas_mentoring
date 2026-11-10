import { Migration } from '@mikro-orm/migrations';

/** One PostgreSQL schema per module (spec §2.3, §3). */
export const MODULE_SCHEMAS = [
  'identity',
  'catalog',
  'scheduling',
  'billing',
  'ledger',
  'payouts',
  'sessions',
  'mentoring',
  'messaging',
  'trust',
  'notifications',
] as const;

/** btree_gist: exclusion constraints on bookings (§4.4); unaccent + pg_trgm: mentor search (§1.3). */
export const EXTENSIONS = ['btree_gist', 'unaccent', 'pg_trgm'] as const;

export class Migration20261021000000Init extends Migration {
  override up(): void {
    for (const extension of EXTENSIONS) {
      this.addSql(`create extension if not exists "${extension}";`);
    }
    for (const schema of MODULE_SCHEMAS) {
      this.addSql(`create schema if not exists "${schema}";`);
    }
  }

  override down(): void {
    for (const schema of [...MODULE_SCHEMAS].reverse()) {
      this.addSql(`drop schema if exists "${schema}" restrict;`);
    }
  }
}
