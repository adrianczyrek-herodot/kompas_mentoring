/**
 * M2 parts: the „Decyzja z powodem” dialog for declining a trial request (KONCEPCJA §M2: reason
 * from a list or „inne” 10–300 characters) and demo-calendar helpers shared with M3 and M4.
 */
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  RadioGroup,
  RadioGroupItem,
  Textarea,
  useToast,
} from '@kompas/ui';
import { type SyntheticEvent, useId, useRef, useState } from 'react';
import { addMinutes, toMs, TZ } from '../lib/clock';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo } from '../state/demo-context';

/** Calendar day `YYYY-MM-DD` of an instant in the demo time zone. */
export function dayKey(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(toMs(iso));
}

const WEEKDAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

/** 0 = Monday … 6 = Sunday, in the demo time zone. */
export function weekdayOf(iso: string): number {
  const name = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: TZ }).format(toMs(iso));
  return WEEKDAY_INDEX[name] ?? 0;
}

/** First and last day (`YYYY-MM-DD`) of the Monday-based week that contains `iso`. */
export function weekRange(iso: string): { from: string; to: string } {
  const monday = addMinutes(iso, -weekdayOf(iso) * 24 * 60);
  return { from: dayKey(monday), to: dayKey(addMinutes(monday, 6 * 24 * 60)) };
}

const DECLINE_REASONS = [
  { value: 'time', label: 'Termin mi nie pasuje', hint: 'Uczeń dostanie link do Twoich wolnych terminów.' },
  { value: 'topic', label: 'Temat poza moją specjalizacją', hint: 'Zaproponujemy uczniowi innych mentorów.' },
  { value: 'full', label: 'Nie przyjmuję teraz nowych uczniów', hint: 'Możesz wstrzymać przyjmowanie w kalendarzu.' },
  { value: 'other', label: 'Inne', hint: 'Opiszesz powód w polu poniżej.' },
];

export function DeclineDialog({
  bookingId,
  student,
  open,
  onOpenChange,
}: {
  bookingId: string;
  student: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const id = useId();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ reason?: string | undefined; note?: string | undefined }>({});
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!reason) next.reason = 'Wybierz powód — uczeń go zobaczy.';
    const length = note.trim().length;
    if (reason === 'other' && (length < 10 || length > 300)) {
      next.note = `Opisz powód w 10–300 znakach (teraz ${String(length)}).`;
    }
    setErrors(next);
    if (next.reason ?? next.note) return;
    const label = DECLINE_REASONS.find((r) => r.value === reason)?.label ?? reason;
    void action.run(() => {
      dispatch({ type: 'answer-trial', id: bookingId, accept: false, reason: reason === 'other' ? note.trim() : label });
      onOpenChange(false);
      toast.add({ title: 'Prośba odrzucona', description: `${student} dostaje powód i zwrot 100% płatności.` });
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!action.busy) { action.reset(); onOpenChange(next); } }}>
      <DialogContent closeLabel="Zamknij">
        <form noValidate onSubmit={submit} className="flex flex-col gap-group">
          <DialogHeader>
            <DialogTitle>Odrzucić prośbę: {student}?</DialogTitle>
            <DialogDescription>Uczeń zobaczy wybrany powód. Sesja próbna nie zostanie umówiona.</DialogDescription>
          </DialogHeader>
          <FieldSet data-invalid={errors.reason ? true : undefined}>
            <FieldLegend id={`${id}-legend`}>Powód odrzucenia</FieldLegend>
            <RadioGroup
              aria-labelledby={`${id}-legend`}
              aria-describedby={errors.reason ? `${id}-reason-error` : undefined}
              value={reason}
              onValueChange={(value) => {
                setReason(String(value));
                setErrors((current) => ({ ...current, reason: undefined }));
              }}
            >
              {DECLINE_REASONS.map((item) => (
                <Field key={item.value} orientation="horizontal">
                  <RadioGroupItem id={`${id}-${item.value}`} value={item.value} />
                  <FieldContent>
                    <FieldLabel htmlFor={`${id}-${item.value}`}>{item.label}</FieldLabel>
                    <FieldDescription>{item.hint}</FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </RadioGroup>
            {errors.reason ? <FieldError id={`${id}-reason-error`}>{errors.reason}</FieldError> : null}
          </FieldSet>
          {reason === 'other' ? (
            <Field data-invalid={errors.note ? true : undefined}>
              <FieldLabel htmlFor={`${id}-note`}>Powód własnymi słowami</FieldLabel>
              <Textarea
                ref={noteRef}
                id={`${id}-note`}
                rows={3}
                showCount
                maxLength={300}
                value={note}
                aria-invalid={errors.note ? true : undefined}
                aria-describedby={errors.note ? `${id}-note-error` : undefined}
                onChange={(event) => { setNote(event.target.value); }}
              />
              {errors.note ? <FieldError id={`${id}-note-error`}>{errors.note}</FieldError> : null}
            </Field>
          ) : null}
          <FailureAlert kind={action.failure} what="Prośba nie została odrzucona" />
          <DialogFooter>
            <Button type="button" variant="outline" disabled={action.busy} onClick={() => { onOpenChange(false); }}>Wróć</Button>
            <Button type="submit" variant="destructive" loading={action.busy}>Odrzuć prośbę</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
