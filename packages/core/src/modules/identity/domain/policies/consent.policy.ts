import type { ConsentDocument } from '../consent.entity.ts';

/** P4: terms and privacy must be accepted to create an account; marketing is optional. */
export const REQUIRED_CONSENTS = ['terms', 'privacy'] as const satisfies readonly ConsentDocument[];

export const missingRequiredConsent = (
  accepted: Readonly<Record<ConsentDocument, boolean>>,
): (typeof REQUIRED_CONSENTS)[number] | null =>
  REQUIRED_CONSENTS.find((document) => !accepted[document]) ?? null;
