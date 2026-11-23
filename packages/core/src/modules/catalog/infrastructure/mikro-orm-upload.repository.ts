import type { Temporal } from 'temporal-polyfill';
import type { InferEntity } from '@mikro-orm/core';
import type { EntityManager } from '@mikro-orm/postgresql';
import type { PendingUpload, UploadRepository } from '../application/ports.ts';
import { toDate, toInstant } from './mentor-profile.mapper.ts';
import { UploadRecord } from './catalog.records.ts';

type UploadRow = InferEntity<typeof UploadRecord>;

const toUpload = (row: UploadRow): PendingUpload => ({
  key: row.key,
  ownerUserId: row.ownerUserId as PendingUpload['ownerUserId'],
  mentorProfileId: row.mentorProfileId as PendingUpload['mentorProfileId'],
  contentType: row.contentType,
  sizeBytes: row.sizeBytes,
  createdAt: toInstant(row.createdAt),
  confirmedAt:
    row.confirmedAt === null || row.confirmedAt === undefined
      ? null
      : toInstant(row.confirmedAt),
});

/** MikroORM adapter of the `UploadRepository` port (table `catalog.upload`). */
export class MikroOrmUploadRepository implements UploadRepository {
  readonly #em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.#em = em;
  }

  async create(upload: PendingUpload): Promise<void> {
    await this.#em.insert(UploadRecord, {
      key: upload.key,
      ownerUserId: upload.ownerUserId,
      mentorProfileId: upload.mentorProfileId,
      contentType: upload.contentType,
      sizeBytes: upload.sizeBytes,
      createdAt: toDate(upload.createdAt),
      confirmedAt: upload.confirmedAt === null ? null : toDate(upload.confirmedAt),
    });
  }

  async findByKey(key: string): Promise<PendingUpload | null> {
    const row = await this.#em.findOne(UploadRecord, { key }, { disableIdentityMap: true });
    return row === null ? null : toUpload(row);
  }

  async markConfirmed(key: string, at: Temporal.Instant): Promise<void> {
    await this.#em.nativeUpdate(UploadRecord, { key }, { confirmedAt: toDate(at) });
  }

  async listUnconfirmedBefore(moment: Temporal.Instant): Promise<PendingUpload[]> {
    const rows = await this.#em.find(
      UploadRecord,
      { confirmedAt: null, createdAt: { $lt: toDate(moment) } },
      { disableIdentityMap: true },
    );
    return rows.map(toUpload);
  }

  async delete(key: string): Promise<void> {
    await this.#em.nativeDelete(UploadRecord, { key });
  }
}
