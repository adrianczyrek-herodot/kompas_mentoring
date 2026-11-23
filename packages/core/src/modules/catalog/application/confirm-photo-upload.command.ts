import type { Clock } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type {
  CatalogForbidden,
  CatalogNotFound,
  PhotoInvalid,
  ProfileLocked,
  VersionConflict,
} from '../domain/catalog.errors.ts';
import { attachPhoto, type MentorProfile } from '../domain/mentor-profile.entity.ts';
import { isPublic } from '../domain/mentor-profile.state.ts';
import { PHOTO } from '../domain/policies/config.ts';
import { checkUploadedPhoto } from '../domain/policies/photo.policy.ts';
import type { FileStorage } from '../domain/ports/file-storage.ts';
import {
  type MentorProfileRepository,
  type UploadRepository,
  requirePermission,
} from './ports.ts';

export type ConfirmPhotoUploadError =
  | CatalogForbidden
  | CatalogNotFound
  | PhotoInvalid
  | ProfileLocked
  | VersionConflict;

/**
 * M1 step 1, second half: the server confirms the uploaded file — it reads the header, checks the
 * real type, size and dimensions and only then pins the key to the profile (requirement 2).
 * A file that does not match the promise is refused and stays unconfirmed (the cleanup job
 * removes it later).
 */
export const makeConfirmPhotoUpload =
  ({
    clock,
    fileStorage,
    mentorProfileRepository,
    uploadRepository,
  }: {
    clock: Clock;
    fileStorage: FileStorage;
    mentorProfileRepository: MentorProfileRepository;
    uploadRepository: UploadRepository;
  }) =>
  async (
    actor: CurrentUser,
    key: string,
  ): Promise<Result<MentorProfile, ConfirmPhotoUploadError>> => {
    const allowed = requirePermission(actor, 'catalog.mentor_profile.edit.own');
    if (allowed.isErr()) return err(allowed.error);

    const upload = await uploadRepository.findByKey(key);
    // Someone else's or a non-existent upload — indistinguishable on purpose (404, spec §8).
    if (upload?.ownerUserId !== actor.id) {
      return err({ code: 'catalog.not_found' });
    }
    const profile = await mentorProfileRepository.findByUserId(actor.id);
    if (profile === null) return err({ code: 'catalog.not_found' });

    const head = await fileStorage.readHead(key, PHOTO.headerBytes);
    if (head === null) return err({ code: 'catalog.photo_invalid', reason: 'unreadable' });
    const problem = checkUploadedPhoto(
      head.bytes,
      { contentType: upload.contentType, size: upload.sizeBytes },
      head.size,
    );
    if (problem !== null) return err({ code: 'catalog.photo_invalid', reason: problem });

    const now = clock.now();
    const attached = attachPhoto(profile, key, now);
    if (attached.isErr()) return err(attached.error);
    const next = { ...attached.value, version: profile.version + 1 };
    const events = isPublic(next.status)
      ? [{ name: 'catalog.mentor_profile_updated.v1' as const, mentorProfileId: next.id }]
      : [];
    const outcome = await mentorProfileRepository.save(next, profile.version, events);
    if (outcome !== 'saved') return err({ code: 'catalog.version_conflict' });
    await uploadRepository.markConfirmed(key, now);
    return ok(next);
  };

export type ConfirmPhotoUpload = ReturnType<typeof makeConfirmPhotoUpload>;
