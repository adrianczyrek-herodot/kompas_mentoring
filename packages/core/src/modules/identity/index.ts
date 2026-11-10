// Public API of the identity module — the only file other modules and apps may import.

export type { AccountOverview } from './application/get-account-overview.query.ts';
export type { CurrentUser } from './application/get-current-user.query.ts';
export type {
  ConsentRepository,
  RecordRegistrationConsents,
  RegistrationConsentInput,
} from './application/record-registration-consents.command.ts';
export type { Consent, ConsentDocument } from './domain/consent.entity.ts';
export type { DataRequestKind } from './domain/data-request.entity.ts';
export type { Forbidden, IdentityError, NotFound } from './domain/identity.errors.ts';
export { checkPasswordLength } from './domain/policies/password.policy.ts';
export { safeReturnTo } from './domain/policies/return-to.policy.ts';
export { mustSetUpTwoFactor, sessionExpiresAt } from './domain/policies/session.policy.ts';
export { hasPermission, isAdmin, type Permission, ROLES, type Role } from './domain/role.ts';
export type { Auth } from './infrastructure/auth/create-auth.ts';
export { hasSessionCookie } from './infrastructure/auth/session-cookie.ts';
export {
  enabledSocialProviders,
  type SocialProvider,
} from './infrastructure/auth/social-providers.ts';
