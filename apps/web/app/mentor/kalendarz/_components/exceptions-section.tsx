'use client';

import type { AvailabilityExceptionView, MentorCalendarView } from '@kompas/contracts/scheduling';
import {
  Alert,
  AlertDescription,
  Button,
  DateTime,
  ExceptionDialog,
  type ExceptionDraft,
} from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import {
  addAvailabilityExceptionAction,
  deleteAvailabilityExceptionAction,
} from '../../../../server/availability-actions.ts';
import { zonedLocalToInstant } from './zone-time.ts';

const KIND_LABEL: Record<AvailabilityExceptionView['kind'], string> = {
  off: 'Urlop / blokada',
  extra: 'Dodatkowe godziny',
};

export interface ExceptionsSectionProps {
  readonly exceptions: readonly AvailabilityExceptionView[];
  /** IANA zone of the mentor — a wall-clock input is read in it (Q12). */
  readonly timeZone: string;
  readonly onSaved: (calendar: MentorCalendarView) => void;
}

/** One exception row: kind, the range in the mentor's zone, the note and a remove button. */
function ExceptionRow({
  exception,
  timeZone,
  busy,
  onRemove,
}: {
  readonly exception: AvailabilityExceptionView;
  readonly timeZone: string;
  readonly busy: boolean;
  readonly onRemove: (id: string) => void;
}) {
  return (
    <li
      className="flex flex-wrap items-center justify-between gap-inline rounded-panel border border-border-divider p-group"
      data-testid="exception-row"
    >
      <span className="text-body text-text-default">
        <strong className="font-semibold">{KIND_LABEL[exception.kind]}</strong>{' '}
        <DateTime value={exception.startsAt} timeZone={timeZone} format="datetime" />
        {' – '}
        <DateTime value={exception.endsAt} timeZone={timeZone} format="time" />
        {exception.note !== null && exception.note !== '' && (
          <span className="text-text-muted"> · {exception.note}</span>
        )}
      </span>
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => {
          onRemove(exception.id);
        }}
      >
        Usuń
      </Button>
    </li>
  );
}

/** M3 exceptions (requirement 1, Q10): the list plus the dialog that adds an `off`/`extra` range. */
export function ExceptionsSection({ exceptions, timeZone, onSaved }: ExceptionsSectionProps) {
  const t = useTranslations('Availability');
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<readonly { field: string; problem: string }[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, startAction] = useTransition();

  const submit = (draft: ExceptionDraft) => {
    setErrors([]);
    setMessage(null);
    startAction(async () => {
      const result = await addAvailabilityExceptionAction({
        startsAt: zonedLocalToInstant(draft.startsAt, timeZone),
        endsAt: zonedLocalToInstant(draft.endsAt, timeZone),
        kind: draft.kind,
        note: draft.note.trim() === '' ? null : draft.note.trim(),
      });
      if (result.ok) {
        setOpen(false);
        onSaved(result.calendar);
      } else if (result.issues !== undefined) {
        setErrors(result.issues);
      } else {
        setMessage(result.kind === 'conflict' ? t('conflict') : t('error'));
      }
    });
  };

  const remove = (id: string) => {
    setMessage(null);
    startAction(async () => {
      const result = await deleteAvailabilityExceptionAction(id);
      if (result.ok) onSaved(result.calendar);
      else setMessage(t('error'));
    });
  };

  return (
    <div className="flex flex-col gap-group">
      {message !== null && (
        <Alert variant="danger" role="alert">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {exceptions.length === 0 ? (
        <p className="text-body text-text-muted">{t('exceptionsEmpty')}</p>
      ) : (
        <ul className="flex flex-col gap-tight" data-testid="exceptions-list">
          {exceptions.map((exception) => (
            <ExceptionRow
              key={exception.id}
              exception={exception}
              timeZone={timeZone}
              busy={busy}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline"
        className="self-start"
        data-testid="exception-add"
        disabled={busy}
        onClick={() => {
          setErrors([]);
          setOpen(true);
        }}
      >
        {t('addException')}
      </Button>
      <ExceptionDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={submit}
        errors={errors}
        pending={busy}
        timeZone={timeZone}
      />
    </div>
  );
}
