import type { Temporal } from 'temporal-polyfill';
import type { MentorId, Money } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import { type CurrentUser, hasPermission } from '../../identity/index.ts';
import type {
  AvailabilityException,
  AvailabilityRule,
  MentorSchedule,
} from '../domain/availability.entity.ts';
import type { SchedulingForbidden } from '../domain/booking.errors.ts';

/** Port: mentor availability (MikroORM adapter in `infrastructure/`). */
export interface AvailabilityRepository {
  findSchedule(mentorId: MentorId): Promise<MentorSchedule | null>;
  listRules(mentorId: MentorId): Promise<AvailabilityRule[]>;
  listExceptions(mentorId: MentorId): Promise<AvailabilityException[]>;
  findException(mentorId: MentorId, id: string): Promise<AvailabilityException | null>;
  /**
   * Replaces the whole weekly template if the stored version still equals `expectedVersion`
   * (`0` until the first save), bumping it. A fresh row is created with version 0 first, so the
   * two concurrent first saves cannot both win.
   */
  saveTemplate(
    mentorId: MentorId,
    rules: readonly AvailabilityRule[],
    expectedVersion: number,
    now: Temporal.Instant,
  ): Promise<'saved' | 'version_conflict'>;
  saveSettings(
    settings: Pick<MentorSchedule, 'timeZone' | 'minNoticeMinutes' | 'bufferMinutes'>,
    mentorId: MentorId,
    expectedVersion: number,
    now: Temporal.Instant,
  ): Promise<'saved' | 'version_conflict'>;
  insertException(
    mentorId: MentorId,
    exception: AvailabilityException,
    now: Temporal.Instant,
  ): Promise<void>;
  /** Deletes only the mentor's own exception; false when it does not exist or belongs to someone else. */
  deleteException(mentorId: MentorId, id: string): Promise<boolean>;
  /**
   * Ids of the mentor's `requested`/`scheduled` bookings that the template would no longer cover
   * (Q11). The adapter resolves the weekly rules against the schedule's time zone and the booking
   * horizon; the `booking` table arrives in step 10, so this is empty in E3-S2.
   */
  listConflictingBookingIds(
    mentorId: MentorId,
    rules: readonly AvailabilityRule[],
  ): Promise<string[]>;
}

/**
 * One mentor as `scheduling` knows them without asking `catalog` (spec "Projekcja
 * mentor_bookability"): mirrored from `catalog.mentor_bookability_changed.v1`, refreshed in the
 * consumer's transaction (spec §4.6).
 */
export interface MentorBookability {
  readonly mentorId: MentorId;
  readonly mentorProfileId: string;
  /** Q5/Q13: an approved profile; a suspended one is still mirrored but cannot be booked. */
  readonly bookable: boolean;
  readonly acceptingNew: boolean;
  /** Q3/F2: the 60-minute rate the booking snapshots; `null` until the mentor sets it. */
  readonly rate60: Money | null;
  readonly updatedAt: Temporal.Instant;
}

/** Port: the `catalog` projection (MikroORM adapter in `infrastructure/`). */
export interface MentorBookabilityRepository {
  /** Public availability: a profile id the projection does not know is unavailable (404). */
  findByProfileId(mentorProfileId: string): Promise<MentorBookability | null>;
  /** Consumer side: stores the newest state; the inbox already deduped the event itself. */
  upsert(bookability: MentorBookability): Promise<void>;
}

/** Every command and query starts here (spec §8: checked server-side, not in the UI). */
export const requirePermission = (
  actor: CurrentUser,
  permission: 'scheduling.availability.manage.own',
): Result<void, SchedulingForbidden> =>
  hasPermission(actor.roles, permission) ? ok(undefined) : err({ code: 'scheduling.forbidden' });
