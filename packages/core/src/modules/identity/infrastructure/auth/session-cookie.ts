import { getSessionCookie } from 'better-auth/cookies';

/**
 * Optimistic check for `proxy.ts`: is there a session cookie at all? Only pages and commands
 * verify the session itself (`getCurrentUser`), as the Next.js docs recommend for proxies.
 */
export const hasSessionCookie = (headers: Headers): boolean => getSessionCookie(headers) !== null;
