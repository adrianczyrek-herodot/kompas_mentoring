'use client';

import {
  type MentorProfileView,
  SkillsStepComplete,
  SkillsStepDraft,
} from '@kompas/contracts/catalog';
import {
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  TagInput,
} from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveProfileStepAction } from '../../../../server/onboarding-actions.ts';
import { StepFormShell, useFieldProblems, useProblemMessage } from './step-form.tsx';

const CATEGORIES = [
  { value: 'it-programowanie', label: 'IT i programowanie' },
  { value: 'data-ai', label: 'Data i AI' },
  { value: 'produkt-ux', label: 'Produkt i UX/design' },
  { value: 'kariera-rekrutacja', label: 'Kariera i rekrutacja' },
  { value: 'biznes-zarzadzanie', label: 'Biznes i zarządzanie' },
  { value: 'marketing-sprzedaz', label: 'Marketing i sprzedaż' },
];

interface ExperienceRow {
  readonly company: string;
  readonly role: string;
  readonly fromYear: number | null;
  readonly toYear: number | null;
}

/** M1 step 2 — "Kompetencje": categories, tags, years of experience and the companies. */
export function SkillsStepForm({ profile }: { profile: MentorProfileView }) {
  const t = useTranslations('Onboarding');
  const router = useRouter();
  const { problems, setProblems, clear, fromIssues } = useFieldProblems();
  const problemText = useProblemMessage();
  const [pending, startTransition] = useTransition();
  const [version, setVersion] = useState(profile.version);
  const [categories, setCategories] = useState<string[]>([...profile.categories]);
  const [tags, setTags] = useState<string[]>([...profile.tags]);
  const [yearsExperience, setYearsExperience] = useState<number | null>(profile.yearsExperience);
  const [experience, setExperience] = useState<ExperienceRow[]>(
    profile.experience.map((entry) => ({ ...entry })),
  );
  const [message, setMessage] = useState<string | null>(null);

  const toggleCategory = (slug: string, checked: boolean) => {
    setCategories((current) =>
      checked ? [...current, slug] : current.filter((candidate) => candidate !== slug),
    );
  };

  const updateExperience = (index: number, patch: Partial<ExperienceRow>) => {
    setExperience((current) =>
      current.map((entry, position) => (position === index ? { ...entry, ...patch } : entry)),
    );
  };

  const save = (mode: 'draft' | 'complete') => {
    const fields = { categories, tags, yearsExperience, experience };
    const schema = mode === 'complete' ? SkillsStepComplete : SkillsStepDraft;
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
        step: 'skills',
        expectedVersion: version,
        fields: parsed.data,
      });
      if (result.ok) {
        setVersion(result.version);
        if (mode === 'complete') router.push('/mentor/onboarding/opis-i-wideo');
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
      <FieldSet>
        <FieldLegend>{t('skills.categories')}</FieldLegend>
        <FieldDescription>{t('skills.categoriesHint')}</FieldDescription>
        <ul className="flex flex-col gap-tight">
          {CATEGORIES.map((category) => (
            <li key={category.value}>
              <Field orientation="horizontal">
                <Checkbox
                  id={`category-${category.value}`}
                  checked={categories.includes(category.value)}
                  onCheckedChange={(checked) => {
                    toggleCategory(category.value, checked);
                  }}
                />
                <FieldLabel htmlFor={`category-${category.value}`}>{category.label}</FieldLabel>
              </Field>
            </li>
          ))}
        </ul>
        {problems['categories'] !== undefined && (
          <FieldError id="categories-error">{problemText(problems['categories'])}</FieldError>
        )}
      </FieldSet>

      <Field>
        <FieldLabel htmlFor="tags">{t('skills.tags')}</FieldLabel>
        <TagInput
          value={tags}
          onChange={setTags}
          label={t('skills.tags')}
          removeLabel={t('skills.removeTag')}
          placeholder={t('skills.tagPlaceholder')}
          minLength={2}
          maxLength={30}
          max={15}
        />
        <FieldDescription>{t('skills.tagsHint')}</FieldDescription>
        {problems['tags'] !== undefined && (
          <FieldError id="tags-error">{problemText(problems['tags'])}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="years">{t('skills.yearsExperience')}</FieldLabel>
        <Input
          id="years"
          type="number"
          inputMode="numeric"
          min={0}
          max={50}
          value={yearsExperience ?? ''}
          aria-invalid={problems['yearsExperience'] !== undefined}
          onChange={(event) => {
            const value = event.target.value;
            setYearsExperience(value.trim() === '' ? null : Number(value));
          }}
        />
        {problems['yearsExperience'] !== undefined && (
          <FieldError id="years-error">{problemText(problems['yearsExperience'])}</FieldError>
        )}
      </Field>

      <FieldSet>
        <FieldLegend>{t('skills.experience')}</FieldLegend>
        <ul className="flex flex-col gap-group">
          {experience.map((entry, index) => (
            <li key={index} className="flex flex-col gap-inline">
              <div className="flex flex-col gap-inline">
                <Field>
                  <FieldLabel htmlFor={`experience.${index}.company`}>{t('skills.company')}</FieldLabel>
                  <Input
                    id={`experience.${index}.company`}
                    value={entry.company}
                    onChange={(event) => {
                      updateExperience(index, { company: event.target.value });
                    }}
                  />
                  {problems[`experience.${index}.company`] !== undefined && (
                    <FieldError id={`experience.${index}.company-error`}>
                      {problemText(problems[`experience.${index}.company`] ?? 'invalid')}
                    </FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor={`experience.${index}.role`}>{t('skills.role')}</FieldLabel>
                  <Input
                    id={`experience.${index}.role`}
                    value={entry.role}
                    onChange={(event) => {
                      updateExperience(index, { role: event.target.value });
                    }}
                  />
                  {problems[`experience.${index}.role`] !== undefined && (
                    <FieldError id={`experience.${index}.role-error`}>
                      {problemText(problems[`experience.${index}.role`] ?? 'invalid')}
                    </FieldError>
                  )}
                </Field>
                <div className="flex flex-col gap-inline @md/field-group:flex-row">
                  <Field>
                    <FieldLabel htmlFor={`experience.${index}.fromYear`}>{t('skills.fromYear')}</FieldLabel>
                    <Input
                      id={`experience.${index}.fromYear`}
                      type="number"
                      inputMode="numeric"
                      value={entry.fromYear ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        updateExperience(index, {
                          fromYear: value.trim() === '' ? null : Number(value),
                        });
                      }}
                    />
                    {problems[`experience.${index}.fromYear`] !== undefined && (
                      <FieldError id={`experience.${index}.fromYear-error`}>
                        {problemText(problems[`experience.${index}.fromYear`] ?? 'invalid')}
                      </FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`experience.${index}.toYear`}>{t('skills.toYear')}</FieldLabel>
                    <Input
                      id={`experience.${index}.toYear`}
                      type="number"
                      inputMode="numeric"
                      value={entry.toYear ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        updateExperience(index, {
                          toYear: value.trim() === '' ? null : Number(value),
                        });
                      }}
                    />
                    {problems[`experience.${index}.toYear`] !== undefined && (
                      <FieldError id={`experience.${index}.toYear-error`}>
                        {problemText(problems[`experience.${index}.toYear`] ?? 'invalid')}
                      </FieldError>
                    )}
                  </Field>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => {
                  setExperience((current) => current.filter((_, position) => position !== index));
                }}
              >
                {t('skills.removeExperience')}
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => {
            setExperience((current) => [
              ...current,
              { company: '', role: '', fromYear: null, toYear: null },
            ]);
          }}
        >
          {t('skills.addExperience')}
        </Button>
        {problems['experience'] !== undefined && (
          <FieldError id="experience-error">{problemText(problems['experience'])}</FieldError>
        )}
      </FieldSet>
    </StepFormShell>
  );
}
