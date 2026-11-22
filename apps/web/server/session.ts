import { createRequestScope } from '@kompas/core';
import { type CurrentUser, sessionEndedByAdminPolicy } from '@kompas/core/identity';
import { headers } from 'next/headers';
import { cache } from 'react';
import { getContainer } from './runtime.ts';

/** Signed-in user of the current request (one lookup per render, shared by layout and page). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Reading headers first makes the route dynamic, so `next build` never builds the container.
  const requestHeaders = await headers();
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  return scope.cradle.getCurrentUser(requestHeaders);
});

export interface SessionState {
  readonly user: CurrentUser | null;
  /** True when the 12 h admin cap — not the session's own expiry — ended the session (F1 Q5). */
  readonly expiredByAdminPolicy: boolean;
}

/**
 * Like `getCurrentUser`, but tells apart "no session" from "an admin session passed its 12 h",
 * so s01 can show the admin-specific expiry message instead of the generic one (spec [s01, s07]).
 */
export const getSessionState = cache(async (): Promise<SessionState> => {
  const requestHeaders = await headers();
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const user = await scope.cradle.getCurrentUser(requestHeaders);
  if (user !== null) return { user, expiredByAdminPolicy: false };
  const session = await scope.cradle.sessionReader.read(requestHeaders);
  if (session === null) return { user: null, expiredByAdminPolicy: false };
  return {
    user: null,
    expiredByAdminPolicy: sessionEndedByAdminPolicy(
      session.user.roles,
      session,
      scope.cradle.clock.now(),
    ),
  };
});
