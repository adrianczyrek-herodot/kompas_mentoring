import { LocalFileStorage } from '@kompas/core/catalog';
import { NextResponse } from 'next/server';
import { getContainer } from '../../../server/runtime.ts';

/**
 * Local file route (spec §1.3): the local storage adapter of dev/e2e keeps the objects on disk
 * and this route serves them (`GET`) and accepts the presigned uploads (`PUT`). In production the
 * storage is R2 and this route does not exist — the objects come from the bucket's CDN.
 */

/** The key of the object: the path segments after `/pliki/`. */
const keyOf = (segments: string[]): string => segments.map(decodeURIComponent).join('/');

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const storage = getContainer().cradle.fileStorage;
  if (!(storage instanceof LocalFileStorage)) return new NextResponse('Not found', { status: 404 });
  const object = await storage.readObject(keyOf(key));
  if (object === null) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(new Uint8Array(object.bytes), {
    headers: {
      'content-type': object.contentType,
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}

export async function PUT(request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const storage = getContainer().cradle.fileStorage;
  if (!(storage instanceof LocalFileStorage)) return new NextResponse('Not found', { status: 404 });
  const url = new URL(request.url);
  const contentType = url.searchParams.get('contentType') ?? '';
  const size = Number(url.searchParams.get('size') ?? 0);
  const expiresAt = Number(url.searchParams.get('expires') ?? 0);
  const signature = url.searchParams.get('signature') ?? '';
  const body = new Uint8Array(await request.arrayBuffer());
  const accepted = await storage.acceptUpload({
    key: keyOf(key),
    contentType,
    size,
    expiresAt,
    signature,
    body,
  });
  return accepted
    ? new NextResponse(null, { status: 204 })
    : new NextResponse('Upload refused', { status: 403 });
}
