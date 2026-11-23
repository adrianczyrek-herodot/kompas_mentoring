import type { FileStorage, StoredHead, UploadTarget } from '../domain/ports/file-storage.ts';

interface StoredObject {
  bytes: Uint8Array;
  contentType: string;
}

/**
 * In-memory adapter of the `FileStorage` port: the test double of the contract test and of the
 * unit tests of the upload commands. It behaves like the real adapters — the same contract runs
 * against it and against the local adapter.
 */
export class FakeFileStorage implements FileStorage {
  readonly #objects = new Map<string, StoredObject>();

  /** Puts an object into the storage, as the browser would after a presigned upload. */
  put(key: string, bytes: Uint8Array, contentType = 'image/jpeg'): void {
    this.#objects.set(key, { bytes, contentType });
  }

  /** Keys of the stored objects — handy in assertions. */
  keys(): string[] {
    return [...this.#objects.keys()];
  }

  createUploadUrl(params: {
    key: string;
    contentType: string;
    size: number;
    expiresInSeconds: number;
  }): Promise<UploadTarget> {
    return Promise.resolve({
      url: `fake://upload/${encodeURIComponent(params.key)}`,
      method: 'PUT',
      headers: { 'content-type': params.contentType },
    });
  }

  readHead(key: string, bytes: number): Promise<StoredHead | null> {
    const object = this.#objects.get(key);
    if (object === undefined) return Promise.resolve(null);
    return Promise.resolve({ bytes: object.bytes.slice(0, bytes), size: object.bytes.length });
  }

  delete(key: string): Promise<void> {
    this.#objects.delete(key);
    return Promise.resolve();
  }

  publicUrl(key: string): string {
    return `fake://files/${encodeURIComponent(key)}`;
  }
}
