'use client';

import type { MentorCalendarView } from '@kompas/contracts/scheduling';
import {
  Alert,
  AlertDescription,
  AvailabilityEditor,
  type AvailabilityRuleView,
  Button,
} from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { saveAvailabilityTemplateAction } from '../../../server/availability-actions.ts';

export interface AvailabilityTemplateFormProps {
  /** The template as the server last stored it. */
  readonly rules: readonly AvailabilityRuleView[];
  /** Optimistic lock of the whole availability (Q6/Q11) — the version M3 loaded. */
  readonly expectedVersion: number;
  readonly disabled?: boolean;
  /** Receives the fresh calendar after a successful save. */
  readonly onSaved: (calendar: MentorCalendarView) => void;
}

/**
 * Leaf form of the weekly template (requirement 2): M3 and the M1 step 5 onboarding (E2-S3) embed
 * exactly this component, so the editor and its save service live in one place. The draft is local
 * until "Zapisz"; a stale version means another tab saved first (409 → conflict message).
 */
export function AvailabilityTemplateForm({
  rules,
  expectedVersion,
  disabled = false,
  onSaved,
}: AvailabilityTemplateFormProps) {
  const t = useTranslations('Availability');
  const [draft, setDraft] = useState<readonly AvailabilityRuleView[]>(rules);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, startSaving] = useTransition();

  // A save (or another tab refreshing) replaced the stored template — follow it.
  useEffect(() => {
    setDraft(rules);
  }, [rules]);

  const save = () => {
    setMessage(null);
    startSaving(async () => {
      const result = await saveAvailabilityTemplateAction({
        rules: draft,
        expectedVersion,
      });
      if (result.ok) {
        setDraft(toEditorRules(result.calendar.rules));
        onSaved(result.calendar);
      } else {
        setMessage(result.kind === 'conflict' ? t('conflict') : t('error'));
      }
    });
  };

  return (
    <div className="flex flex-col gap-group">
      {message !== null && (
        <Alert variant="danger" role="alert" data-testid="template-error">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <AvailabilityEditor
        value={draft}
        onChange={(next) => {
          setDraft(next);
        }}
        disabled={disabled || busy}
      />
      <Button
        type="button"
        className="self-start"
        data-testid="template-save"
        disabled={disabled || busy}
        onClick={save}
      >
        {busy ? t('saving') : t('save')}
      </Button>
    </div>
  );
}

/** Contract rules (weekday as a number) → the editor's narrowed weekday union. */
export const toEditorRules = (rules: MentorCalendarView['rules']): AvailabilityRuleView[] =>
  rules.map((rule) => ({
    weekday: rule.weekday as AvailabilityRuleView['weekday'],
    startLocal: rule.startLocal,
    endLocal: rule.endLocal,
  }));
