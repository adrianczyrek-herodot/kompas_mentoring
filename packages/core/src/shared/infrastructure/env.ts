import { z } from 'zod';

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    /** Pooled connection (web: queries and job sending). */
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    /** Direct connection for the worker (job fetching, cron, maintenance) and migrations. */
    DATABASE_DIRECT_URL: z.url({ protocol: /^postgres(ql)?$/ }).optional(),
    WORKER_PORT: z.coerce.number().int().min(1).max(65_535).default(8081),
    SENTRY_DSN: z.url().optional(),
    /** Signs session cookies; required in production (outside it a fixed development secret is used). */
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    /** Public origin of the web app; required in production, inferred from requests elsewhere. */
    BETTER_AUTH_URL: z.url().optional(),
    /** HIBP k-anonymity check of new passwords (Q8); `off` only in tests that must stay offline. */
    AUTH_BREACHED_PASSWORD_CHECK: z.enum(['on', 'off']).default('on'),
    /** Q1: payment adapter of the booking flow; `none` until F4 ships Stripe. */
    BOOKING_PAYMENT_MODE: z.enum(['none', 'stripe']).default('none'),
    /** Social sign-in buttons appear only when both keys of a provider are set (F1 Q1). */
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    LINKEDIN_CLIENT_ID: z.string().min(1).optional(),
    LINKEDIN_CLIENT_SECRET: z.string().min(1).optional(),
    /** Driver of the file storage: `local` (directory on disk, dev/e2e) or `r2` (production). */
    FILE_STORAGE_DRIVER: z.enum(['local', 'r2']).default('local'),
    /** Directory of the local adapter (relative paths resolve against the process directory). */
    FILE_STORAGE_LOCAL_DIR: z.string().min(1).default('.kompas-files'),
    /** Public origin of the app; the local adapter builds absolute URLs only with it. */
    FILE_STORAGE_PUBLIC_URL: z.url().optional(),
    /** Signs the upload URLs of the local adapter; falls back to `BETTER_AUTH_SECRET`. */
    FILE_STORAGE_SIGNING_SECRET: z.string().min(16).optional(),
    /** R2 (S3-compatible) connection — required with the `r2` driver. */
    R2_ACCOUNT_ID: z.string().min(1).optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    R2_BUCKET: z.string().min(1).optional(),
    R2_PUBLIC_URL: z.url().optional(),
  })
  .refine((env) => env.NODE_ENV !== 'production' || env.BETTER_AUTH_SECRET !== undefined, {
    message: 'BETTER_AUTH_SECRET is required in production',
    path: ['BETTER_AUTH_SECRET'],
  })
  // Origin checks (CSRF) and OAuth callbacks need the public origin, not one guessed per request.
  .refine((env) => env.NODE_ENV !== 'production' || env.BETTER_AUTH_URL !== undefined, {
    message: 'BETTER_AUTH_URL is required in production',
    path: ['BETTER_AUTH_URL'],
  });

export type Env = z.infer<typeof EnvSchema>;

/** Validates the environment once at startup and fails fast with a readable list of problems. */
export const parseEnv = (source: Record<string, string | undefined> = process.env): Env => {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
};

export const directDatabaseUrl = (env: Env): string => env.DATABASE_DIRECT_URL ?? env.DATABASE_URL;
