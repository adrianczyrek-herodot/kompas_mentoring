import { v7 as uuidv7 } from 'uuid';
import type { Temporal } from 'temporal-polyfill';
import type { Clock } from '../../../shared/domain/index.ts';
import { err, MentorId, newId, ok, type Result } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { CatalogForbidden, CatalogNotFound, PhotoInvalid } from '../domain/catalog.errors.ts';
import {
  createDraftProfile,
  type MentorProfile,
} from '../domain/mentor-profile.entity.ts';
import { PHOTO } from '../domain/policies/config.ts';
import { checkPhotoRequest, photoExtension } from '../domain/policies/photo.policy.ts';
import type { FileStorage, UploadTarget } from '../domain/ports/file-storage.ts';
import { type MentorProfileRepository, type UploadRepository, requirePermission } from './ports.ts';

export type RequestPhotoUploadError = CatalogForbidden | CatalogNotFound | PhotoInvalid;

/** What the browser needs to upload the file straight to the storage (requirement 2). */
export interface PhotoUploadGrant {
  /** Key of the object in the storage; the server generated it. */
  readonly key: string;
  readonly url: string;
  readonly method: 'PUT';
  readonly headers: Readonly<Record<string, string>>;
  /** ISO 8601 instant after which the URL stops working. */
  readonly expiresAt: string;
}

const grantOf = (key: string, target: UploadTarget, expiresAt: string): PhotoUploadGrant => ({
  key,
  url: target.url,
  method: target.method,
  headers: target.headers,
  expiresAt,
});

/**
 * M1 step 1: gives the mentor a presigned upload URL for the profile photo. The key is generated
 * by the server, the type and the size are checked before the URL is signed (requirement 2).
 */
export const makeRequestPhotoUpload =
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
    input: { contentType: string; size: number },
  ): Promise<Result<PhotoUploadGrant, RequestPhotoUploadError>> => {
    const allowed = requirePermission(actor, 'catalog.mentor_profile.edit.own');
    if (allowed.isErr()) return err(allowed.error);

    const problem = checkPhotoRequest(input);
    if (problem !== null) return err({ code: 'catalog.photo_invalid', reason: problem });

    const now = clock.now();
    const profile = await ownProfile(actor, mentorProfileRepository, now);
    if (profile === null) return err({ code: 'catalog.not_found' });

    const extension = photoExtension(input.contentType as (typeof PHOTO.contentTypes)[number]);
    const key = `mentor-photos/${profile.id}/${uuidv7()}.${extension}`;
    await uploadRepository.create({
      key,
      ownerUserId: actor.id,
      mentorProfileId: profile.id,
      contentType: input.contentType,
      sizeBytes: input.size,
      createdAt: now,
      confirmedAt: null,
    });
    const target = await fileStorage.createUploadUrl({
      key,
      contentType: input.contentType,
      size: input.size,
      expiresInSeconds: PHOTO.uploadUrlTtlSeconds,
    });
    return ok(
      grantOf(
        key,
        target,
        now.add({ seconds: PHOTO.uploadUrlTtlSeconds }).toString(),
      ),
    );
  };

/**
 * The mentor's own profile; created lazily as a draft, like the M1 screen does on the first visit.
 */
const ownProfile = async (
  actor: CurrentUser,
  mentorProfileRepository: MentorProfileRepository,
  now: Temporal.Instant,
): Promise<MentorProfile | null> => {
  const existing = await mentorProfileRepository.findByUserId(actor.id);
  if (existing !== null) return existing;
  return mentorProfileRepository.createIfMissing(
    createDraftProfile({
      id: newId(MentorId),
      userId: actor.id,
      displayName: actor.name,
      now,
    }),
  );
};

export type RequestPhotoUpload = ReturnType<typeof makeRequestPhotoUpload>;
