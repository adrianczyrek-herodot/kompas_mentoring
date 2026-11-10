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
    /** Public origin of the web app; Better Auth infers it from the request when unset. */
    BETTER_AUTH_URL: z.url().optional(),
    /** Social sign-in buttons appear only when both keys of a provider are set (F1 Q1). */
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    LINKEDIN_CLIENT_ID: z.string().min(1).optional(),
    LINKEDIN_CLIENT_SECRET: z.string().min(1).optional(),
  })
  .refine((env) => env.NODE_ENV !== 'production' || env.BETTER_AUTH_SECRET !== undefined, {
    message: 'BETTER_AUTH_SECRET is required in production',
    path: ['BETTER_AUTH_SECRET'],
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
