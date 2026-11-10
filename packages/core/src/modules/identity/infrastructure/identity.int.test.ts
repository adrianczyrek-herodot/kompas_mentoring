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

  const signUp = (email: string, password = PASSWORD) =>
    container.cradle.auth.api.signUpEmail({ body: { name: 'Ola Nowak', email, password } });

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
      env: parseEnv({ DATABASE_URL: database.getConnectionUri(), NODE_ENV: 'test' }),
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

  it('rejects a wrong password', async () => {
    await expect(signIn('ola@example.com', 'wrong-password-123')).rejects.toThrow();
  });

  it('records registration consents with document versions', async () => {
    const { user } = await signUp('consents@example.com');
    const scope = createRequestScope(container, { requestId: 'int-consents' });
    const result = await scope.cradle.recordRegistrationConsents(UserId.parse(user.id), {
      terms: true,
      privacy: true,
      marketing: false,
    });
    expect(result.isOk()).toBe(true);
    const rows = await container.cradle.orm.em
      .getConnection()
      .execute<{ document: string; version: string }[]>(
        `select "document", "version" from "identity"."consent" where "user_id" = ? order by "document"`,
        [user.id],
      );
    expect(rows).toEqual([
      { document: 'privacy', version: '2026-11-10' },
      { document: 'terms', version: '2026-11-10' },
    ]);
  });
});
