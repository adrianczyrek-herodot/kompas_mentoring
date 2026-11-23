// Public API of the catalog module — the only file other modules and apps may import.
export {
  type CatalogProblem,
  toCatalogProblem,
  toMentorProfileView,
  toStepInput,
} from './api/mentor-profile.api.ts';
export type { ConfirmPhotoUploadError } from './application/confirm-photo-upload.command.ts';
export type { MentorAccess } from './application/open-my-mentor-profile.query.ts';
export type {
  PhotoUploadGrant,
  RequestPhotoUploadError,
} from './application/request-photo-upload.command.ts';
export type { SaveProfileStepError } from './application/save-profile-step.command.ts';
export type {
  SetAcceptingNew,
  SetAcceptingNewError,
  SetAcceptingNewInput,
} from './application/set-accepting-new.command.ts';
export type { CatalogCradle } from './di.ts';
export type {
  CatalogError,
  FieldIssue,
  FieldProblem,
  PhotoProblem,
} from './domain/catalog.errors.ts';
export type { DraftStep, MentorProfile, ProfileStep } from './domain/mentor-profile.entity.ts';
export type { MentorProfileDomainEvent } from './domain/mentor-profile.events.ts';
export type { MentorProfileEvent, MentorProfileStatus } from './domain/mentor-profile.state.ts';
export {
  CATEGORY_SLUGS,
  COUNTRIES,
  DRAFT_STEPS,
  LANGUAGES,
  LIMITS,
  PHOTO,
  PROFILE_STEPS,
} from './domain/policies/config.ts';
export type { ExperienceEntry } from './domain/policies/profile-fields.policy.ts';
export { halfHourRate } from './domain/policies/rate.policy.ts';
export {
  type VideoLink,
  type VideoProvider,
  videoPageUrl,
} from './domain/policies/video-link.policy.ts';
export type { FileStorage, StoredHead, UploadTarget } from './domain/ports/file-storage.ts';
export { FakeFileStorage } from './infrastructure/fake-file-storage.ts';
export { LocalFileStorage } from './infrastructure/local-file-storage.ts';
export { R2FileStorage } from './infrastructure/r2-file-storage.ts';
export {
  CLEANUP_ORPHAN_UPLOADS_CRON,
  CLEANUP_ORPHAN_UPLOADS_QUEUE,
} from './jobs/cleanup-orphan-uploads.ts';
