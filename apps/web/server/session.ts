import { createRequestScope } from '@kompas/core';
import type { CurrentUser } from '@kompas/core/identity';
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
