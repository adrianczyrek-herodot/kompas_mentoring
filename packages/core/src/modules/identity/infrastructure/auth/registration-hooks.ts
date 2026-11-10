import type { GenericEndpointContext, User } from 'better-auth';
import { APIError } from 'better-auth/api';
import { z } from 'zod';
import type { RegistrationConsentInput } from '../../application/record-registration-consents.command.ts';
import { missingRequiredConsent } from '../../domain/policies/consent.policy.ts';

const EMAIL_SIGN_UP = '/sign-up/email';

/** Extra fields of the P4 sign-up body: "I want to learn / mentor" (Q3) and consents. */
const RegistrationBody = z.object({
  as: z.enum(['student', 'mentor']).default('student'),
  terms: z.boolean().default(false),
  privacy: z.boolean().default(false),
  marketing: z.boolean().default(false),
});

/** Social sign-up: the buttons state that continuing accepts the terms and privacy policy. */
const SOCIAL_SIGN_UP_CONSENTS: RegistrationConsentInput = {
  terms: true,
  privacy: true,
  marketing: false,
};

export type RecordSignUpConsents = (
  userId: string,
  consents: RegistrationConsentInput,
) => Promise<void>;

const registrationOf = (ctx: GenericEndpointContext) => {
  const parsed = RegistrationBody.safeParse(ctx.body ?? {});
  if (!parsed.success) {
    throw APIError.from('BAD_REQUEST', {
      code: 'INVALID_REGISTRATION',
      message: 'Invalid sign-up',
    });
  }
  return parsed.data;
};

/**
 * `databaseHooks.user.create` of Better Auth: e-mail sign-up requires terms and privacy and sets
 * the chosen role; consents are recorded after the user's transaction commits (Better Auth runs
 * `after` hooks then), so the `consent → user` foreign key holds.
 */
export const registrationHooks = (recordConsents: RecordSignUpConsents) => ({
  before: (user: User, ctx: GenericEndpointContext | null) => {
    if (ctx?.path !== EMAIL_SIGN_UP) return Promise.resolve();
    const registration = registrationOf(ctx);
    const missing = missingRequiredConsent(registration);
    if (missing !== null) {
      throw APIError.from('BAD_REQUEST', {
        code: 'REQUIRED_CONSENT_MISSING',
        message: `Consent required: ${missing}`,
      });
    }
    return Promise.resolve({ data: { ...user, roles: [registration.as] } });
  },
  after: async (user: User, ctx: GenericEndpointContext | null) => {
    // No endpoint context: users created by scripts (admin seed) record no consents.
    if (ctx === null) return;
    await recordConsents(
      user.id,
      ctx.path === EMAIL_SIGN_UP ? registrationOf(ctx) : SOCIAL_SIGN_UP_CONSENTS,
    );
  },
});
