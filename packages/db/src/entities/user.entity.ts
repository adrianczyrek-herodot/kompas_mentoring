import { defineEntity, p } from "@mikro-orm/postgresql";

export const USER_ROLES = ["mentee", "mentor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const UserSchema = defineEntity({
  name: "User",
  tableName: "users",
  properties: {
    id: p.uuid().primary().onCreate(() => crypto.randomUUID()),
    email: p.string().unique(),
    displayName: p.string(),
    role: p.enum(() => [...USER_ROLES]).$type<UserRole>(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export class User extends UserSchema.class {}
UserSchema.setClass(User);
