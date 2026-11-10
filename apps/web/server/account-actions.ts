'use server';

import { createRequestScope, type RequestScope } from '@kompas/core';
import type { CurrentUser, DataRequestKind } from '@kompas/core/identity';
import { revalidatePath } from 'next/cache';
import { getContainer } from './runtime.ts';
import { getCurrentUser } from './session.ts';

type ActionResult = { ok: true } | { ok: false };

/** Runs a module command for the signed-in user; `null` without a session. */
const withActor = async <T>(
  run: (scope: RequestScope, actor: CurrentUser) => Promise<T>,
): Promise<T | null> => {
  const actor = await getCurrentUser();
  if (actor === null) return null;
  return run(createRequestScope(getContainer(), { requestId: crypto.randomUUID() }), actor);
};

/** S3: marketing consent toggle — a new consent decision, checked by the identity module. */
export async function setMarketingConsent(granted: boolean): Promise<ActionResult> {
  const result = await withActor((scope, actor) =>
    scope.cradle.setMarketingConsent(actor, granted),
  );
  revalidatePath('/konto');
  return { ok: result?.isOk() === true };
}

/** S3 (Q7): records an export or deletion request (carried out in F8). */
export async function requestPersonalData(kind: DataRequestKind): Promise<ActionResult> {
  const result = await withActor((scope, actor) => scope.cradle.requestPersonalData(actor, kind));
  revalidatePath('/konto');
  return { ok: result?.isOk() === true };
}
