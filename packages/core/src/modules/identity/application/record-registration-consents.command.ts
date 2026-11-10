import type { Clock, UserId } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import type { Consent, ConsentDocument } from '../domain/consent.entity.ts';
import type { RequiredConsentMissing } from '../domain/identity.errors.ts';
import { CONSENT_DOCUMENT_VERSIONS } from '../domain/policies/config.ts';
import { missingRequiredConsent } from '../domain/policies/consent.policy.ts';

/** Port: persistence of consent decisions (MikroORM adapter in `infrastructure/`). */
export interface ConsentRepository {
  saveAll(consents: readonly Consent[]): Promise<void>;
  /** The most recent decision about the document, or `null` when there was none. */
  latest(userId: UserId, document: ConsentDocument): Promise<Consent | null>;
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
    const missing = missingRequiredConsent(input);
    if (missing !== null) {
      return err({ code: 'identity.required_consent_missing', document: missing });
    }
    const decidedAt = clock.now();
    const accepted = (Object.keys(CONSENT_DOCUMENT_VERSIONS) as ConsentDocument[]).filter(
      (d) => input[d],
    );
    const consents = accepted.map((document) => ({
      userId,
      document,
      version: CONSENT_DOCUMENT_VERSIONS[document],
      granted: true,
      decidedAt,
    }));
    await consentRepository.saveAll(consents);
    return ok(consents);
  };

export type RecordRegistrationConsents = ReturnType<typeof makeRecordRegistrationConsents>;
