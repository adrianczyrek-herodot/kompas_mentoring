import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { FileStorage } from '../domain/ports/file-storage.ts';
import { FakeFileStorage } from './fake-file-storage.ts';
import { LocalFileStorage } from './local-file-storage.ts';

/**
 * One contract for every adapter of the `FileStorage` port (spec §1.3): the fake, the local
 * adapter and (in production) R2 must behave the same, otherwise the domain rules would depend
 * on the environment.
 */
const fileStorageContract = (name: string, create: () => Promise<FileStorage>) => {
  describe(`${name} — contract of the FileStorage port`, () => {
    let storage: FileStorage;

    afterEach(async () => {
      storage = await create();
    });

    it('gives a PUT target with the declared content type', async () => {
      storage = await create();
      const target = await storage.createUploadUrl({
        key: 'mentor-photos/profile/file.jpg',
        contentType: 'image/jpeg',
        size: 1024,
        expiresInSeconds: 300,
      });
      expect(target.method).toBe('PUT');
      expect(target.url).toContain('mentor-photos');
      expect(target.headers['content-type']).toBe('image/jpeg');
    });

    it('reads nothing under an unknown key', async () => {
      storage = await create();
      await expect(storage.readHead('missing.jpg', 16)).resolves.toBeNull();
    });

    it('reads the first bytes and the full size of a stored object', async () => {
      storage = await create();
      const bytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      await putObject(storage, 'mentor-photos/profile/file.jpg', bytes);
      const head = await storage.readHead('mentor-photos/profile/file.jpg', 4);
      expect(head?.size).toBe(8);
      expect([...(head?.bytes ?? [])]).toEqual([1, 2, 3, 4]);
    });

    it('deletes an object and does not fail on a missing one', async () => {
      storage = await create();
      await putObject(storage, 'mentor-photos/profile/file.jpg', new Uint8Array([1, 2, 3]));
      await storage.delete('mentor-photos/profile/file.jpg');
      await expect(storage.readHead('mentor-photos/profile/file.jpg', 4)).resolves.toBeNull();
      await expect(storage.delete('mentor-photos/profile/file.jpg')).resolves.toBeUndefined();
    });

    it('builds a public URL containing the key', async () => {
      storage = await create();
      expect(storage.publicUrl('mentor-photos/profile/file.jpg')).toContain('mentor-photos');
    });
  });
};

/** The fake is filled directly; the local adapter takes the object through its upload route. */
const putObject = async (storage: FileStorage, key: string, bytes: Uint8Array): Promise<void> => {
  if (storage instanceof FakeFileStorage) {
    storage.put(key, bytes);
    return;
  }
  if (storage instanceof LocalFileStorage) {
    const grant = await signUpload(storage, key, bytes.length);
    const accepted = await storage.acceptUpload({
      key,
      contentType: 'image/jpeg',
      size: bytes.length,
      expiresAt: grant.expiresAt,
      signature: grant.signature,
      body: bytes,
    });
    expect(accepted).toBe(true);
    return;
  }
  throw new Error('Unknown storage adapter in the contract test');
};

/** Signs the upload the way the adapter does — the local adapter verifies it on upload. */
const signUpload = async (
  storage: LocalFileStorage,
  key: string,
  size: number,
): Promise<{ signature: string; expiresAt: number }> => {
  const target = await storage.createUploadUrl({
    key,
    contentType: 'image/jpeg',
    size,
    expiresInSeconds: 300,
  });
  const query = new URL(target.url, 'http://localhost').searchParams;
  return {
    signature: query.get('signature') ?? '',
    expiresAt: Number(query.get('expires') ?? 0),
  };
};

describe('FileStorage', () => {
  fileStorageContract('fake', () => Promise.resolve(new FakeFileStorage()));

  fileStorageContract('local adapter', () => {
    const root = mkdtempSync(join(tmpdir(), 'kompas-files-'));
    const storage = new LocalFileStorage({ root, signingSecret: 'test-signing-secret-000000' });
    process.on('exit', () => {
      rmSync(root, { recursive: true, force: true });
    });
    return Promise.resolve(storage);
  });
});
