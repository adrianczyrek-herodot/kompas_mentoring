import { Temporal } from 'temporal-polyfill';
import type { Clock } from '../domain/clock.ts';

/** Production Clock. Lives outside domain/, the only place allowed to read the system time. */
export class SystemClock implements Clock {
  now(): Temporal.Instant {
    return Temporal.Now.instant();
  }
}
