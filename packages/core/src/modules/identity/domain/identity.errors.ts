import type { DomainError } from '../../../shared/domain/index.ts';

export type PasswordTooShort = DomainError<'identity.password_too_short'> & {
  readonly minLength: number;
};
export type PasswordTooLong = DomainError<'identity.password_too_long'> & {
  readonly maxLength: number;
};
export type RequiredConsentMissing = DomainError<'identity.required_consent_missing'> & {
  readonly document: 'terms' | 'privacy';
};

/** Every expected identity failure; mapped to RFC 9457 problems at the API edge (spec §4.9). */
export type IdentityError = PasswordTooShort | PasswordTooLong | RequiredConsentMissing;
