// Public API of the identity module — the only file other modules and apps may import.
export type {
  ConsentRepository,
  RecordRegistrationConsents,
  RegistrationConsentInput,
} from './application/record-registration-consents.command.ts';
export type { Consent, ConsentDocument } from './domain/consent.entity.ts';
export type { IdentityError } from './domain/identity.errors.ts';
export { checkPasswordLength } from './domain/policies/password.policy.ts';
export { safeReturnTo } from './domain/policies/return-to.policy.ts';
export { mustSetUpTwoFactor, sessionTtlFor } from './domain/policies/session.policy.ts';
export { hasPermission, isAdmin, type Permission, ROLES, type Role } from './domain/role.ts';
