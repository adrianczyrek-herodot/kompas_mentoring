'use client';

import { Alert, AlertDescription, AlertTitle, Button } from '@kompas/ui';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

/** One problem per field: the field path (`tags`, `experience.0.company`) → the problem code. */
export type FieldProblems = Record<string, string>;

/** Problem code → the key of its message in `messages/pl.json`. */
const PROBLEM_KEYS = {
  required: 'problems.required',
  too_short: 'problems.too_short',
  too_long: 'problems.too_long',
  too_few: 'problems.too_few',
  too_many: 'problems.too_many',
  out_of_range: 'problems.out_of_range',
  not_whole_zloty: 'problems.not_whole_zloty',
  invalid: 'problems.invalid',
  unknown_option: 'problems.unknown_option',
} as const;

/** The text of a problem code — the codes come from the domain, the texts from `pl.json`. */
export function useProblemMessage(): (problem: string) => string {
  const t = useTranslations('Onboarding');
  return (problem) => {
    const key = (PROBLEM_KEYS as Record<string, (typeof PROBLEM_KEYS)[keyof typeof PROBLEM_KEYS]>)[
      problem
    ];
    return key === undefined ? t('problems.invalid') : t(key);
  };
}

/** Field path (the last segment) → the key of its name in `messages/pl.json`. */
const FIELD_KEYS = {
  country: 'fields.country',
  languages: 'fields.languages',
  photo: 'fields.photo',
  categories: 'fields.categories',
  tags: 'fields.tags',
  yearsExperience: 'fields.yearsExperience',
  experience: 'fields.experience',
  company: 'fields.company',
  role: 'fields.role',
  fromYear: 'fields.fromYear',
  toYear: 'fields.toYear',
  headline: 'fields.headline',
  bio: 'fields.bio',
  videoUrl: 'fields.videoUrl',
  rate60: 'fields.rate60',
  rate60Amount: 'fields.rate60Amount',
} as const;

/** The name of a field in Polish — the summary of problems speaks the language of the form. */
function useFieldLabel(): (path: string) => string {
  const t = useTranslations('Onboarding');
  return (path) => {
    const last = path.split('.').pop() ?? path;
    const key = (FIELD_KEYS as Record<string, (typeof FIELD_KEYS)[keyof typeof FIELD_KEYS]>)[last];
    return key === undefined ? path : t(key);
  };
}

export interface StepFormShellProps {
  readonly problems: FieldProblems;
  /** Message above the form (conflict, locked profile, a failed upload). */
  readonly message: string | null;
  readonly busy: boolean;
  readonly onSave: (mode: 'draft' | 'complete') => void;
  readonly children: ReactNode;
  /** The step is not editable (the application is under review — Q6). */
  readonly readOnly?: boolean;
}

/**
 * Shell of every M1 step form: the fields, the list of problems and the two buttons — "Zapisz
 * szkic" (a draft may stay incomplete) and "Zapisz i dalej" (the step must be complete). The
 * summary of problems appears above the form and the focus lands on the first wrong field
 * (requirement: inline errors, focus on the first error).
 */
export function StepFormShell({
  problems,
  message,
  busy,
  onSave,
  children,
  readOnly = false,
}: StepFormShellProps) {
  const t = useTranslations('Onboarding');
  const problemText = useProblemMessage();
  const fieldLabel = useFieldLabel();
  const entries = Object.entries(problems);

  return (
    <form
      className="flex flex-col gap-group"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSave('complete');
      }}
    >
      {message !== null && (
        <Alert variant="danger" role="alert">
          <AlertTitle>{t('errorSummary')}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {entries.length > 0 && (
        <Alert variant="danger" role="alert" data-testid="step-problems">
          <AlertTitle>{t('errorSummary')}</AlertTitle>
          <AlertDescription>
            <ul className="flex list-disc flex-col gap-tight pl-group">
              {entries.map(([field, problem]) => (
                <li key={field}>
                  <a href={`#${field}`} className="underline underline-offset-4">
                    {fieldLabel(field)}: {problemText(problem)}
                  </a>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {children}
      <div className="flex flex-wrap items-center gap-inline">
        <Button type="submit" disabled={busy || readOnly}>
          {busy ? t('saving') : t('saveAndNext')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy || readOnly}
          onClick={() => {
            onSave('draft');
          }}
        >
          {t('saveDraft')}
        </Button>
      </div>
    </form>
  );
}

/**
 * Keeps the problems of the fields and moves the focus to the first one, so a keyboard user does
 * not have to hunt for the mistake (WCAG 3.3.1, 3.3.3).
 */
export function useFieldProblems() {
  const [problems, setProblems] = useState<FieldProblems>({});
  const first = Object.keys(problems)[0];

  useEffect(() => {
    if (first === undefined) return;
    document.getElementById(first)?.focus();
  }, [problems, first]);

  return {
    problems,
    setProblems,
    clear: () => {
      setProblems({});
    },
    /** Field path → problem code, ready for the state of the form. */
    fromIssues: (issues: readonly { field: string; problem: string }[]) =>
      Object.fromEntries(issues.map((issue) => [issue.field, issue.problem])),
  };
}
