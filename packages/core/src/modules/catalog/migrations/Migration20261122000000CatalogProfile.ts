import { Migration } from '@mikro-orm/migrations';

/** Q3: the closed category list starts here; later changes are new migrations, never edits. */
const CATEGORIES = [
  ['it-programowanie', 'IT i programowanie', 10],
  ['data-ai', 'Data i AI', 20],
  ['produkt-ux', 'Produkt i UX/design', 30],
  ['kariera-rekrutacja', 'Kariera i rekrutacja', 40],
  ['biznes-zarzadzanie', 'Biznes i zarządzanie', 50],
  ['marketing-sprzedaz', 'Marketing i sprzedaż', 60],
] as const;

/**
 * F2 (E2-S2): mentor profile, taxonomy, photo uploads and the module inbox (schema `catalog`).
 * Expand-only: new tables, nothing existing changes (SDLC §6).
 */
export class Migration20261122000000CatalogProfile extends Migration {
  override up(): void {
    this.addSql(
      `create table "catalog"."category" ("slug" text not null primary key, "name" text not null, "sort" smallint not null);`,
    );
    this.addSql(
      `insert into "catalog"."category" ("slug", "name", "sort") values ${CATEGORIES.map(
        ([slug, name, sort]) => `('${slug}', '${name}', ${sort})`,
      ).join(', ')};`,
    );
    this.addSql(
      `create table "catalog"."mentor_profile" (
        "id" uuid not null primary key,
        "user_id" text not null unique references "identity"."user" ("id") on delete cascade,
        "status" text not null check ("status" in ('draft', 'submitted', 'changes_requested', 'approved', 'suspended', 'rejected')),
        "slug" text not null unique,
        "headline" text null,
        "bio" text null,
        "photo_key" text null,
        "video_provider" text null check ("video_provider" in ('youtube', 'vimeo')),
        "video_id" text null,
        "country" char(2) null,
        "languages" text[] not null default '{}',
        "years_experience" smallint null check ("years_experience" between 0 and 50),
        "experience" jsonb not null default '[]',
        "rate_60_amount" bigint null check ("rate_60_amount" between 4000 and 100000 and "rate_60_amount" % 100 = 0),
        "currency" char(3) not null default 'PLN',
        "linkedin_url" text null,
        "accepting_new" boolean not null default true,
        "completed_steps" text[] not null default '{}',
        "requested_fields" text[] not null default '{}',
        "submitted_at" timestamptz null,
        "published_at" timestamptz null,
        "version" integer not null default 1,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "mentor_profile_video_pair_chk" check (("video_provider" is null) = ("video_id" is null))
      );`,
    );
    this.addSql(
      `create index "mentor_profile_status_idx" on "catalog"."mentor_profile" ("status");`,
    );
    this.addSql(
      `create table "catalog"."mentor_profile_category" ("mentor_profile_id" uuid not null references "catalog"."mentor_profile" ("id") on delete cascade, "category_slug" text not null references "catalog"."category" ("slug"), "position" smallint not null, primary key ("mentor_profile_id", "category_slug"));`,
    );
    // Free tags (Q3): one row per normalised form, the profile keeps the label as the mentor typed it.
    this.addSql(
      `create table "catalog"."tag" ("id" uuid not null primary key, "label" text not null, "normalized" text not null unique);`,
    );
    this.addSql(
      `create table "catalog"."mentor_profile_tag" ("mentor_profile_id" uuid not null references "catalog"."mentor_profile" ("id") on delete cascade, "tag_id" uuid not null references "catalog"."tag" ("id"), "label" text not null, "position" smallint not null, primary key ("mentor_profile_id", "tag_id"));`,
    );
    this.addSql(
      `create index "mentor_profile_tag_tag_id_idx" on "catalog"."mentor_profile_tag" ("tag_id");`,
    );
    // Presigned photo uploads: pinned once the server confirmed the dimensions (requirement 2).
    this.addSql(
      `create table "catalog"."upload" ("key" text not null primary key, "owner_user_id" text not null references "identity"."user" ("id") on delete cascade, "mentor_profile_id" uuid not null references "catalog"."mentor_profile" ("id") on delete cascade, "content_type" text not null, "size_bytes" integer not null, "created_at" timestamptz not null, "confirmed_at" timestamptz null);`,
    );
    this.addSql(
      `create index "upload_unconfirmed_idx" on "catalog"."upload" ("created_at") where "confirmed_at" is null;`,
    );
    // Consumer dedupe for events from other modules (spec §4.6).
    this.addSql(
      `create table "catalog"."inbox_event" ("event_id" uuid not null primary key, "processed_at" timestamptz not null);`,
    );
  }

  override down(): void {
    for (const table of [
      'inbox_event',
      'upload',
      'mentor_profile_tag',
      'tag',
      'mentor_profile_category',
      'mentor_profile',
      'category',
    ]) {
      this.addSql(`drop table if exists "catalog"."${table}";`);
    }
  }
}
