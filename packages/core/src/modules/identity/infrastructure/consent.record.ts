import { defineEntity, p } from '@mikro-orm/core';

/** Persistence shape of a recorded consent (table `identity.consent`). */
export const ConsentRecord = defineEntity({
  name: 'ConsentRecord',
  tableName: 'consent',
  schema: 'identity',
  properties: {
    id: p.uuid().primary(),
    userId: p.string(),
    document: p.string(),
    version: p.string(),
    givenAt: p.datetime(),
  },
});
