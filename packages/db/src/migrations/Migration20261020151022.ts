import { Migration } from '@mikro-orm/migrations';

export class Migration20261020151022 extends Migration {

  override name = 'Migration20261020151022';

  override up(): void | Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null, "email" varchar(255) not null, "display_name" varchar(255) not null, "role" text not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`alter table "users" add constraint "users_role_check" check ("role" in ('mentee', 'mentor', 'admin'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }

}
