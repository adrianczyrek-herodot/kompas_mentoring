import type { DomainError } from '../../../shared/domain/index.ts';
import type { MentorProfileEvent, MentorProfileStatus } from './mentor-profile.status.ts';

export interface InvalidProfileTransition extends DomainError<'catalog.invalid_transition'> {
  readonly from: MentorProfileStatus;
  readonly event: MentorProfileEvent;
}

/** Edits while the application is under review (or the profile is closed) — Q6 (→ 409). */
export interface ProfileLocked extends DomainError<'catalog.profile_locked'> {
  readonly status: MentorProfileStatus;
}

/** Submission with missing steps (E2-S3). */
interface IncompleteProfile extends DomainError<'catalog.incomplete_profile'> {
  readonly missingSteps: readonly string[];
}

export type PhotoProblem = 'type' | 'size' | 'dimensions' | 'unreadable';

export interface PhotoInvalid extends DomainError<'catalog.photo_invalid'> {
  readonly reason: PhotoProblem;
}

/** Someone else's resource, or none at all — indistinguishable on purpose (→ 404, spec §8). */
export type CatalogNotFound = DomainError<'catalog.not_found'>;

/** The actor lacks the permission (→ 403). */
export type CatalogForbidden = DomainError<'catalog.forbidden'>;

/** Optimistic lock: the profile changed in another tab (→ 409 "odśwież"). */
export type VersionConflict = DomainError<'catalog.version_conflict'>;

export type FieldProblem =
  | 'required'
  | 'too_short'
  | 'too_long'
  | 'too_few'
  | 'too_many'
  | 'out_of_range'
  | 'not_whole_zloty'
  | 'invalid'
  | 'unknown_option';

export interface FieldIssue {
  /** Field path in the step form, e.g. `headline`, `tags`, `experience.0.company`. */
  readonly field: string;
  readonly problem: FieldProblem;
}

/** Values that break the field policies (→ 422 with one issue per field). */
export interface InvalidFields extends DomainError<'catalog.invalid_fields'> {
  readonly issues: readonly FieldIssue[];
}

/** Every expected catalog failure; mapped to RFC 9457 problems at the API edge (spec §4.9). */
export type CatalogError =
  | InvalidProfileTransition
  | ProfileLocked
  | IncompleteProfile
  | PhotoInvalid
  | CatalogNotFound
  | CatalogForbidden
  | VersionConflict
  | InvalidFields;
