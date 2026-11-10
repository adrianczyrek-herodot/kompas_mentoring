import type { SocialProvider } from '@kompas/core/identity';
import type { Credentials } from './auth-validation.ts';

/** Failures shown above the form; keys of `Auth.failure` in messages/pl.json. */
export type AuthFailure =
  | 'invalidCredentials'
  | 'accountExists'
  | 'passwordCompromised'
  | 'consentMissing'
  | 'invalidPassword'
  | 'tooManyAttempts'
  | 'unexpected';

/** Better Auth error codes → what the user sees (never which field was wrong, spec P4). */
const FAILURES: Record<string, AuthFailure> = {
  INVALID_EMAIL_OR_PASSWORD: 'invalidCredentials',
  USER_ALREADY_EXISTS: 'accountExists',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'accountExists',
  PASSWORD_COMPROMISED: 'passwordCompromised',
  REQUIRED_CONSENT_MISSING: 'consentMissing',
  INVALID_PASSWORD: 'invalidPassword',
};

const post = async (path: string, body: object): Promise<Response> =>
  fetch(`/api/auth${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

const failureOf = async (response: Response): Promise<AuthFailure | null> => {
  if (response.ok) return null;
  if (response.status === 429) return 'tooManyAttempts';
  const body = (await response.json().catch(() => ({}))) as { code?: string };
  return FAILURES[body.code ?? ''] ?? 'unexpected';
};

/** Any Better Auth endpoint called from the browser (rate limit and origin check apply). */
export const callAuthApi = async (path: string, body: object = {}): Promise<AuthFailure | null> =>
  failureOf(await post(path, body));

export const signInWithEmail = async (credentials: Credentials): Promise<AuthFailure | null> =>
  failureOf(
    await post('/sign-in/email', {
      email: credentials.email,
      password: credentials.password,
      rememberMe: true,
    }),
  );

/** Sign-up body: Better Auth fields + role choice and consents read by the identity hooks. */
export const signUpWithEmail = async (credentials: Credentials): Promise<AuthFailure | null> =>
  failureOf(
    await post('/sign-up/email', {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
      as: credentials.as,
      terms: credentials.terms,
      privacy: credentials.terms,
      marketing: credentials.marketing,
    }),
  );

/** Redirects to the provider; Better Auth returns to `returnTo` after the callback. */
export const signInWithProvider = async (provider: SocialProvider, returnTo: string) => {
  const response = await post('/sign-in/social', { provider, callbackURL: returnTo });
  const body = (await response.json()) as { url?: string };
  if (body.url !== undefined) window.location.assign(body.url);
};
