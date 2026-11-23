import { Temporal } from 'temporal-polyfill';

/**
 * Q14 (§4.3): the mentor answers a trial request within `min(creation + 24 h, start − 2 h)`. The
 * deadline leaves the mentor at least 4 h when the trial respects the 6 h notice (Q9).
 */
export const autoAcceptDeadline = (
  createdAt: Temporal.Instant,
  startsAt: Temporal.Instant,
): Temporal.Instant => {
  const byCreation = createdAt.add({ hours: 24 });
  const beforeStart = startsAt.subtract({ hours: 2 });
  return Temporal.Instant.compare(byCreation, beforeStart) <= 0 ? byCreation : beforeStart;
};
