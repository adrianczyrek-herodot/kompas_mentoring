import { STEP_SEGMENTS } from '@kompas/contracts/catalog';
import { redirect } from 'next/navigation';
import { loadMyMentorProfile } from '../../../server/mentor-profile.ts';

/**
 * "Wróć do onboardingu" opens the first step that is not done yet (spec F2, requirement 1). The
 * draft is kept in the database, so the mentor always comes back to the same place.
 */
export default async function OnboardingIndexPage() {
  const profile = await loadMyMentorProfile();
  const step = profile?.nextStep ?? 'about';
  redirect(`/mentor/onboarding/${STEP_SEGMENTS[step]}`);
}
