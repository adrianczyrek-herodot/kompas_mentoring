import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type AppContainer, createAppContainer, createRequestScope } from '../../../container.ts';
import { money, UserId } from '../../../shared/domain/index.ts';
import { migrateUp } from '../../../shared/infrastructure/db/orm.ts';
import {
  dockerAvailable,
  integrationSuite,
  POSTGRES_IMAGE,
} from '../../../shared/infrastructure/db/test-database.ts';
import { parseEnv } from '../../../shared/infrastructure/env.ts';
import { createLogger } from '../../../shared/infrastructure/logger.ts';
import type { CurrentUser, Role } from '../../identity/index.ts';
import { CATEGORY_SLUGS } from '../domain/policies/config.ts';

const PASSWORD = 'correct-horse-battery';

describe.skipIf(!dockerAvailable)(
  integrationSuite('catalog: mentor profile drafts on PostgreSQL'),
  () => {
    let database: StartedPostgreSqlContainer;
    let container: AppContainer;
    let counter = 0;

    const scope = () =>
      createRequestScope(container, { requestId: `int-catalog-${(counter += 1)}` });

    /** Signs a user up through Better Auth (the profile references identity.user) and returns the actor. */
    const userWith = async (role: Role = 'mentor'): Promise<CurrentUser> => {
      const email = `catalog-${crypto.randomUUID()}@example.com`;
      const as = role === 'mentor' ? 'mentor' : 'student';
      const body = { name: 'Łucja', email, password: PASSWORD, terms: true, privacy: true, as };
      const { user } = await container.cradle.auth.api.signUpEmail({ body });
      return {
        id: UserId.parse(user.id),
        name: user.name,
        email,
        emailVerified: true,
        twoFactorEnabled: false,
        roles: [role],
      };
    };

    const rows = <T>(sql: string, params: unknown[] = []) =>
      container.cradle.orm.em.getConnection().execute<T[]>(sql, params);

    beforeAll(async () => {
      database = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
      container = createAppContainer({
        env: parseEnv({
          DATABASE_URL: database.getConnectionUri(),
          AUTH_BREACHED_PASSWORD_CHECK: 'off',
        }),
        logger: createLogger({ level: 'silent' }),
      });
      await migrateUp(container.cradle.orm);
    });

    afterAll(async () => {
      await container.cradle.orm.close();
      await database.stop();
    });

    it('seeds the closed category list of the domain config (Q3)', async () => {
      const categories = await rows<{ slug: string }>(
        'select "slug" from "catalog"."category" order by "sort"',
      );
      expect(categories.map((row) => row.slug)).toEqual([...CATEGORY_SLUGS]);
    });

    it('creates exactly one draft even when two tabs open M1 at once', async () => {
      const mentor = await userWith();
      const [a, b] = await Promise.all([
        scope().cradle.openMyMentorProfile(mentor),
        scope().cradle.openMyMentorProfile(mentor),
      ]);
      expect(a._unsafeUnwrap().id).toBe(b._unsafeUnwrap().id);
      const count = await rows<{ n: string }>(
        'select count(*) as n from "catalog"."mentor_profile" where "user_id" = ?',
        [mentor.id],
      );
      expect(Number(count[0]?.n)).toBe(1);
    });

    it('round-trips every step 1–4 field and derives the completed steps', async () => {
      const mentor = await userWith();
      const { cradle } = scope();
      await cradle.openMyMentorProfile(mentor);
      const steps = [
        { step: 'about', fields: { country: 'PL', languages: ['pl', 'en'] } },
        {
          step: 'skills',
          fields: {
            categories: ['data-ai', 'it-programowanie'],
            tags: ['SQL', 'Python', 'dbt'],
            yearsExperience: 8,
            experience: [
              { company: 'Allegro', role: 'Data engineer', fromYear: 2018, toYear: null },
            ],
          },
        },
        {
          step: 'bio',
          fields: {
            headline: 'Pomagam wejść do data engineeringu',
            bio: 'b'.repeat(320),
            videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
          },
        },
        { step: 'rate', fields: { rate60: money.of(18_000n) } },
      ] as const;
      let version = 1;
      for (const input of steps) {
        const saved = await scope().cradle.saveProfileStep(mentor, input, version);
        version = saved._unsafeUnwrap().version;
      }
      const stored = (await scope().cradle.openMyMentorProfile(mentor))._unsafeUnwrap();
      expect(stored).toMatchObject({
        version: 5,
        country: 'PL',
        languages: ['pl', 'en'],
        categories: ['data-ai', 'it-programowanie'],
        tags: ['SQL', 'Python', 'dbt'],
        yearsExperience: 8,
        experience: [{ company: 'Allegro', role: 'Data engineer', fromYear: 2018, toYear: null }],
        video: { provider: 'youtube', videoId: 'dQw4w9WgXcQ' },
        rate60: money.of(18_000n),
        // Step 1 still lacks the photo (step 4 of the plan pins it).
        completedSteps: ['skills', 'bio', 'rate'],
      });
    });

    it('shares one tag row per normalised form across mentors (Q3)', async () => {
      for (const label of ['React', 'react ']) {
        const mentor = await userWith();
        await scope().cradle.openMyMentorProfile(mentor);
        const fields = {
          categories: ['it-programowanie'],
          tags: [label, 'TypeScript', 'Node'],
          yearsExperience: 3,
          experience: [],
        };
        (
          await scope().cradle.saveProfileStep(mentor, { step: 'skills', fields }, 1)
        )._unsafeUnwrap();
      }
      const tags = await rows<{ normalized: string }>(
        `select "normalized" from "catalog"."tag" where "normalized" = 'react'`,
      );
      expect(tags).toHaveLength(1);
    });

    it('answers a stale version with a conflict and keeps the first save (409)', async () => {
      const mentor = await userWith();
      await scope().cradle.openMyMentorProfile(mentor);
      const rate = (zloty: bigint) =>
        ({ step: 'rate', fields: { rate60: money.of(zloty * 100n) } }) as const;
      (await scope().cradle.saveProfileStep(mentor, rate(150n), 1))._unsafeUnwrap();
      const stale = await scope().cradle.saveProfileStep(mentor, rate(300n), 1);
      expect(stale._unsafeUnwrapErr()).toEqual({ code: 'catalog.version_conflict' });
      const stored = (await scope().cradle.openMyMentorProfile(mentor))._unsafeUnwrap();
      expect(stored.rate60).toEqual(money.of(15_000n));
    });

    it('keeps every mentor on their own profile and refuses other roles', async () => {
      const owner = await userWith();
      const other = await userWith();
      const ownerProfile = (await scope().cradle.openMyMentorProfile(owner))._unsafeUnwrap();
      // The other mentor has no profile yet: saving reaches nothing (404), never the owner's profile.
      const rate = { step: 'rate', fields: { rate60: money.of(20_000n) } } as const;
      expect(
        (
          await scope().cradle.saveProfileStep(other, rate, ownerProfile.version)
        )._unsafeUnwrapErr(),
      ).toEqual({
        code: 'catalog.not_found',
      });
      const student = await userWith('student');
      expect((await scope().cradle.openMyMentorProfile(student))._unsafeUnwrapErr()).toEqual({
        code: 'catalog.forbidden',
      });
      const stored = (await scope().cradle.openMyMentorProfile(owner))._unsafeUnwrap();
      expect(stored.version).toBe(ownerProfile.version);
    });
  },
);
