/**
 * „Decyzja z powodem”: declining a trial request in M2 (E3-S7 T1 — reason from a list or „inne”
 * 10–300 characters). Real @kompas/ui components; Storybook only.
 */
import { CircleX } from 'lucide-react';
import { type SyntheticEvent, useId, useRef, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
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
  type TrialRequest,
} from '../../src/index';
import type { ApiResult } from './api';

// Reasons and their consequences — the same list as the RadioGroup docs (M2).
export const declineReasons = [
  {
    value: 'time',
    label: 'Termin mi nie pasuje',
    hint: 'Uczeń dostanie link do Twoich wolnych terminów.',
  },
  {
    value: 'topic',
    label: 'Temat poza moją specjalizacją',
    hint: 'Zaproponujemy uczniowi innych mentorów.',
  },
  {
    value: 'full',
    label: 'Nie przyjmuję teraz nowych uczniów',
    hint: 'Możesz wstrzymać przyjmowanie w kalendarzu.',
  },
  { value: 'other', label: 'Inne', hint: 'Opiszesz powód w polu poniżej.' },
];

export function DeclineDialog({
  request,
  open,
  onOpenChange,
  onSubmit,
}: {
  request: TrialRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string, note: string) => Promise<ApiResult>;
}) {
  const id = useId();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ reason?: string | undefined; note?: string | undefined }>(
    {},
  );
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const firstRadio = useRef<HTMLButtonElement>(null);

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const next: typeof errors = {};
    if (!reason) next.reason = 'Wybierz powód — uczeń go zobaczy.';
    const length = note.trim().length;
    if (reason === 'other' && (length < 10 || length > 300))
      next.note = `Opisz powód w 10–300 znakach (teraz ${String(length)}).`;
    setErrors(next);
    if (next.reason) {
      firstRadio.current?.focus();
      return;
    }
    if (next.note) {
      noteRef.current?.focus();
      return;
    }
    setPending(true);
    setFailure(null);
    const run = async () => {
      const answer = await onSubmit(reason, note);
      setPending(false);
      if (answer.ok) onOpenChange(false);
      else
        setFailure(
          answer.kind === 'offline'
            ? 'Brak połączenia z internetem. Prośba nadal czeka — spróbuj ponownie.'
            : 'Nie udało się odrzucić prośby. Spróbuj ponownie za chwilę.',
        );
    };
    void run();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
    >
      <DialogContent closeLabel="Zamknij">
        <form
          noValidate
          onSubmit={(event) => {
            submit(event);
          }}
          className="flex flex-col gap-group"
        >
          <DialogHeader>
            <DialogTitle>Odrzucić prośbę: {request.student}?</DialogTitle>
            <DialogDescription>
              Uczeń zobaczy wybrany powód. Sesja próbna nie zostanie umówiona.
            </DialogDescription>
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
              {declineReasons.map((item, index) => (
                <Field key={item.value} orientation="horizontal">
                  <RadioGroupItem
                    ref={index === 0 ? firstRadio : undefined}
                    id={`${id}-${item.value}`}
                    value={item.value}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={`${id}-${item.value}`}>{item.label}</FieldLabel>
                    <FieldDescription>{item.hint}</FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </RadioGroup>
            {errors.reason ? (
              <FieldError id={`${id}-reason-error`}>{errors.reason}</FieldError>
            ) : null}
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
                onChange={(event) => {
                  setNote(event.target.value);
                }}
              />
              {errors.note ? <FieldError id={`${id}-note-error`}>{errors.note}</FieldError> : null}
            </Field>
          ) : null}
          {failure ? (
            <Alert variant="danger" role="alert">
              <CircleX aria-hidden="true" />
              <AlertTitle>Prośba nie została odrzucona</AlertTitle>
              <AlertDescription>{failure}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Wróć
            </Button>
            <Button type="submit" loading={pending}>
              Odrzuć prośbę
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
