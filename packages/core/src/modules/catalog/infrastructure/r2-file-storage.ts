import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { FileStorage, StoredHead, UploadTarget } from '../domain/ports/file-storage.ts';

export interface R2FileStorageOptions {
  readonly client: S3Client;
  readonly bucket: string;
  /** Public origin of the bucket (CDN), used for the URLs in the browser. */
  readonly publicUrl: string;
}

/**
 * R2 adapter of the `FileStorage` port (spec §1.3): Cloudflare R2 in the EU jurisdiction, reached
 * through the S3-compatible API. The browser uploads straight to the bucket with a presigned URL
 * (requirement 2) — the app server never proxies the file.
 */
export class R2FileStorage implements FileStorage {
  readonly #client: S3Client;
  readonly #bucket: string;
  readonly #publicUrl: string;

  constructor(options: R2FileStorageOptions) {
    this.#client = options.client;
    this.#bucket = options.bucket;
    this.#publicUrl = options.publicUrl.replace(/\/+$/, '');
  }

  async createUploadUrl(params: {
    key: string;
    contentType: string;
    size: number;
    expiresInSeconds: number;
  }): Promise<UploadTarget> {
    const command = new PutObjectCommand({
      Bucket: this.#bucket,
      Key: params.key,
      ContentType: params.contentType,
    });
    const url = await getSignedUrl(this.#client, command, { expiresIn: params.expiresInSeconds });
    return {
      url,
      method: 'PUT',
      headers: { 'content-type': params.contentType },
    };
  }

  async readHead(key: string, bytes: number): Promise<StoredHead | null> {
    const head = await this.#client.send(
      new HeadObjectCommand({ Bucket: this.#bucket, Key: key }),
    );
    if (head.ContentLength === undefined) return null;
    const response = await this.#client.send(
      new GetObjectCommand({ Bucket: this.#bucket, Key: key, Range: `bytes=0-${bytes - 1}` }),
    );
    if (response.Body === undefined) return null;
    const merged = await response.Body.transformToByteArray();
    return { bytes: merged, size: head.ContentLength };
  }

  async delete(key: string): Promise<void> {
    await this.#client.send(new DeleteObjectCommand({ Bucket: this.#bucket, Key: key }));
  }

  publicUrl(key: string): string {
    return `${this.#publicUrl}/${key.split('/').map(encodeURIComponent).join('/')}`;
  }
}
