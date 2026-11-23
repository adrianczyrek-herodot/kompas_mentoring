import { Migration } from '@mikro-orm/migrations';

// E3-S3 (krok 7): the `catalog` data that `scheduling` needs, mirrored from
// `catalog.mentor_bookability_changed.v1` (spec "Projekcja mentor_bookability", Q13). `scheduling`
// never calls `catalog` — that direction would close a cycle (spec §2.4 rule 5). Expand-only
// (SDLC §6): one new table, nothing existing changes.
const CREATE_BOOKABILITY = `create table "scheduling"."mentor_bookability" (
  "mentor_profile_id" uuid not null primary key,
  "mentor_id" text not null unique references "identity"."user" ("id") on delete cascade,
  "is_bookable" boolean not null,
  "accepting_new" boolean not null,
  "rate_60_amount" bigint null check ("rate_60_amount" is null or "rate_60_amount" > 0),
  "currency" char(3) not null default 'PLN',
  "updated_at" timestamptz not null
);`;

export class Migration20261124000000SchedulingBookability extends Migration {
  override up(): void {
    this.addSql(CREATE_BOOKABILITY);
    // Public availability looks mentors up by profile id; the unique key above answers it, this
    // index keeps "which profile is this user" cheap for the dashboard and the hold in step 10.
    this.addSql(
      `create index "mentor_bookability_mentor_idx" on "scheduling"."mentor_bookability" ("mentor_id");`,
    );
  }

  override down(): void {
    this.addSql('drop table if exists "scheduling"."mentor_bookability";');
  }
}
