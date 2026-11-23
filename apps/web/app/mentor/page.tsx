import { STEP_SEGMENTS } from '@kompas/contracts/catalog';
import { Badge, buttonVariants, Card, CardContent, CardHeader, CardTitle } from '@kompas/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { loadMyMentorProfile } from '../../server/mentor-profile.ts';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Mentor');
  return { title: t('title') };
}

/** Number of the steps E2-S2 fills in (the whole onboarding has six). */
const DRAFT_STEP_COUNT = 4;

/** Status of the profile → the key of its label in `messages/pl.json`. */
const STATUS_KEYS = {
  draft: 'status.draft',
  submitted: 'status.submitted',
  changes_requested: 'status.changes_requested',
  approved: 'status.approved',
  suspended: 'status.suspended',
  rejected: 'status.rejected',
} as const;

/**
 * Mentor home: the status of the profile and the way back to the onboarding (spec F2,
 * requirement 1). Without a profile the mentor lands on the first step; a published profile shows
 * a link to its public page.
 */
export default async function MentorPage() {
  const profile = await loadMyMentorProfile();
  const t = await getTranslations('Mentor');

  if (profile === null) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8">
        <h1 className="text-3xl">{t('title')}</h1>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-xl">{t('profileStatus')}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>{t('lead')}</CardContent>
        </Card>
      </main>
    );
  }

  const nextSegment = profile.nextStep === null ? null : STEP_SEGMENTS[profile.nextStep];
  const done = profile.completedSteps.filter((step) =>
    ['about', 'skills', 'bio', 'rate'].includes(step),
  ).length;
  // Steps 5–6 (availability, verification) arrive with E2-S3 — the mentor must know that the
  // four steps of this story are already behind them.
  const draftStepsDone = profile.nextStep === 'availability' || profile.nextStep === 'verification';

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8">
      <h1 className="text-3xl">{t('title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">{t('profileStatus')}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-group">
          <Badge variant={profile.status === 'approved' ? 'success' : 'neutral'} data-testid="profile-status">
            {t(STATUS_KEYS[profile.status])}
          </Badge>
          <p className="text-body text-text-muted">{t('lead')}</p>
          <p className="text-body-dense text-text-muted">
            {t('stepsDoneCount', { done, total: DRAFT_STEP_COUNT })}
          </p>
          {draftStepsDone && <p className="text-body text-text-default">{t('draftStepsDone')}</p>}
          {nextSegment !== null ? (
            <Link
              href={`/mentor/onboarding/${nextSegment}`}
              className={buttonVariants({ className: 'self-start' })}
            >
              {t('continueOnboarding')}
            </Link>
          ) : (
            <p className="text-body text-text-default">{t('draftStepsDone')}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
