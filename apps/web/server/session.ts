import { createRequestScope } from '@kompas/core';
import { type CurrentUser, hasPermission } from '@kompas/core/identity';
import { headers } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';
import { cache } from 'react';
import { getContainer } from './runtime.ts';

/** Signed-in user of the current request (one lookup per render, shared by layout and page). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Reading headers first makes the route dynamic, so `next build` never builds the container.
  const requestHeaders = await headers();
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  return scope.cradle.getCurrentUser(requestHeaders);
});

/** Admin routes: guests sign in first, other roles get 403 (spec §8); 2FA is checked by pages. */
export const requireAdmin = async (path: string): Promise<CurrentUser> => {
  const user = await getCurrentUser();
  if (user === null) redirect(`/logowanie?returnTo=${encodeURIComponent(path)}`);
  if (!hasPermission(user.roles, 'admin.access')) forbidden();
  return user;
};
