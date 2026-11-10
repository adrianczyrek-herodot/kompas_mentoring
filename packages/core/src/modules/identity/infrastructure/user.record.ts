import { defineEntity, p } from '@mikro-orm/core';

/**
 * Read-only MikroORM view of the Better Auth `user` table (spec §1.3): Better Auth owns writes,
 * other code reads users through this mapping. Column names follow Better Auth (camelCase).
 */
export const UserRecord = defineEntity({
  name: 'UserRecord',
  tableName: 'user',
  schema: 'identity',
  readonly: true,
  properties: {
    id: p.string().primary(),
    email: p.string(),
    name: p.string(),
    emailVerified: p.boolean().fieldName('emailVerified'),
    twoFactorEnabled: p.boolean().fieldName('twoFactorEnabled').nullable(),
    roles: p.json<string[]>().nullable(),
    createdAt: p.datetime().fieldName('createdAt'),
  },
});
