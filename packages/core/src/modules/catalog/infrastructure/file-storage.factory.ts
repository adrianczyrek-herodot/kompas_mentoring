import { S3Client } from '@aws-sdk/client-s3';
import type { Env } from '../../../shared/infrastructure/env.ts';
import type { FileStorage } from '../domain/ports/file-storage.ts';
import { LocalFileStorage } from './local-file-storage.ts';
import { R2FileStorage } from './r2-file-storage.ts';

/**
 * Builds the file storage of the process from the environment (spec §1.3): R2 in the EU
 * jurisdiction in production, a directory on disk in dev and e2e. The rest of the app never asks
 * which one it got — it only sees the `FileStorage` port.
 */
export const createFileStorage = (env: Env): FileStorage => {
  if (env.FILE_STORAGE_DRIVER === 'r2') {
    const accountId = env.R2_ACCOUNT_ID;
    const accessKeyId = env.R2_ACCESS_KEY_ID;
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
    const bucket = env.R2_BUCKET;
    const publicUrl = env.R2_PUBLIC_URL;
    if (
      accountId === undefined ||
      accessKeyId === undefined ||
      secretAccessKey === undefined ||
      bucket === undefined ||
      publicUrl === undefined
    ) {
      throw new Error(
        'The r2 file storage needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET and R2_PUBLIC_URL.',
      );
    }
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
    return new R2FileStorage({ client, bucket, publicUrl });
  }
  return new LocalFileStorage({
    root: env.FILE_STORAGE_LOCAL_DIR,
    signingSecret:
      env.FILE_STORAGE_SIGNING_SECRET ??
      env.BETTER_AUTH_SECRET ??
      'local-file-storage-development-secret',
    ...(env.FILE_STORAGE_PUBLIC_URL ? { publicUrl: env.FILE_STORAGE_PUBLIC_URL } : {}),
  });
};
