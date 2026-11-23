'use client';

import {
  BioStepComplete,
  BioStepDraft,
  type MentorProfileView,
} from '@kompas/contracts/catalog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
  VideoLinkField,
} from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveProfileStepAction } from '../../../../server/onboarding-actions.ts';
import { StepFormShell, useFieldProblems, useProblemMessage } from './step-form.tsx';

/** M1 step 3 — "Opis i wideo": headline, description and an optional video. */
export function BioStepForm({ profile }: { profile: MentorProfileView }) {
  const t = useTranslations('Onboarding');
  const router = useRouter();
  const { problems, setProblems, clear, fromIssues } = useFieldProblems();
  const problemText = useProblemMessage();
  const [pending, startTransition] = useTransition();
  const [version, setVersion] = useState(profile.version);
  const [headline, setHeadline] = useState(profile.headline ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [videoUrl, setVideoUrl] = useState(profile.videoUrl ?? '');
  const [message, setMessage] = useState<string | null>(null);

  const save = (mode: 'draft' | 'complete') => {
    const fields = { headline, bio, videoUrl };
    const schema = mode === 'complete' ? BioStepComplete : BioStepDraft;
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
        step: 'bio',
        expectedVersion: version,
        fields: parsed.data,
      });
      if (result.ok) {
        setVersion(result.version);
        if (mode === 'complete') router.push('/mentor/onboarding/stawka');
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

  return (
    <StepFormShell problems={problems} message={message} busy={pending} onSave={save}>
      <Field>
        <FieldLabel htmlFor="headline">{t('bio.headline')}</FieldLabel>
        <Input
          id="headline"
          value={headline}
          maxLength={80}
          aria-invalid={problems['headline'] !== undefined}
          onChange={(event) => {
            setHeadline(event.target.value);
          }}
        />
        <FieldDescription>{t('bio.headlineHint')}</FieldDescription>
        {problems['headline'] !== undefined && (
          <FieldError id="headline-error">{problemText(problems['headline'])}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="bio">{t('bio.bio')}</FieldLabel>
        <Textarea
          id="bio"
          rows={10}
          value={bio}
          maxLength={2000}
          showCount
          aria-invalid={problems['bio'] !== undefined}
          onChange={(event) => {
            setBio(event.target.value);
          }}
        />
        <FieldDescription>{t('bio.bioHint')}</FieldDescription>
        {problems['bio'] !== undefined && (
          <FieldError id="bio-error">{problemText(problems['bio'])}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="videoUrl">{t('bio.video')}</FieldLabel>
        <VideoLinkField
          id="videoUrl"
          value={videoUrl}
          onChange={setVideoUrl}
          error={problems['videoUrl'] === undefined ? null : t('bio.videoInvalid')}
        />
        <FieldDescription>{t('bio.videoHint')}</FieldDescription>
      </Field>
    </StepFormShell>
  );
}
