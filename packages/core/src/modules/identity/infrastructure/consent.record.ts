import { defineEntity, p } from '@mikro-orm/core';

/** Persistence shape of a consent decision (table `identity.consent`). */
export const ConsentRecord = defineEntity({
  name: 'ConsentRecord',
  tableName: 'consent',
  schema: 'identity',
  properties: {
    id: p.uuid().primary(),
    userId: p.string(),
    document: p.string(),
    version: p.string(),
    granted: p.boolean(),
    decidedAt: p.datetime(),
  },
});
