import { Temporal } from 'temporal-polyfill';
import { HOLD } from './config.ts';

/** Q18/rule 5: a hold expires 10 minutes after it was taken. */
export const holdExpiresAt = (now: Temporal.Instant): Temporal.Instant =>
  now.add({ minutes: HOLD.durationMinutes });

/** Q18: the number of holds a student has taken in the last hour reached the cap. */
export const holdLimitReached = (holdsInWindow: number): boolean => holdsInWindow >= HOLD.maxPerHour;

export const HOLD_WINDOW = Temporal.Duration.from({ minutes: HOLD.windowMinutes });
