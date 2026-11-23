import { type AwilixContainer, asClass, asFunction } from 'awilix';
import type { Clock } from '../../shared/domain/index.ts';
import type { DatabaseCradle } from '../../shared/infrastructure/db/database-cradle.ts';
import type { Env } from '../../shared/infrastructure/env.ts';
import type { EventPublisher } from '../../shared/infrastructure/events/outbox.ts';
import {
  type ConfirmPhotoUpload,
  makeConfirmPhotoUpload,
} from './application/confirm-photo-upload.command.ts';
import {
  type GetMentorAccess,
  makeGetMentorAccess,
  makeOpenMyMentorProfile,
  type OpenMyMentorProfile,
} from './application/open-my-mentor-profile.query.ts';
import type { MentorProfileRepository, UploadRepository } from './application/ports.ts';
import {
  makeRequestPhotoUpload,
  type RequestPhotoUpload,
} from './application/request-photo-upload.command.ts';
import {
  makeSaveProfileStep,
  type SaveProfileStep,
} from './application/save-profile-step.command.ts';
import {
  makeSetAcceptingNew,
  type SetAcceptingNew,
} from './application/set-accepting-new.command.ts';
import type { FileStorage } from './domain/ports/file-storage.ts';
import { catalogRecords } from './infrastructure/catalog.records.ts';
import { createFileStorage } from './infrastructure/file-storage.factory.ts';
import { MikroOrmMentorProfileRepository } from './infrastructure/mikro-orm-mentor-profile.repository.ts';
import { MikroOrmUploadRepository } from './infrastructure/mikro-orm-upload.repository.ts';
import {
  type CleanupOrphanUploads,
  makeCleanupOrphanUploads,
} from './jobs/cleanup-orphan-uploads.ts';
import { Migration20261122000000CatalogProfile } from './migrations/Migration20261122000000CatalogProfile.ts';

/** Picked up by the ORM configuration (explicit lists, no globbing). */
export const catalogEntities = catalogRecords;
export const catalogMigrations = [
  {
    name: 'Migration20261122000000CatalogProfile',
    class: Migration20261122000000CatalogProfile,
  },
];

export interface CatalogCradle {
  mentorProfileRepository: MentorProfileRepository;
  uploadRepository: UploadRepository;
  /** The file storage of the process (spec §1.3): R2 in production, a directory in dev/e2e. */
  fileStorage: FileStorage;
  openMyMentorProfile: OpenMyMentorProfile;
  getMentorAccess: GetMentorAccess;
  saveProfileStep: SaveProfileStep;
  /** Q13: the M3 "pause new students" switch — `catalog` stays the source of truth. */
  setAcceptingNew: SetAcceptingNew;
  requestPhotoUpload: RequestPhotoUpload;
  confirmPhotoUpload: ConfirmPhotoUpload;
  cleanupOrphanUploads: CleanupOrphanUploads;
}

type Deps = CatalogCradle &
  DatabaseCradle & { clock: Clock; eventPublisher: EventPublisher; env: Env };

/** Registers the catalog module; application services are scoped per request / per job. */
export const registerCatalogModule = (container: AwilixContainer<Deps>): void => {
  container.register({
    mentorProfileRepository: asClass(MikroOrmMentorProfileRepository).scoped(),
    uploadRepository: asClass(MikroOrmUploadRepository).scoped(),
    // A singleton: the presigned URL and the upload route must share the signing secret.
    fileStorage: asFunction(({ env }: { env: Env }) => createFileStorage(env)).singleton(),
    openMyMentorProfile: asFunction(makeOpenMyMentorProfile).scoped(),
    getMentorAccess: asFunction(makeGetMentorAccess).scoped(),
    saveProfileStep: asFunction(makeSaveProfileStep).scoped(),
    setAcceptingNew: asFunction(makeSetAcceptingNew).scoped(),
    requestPhotoUpload: asFunction(makeRequestPhotoUpload).scoped(),
    confirmPhotoUpload: asFunction(makeConfirmPhotoUpload).scoped(),
    cleanupOrphanUploads: asFunction(makeCleanupOrphanUploads).scoped(),
  });
};
