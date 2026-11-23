import type { Clock } from '../../../shared/domain/index.ts';
import type { BookingRepository } from './ports.ts';

type Deps = { clock: Clock; bookingRepository: BookingRepository };

/**
 * Job `scheduling/expire-holds` (rule 5): every minute it moves holds past `hold_expires_at` to
 * `expired`, so a forgotten hold never keeps a slot. The slot reads also filter by the deadline,
 * so the cleanup is not on the correctness path.
 */
export const makeExpireHolds =
  (deps: Deps) =>
  async (): Promise<number> => {
    const expired = await deps.bookingRepository.expireStaleHolds(deps.clock.now());
    return expired.length;
  };

export type ExpireHolds = ReturnType<typeof makeExpireHolds>;
