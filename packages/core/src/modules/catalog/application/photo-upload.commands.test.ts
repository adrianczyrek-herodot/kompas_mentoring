import { FakeClock } from '@kompas/testing';
import { describe, expect, it } from 'vitest';
import { type UserId, UserId as UserIdSchema } from '../../../shared/domain/index.ts';
import type { CurrentUser, Role } from '../../identity/index.ts';
import type { MentorProfile } from '../domain/mentor-profile.entity.ts';
import type { MentorProfileDomainEvent } from '../domain/mentor-profile.events.ts';
import { FakeFileStorage } from '../infrastructure/fake-file-storage.ts';
import { makeConfirmPhotoUpload } from './confirm-photo-upload.command.ts';
import type { MentorProfileRepository, PendingUpload, UploadRepository } from './ports.ts';
import { makeRequestPhotoUpload } from './request-photo-upload.command.ts';

class InMemoryProfiles implements MentorProfileRepository {
  readonly byUser = new Map<string, MentorProfile>();
  readonly published: MentorProfileDomainEvent[] = [];

  findByUserId(userId: UserId) {
    return Promise.resolve(this.byUser.get(userId) ?? null);
  }

  createIfMissing(profile: MentorProfile) {
    if (!this.byUser.has(profile.userId)) this.byUser.set(profile.userId, profile);
    return Promise.resolve(this.byUser.get(profile.userId) ?? profile);
  }

  save(
    profile: MentorProfile,
    expectedVersion: number,
    events: readonly MentorProfileDomainEvent[],
  ) {
    if (this.byUser.get(profile.userId)?.version !== expectedVersion) {
      return Promise.resolve('version_conflict' as const);
    }
    this.byUser.set(profile.userId, profile);
    this.published.push(...events);
    return Promise.resolve('saved' as const);
  }
}

class InMemoryUploads implements UploadRepository {
  readonly byKey = new Map<string, PendingUpload>();

  create(upload: PendingUpload) {
    this.byKey.set(upload.key, upload);
    return Promise.resolve();
  }

  findByKey(key: string) {
    return Promise.resolve(this.byKey.get(key) ?? null);
  }

  markConfirmed(key: string, at: PendingUpload['confirmedAt']) {
    const upload = this.byKey.get(key);
    if (upload !== undefined) this.byKey.set(key, { ...upload, confirmedAt: at });
    return Promise.resolve();
  }

  listUnconfirmedBefore(moment: PendingUpload['createdAt']) {
    return Promise.resolve(
      [...this.byKey.values()].filter(
        (upload) => upload.confirmedAt === null && upload.createdAt < moment,
      ),
    );
  }

  delete(key: string) {
    this.byKey.delete(key);
    return Promise.resolve();
  }
}

const actor = (
  roles: Role[] = ['mentor'],
  id = '0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d11',
): CurrentUser => ({
  id: UserIdSchema.parse(id),
  name: 'Ola',
  email: 'ola@example.com',
  emailVerified: true,
  twoFactorEnabled: false,
  timeZone: null,
  roles,
});

/** Minimal PNG header (the IHDR chunk carries the dimensions). */
const png = (width: number, height: number): Uint8Array => {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
};

const setup = () => {
  const clock = new FakeClock();
  const mentorProfileRepository = new InMemoryProfiles();
  const uploadRepository = new InMemoryUploads();
  const fileStorage = new FakeFileStorage();
  const deps = { clock, mentorProfileRepository, uploadRepository, fileStorage };
  return {
    repo: mentorProfileRepository,
    uploads: uploadRepository,
    storage: fileStorage,
    request: makeRequestPhotoUpload(deps),
    confirm: makeConfirmPhotoUpload(deps),
  };
};

describe('photo upload', () => {
  it('refuses a file that is not a JPG or a PNG (GIF)', async () => {
    const { request } = setup();
    const result = await request(actor(), { contentType: 'image/gif', size: 1024 });
    expect(result._unsafeUnwrapErr()).toEqual({
      code: 'catalog.photo_invalid',
      reason: 'type',
    });
  });

  it('refuses a file bigger than 5 MB', async () => {
    const { request } = setup();
    const result = await request(actor(), { contentType: 'image/png', size: 5 * 1024 * 1024 + 1 });
    expect(result._unsafeUnwrapErr()).toEqual({
      code: 'catalog.photo_invalid',
      reason: 'size',
    });
  });

  it('refuses everyone but the mentor (catalog.forbidden → 403)', async () => {
    const { request, confirm } = setup();
    expect(
      (await request(actor(['student']), { contentType: 'image/png', size: 1024 }))._unsafeUnwrapErr(),
    ).toEqual({ code: 'catalog.forbidden' });
    expect((await confirm(actor(['student']), 'key'))._unsafeUnwrapErr()).toEqual({
      code: 'catalog.forbidden',
    });
  });

  it('gives a presigned URL with a server-generated key', async () => {
    const { request } = setup();
    const grant = (await request(actor(), { contentType: 'image/png', size: 1024 }))._unsafeUnwrap();
    expect(grant.key).toMatch(/^mentor-photos\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.png$/);
    expect(grant.method).toBe('PUT');
    expect(grant.headers['content-type']).toBe('image/png');
  });

  it('pins the photo after the server confirmed the dimensions', async () => {
    const { request, confirm, storage, uploads } = setup();
    const grant = (await request(actor(), { contentType: 'image/png', size: 24 }))._unsafeUnwrap();
    storage.put(grant.key, png(800, 800), 'image/png');
    const profile = (await confirm(actor(), grant.key))._unsafeUnwrap();
    expect(profile.photoKey).toBe(grant.key);
    expect(profile.version).toBe(2);
    expect(uploads.byKey.get(grant.key)?.confirmedAt).not.toBeNull();
  });

  it('refuses an image smaller than 400×400 px', async () => {
    const { request, confirm, storage } = setup();
    const grant = (await request(actor(), { contentType: 'image/png', size: 24 }))._unsafeUnwrap();
    storage.put(grant.key, png(399, 399), 'image/png');
    const result = await confirm(actor(), grant.key);
    expect(result._unsafeUnwrapErr()).toEqual({
      code: 'catalog.photo_invalid',
      reason: 'dimensions',
    });
  });

  it('refuses a file that is not the promised type', async () => {
    const { request, confirm, storage } = setup();
    // Promised as a JPEG, but the bytes are a PNG — the server reads the header and refuses it.
    const grant = (await request(actor(), { contentType: 'image/jpeg', size: 24 }))._unsafeUnwrap();
    storage.put(grant.key, png(800, 800), 'image/png');
    const result = await confirm(actor(), grant.key);
    expect(result._unsafeUnwrapErr()).toEqual({ code: 'catalog.photo_invalid', reason: 'type' });
  });

  it('refuses a file whose size differs from the promise', async () => {
    const { request, confirm, storage } = setup();
    const grant = (await request(actor(), { contentType: 'image/png', size: 1024 }))._unsafeUnwrap();
    storage.put(grant.key, png(800, 800), 'image/png');
    const result = await confirm(actor(), grant.key);
    expect(result._unsafeUnwrapErr()).toEqual({ code: 'catalog.photo_invalid', reason: 'size' });
  });

  it('hides someone else’s upload behind a 404', async () => {
    const { request, confirm, storage } = setup();
    const grant = (await request(actor(), { contentType: 'image/png', size: 24 }))._unsafeUnwrap();
    storage.put(grant.key, png(800, 800), 'image/png');
    const other = actor(['mentor'], '0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d12');
    expect((await confirm(other, grant.key))._unsafeUnwrapErr()).toEqual({
      code: 'catalog.not_found',
    });
  });
});
