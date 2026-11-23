import type { PhotoProblem } from '../catalog.errors.ts';
import { PHOTO } from './config.ts';

export type PhotoType = (typeof PHOTO.contentTypes)[number];

interface ImageInfo {
  readonly type: PhotoType;
  readonly width: number;
  readonly height: number;
}

const isPhotoType = (value: string): value is PhotoType =>
  (PHOTO.contentTypes as readonly string[]).includes(value);

/** Before the presigned URL: JPG/PNG only, at most 5 MB (requirement 2). */
export const checkPhotoRequest = (request: {
  contentType: string;
  size: number;
}): PhotoProblem | null => {
  if (!isPhotoType(request.contentType)) return 'type';
  if (!Number.isInteger(request.size) || request.size <= 0 || request.size > PHOTO.maxBytes) {
    return 'size';
  }
  return null;
};

/** File extension of the storage key, so the file is served with the right type. */
export const photoExtension = (type: PhotoType): 'jpg' | 'png' =>
  type === 'image/png' ? 'png' : 'jpg';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const readPng = (bytes: Uint8Array): ImageInfo | null => {
  if (bytes.length < 24 || PNG_SIGNATURE.some((byte, i) => bytes[i] !== byte)) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // The IHDR chunk always comes first: width and height at bytes 16–23.
  return { type: 'image/png', width: view.getUint32(16), height: view.getUint32(20) };
};

/** SOFn markers carry the frame size; DHT (C4), JPG (C8) and DAC (CC) share the range but do not. */
const isStartOfFrame = (marker: number): boolean =>
  marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

const readJpeg = (bytes: Uint8Array): ImageInfo | null => {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;
  while (offset + 9 <= bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1] ?? 0;
    if (marker === 0xff) {
      offset += 1; // fill byte
      continue;
    }
    if (isStartOfFrame(marker)) {
      return { type: 'image/jpeg', height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
    }
    offset += 2 + view.getUint16(offset + 2);
  }
  return null;
};

/**
 * Reads type and dimensions from the file header (requirement 2: the server confirms them after
 * the upload). Returns `null` for anything that is not a readable PNG or JPEG.
 */
const readImageInfo = (bytes: Uint8Array): ImageInfo | null => readPng(bytes) ?? readJpeg(bytes);

/** After the upload: the real file must match the declared type and be at least 400×400 px. */
export const checkUploadedPhoto = (
  head: Uint8Array,
  declared: { contentType: string; size: number },
  actualSize: number,
): PhotoProblem | null => {
  const info = readImageInfo(head);
  if (info === null) return 'unreadable';
  if (info.type !== declared.contentType) return 'type';
  if (actualSize !== declared.size || actualSize > PHOTO.maxBytes) return 'size';
  return info.width < PHOTO.minSide || info.height < PHOTO.minSide ? 'dimensions' : null;
};
