import { hasPermission, mustSetUpTwoFactor } from '@kompas/core/identity';
import { forbidden, redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSessionState } from '../../server/session.ts';

const ADMIN_HOME = '/admin';
const SIGN_IN = `/logowanie?returnTo=${encodeURIComponent(ADMIN_HOME)}`;
const SESSION_EXPIRED = '/logowanie?reason=admin-session-expired';
const SET_UP_2FA = `/konto/2fa?reason=2fa&returnTo=${encodeURIComponent(ADMIN_HOME)}`;

/**
 * Guard for every `/admin/*` route (spec §8: checked server-side, not in the UI — `proxy.ts` only
 * sees the cookie). Order: session → `admin.access` → mandatory 2FA for admins (s07).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, expiredByAdminPolicy } = await getSessionState();
  if (user === null) redirect(expiredByAdminPolicy ? SESSION_EXPIRED : SIGN_IN);
  if (!hasPermission(user.roles, 'admin.access')) forbidden();
  if (mustSetUpTwoFactor(user.roles, user.twoFactorEnabled)) redirect(SET_UP_2FA);
  return <>{children}</>;
}
