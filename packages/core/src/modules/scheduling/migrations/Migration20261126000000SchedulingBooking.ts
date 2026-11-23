import { Migration } from '@mikro-orm/migrations';

// E3-S4 (step 10): the booking aggregate (spec §4.4). Expand-only: one new table plus the two
// exclusion constraints that make double bookings impossible at the database, not in code.
//
// `during` holds `[starts_at, ends_at + buffer)`. The buffer is snapshotted per booking, so changing
// the mentor's setting never moves an existing reservation (Q11).
const CREATE_BOOKING = `create table "scheduling"."booking" (
  "id" uuid not null primary key,
  "mentor_id" text not null references "identity"."user" ("id") on delete cascade,
  "student_id" text not null references "identity"."user" ("id") on delete cascade,
  "type" text not null check ("type" in ('trial', 'plan', 'single')),
  "status" text not null check ("status" in (
    'hold', 'pending_payment', 'requested', 'scheduled', 'in_progress', 'completed',
    'late_cancelled', 'no_show_student', 'no_show_mentor', 'disputed', 'cancelled',
    'expired', 'settled', 'refunded'
  )),
  "starts_at" timestamptz not null,
  "ends_at" timestamptz not null,
  "buffer_minutes" smallint not null default 0 check ("buffer_minutes" between 0 and 30 and "buffer_minutes" % 5 = 0),
  -- [starts_at, ends_at + buffer); written by the insert (a generated column cannot use the
  -- STABLE timestamptz+interval operator), so every writer must keep it in sync with the range.
  "during" tstzrange not null,
  "hold_expires_at" timestamptz null,
  "goal" text null,
  "price_amount" bigint null,
  "currency" text null,
  "payment_mode" text null check ("payment_mode" in ('none', 'stripe')),
  "accept_deadline_at" timestamptz null,
  "decline_reason" text null,
  "decline_comment" text null,
  "cancelled_by" text null check ("cancelled_by" in ('student', 'mentor', 'system')),
  "cancel_reason" text null,
  "reschedule_count" integer not null default 0,
  "version" integer not null default 1,
  "created_at" timestamptz not null,
  "updated_at" timestamptz not null,
  constraint "booking_order_chk" check ("ends_at" > "starts_at")
);`;

// C3: no overlapping session for the same mentor, buffer included (§4.4). Only lifecycle states
// that occupy the calendar are guarded; the predicate cannot contain `now()`.
const MENTOR_NO_OVERLAP = `alter table "scheduling"."booking" add constraint "booking_mentor_no_overlap"
  exclude using gist ("mentor_id" with =, "during" with &&)
  where ("status" in ('hold', 'pending_payment', 'requested', 'scheduled', 'in_progress'));`;

// The student never has two overlapping sessions, even with different mentors (no buffer here).
const STUDENT_NO_OVERLAP = `alter table "scheduling"."booking" add constraint "booking_student_no_overlap"
  exclude using gist ("student_id" with =, tstzrange("starts_at", "ends_at", '[)') with &&)
  where ("status" in ('hold', 'pending_payment', 'requested', 'scheduled', 'in_progress'));`;

// One trial per student–mentor pair; `late_cancelled` (Q6) and `no_show_mentor` still occupy it,
// while expired/cancelled/refunded free the pair for a new trial.
const ONE_TRIAL_PER_PAIR = `create unique index "booking_one_trial_per_pair"
  on "scheduling"."booking" ("student_id", "mentor_id")
  where "type" = 'trial' and "status" not in ('expired', 'cancelled', 'refunded', 'no_show_mentor');`;

export class Migration20261126000000SchedulingBooking extends Migration {
  override up(): void {
    this.addSql(CREATE_BOOKING);
    this.addSql(MENTOR_NO_OVERLAP);
    this.addSql(STUDENT_NO_OVERLAP);
    this.addSql(ONE_TRIAL_PER_PAIR);
    this.addSql(
      `create index "booking_student_starts_idx" on "scheduling"."booking" ("student_id", "starts_at");`,
    );
    this.addSql(
      `create index "booking_mentor_starts_idx" on "scheduling"."booking" ("mentor_id", "starts_at");`,
    );
    this.addSql(
      `create index "booking_status_hold_idx" on "scheduling"."booking" ("status", "hold_expires_at");`,
    );
  }

  override down(): void {
    this.addSql(`drop table if exists "scheduling"."booking";`);
  }
}
