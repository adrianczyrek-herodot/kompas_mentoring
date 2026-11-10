import { DEFAULT_RETURN_TO } from './config.ts';

// Auth pages: returning to them after login would loop.
const AUTH_PATHS = ['/logowanie', '/rejestracja'];

/** Control characters (C0, DEL) and backslashes: browsers normalise them into other hosts. */
const hasUnsafeCharacter = (value: string): boolean => {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f || code === 0x5c) {
      return true;
    }
  }
  return false;
};

/**
 * Requirement 4 (F1): after login go back to `returnTo`, but only to an internal path —
 * anything that could leave the site (absolute URLs, `//host`, `/\host`, control characters)
 * falls back to the default, which blocks open redirects.
 */
export const safeReturnTo = (raw: string | null | undefined): string => {
  if (!raw?.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) {
    return DEFAULT_RETURN_TO;
  }
  if (hasUnsafeCharacter(raw)) {
    return DEFAULT_RETURN_TO;
  }
  const path = raw.split(/[?#]/)[0] ?? raw;
  return AUTH_PATHS.includes(path) ? DEFAULT_RETURN_TO : raw;
};
