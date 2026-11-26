import { Migration } from '@mikro-orm/migrations';

// Fixes after the PR #73 review (Q18): at most one `hold` per student, guaranteed by the database
// and not only by `createHold` releasing the previous hold — two parallel requests could both find
// nothing to release and both insert. Expand-only: one partial unique index.
//
// Rows a past race may have left behind are expired first (all but the newest hold of a student),
// otherwise the index cannot be built. `hold → expired` is the `hold_expired` transition (§4.3).
const EXPIRE_DUPLICATE_HOLDS = `update "scheduling"."booking" as "b"
  set "status" = 'expired', "version" = "b"."version" + 1, "updated_at" = now()
  where "b"."status" = 'hold'
    and exists (
      select 1 from "scheduling"."booking" as "newer"
       where "newer"."student_id" = "b"."student_id" and "newer"."status" = 'hold'
         and ("newer"."created_at", "newer"."id") > ("b"."created_at", "b"."id")
    );`;

const ONE_HOLD_PER_STUDENT = `create unique index "booking_one_hold_per_student"
  on "scheduling"."booking" ("student_id")
  where "status" = 'hold';`;

export class Migration20261130000000SchedulingOneActiveHold extends Migration {
  override up(): void {
    this.addSql(EXPIRE_DUPLICATE_HOLDS);
    this.addSql(ONE_HOLD_PER_STUDENT);
  }

  override down(): void {
    this.addSql(`drop index if exists "scheduling"."booking_one_hold_per_student";`);
  }
}
