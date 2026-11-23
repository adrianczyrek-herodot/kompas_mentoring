'use client';

import { type MentorProfileView, RateStepComplete, RateStepDraft } from '@kompas/contracts/catalog';
import { EarningsPreview, Field, FieldDescription, FieldLabel, RateInput } from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveProfileStepAction } from '../../../../server/onboarding-actions.ts';
import { StepFormShell, useFieldProblems, useProblemMessage } from './step-form.tsx';

/** M1 step 4 — "Stawka": the price of 60 minutes and the preview of what the mentor earns (Q9). */
export function RateStepForm({ profile }: { profile: MentorProfileView }) {
  const t = useTranslations('Onboarding');
  const router = useRouter();
  const { problems, setProblems, clear, fromIssues } = useFieldProblems();
  const problemText = useProblemMessage();
  const [pending, startTransition] = useTransition();
  const [version, setVersion] = useState(profile.version);
  const [rate, setRate] = useState<number | null>(profile.rate60Amount);
  const [message, setMessage] = useState<string | null>(null);

  const save = (mode: 'draft' | 'complete') => {
    const fields = { rate60Amount: rate };
    const schema = mode === 'complete' ? RateStepComplete : RateStepDraft;
    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      setProblems(
        fromIssues(
          parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            problem: issue.message,
          })),
        ),
      );
      return;
    }
    clear();
    setMessage(null);
    startTransition(async () => {
      const result = await saveProfileStepAction({
        step: 'rate',
        expectedVersion: version,
        fields: parsed.data,
      });
      if (result.ok) {
        setVersion(result.version);
        if (mode === 'complete') router.push('/mentor');
        else router.refresh();
        return;
      }
      if (result.kind === 'invalid' && result.issues !== undefined) {
        setProblems(fromIssues(result.issues));
        return;
      }
      setMessage(
        result.kind === 'conflict'
          ? t('conflict')
          : result.kind === 'locked'
            ? t('locked')
            : t('genericError'),
      );
    });
  };

  const amount = rate ?? 0;
  // The contract names the field `rate60Amount`, the domain `rate60` — both end up here.
  const rateProblem = problems['rate60Amount'] ?? problems['rate60'];

  return (
    <StepFormShell problems={problems} message={message} busy={pending} onSave={save}>
      <Field>
        <FieldLabel htmlFor="rate60">{t('rate.rate')}</FieldLabel>
        <RateInput
          id="rate60"
          amount={rate}
          onChange={setRate}
          currencyLabel="zł / 60 min"
          error={
            rateProblem === undefined ? null : problemText(rateProblem)
          }
        />
        <FieldDescription>{t('rate.rateHint')}</FieldDescription>
      </Field>

      <section aria-labelledby="earnings-preview" className="flex flex-col gap-inline">
        <h3 id="earnings-preview" className="text-label font-medium text-text-default">
          {t('rate.earnings')}
        </h3>
        <EarningsPreview rate60Amount={BigInt(amount)} rate30Amount={BigInt(Math.floor(amount / 2))} />
      </section>
    </StepFormShell>
  );
}
