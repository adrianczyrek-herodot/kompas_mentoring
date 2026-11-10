import { type DestinationStream, type Logger, pino } from 'pino';

export type { Logger } from 'pino';

/**
 * Personal data never reaches logs (spec §6.5, RODO): we log identifiers, not people.
 * Paths cover top-level fields and fields nested one level deep (e.g. `user.email`).
 */
const PII_FIELDS = [
  'email',
  'phone',
  'name',
  'firstName',
  'lastName',
  'fullName',
  'messageBody',
  'body',
  'content',
  'note',
  'notes',
  'goal',
  'sessionGoal',
  'token',
  'accessToken',
  'refreshToken',
  'password',
] as const;

const REDACTED_PATHS: string[] = [
  ...PII_FIELDS,
  // Chat message text at the top level only: `*.message` would also hide `err.message`.
  'message',
  ...PII_FIELDS.map((field) => `*.${field}`),
  'req.headers.authorization',
  'req.headers.cookie',
  'headers.authorization',
  'headers.cookie',
];

export const createLogger = (
  options: { level: string; module?: string },
  destination?: DestinationStream,
): Logger =>
  pino(
    {
      level: options.level,
      base: options.module === undefined ? {} : { module: options.module },
      redact: { paths: REDACTED_PATHS, censor: '[redacted]' },
    },
    destination,
  );
