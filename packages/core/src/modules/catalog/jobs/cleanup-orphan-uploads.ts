import type { Clock } from '../../../shared/domain/index.ts';
import type { UploadRepository } from '../application/ports.ts';
import { PHOTO } from '../domain/policies/config.ts';
import type { FileStorage } from '../domain/ports/file-storage.ts';

/** Queue and cron of the cleanup job (requirement 2: uploads nobody confirmed disappear). */
export const CLEANUP_ORPHAN_UPLOADS_QUEUE = 'catalog.cleanup-orphan-uploads';
export const CLEANUP_ORPHAN_UPLOADS_CRON = '23 3 * * *';

/**
 * Removes the files nobody pinned to a profile: the browser got a presigned URL, but the mentor
 * never confirmed the file (or the upload failed half way). Objects older than
 * `PHOTO.orphanAfterHours` are deleted from the storage and their rows from the database.
 */
export const makeCleanupOrphanUploads =
  ({
    clock,
    fileStorage,
    uploadRepository,
  }: {
    clock: Clock;
    fileStorage: FileStorage;
    uploadRepository: UploadRepository;
  }) =>
  async (): Promise<number> => {
    const cutoff = clock.now().subtract({ hours: PHOTO.orphanAfterHours });
    const uploads = await uploadRepository.listUnconfirmedBefore(cutoff);
    for (const upload of uploads) {
      await fileStorage.delete(upload.key);
      await uploadRepository.delete(upload.key);
    }
    return uploads.length;
  };

export type CleanupOrphanUploads = ReturnType<typeof makeCleanupOrphanUploads>;
