import { hasPermission } from '@kompas/core/identity';
import type { ReactNode } from 'react';
import { forbidden, redirect } from 'next/navigation';
import { getCurrentUser } from '../../server/session.ts';

/**
 * Guard of the mentor area (spec F2, requirement 5): a session and the role `mentor`. The
 * session cookie alone is checked by `proxy.ts`; the role and the status of the profile are
 * checked here, where the session can be verified.
 */
export default async function MentorLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (user === null) redirect('/logowanie?returnTo=%2Fmentor');
  if (!hasPermission(user.roles, 'mentor.access')) forbidden();
  return children;
}
