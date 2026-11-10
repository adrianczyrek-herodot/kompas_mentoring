import type { EntityManager } from '@mikro-orm/postgresql';
import { Temporal } from 'temporal-polyfill';
import { v7 as uuidv7 } from 'uuid';
import { UserId } from '../../../shared/domain/index.ts';
import type { ConsentRepository } from '../application/record-registration-consents.command.ts';
import type { Consent, ConsentDocument } from '../domain/consent.entity.ts';
import { ConsentRecord } from './consent.record.ts';

export class MikroOrmConsentRepository implements ConsentRepository {
  readonly #em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.#em = em;
  }

  async saveAll(consents: readonly Consent[]): Promise<void> {
    if (consents.length === 0) return;
    await this.#em.insertMany(
      ConsentRecord,
      consents.map((consent) => ({
        id: uuidv7(),
        userId: consent.userId,
        document: consent.document,
        version: consent.version,
        granted: consent.granted,
        decidedAt: new Date(consent.decidedAt.epochMilliseconds),
      })),
    );
  }

  async latest(userId: UserId, document: ConsentDocument): Promise<Consent | null> {
    const record = await this.#em.findOne(
      ConsentRecord,
      { userId, document },
      { orderBy: { decidedAt: 'desc', id: 'desc' } },
    );
    if (record === null) return null;
    return {
      userId: UserId.parse(record.userId),
      document,
      version: record.version,
      granted: record.granted,
      decidedAt: Temporal.Instant.fromEpochMilliseconds(record.decidedAt.getTime()),
    };
  }
}
