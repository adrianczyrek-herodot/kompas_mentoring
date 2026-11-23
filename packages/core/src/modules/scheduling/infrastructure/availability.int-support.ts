import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Temporal } from 'temporal-polyfill';
import { type AppContainer, createAppContainer, createRequestScope } from '../../../container.ts';
import { type Clock, MentorId, UserId } from '../../../shared/domain/index.ts';
import { migrateUp } from '../../../shared/infrastructure/db/orm.ts';
import { POSTGRES_IMAGE } from '../../../shared/infrastructure/db/test-database.ts';
import { parseEnv } from '../../../shared/infrastructure/env.ts';
import { createLogger } from '../../../shared/infrastructure/logger.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { GetMentorAvailabilityInput } from '../application/get-mentor-availability.query.ts';
import type { MentorAvailabilitySlots } from '../application/mentor-availability.ts';

// Fixtures of the two public-availability integration suites (steps 8). Not a test file itself: it
// imports no test framework, so eslint and knip treat it as ordinary module code.

const PASSWORD = 'correct-horse-battery';

/** Sunday 1 March 2026, 10:00 in Warsaw — a month before the spring-forward Sunday. */
export const NOW = Temporal.Instant.from('2026-03-01T09:00:00Z');

export const instant = (value: string): Temporal.Instant => Temporal.Instant.from(value);
const time = (value: string): Temporal.PlainTime => Temporal.PlainTime.from(value);

export interface AvailabilityEnv {
  readonly database: StartedPostgreSqlContainer;
  readonly container: AppContainer;
  /** Another process view of the same database with a different clock (DST months). */
  containerAt(clock: Clock): AppContainer;
  close(): Promise<void>;
}

/** The clock comes from the test file: this module must not import `@kompas/testing` (boundaries). */
export const startAvailabilityEnv = async (clock: Clock): Promise<AvailabilityEnv> => {
  const database = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
  const containerAt = (at: Clock): AppContainer =>
    createAppContainer({
      env: parseEnv({
        DATABASE_URL: database.getConnectionUri(),
        AUTH_BREACHED_PASSWORD_CHECK: 'off',
      }),
      logger: createLogger({ level: 'silent' }),
      clock: at,
    });
  const container = containerAt(clock);
  await migrateUp(container.cradle.orm);
  return {
    database,
    container,
    containerAt,
    close: async () => {
      await container.cradle.boss.stop({ graceful: false });
      await container.cradle.orm.close();
      await database.stop();
    },
  };
};

let requestCounter = 0;
const scopeOf = (container: AppContainer) =>
  createRequestScope(container, { requestId: `int-availability-${(requestCounter += 1)}` });

const userWith = async (container: AppContainer): Promise<CurrentUser> => {
  const email = `availability-${crypto.randomUUID()}@example.com`;
  const body = {
    name: 'Marta',
    email,
    password: PASSWORD,
    terms: true,
    privacy: true,
    as: 'mentor',
  };
  const { user } = await container.cradle.auth.api.signUpEmail({ body });
  return {
    id: UserId.parse(user.id),
    name: user.name,
    email,
    emailVerified: true,
    twoFactorEnabled: false,
    roles: ['mentor'],
  };
};

/**
 * A mentor the projection knows as bookable: the profile comes from the M1 query, the projection
 * from its repository (the publishing path is covered in `bookability.int.test.ts`).
 */
export const bookableMentor = async (
  container: AppContainer,
): Promise<{ mentor: CurrentUser; profileId: string }> => {
  const mentor = await userWith(container);
  const scope = scopeOf(container);
  const profile = (await scope.cradle.openMyMentorProfile(mentor))._unsafeUnwrap();
  await scope.cradle.mentorBookabilityRepository.upsert({
    mentorId: MentorId.parse(mentor.id),
    mentorProfileId: profile.id,
    bookable: true,
    acceptingNew: true,
    rate60: null,
    updatedAt: NOW,
  });
  return { mentor, profileId: profile.id };
};

export const saveTemplate = async (
  container: AppContainer,
  mentor: CurrentUser,
  rules: { weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7; start: string; end: string }[],
): Promise<void> => {
  const scope = scopeOf(container);
  const calendar = (await scope.cradle.getMentorCalendar(mentor))._unsafeUnwrap();
  await scope.cradle
    .saveAvailabilityTemplate(mentor, {
      rules: rules.map((rule) => ({
        weekday: rule.weekday,
        startLocal: time(rule.start),
        endLocal: time(rule.end),
      })),
      expectedVersion: calendar.schedule.version,
      acknowledgeConflicts: false,
    })
    .then((result) => result._unsafeUnwrap());
};

export const setSettings = async (
  container: AppContainer,
  mentor: CurrentUser,
  settings: { timeZone: string; minNoticeMinutes: number; bufferMinutes: number },
): Promise<void> => {
  const scope = scopeOf(container);
  const calendar = (await scope.cradle.getMentorCalendar(mentor))._unsafeUnwrap();
  await scope.cradle
    .updateMentorSettings(mentor, {
      ...settings,
      expectedVersion: calendar.schedule.version,
    })
    .then((result) => result._unsafeUnwrap());
};

export const addException = async (
  container: AppContainer,
  mentor: CurrentUser,
  exception: { startsAt: Temporal.Instant; endsAt: Temporal.Instant; kind: 'off' | 'extra' },
): Promise<void> => {
  await scopeOf(container)
    .cradle.addAvailabilityException(mentor, { ...exception, note: null })
    .then((result) => result._unsafeUnwrap());
};

export const readAvailability = async (
  container: AppContainer,
  input: GetMentorAvailabilityInput,
): Promise<MentorAvailabilitySlots> =>
  scopeOf(container)
    .cradle.getMentorAvailability(input)
    .then((result) => result._unsafeUnwrap());

export const startsAtOf = (slots: MentorAvailabilitySlots): string[] =>
  slots.slots.map((slot) => slot.startsAt.toString());
