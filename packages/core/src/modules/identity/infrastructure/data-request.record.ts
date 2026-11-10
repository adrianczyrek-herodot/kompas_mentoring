import { defineEntity, p } from '@mikro-orm/core';

/** Persistence shape of an export / deletion request (table `identity.data_request`). */
export const DataRequestRecord = defineEntity({
  name: 'DataRequestRecord',
  tableName: 'data_request',
  schema: 'identity',
  properties: {
    id: p.uuid().primary(),
    userId: p.string(),
    kind: p.string(),
    requestedAt: p.datetime(),
    completedAt: p.datetime().nullable(),
  },
});
