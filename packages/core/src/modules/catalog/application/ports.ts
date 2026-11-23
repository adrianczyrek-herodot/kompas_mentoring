import type { Temporal } from 'temporal-polyfill';
import type { MentorId, UserId } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import { type CurrentUser, hasPermission, type Permission } from '../../identity/index.ts';
import type { CatalogForbidden } from '../domain/catalog.errors.ts';
import type { MentorProfile } from '../domain/mentor-profile.entity.ts';
import type { MentorProfileDomainEvent } from '../domain/mentor-profile.events.ts';

/** Port: mentor profiles (MikroORM adapter in `infrastructure/`). */
export interface MentorProfileRepository {
  findByUserId(userId: UserId): Promise<MentorProfile | null>;
  /** Inserts the new draft unless the user already has a profile (two tabs) and returns the stored one. */
  createIfMissing(profile: MentorProfile): Promise<MentorProfile>;
  /**
   * Persists the profile only if the stored version still equals `expectedVersion`, bumping it, and
   * publishes `events` in the same transaction (outbox, spec §4.6).
   */
  save(
    profile: MentorProfile,
    expectedVersion: number,
    events: readonly MentorProfileDomainEvent[],
  ): Promise<'saved' | 'version_conflict'>;
}

/** A photo uploaded to the storage and waiting for the server to confirm it (requirement 2). */
export interface PendingUpload {
  readonly key: string;
  readonly ownerUserId: UserId;
  readonly mentorProfileId: MentorId;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly createdAt: Temporal.Instant;
  /** Set when the server confirmed the file and pinned it to the profile. */
  readonly confirmedAt: Temporal.Instant | null;
}

/** Port: pending uploads (MikroORM adapter in `infrastructure/`). */
export interface UploadRepository {
  create(upload: PendingUpload): Promise<void>;
  findByKey(key: string): Promise<PendingUpload | null>;
  markConfirmed(key: string, at: Temporal.Instant): Promise<void>;
  /** Uploads nobody confirmed — the cleanup job deletes them after `PHOTO.orphanAfterHours`. */
  listUnconfirmedBefore(moment: Temporal.Instant): Promise<PendingUpload[]>;
  delete(key: string): Promise<void>;
}

/** Every command and query starts here (spec §8: checked server-side, not in the UI). */
export const requirePermission = (
  actor: CurrentUser,
  permission: Permission,
): Result<void, CatalogForbidden> =>
  hasPermission(actor.roles, permission) ? ok(undefined) : err({ code: 'catalog.forbidden' });
