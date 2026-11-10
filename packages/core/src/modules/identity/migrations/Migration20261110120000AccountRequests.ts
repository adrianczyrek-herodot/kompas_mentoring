import { Migration } from '@mikro-orm/migrations';

/** S3 (Q7): consent withdrawal (append-only decisions) and export / deletion requests. */
export class Migration20261110120000AccountRequests extends Migration {
  override up(): void {
    this.addSql(
      `alter table "identity"."consent" add column "granted" boolean not null default true;`,
    );
    this.addSql(`alter table "identity"."consent" rename column "given_at" to "decided_at";`);
    this.addSql(
      `create index "consent_user_id_document_decided_at_idx" on "identity"."consent" ("user_id", "document", "decided_at" desc);`,
    );
    this.addSql(
      `create table "identity"."data_request" ("id" uuid not null primary key, "user_id" text not null references "identity"."user" ("id") on delete cascade, "kind" text not null check ("kind" in ('export', 'deletion')), "requested_at" timestamptz not null, "completed_at" timestamptz null);`,
    );
    // At most one pending request of each kind per user (idempotent "request again").
    this.addSql(
      `create unique index "data_request_pending_uq" on "identity"."data_request" ("user_id", "kind") where "completed_at" is null;`,
    );
  }

  override down(): void {
    this.addSql(`drop table if exists "identity"."data_request";`);
    this.addSql(`drop index if exists "identity"."consent_user_id_document_decided_at_idx";`);
    this.addSql(`alter table "identity"."consent" rename column "decided_at" to "given_at";`);
    this.addSql(`alter table "identity"."consent" drop column "granted";`);
  }
}
