import type { Clock, UserId } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import type { Consent, ConsentDocument } from '../domain/consent.entity.ts';
import type { RequiredConsentMissing } from '../domain/identity.errors.ts';
import { CONSENT_DOCUMENT_VERSIONS } from '../domain/policies/config.ts';

/** Port: persistence of consents (MikroORM adapter in `infrastructure/`, F1 step 3). */
export interface ConsentRepository {
  saveAll(consents: readonly Consent[]): Promise<void>;
}

export interface RegistrationConsentInput {
  readonly terms: boolean;
  readonly privacy: boolean;
  readonly marketing: boolean;
}

/**
 * P4: terms and privacy are required, marketing is optional. Each accepted document is stored
 * with its current version and the time from the Clock port (Q6).
 */
export const makeRecordRegistrationConsents =
  ({ clock, consentRepository }: { clock: Clock; consentRepository: ConsentRepository }) =>
  async (
    userId: UserId,
    input: RegistrationConsentInput,
  ): Promise<Result<readonly Consent[], RequiredConsentMissing>> => {
    for (const document of ['terms', 'privacy'] as const) {
      if (!input[document]) {
        return err({ code: 'identity.required_consent_missing', document });
      }
    }
    const givenAt = clock.now();
    const accepted = (Object.keys(CONSENT_DOCUMENT_VERSIONS) as ConsentDocument[]).filter(
      (d) => input[d],
    );
    const consents = accepted.map((document) => ({
      userId,
      document,
      version: CONSENT_DOCUMENT_VERSIONS[document],
      givenAt,
    }));
    await consentRepository.saveAll(consents);
    return ok(consents);
  };

export type RecordRegistrationConsents = ReturnType<typeof makeRecordRegistrationConsents>;
