import type { EntityManager } from '@mikro-orm/postgresql';
import { v7 as uuidv7 } from 'uuid';
import type { ConsentRepository } from '../application/record-registration-consents.command.ts';
import type { Consent } from '../domain/consent.entity.ts';
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
        givenAt: new Date(consent.givenAt.epochMilliseconds),
      })),
    );
  }
}
