import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { asValue } from 'awilix';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type AppContainer, createAppContainer, createRequestScope } from '../../../container.ts';
import { UserId } from '../../../shared/domain/index.ts';
import { migrateUp } from '../../../shared/infrastructure/db/orm.ts';
import {
  dockerAvailable,
  integrationSuite,
  POSTGRES_IMAGE,
} from '../../../shared/infrastructure/db/test-database.ts';
import { parseEnv } from '../../../shared/infrastructure/env.ts';
import { createLogger } from '../../../shared/infrastructure/logger.ts';

const PASSWORD = 'correct-horse-battery';
const HOUR_MS = 3_600_000;

describe.skipIf(!dockerAvailable)(integrationSuite('identity: Better Auth on PostgreSQL'), () => {
  let database: StartedPostgreSqlContainer;
  let container: AppContainer;
  const sentLinks: string[] = [];

  /** P4 body: Better Auth fields plus the role choice and consents read by the sign-up hooks. */
  const signUp = (email: string, password = PASSWORD, extra: Record<string, unknown> = {}) => {
    const body = { name: 'Ola Nowak', email, password, terms: true, privacy: true, ...extra };
    return container.cradle.auth.api.signUpEmail({ body });
  };

  const consentsOf = (userId: string) =>
    container.cradle.orm.em
      .getConnection()
      .execute<{ document: string; version: string }[]>(
        `select "document", "version" from "identity"."consent" where "user_id" = ? order by "document"`,
        [userId],
      );

  const scopeOf = (requestId: string) => createRequestScope(container, { requestId });

  /** Signs in and returns the request headers of a browser holding the session cookie. */
  const signIn = async (email: string, password = PASSWORD): Promise<Headers> => {
    const { headers } = await container.cradle.auth.api.signInEmail({
      body: { email, password },
      returnHeaders: true,
    });
    const cookie = (headers.get('set-cookie') ?? '').split(';')[0] ?? '';
    return new Headers({ cookie });
  };

  beforeAll(async () => {
    database = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
    container = createAppContainer({
      env: parseEnv({
        DATABASE_URL: database.getConnectionUri(),
        AUTH_BREACHED_PASSWORD_CHECK: 'off',
      }),
      logger: createLogger({ level: 'silent' }),
    });
    container.register({
      emailVerificationSender: asValue({
        sendVerificationLink: ({ url }: { url: string }) => {
          sentLinks.push(url);
          return Promise.resolve();
        },
      }),
    });
    await migrateUp(container.cradle.orm);
  });

  afterAll(async () => {
    await container.cradle.orm.close();
    await database.stop();
  });

  it('registers a student and sends the verification link', async () => {
    const { user } = await signUp('ola@example.com');
    expect(user).toMatchObject({ email: 'ola@example.com', emailVerified: false });
    expect(user.roles).toEqual(['student']);
    expect(UserId.safeParse(user.id).success).toBe(true);
    expect(sentLinks).toHaveLength(1);
  });

  it('rejects passwords shorter than 10 characters', async () => {
    await expect(signUp('short@example.com', 'too-short')).rejects.toThrow();
  });

  it('signs in and reads a 30-day session from the cookie', async () => {
    const headers = await signIn('ola@example.com');
    const current = await container.cradle.auth.api.getSession({ headers });
    expect(current?.user.email).toBe('ola@example.com');
    const ttl = (current?.session.expiresAt.getTime() ?? 0) - Date.now();
    expect(ttl).toBeGreaterThan(29 * 24 * HOUR_MS);
  });

  it('resolves the signed-in user of a request scope', async () => {
    const scope = createRequestScope(container, { requestId: 'int-current-user' });
    const user = await scope.cradle.getCurrentUser(await signIn('ola@example.com'));
    expect(user).toMatchObject({ email: 'ola@example.com', roles: ['student'] });
    expect(await scope.cradle.getCurrentUser(new Headers())).toBeNull();
  });

  it('rejects a wrong password', async () => {
    await expect(signIn('ola@example.com', 'wrong-password-123')).rejects.toThrow();
  });

  it('records consents given at sign-up with document versions', async () => {
    const { user } = await signUp('consents@example.com', PASSWORD, { marketing: true });
    await expect
      .poll(() => consentsOf(user.id))
      .toEqual([
        { document: 'marketing', version: '2026-11-10' },
        { document: 'privacy', version: '2026-11-10' },
        { document: 'terms', version: '2026-11-10' },
      ]);
  });

  it('refuses sign-up without the required consents', async () => {
    await expect(signUp('no-terms@example.com', PASSWORD, { terms: false })).rejects.toThrow();
  });

  it('gives the mentor role to those who want to mentor (Q3)', async () => {
    const { user } = await signUp('mentor@example.com', PASSWORD, { as: 'mentor' });
    expect(user.roles).toEqual(['mentor']);
  });

  it('keeps the latest marketing decision and pending data requests (S3)', async () => {
    await signUp('account@example.com', PASSWORD, { marketing: true });
    const headers = await signIn('account@example.com');
    const actor = await scopeOf('int-s3-actor').cradle.getCurrentUser(headers);
    if (actor === null) throw new Error('expected a signed-in user');

    await scopeOf('int-s3-withdraw').cradle.setMarketingConsent(actor, false);
    const first = await scopeOf('int-s3-export').cradle.requestPersonalData(actor, 'export');
    const again = await scopeOf('int-s3-export-again').cradle.requestPersonalData(actor, 'export');
    expect(again._unsafeUnwrap().id).toBe(first._unsafeUnwrap().id);

    const overview = await scopeOf('int-s3-overview').cradle.getAccountOverview(actor, actor.id);
    expect(overview._unsafeUnwrap()).toEqual({
      marketingConsent: false,
      pendingRequests: ['export'],
    });
  });
});
