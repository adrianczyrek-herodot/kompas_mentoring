import type { EntityManager } from '@mikro-orm/postgresql';
import { Temporal } from 'temporal-polyfill';
import { UserId } from '../../../shared/domain/index.ts';
import type { DataRequestRepository } from '../application/account.commands.ts';
import type { DataRequest, DataRequestKind } from '../domain/data-request.entity.ts';
import { DataRequestRecord } from './data-request.record.ts';

type Row = { id: string; userId: string; kind: string; requestedAt: Date };

const toDomain = (row: Row): DataRequest => ({
  id: row.id,
  userId: UserId.parse(row.userId),
  kind: row.kind === 'deletion' ? 'deletion' : 'export',
  requestedAt: Temporal.Instant.fromEpochMilliseconds(row.requestedAt.getTime()),
});

export class MikroOrmDataRequestRepository implements DataRequestRepository {
  readonly #em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.#em = em;
  }

  async findPending(userId: UserId, kind: DataRequestKind): Promise<DataRequest | null> {
    const row = await this.#em.findOne(DataRequestRecord, { userId, kind, completedAt: null });
    return row === null ? null : toDomain(row);
  }

  async listPending(userId: UserId): Promise<readonly DataRequest[]> {
    const rows = await this.#em.find(
      DataRequestRecord,
      { userId, completedAt: null },
      { orderBy: { requestedAt: 'asc' } },
    );
    return rows.map(toDomain);
  }

  async save(request: DataRequest): Promise<void> {
    await this.#em.insert(DataRequestRecord, {
      id: request.id,
      userId: request.userId,
      kind: request.kind,
      requestedAt: new Date(request.requestedAt.epochMilliseconds),
      completedAt: null,
    });
  }
}
