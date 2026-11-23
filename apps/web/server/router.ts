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
import { implement, ORPCError } from '@orpc/server';
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

export const router = os.router({ health, myMentorProfile, saveProfileStep });
