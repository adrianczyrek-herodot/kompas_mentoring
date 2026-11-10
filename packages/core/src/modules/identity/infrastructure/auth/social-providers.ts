import type { Env } from '../../../../shared/infrastructure/env.ts';

export type SocialProvider = 'google' | 'linkedin';

/** Q1: a provider is enabled only when both of its keys are set; the UI shows only these. */
export const socialProviderCredentials = (env: Env) => ({
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
    : {}),
  ...(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET
    ? { linkedin: { clientId: env.LINKEDIN_CLIENT_ID, clientSecret: env.LINKEDIN_CLIENT_SECRET } }
    : {}),
});

export const enabledSocialProviders = (env: Env): SocialProvider[] =>
  Object.keys(socialProviderCredentials(env)) as SocialProvider[];
