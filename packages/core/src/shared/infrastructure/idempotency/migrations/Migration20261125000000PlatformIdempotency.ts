import { Migration } from '@mikro-orm/migrations';

// E3-S4 (step 9): Idempotency-Key support (spec §4.6). The `platform` schema holds cross-module
// infrastructure; expand-only, nothing existing changes.
export class Migration20261125000000PlatformIdempotency extends Migration {
  override up(): void {
    this.addSql(`create schema if not exists "platform";`);
    this.addSql(
      `create table "platform"."idempotency_key" (
        "user_id" text not null,
        "key" text not null,
        "fingerprint" text not null,
        "response" jsonb null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        "expires_at" timestamptz not null,
        primary key ("user_id", "key")
      );`,
    );
    // The cleanup job scans by expiry; the primary key already serves the claim/replay lookups.
    this.addSql(
      `create index "idempotency_key_expires_idx" on "platform"."idempotency_key" ("expires_at");`,
    );
  }

  override down(): void {
    this.addSql(`drop table if exists "platform"."idempotency_key";`);
    this.addSql(`drop schema if exists "platform";`);
  }
}
