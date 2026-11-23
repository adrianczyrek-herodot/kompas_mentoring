import { createRequestScope } from '@kompas/core';
import { toMentorProfileView } from '@kompas/core/catalog';
import type { MentorProfileView } from '@kompas/contracts/catalog';
import { getContainer } from './runtime.ts';
import { getCurrentUser } from './session.ts';

/**
 * The signed-in mentor's own profile as M1 shows it. The profile is created lazily on the first
 * visit (F1 Q3), the photo URL comes from the file storage of the process.
 */
export const loadMyMentorProfile = async (): Promise<MentorProfileView | null> => {
  const actor = await getCurrentUser();
  if (actor === null) return null;
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.openMyMentorProfile(actor);
  if (result.isErr()) return null;
  const profile = result.value;
  return toMentorProfileView(profile, {
    displayName: actor.name,
    photoUrl: profile.photoKey === null ? null : scope.cradle.fileStorage.publicUrl(profile.photoKey),
  });
};
