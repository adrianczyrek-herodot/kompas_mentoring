import { Temporal } from 'temporal-polyfill';

// Business constants of the scheduling module, each linked to its decision (spec §4.1).

/** Z4: a student may cancel or reschedule for free up to 12 h before the session starts. */
export const FREE_CANCELLATION_NOTICE = Temporal.Duration.from({ hours: 12 });
