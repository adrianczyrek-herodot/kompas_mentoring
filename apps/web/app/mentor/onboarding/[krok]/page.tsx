import {
  PROFILE_STEPS,
  type ProfileStepKey,
  STEP_SEGMENTS,
} from '@kompas/contracts/catalog';
import { Alert, AlertDescription, AlertTitle, Card, CardContent, Stepper } from '@kompas/ui';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { loadMyMentorProfile } from '../../../../server/mentor-profile.ts';
import { AboutStepForm } from '../_components/about-step-form.tsx';
import { BioStepForm } from '../_components/bio-step-form.tsx';
import { RateStepForm } from '../_components/rate-step-form.tsx';
import { SkillsStepForm } from '../_components/skills-step-form.tsx';

/** URL segment → step key. The segments are fixed in Polish (spec F2, "Ekrany"). */
const STEP_BY_SEGMENT = Object.fromEntries(
  Object.entries(STEP_SEGMENTS).map(([step, segment]) => [segment, step]),
) as Record<string, ProfileStepKey>;

/** Steps E2-S2 fills in; steps 5–6 arrive with E2-S3. */
const DRAFT_STEPS = ['about', 'skills', 'bio', 'rate'] as const;

/**
 * M1 — one step of the onboarding (spec F2, "Ekrany"). The page shows the progress of the six
 * steps and the form of the chosen step; the draft of every step is saved in the database.
 */
export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ krok: string }>;
}) {
  const { krok } = await params;
  const step = STEP_BY_SEGMENT[krok];
  if (step === undefined) notFound();

  const profile = await loadMyMentorProfile();
  if (profile === null) redirect('/logowanie?returnTo=%2Fmentor');

  const t = await getTranslations('Onboarding');
  const stepLabels = await getTranslations('Onboarding.steps');
  // A published profile does not need the onboarding any more (spec F2, requirement 5).
  if (profile.status === 'approved') redirect('/mentor');

  const stepIndex = PROFILE_STEPS.indexOf(step);
  const stepperSteps = PROFILE_STEPS.map((candidate, index) => {
    const state = profile.completedSteps.includes(candidate)
      ? ('completed' as const)
      : index === stepIndex
        ? ('current' as const)
        : ('upcoming' as const);
    const linkable =
      index !== stepIndex && DRAFT_STEPS.includes(candidate as (typeof DRAFT_STEPS)[number]);
    return {
      id: candidate,
      label: stepLabels(candidate),
      state,
      ...(linkable ? { href: `/mentor/onboarding/${STEP_SEGMENTS[candidate]}` } : {}),
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-panel px-4 py-8 @md/mentor:flex-row">
      <div className="w-full shrink-0 @md/mentor:w-64">
        <h1 className="text-2xl">{t('title')}</h1>
        <p className="mt-tight text-body text-text-muted">{t('lead')}</p>
        <nav aria-label={t('title')} className="mt-panel">
          <Stepper steps={stepperSteps} label={t('title')} />
        </nav>
      </div>

      <div className="flex w-full flex-col gap-group">
        <p className="text-body-dense text-text-muted">
          {t('stepOf', { current: stepIndex + 1, total: PROFILE_STEPS.length })}
        </p>
        <Card>
          <CardContent className="flex flex-col gap-group">
            {step === 'about' && <AboutStepForm profile={profile} />}
            {step === 'skills' && <SkillsStepForm profile={profile} />}
            {step === 'bio' && <BioStepForm profile={profile} />}
            {step === 'rate' && <RateStepForm profile={profile} />}
            {(step === 'availability' || step === 'verification') && (
              <Alert>
                <AlertTitle>{t('later.title')}</AlertTitle>
                <AlertDescription>{t('later.lead')}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
