import { Migration } from '@mikro-orm/migrations';

// E3-S4 (step 9): Q12 — the user's time zone, reported by the browser (edited in S3, E3-S9).
// Expand-only: a nullable column on the Better Auth `user` table.
export class Migration20261111000000IdentityTimeZone extends Migration {
  override up(): void {
    this.addSql(`alter table "identity"."user" add column "time_zone" text null;`);
  }

  override down(): void {
    this.addSql(`alter table "identity"."user" drop column if exists "time_zone";`);
  }
}
