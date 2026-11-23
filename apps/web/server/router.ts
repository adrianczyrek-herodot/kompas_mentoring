import { contract } from '@kompas/contracts';
import { createRequestScope, type Result } from '@kompas/core';
import {
  type CatalogError,
  type MentorProfile,
  toCatalogProblem,
  toMentorProfileView,
  toStepInput,
} from '@kompas/core/catalog';
import type { CurrentUser } from '@kompas/core/identity';
import {
  type BookingError,
  toExceptionInput,
  toExceptionView,
  toMentorAvailabilityView,
  toMentorCalendarView,
  toRuleInput,
  toScheduleSettings,
  toSchedulingProblem,
} from '@kompas/core/scheduling';
import { implement, ORPCError } from '@orpc/server';
import { Temporal } from 'temporal-polyfill';
import { getContainer } from './runtime.ts';

/** Request context given by the route handler: the browser's headers carry the session cookie. */
interface RequestContext {
  readonly headers: Headers;
}

const os = implement(contract).$context<RequestContext>();

const PROBLEM_CODES = {
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_CONTENT',
} as const;

/** Expected domain failures → RFC 9457 problem responses (spec §4.9). */
const problem = (error: CatalogError): ORPCError<string, unknown> => {
  const { status, code, issues } = toCatalogProblem(error);
  return new ORPCError(PROBLEM_CODES[status], { status, message: code, data: { code, issues } });
};

/** Same for `scheduling`: the problem codes are the domain codes (spec §4.9). */
const schedulingProblem = (error: BookingError): ORPCError<string, unknown> => {
  const { status, code, issues, bookingIds } = toSchedulingProblem(error);
  return new ORPCError(PROBLEM_CODES[status], {
    status,
    message: code,
    data: { code, issues, bookingIds },
  });
};

const unwrapScheduling = <T>(result: Result<T, BookingError>): T => {
  if (result.isErr()) throw schedulingProblem(result.error);
  return result.value;
};

/** Resolves the signed-in user and a request scope; 401 without a valid session. */
const authed = os.middleware(async ({ context, next }) => {
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const actor = await scope.cradle.getCurrentUser(context.headers);
  if (actor === null) throw new ORPCError('UNAUTHORIZED');
  return next({ context: { scope, actor } });
});

const viewOf = (profile: MentorProfile, actor: CurrentUser) =>
  toMentorProfileView(profile, { displayName: actor.name, photoUrl: null });

const unwrap = <T>(result: Result<T, CatalogError>): T => {
  if (result.isErr()) throw problem(result.error);
  return result.value;
};

const health = os.health.handler(async () => {
  const { databaseHealth, clock } = getContainer().cradle;
  const db = await databaseHealth();
  return {
    status: db === 'up' ? 'ok' : 'degraded',
    app: 'ok',
    db,
    version: process.env['APP_VERSION'] ?? 'dev',
    time: clock.now().toString(),
  } as const;
});

const myMentorProfile = os.myMentorProfile
  .use(authed)
  .handler(async ({ context: { scope, actor } }) =>
    viewOf(unwrap(await scope.cradle.openMyMentorProfile(actor)), actor),
  );

const saveProfileStep = os.saveProfileStep
  .use(authed)
  .handler(async ({ input, context: { scope, actor } }) => {
    const result = await scope.cradle.saveProfileStep(
      actor,
      toStepInput(input),
      input.expectedVersion,
    );
    return viewOf(unwrap(result), actor);
  });

/** Requirement 2: the browser uploads the photo straight to the storage. */
const requestPhotoUpload = os.requestPhotoUpload
  .use(authed)
  .handler(async ({ input, context: { scope, actor } }) =>
    unwrap(await scope.cradle.requestPhotoUpload(actor, input)),
  );

/** Requirement 2: the server confirms the type, the size and the dimensions of the file. */
const confirmPhotoUpload = os.confirmPhotoUpload
  .use(authed)
  .handler(async ({ input, context: { scope, actor } }) => {
    const result = await scope.cradle.confirmPhotoUpload(actor, input.key);
    return viewOf(unwrap(result), actor);
  });

/**
 * Requirement 20: public availability of one mentor (U1). No session — a guest sees the slots, and
 * the session is only needed at the hold. `:id` is the mentor profile id.
 */
const getMentorAvailability = os.getMentorAvailability.handler(async ({ input }) => {
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.getMentorAvailability({
    mentorProfileId: input.id,
    range: {
      from: Temporal.Instant.from(input.from),
      to: Temporal.Instant.from(input.to),
    },
    durationMinutes: input.duration ?? 30,
    kind: input.type ?? 'plan',
  });
  return toMentorAvailabilityView(unwrapScheduling(result), input.timeZone);
});

/** Q13: the M3 "pause new students" switch goes to `catalog`, the source of truth. */
const setAcceptingNew = os.setAcceptingNew
  .use(authed)
  .handler(async ({ input, context: { scope, actor } }) => {
    const profile = unwrap(
      await scope.cradle.setAcceptingNew(actor, {
        acceptingNew: input.acceptingNew,
        expectedVersion: input.expectedVersion,
      }),
    );
    return { acceptingNew: profile.acceptingNew, version: profile.version };
  });

/** M3: the mentor's own week of availability and sessions (sessions come in step 10). */
const getMentorCalendar = os.getMentorCalendar
  .use(authed)
  .handler(async ({ context: { scope, actor } }) =>
    toMentorCalendarView(unwrapScheduling(await scope.cradle.getMentorCalendar(actor))),
  );

/** M3 "Zapisz": replaces the weekly template (409 on a stale version, 422 on a bad grid). */
const saveAvailabilityTemplate = os.saveAvailabilityTemplate
  .use(authed)
  .handler(async ({ input, context: { scope, actor } }) => {
    const result = await scope.cradle.saveAvailabilityTemplate(actor, {
      rules: input.rules.map(toRuleInput),
      expectedVersion: input.expectedVersion,
      acknowledgeConflicts: input.acknowledgeConflicts ?? false,
    });
    return toMentorCalendarView(unwrapScheduling(result));
  });

const addAvailabilityException = os.addAvailabilityException
  .use(authed)
  .handler(async ({ input, context: { scope, actor } }) =>
    toExceptionView(
      unwrapScheduling(await scope.cradle.addAvailabilityException(actor, toExceptionInput(input))),
    ),
  );

const deleteAvailabilityException = os.deleteAvailabilityException
  .use(authed)
  .handler(async ({ input, context: { scope, actor } }) =>
    unwrapScheduling(await scope.cradle.deleteAvailabilityException(actor, input.id)),
  );

const updateMentorSettings = os.updateMentorSettings
  .use(authed)
  .handler(async ({ input, context: { scope, actor } }) =>
    toScheduleSettings(
      unwrapScheduling(
        await scope.cradle.updateMentorSettings(actor, {
          timeZone: input.timeZone,
          minNoticeMinutes: input.minNoticeMinutes,
          bufferMinutes: input.bufferMinutes,
          expectedVersion: input.expectedVersion,
        }),
      ),
    ),
  );

export const router = os.router({
  health,
  myMentorProfile,
  saveProfileStep,
  requestPhotoUpload,
  confirmPhotoUpload,
  setAcceptingNew,
  getMentorAvailability,
  getMentorCalendar,
  saveAvailabilityTemplate,
  addAvailabilityException,
  deleteAvailabilityException,
  updateMentorSettings,
});
