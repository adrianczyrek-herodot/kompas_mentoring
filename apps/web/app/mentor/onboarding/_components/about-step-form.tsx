'use client';

import {
  AboutStepComplete,
  AboutStepDraft,
  type MentorProfileView,
} from '@kompas/contracts/catalog';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  PhotoUploader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { confirmPhotoUploadAction, requestPhotoUploadAction, saveProfileStepAction } from '../../../../server/onboarding-actions.ts';
import { StepFormShell, useFieldProblems, useProblemMessage } from './step-form.tsx';

const COUNTRIES = [
  { value: 'PL', label: 'Polska' },
  { value: 'AT', label: 'Austria' },
  { value: 'BE', label: 'Belgia' },
  { value: 'CH', label: 'Szwajcaria' },
  { value: 'CZ', label: 'Czechy' },
  { value: 'DE', label: 'Niemcy' },
  { value: 'DK', label: 'Dania' },
  { value: 'ES', label: 'Hiszpania' },
  { value: 'FR', label: 'Francja' },
  { value: 'GB', label: 'Wielka Brytania' },
  { value: 'IE', label: 'Irlandia' },
  { value: 'IT', label: 'Włochy' },
  { value: 'LT', label: 'Litwa' },
  { value: 'NL', label: 'Holandia' },
  { value: 'NO', label: 'Norwegia' },
  { value: 'PT', label: 'Portugalia' },
  { value: 'SE', label: 'Szwecja' },
  { value: 'SK', label: 'Słowacja' },
  { value: 'UA', label: 'Ukraina' },
  { value: 'US', label: 'Stany Zjednoczone' },
];

const LANGUAGES = [
  { value: 'pl', label: 'polski' },
  { value: 'en', label: 'angielski' },
  { value: 'de', label: 'niemiecki' },
  { value: 'uk', label: 'ukraiński' },
  { value: 'es', label: 'hiszpański' },
  { value: 'fr', label: 'francuski' },
  { value: 'it', label: 'włoski' },
  { value: 'cs', label: 'czeski' },
  { value: 'sk', label: 'słowacki' },
  { value: 'lt', label: 'litewski' },
  { value: 'nl', label: 'niderlandzki' },
  { value: 'pt', label: 'portugalski' },
  { value: 'sv', label: 'szwedzki' },
  { value: 'ru', label: 'rosyjski' },
];

const languageLabel = (code: string): string =>
  LANGUAGES.find((language) => language.value === code)?.label ?? code;

/** M1 step 1 — "O mnie": photo, country and the languages of the sessions. */
export function AboutStepForm({ profile }: { profile: MentorProfileView }) {
  const t = useTranslations('Onboarding');
  const router = useRouter();
  const { problems, setProblems, clear, fromIssues } = useFieldProblems();
  const problemText = useProblemMessage();
  const [pending, startTransition] = useTransition();
  const [version, setVersion] = useState(profile.version);
  const [country, setCountry] = useState(profile.country ?? 'PL');
  const [languages, setLanguages] = useState<string[]>([...profile.languages]);
  const [photoState, setPhotoState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [hasPhoto, setHasPhoto] = useState(profile.photoUrl !== null);
  const [message, setMessage] = useState<string | null>(null);

  /** The reason the server gave for refusing the file — a different text for every reason. */
  const photoProblemText = (problem: string | undefined): string => {
    if (problem === 'type') return t('about.photoWrongType');
    if (problem === 'size') return t('about.photoTooBig');
    if (problem === 'dimensions') return t('about.photoTooSmall');
    return t('about.photoInvalid');
  };

  const uploadPhoto = async (file: File) => {
    setPhotoState('uploading');
    setPhotoError(null);
    setPhotoName(file.name);
    const grant = await requestPhotoUploadAction({ contentType: file.type, size: file.size });
    if (!grant.ok) {
      setPhotoState('error');
      setPhotoError(photoProblemText(grant.problem));
      return;
    }
    const uploaded = await fetch(grant.url, {
      method: grant.method,
      headers: grant.headers,
      body: file,
    });
    if (!uploaded.ok) {
      setPhotoState('error');
      setPhotoError(photoProblemText(undefined));
      return;
    }
    const confirmed = await confirmPhotoUploadAction(grant.key);
    if (!confirmed.ok) {
      setPhotoState('error');
      setPhotoError(photoProblemText(confirmed.problem));
      return;
    }
    setVersion(confirmed.version);
    setHasPhoto(true);
    setPhotoState('idle');
    router.refresh();
  };

  const save = (mode: 'draft' | 'complete') => {
    const fields = { country, languages };
    const schema = mode === 'complete' ? AboutStepComplete : AboutStepDraft;
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
    if (mode === 'complete' && !hasPhoto) {
      setProblems({ photo: 'required' });
      return;
    }
    clear();
    setMessage(null);
    startTransition(async () => {
      const result = await saveProfileStepAction({
        step: 'about',
        expectedVersion: version,
        fields: parsed.data,
      });
      if (result.ok) {
        setVersion(result.version);
        if (mode === 'complete') router.push('/mentor/onboarding/kompetencje');
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
    <StepFormShell
      problems={problems}
      message={message}
      busy={pending || photoState === 'uploading'}
      onSave={save}
    >
      <Field>
        <FieldLabel htmlFor="display-name">{t('about.displayName')}</FieldLabel>
        <Input id="display-name" value={profile.displayName} readOnly disabled />
        <FieldDescription>{t('about.displayNameHint')}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="photo">{t('about.photo')}</FieldLabel>
        <PhotoUploader
          previewUrl={profile.photoUrl}
          fileName={photoName}
          state={photoState}
          error={photoError ?? (problems['photo'] === undefined ? null : t('about.photoMissing'))}
          chooseLabel={t('about.choosePhoto')}
          retryLabel={t('about.retryPhoto')}
          description={photoState === 'uploading' ? t('about.uploadingPhoto') : t('about.photoHint')}
          onSelect={(file) => void uploadPhoto(file)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="country">{t('about.country')}</FieldLabel>
        <Select
          items={COUNTRIES}
          value={country}
          onValueChange={(value) => {
            setCountry(typeof value === 'string' ? value : 'PL');
          }}
        >
          <SelectTrigger id="country" aria-invalid={problems['country'] !== undefined}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {problems['country'] !== undefined && (
          <FieldError id="country-error">{problemText(problems['country'])}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="languages">{t('about.languages')}</FieldLabel>
        <Combobox
          items={LANGUAGES}
          multiple
          value={languages}
          onValueChange={(value) => {
            setLanguages(value);
          }}
        >
          <ComboboxValue>
            {(value: string[]) => (
              <ComboboxInput
                id="languages"
                triggerLabel="Pokaż języki"
                placeholder={value.length > 0 ? '' : 'np. polski'}
                chips={
                  value.length > 0 ? (
                    <ComboboxChips aria-label={t('about.languages')}>
                      {value.map((code) => (
                        <ComboboxChip key={code} removeLabel={`${t('skills.removeTag')}: ${code}`}>
                          {languageLabel(code)}
                        </ComboboxChip>
                      ))}
                    </ComboboxChips>
                  ) : null
                }
              />
            )}
          </ComboboxValue>
          <ComboboxContent>
            <ComboboxEmpty>Nie ma takiego języka na liście.</ComboboxEmpty>
            <ComboboxList>
              {(language: { value: string; label: string }) => (
                <ComboboxItem key={language.value} value={language.value}>
                  {language.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>{t('about.languagesHint')}</FieldDescription>
        {problems['languages'] !== undefined && (
          <FieldError id="languages-error">{problemText(problems['languages'])}</FieldError>
        )}
      </Field>
    </StepFormShell>
  );
}
