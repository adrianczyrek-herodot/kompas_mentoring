import { Migration } from '@mikro-orm/migrations';

// E3-S2 (krok 3): mentor availability in schema `scheduling`. Expand-only (SDLC §6): new tables,
// nothing existing changes. `booking`, `mentor_bookability`, `calendar_connection` and
// `external_busy` arrive in steps 10/25.
const CREATE_SETTINGS = `create table "scheduling"."mentor_schedule" (
  "mentor_id" text not null primary key references "identity"."user" ("id") on delete cascade,
  "time_zone" text not null,
  "min_notice_minutes" smallint not null default 360 check ("min_notice_minutes" between 120 and 2880 and "min_notice_minutes" % 60 = 0),
  "buffer_minutes" smallint not null default 0 check ("buffer_minutes" between 0 and 30 and "buffer_minutes" % 5 = 0),
  "version" integer not null default 1,
  "created_at" timestamptz not null,
  "updated_at" timestamptz not null
);`;

// M3: intervals of one weekday may not overlap; the command replaces the whole template, while the
// DB check keeps `end > start` so a midnight interval can never reach the database.
const CREATE_RULES = `create table "scheduling"."availability_rule" (
  "id" uuid not null primary key,
  "mentor_id" text not null references "scheduling"."mentor_schedule" ("mentor_id") on delete cascade,
  "weekday" smallint not null check ("weekday" between 1 and 7),
  "start_local" time not null,
  "end_local" time not null,
  constraint "availability_rule_order_chk" check ("end_local" > "start_local")
);`;

// Q10: exceptions live inside the booking horizon; the command validates that, the DB keeps order.
const CREATE_EXCEPTIONS = `create table "scheduling"."availability_exception" (
  "id" uuid not null primary key,
  "mentor_id" text not null references "scheduling"."mentor_schedule" ("mentor_id") on delete cascade,
  "starts_at" timestamptz not null,
  "ends_at" timestamptz not null,
  "kind" text not null check ("kind" in ('off', 'extra')),
  "note" text null,
  "created_at" timestamptz not null,
  constraint "availability_exception_order_chk" check ("ends_at" > "starts_at")
);`;

// Consumer dedupe for events from other modules (spec §4.6); the first consumer arrives in step 7.
const CREATE_INBOX = `create table "scheduling"."inbox_event" ("event_id" uuid not null primary key, "processed_at" timestamptz not null);`;

const CREATES = [CREATE_SETTINGS, CREATE_RULES, CREATE_EXCEPTIONS, CREATE_INBOX];

const DROPS = [
  'inbox_event',
  'availability_exception',
  'availability_rule',
  'mentor_schedule',
] as const;

export class Migration20261123000000SchedulingAvailability extends Migration {
  override up(): void {
    for (const sql of CREATES) this.addSql(sql);
    this.addSql(
      `create index "availability_rule_mentor_idx" on "scheduling"."availability_rule" ("mentor_id");`,
    );
    this.addSql(
      `create index "availability_exception_mentor_idx" on "scheduling"."availability_exception" ("mentor_id", "starts_at");`,
    );
  }

  override down(): void {
    for (const table of DROPS) {
      this.addSql(`drop table if exists "scheduling"."${table}";`);
    }
  }
}
