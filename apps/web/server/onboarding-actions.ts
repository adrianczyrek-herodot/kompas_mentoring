'use server';

import { createRequestScope } from '@kompas/core';
import { type CatalogError, toStepInput } from '@kompas/core/catalog';
import { SaveProfileStepInput } from '@kompas/contracts/catalog';
import { revalidatePath } from 'next/cache';
import { getContainer } from './runtime.ts';
import { getCurrentUser } from './session.ts';

interface StepFieldIssue {
  readonly field: string;
  readonly problem: string;
}

export type SaveStepResult =
  | { readonly ok: true; readonly version: number }
  | {
      readonly ok: false;
      readonly kind: 'invalid' | 'conflict' | 'locked' | 'forbidden' | 'not_found';
      readonly issues?: readonly StepFieldIssue[];
    };

export type PhotoUploadResult =
  | {
      readonly ok: true;
      readonly key: string;
      readonly url: string;
      readonly method: 'PUT';
      readonly headers: Record<string, string>;
    }
  | { readonly ok: false; readonly kind: 'invalid' | 'forbidden' | 'not_found'; readonly problem?: string };

/** Domain failure → what the form shows (spec §4.9). */
const toResult = (error: CatalogError): SaveStepResult => {
  switch (error.code) {
    case 'catalog.invalid_fields':
      return { ok: false, kind: 'invalid', issues: error.issues };
    case 'catalog.version_conflict':
      return { ok: false, kind: 'conflict' };
    case 'catalog.profile_locked':
      return { ok: false, kind: 'locked' };
    case 'catalog.forbidden':
      return { ok: false, kind: 'forbidden' };
    case 'catalog.not_found':
      return { ok: false, kind: 'not_found' };
    case 'catalog.incomplete_profile':
    case 'catalog.invalid_transition':
    case 'catalog.photo_invalid':
      return { ok: false, kind: 'invalid' };
    default:
      return { ok: false, kind: 'invalid' };
  }
};

/**
 * Saves one step of M1 (spec F2, requirement 1). The owner comes from the session, never from the
 * body; the version is the optimistic lock — a stale one means another tab saved first (409).
 */
export async function saveProfileStepAction(input: unknown): Promise<SaveStepResult> {
  const parsed = SaveProfileStepInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      kind: 'invalid',
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        problem: issue.message,
      })),
    };
  }
  const actor = await getCurrentUser();
  if (actor === null) return { ok: false, kind: 'forbidden' };
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.saveProfileStep(
    actor,
    toStepInput(parsed.data),
    parsed.data.expectedVersion,
  );
  if (result.isErr()) return toResult(result.error);
  revalidatePath('/mentor');
  return { ok: true, version: result.value.version };
}

/** Requirement 2: a presigned URL for the photo; the browser uploads the file itself. */
export async function requestPhotoUploadAction(input: {
  contentType: string;
  size: number;
}): Promise<PhotoUploadResult> {
  const actor = await getCurrentUser();
  if (actor === null) return { ok: false, kind: 'forbidden' };
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.requestPhotoUpload(actor, input);
  if (result.isErr()) {
    const invalid = result.error.code === 'catalog.photo_invalid';
    return {
      ok: false,
      kind: invalid ? 'invalid' : 'forbidden',
      ...(invalid ? { problem: result.error.reason } : {}),
    };
  }
  return {
    ok: true,
    key: result.value.key,
    url: result.value.url,
    method: result.value.method,
    headers: { ...result.value.headers },
  };
}

/** Requirement 2: the server confirms the type, the size and the dimensions of the file. */
export async function confirmPhotoUploadAction(
  key: string,
): Promise<{ ok: true; version: number } | { ok: false; kind: string; problem?: string }> {
  const actor = await getCurrentUser();
  if (actor === null) return { ok: false, kind: 'forbidden' };
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.confirmPhotoUpload(actor, key);
  if (result.isErr()) {
    const invalid = result.error.code === 'catalog.photo_invalid';
    return {
      ok: false,
      kind: result.error.code,
      ...(invalid ? { problem: result.error.reason } : {}),
    };
  }
  revalidatePath('/mentor');
  return { ok: true, version: result.value.version };
}
