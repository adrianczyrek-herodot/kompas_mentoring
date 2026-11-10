import { type AwilixContainer, asClass, asFunction } from 'awilix';
import type { BetterAuthPlugin } from 'better-auth';
import type { Clock } from '../../shared/domain/index.ts';
import { UserId } from '../../shared/domain/index.ts';
import type { DatabaseCradle } from '../../shared/infrastructure/db/database-cradle.ts';
import type { Env } from '../../shared/infrastructure/env.ts';
import type { Logger } from '../../shared/infrastructure/logger.ts';
import {
  type DataRequestRepository,
  makeRequestPersonalData,
  makeSetMarketingConsent,
  type RequestPersonalData,
  type SetMarketingConsent,
} from './application/account.commands.ts';
import type { EmailVerificationSender } from './application/email-verification-sender.port.ts';
import {
  type GetAccountOverview,
  makeGetAccountOverview,
} from './application/get-account-overview.query.ts';
import {
  type GetCurrentUser,
  makeGetCurrentUser,
  type SessionReader,
} from './application/get-current-user.query.ts';
import {
  type ConsentRepository,
  makeRecordRegistrationConsents,
  type RecordRegistrationConsents,
} from './application/record-registration-consents.command.ts';
import {
  type CreateAdminAccount,
  makeCreateAdminAccount,
} from './infrastructure/auth/admin-accounts.ts';
import { BetterAuthSessionReader } from './infrastructure/auth/better-auth-session-reader.ts';
import { type Auth, createAuth } from './infrastructure/auth/create-auth.ts';
import { ConsentRecord } from './infrastructure/consent.record.ts';
import { DataRequestRecord } from './infrastructure/data-request.record.ts';
import { LoggingEmailVerificationSender } from './infrastructure/email/logging-email-verification-sender.ts';
import { MikroOrmConsentRepository } from './infrastructure/mikro-orm-consent.repository.ts';
import { MikroOrmDataRequestRepository } from './infrastructure/mikro-orm-data-request.repository.ts';
import { UserRecord } from './infrastructure/user.record.ts';
import { Migration20261110000000IdentityAuth } from './migrations/Migration20261110000000IdentityAuth.ts';
import { Migration20261110120000AccountRequests } from './migrations/Migration20261110120000AccountRequests.ts';

/** Picked up by the ORM configuration (explicit lists, no globbing). */
export const identityEntities = [UserRecord, ConsentRecord, DataRequestRecord];
export const identityMigrations = [
  { name: 'Migration20261110000000IdentityAuth', class: Migration20261110000000IdentityAuth },
  { name: 'Migration20261110120000AccountRequests', class: Migration20261110120000AccountRequests },
];

export interface IdentityCradle {
  /** Better Auth instance (one per process); apps mount its handler and read sessions with it. */
  auth: Auth;
  /** Framework plugins for Better Auth given by the app (e.g. `nextCookies()` in web). */
  authPlugins: readonly BetterAuthPlugin[];
  emailVerificationSender: EmailVerificationSender;
  sessionReader: SessionReader;
  /** CLI only (`pnpm admin:create`), Q4. */
  createAdminAccount: CreateAdminAccount;
  getCurrentUser: GetCurrentUser;
  consentRepository: ConsentRepository;
  recordRegistrationConsents: RecordRegistrationConsents;
  dataRequestRepository: DataRequestRepository;
  getAccountOverview: GetAccountOverview;
  setMarketingConsent: SetMarketingConsent;
  requestPersonalData: RequestPersonalData;
}

type Deps = IdentityCradle & DatabaseCradle & { env: Env; logger: Logger; clock: Clock };

/** Registers the identity module: Better Auth on the shared pool, consents per request scope. */
export const registerIdentityModule = (container: AwilixContainer<Deps>): void => {
  container.register({
    emailVerificationSender: asClass(LoggingEmailVerificationSender).singleton(),
    auth: asFunction(({ orm, env, clock, emailVerificationSender, authPlugins }: Deps) =>
      createAuth({
        db: orm.em.getConnection().getClient(),
        env,
        emailVerificationSender,
        // Runs outside any request scope (Better Auth hook), so it uses its own EntityManager fork.
        recordSignUpConsents: async (userId, consents) => {
          const record = makeRecordRegistrationConsents({
            clock,
            consentRepository: new MikroOrmConsentRepository({ em: orm.em.fork() }),
          });
          const result = await record(UserId.parse(userId), consents);
          // The `before` hook already rejected sign-ups without the required consents.
          if (result.isErr()) throw new Error(`Unexpected consent error: ${result.error.code}`);
        },
        checkBreachedPasswords: env.AUTH_BREACHED_PASSWORD_CHECK === 'on',
        plugins: authPlugins,
      }),
    ).singleton(),
    sessionReader: asClass(BetterAuthSessionReader).singleton(),
    createAdminAccount: asFunction(makeCreateAdminAccount).singleton(),
    getCurrentUser: asFunction(makeGetCurrentUser).scoped(),
    consentRepository: asClass(MikroOrmConsentRepository).scoped(),
    recordRegistrationConsents: asFunction(makeRecordRegistrationConsents).scoped(),
    dataRequestRepository: asClass(MikroOrmDataRequestRepository).scoped(),
    getAccountOverview: asFunction(makeGetAccountOverview).scoped(),
    setMarketingConsent: asFunction(makeSetMarketingConsent).scoped(),
    requestPersonalData: asFunction(makeRequestPersonalData).scoped(),
  });
};
