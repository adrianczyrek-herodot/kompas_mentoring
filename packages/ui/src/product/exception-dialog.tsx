'use client';

import { type ChangeEventHandler, type SyntheticEvent, useId, useState } from 'react';
import { Button } from '../components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/dialog';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldOptional,
  FieldSet,
} from '../components/field';
import { Input } from '../components/input';
import { RadioGroup, RadioGroupItem } from '../components/radio-group';
import { Textarea } from '../components/textarea';

export interface ExceptionDraft {
  /** 'YYYY-MM-DDTHH:MM' (datetime-local), interpreted in the mentor's zone. */
  readonly startsAt: string;
  readonly endsAt: string;
  readonly kind: 'off' | 'extra';
  readonly note: string;
}

export interface ExceptionDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (value: ExceptionDraft) => void;
  readonly initialValue?: Partial<ExceptionDraft>;
  readonly mode?: 'create' | 'edit';
  readonly errors?: readonly { readonly field: string; readonly problem: string }[];
  readonly pending?: boolean;
  readonly timeZone?: string;
  readonly className?: string;
}

type FieldName = 'startsAt' | 'endsAt' | 'kind' | 'note';
type FieldErrors = Partial<Record<FieldName, string>>;

const KIND_OPTIONS = [
  {
    value: 'off',
    label: 'Urlop / blokada',
    hint: 'Ten czas zniknie z Twoich wolnych terminów.',
  },
  {
    value: 'extra',
    label: 'Dodatkowe godziny',
    hint: 'Pojawią się poza Twoim tygodniowym szablonem.',
  },
] as const;

function KindField({
  id,
  value,
  error,
  onChange,
}: {
  id: string;
  value: ExceptionDraft['kind'];
  error: string | undefined;
  onChange: (patch: Partial<ExceptionDraft>) => void;
}) {
  const select = (next: unknown) => {
    onChange({ kind: next as ExceptionDraft['kind'] });
  };
  return (
    <FieldSet data-invalid={error ? true : undefined}>
      <FieldLegend>Rodzaj</FieldLegend>
      <RadioGroup value={value} onValueChange={select}>
        {KIND_OPTIONS.map((option) => (
          <Field key={option.value} orientation="horizontal">
            <RadioGroupItem id={`${id}-${option.value}`} value={option.value} />
            <FieldContent>
              <FieldLabel htmlFor={`${id}-${option.value}`}>{option.label}</FieldLabel>
              <FieldDescription>{option.hint}</FieldDescription>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
      <FieldError>{error}</FieldError>
    </FieldSet>
  );
}

function DateTimeField({
  id,
  field,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  field: 'startsAt' | 'endsAt';
  label: string;
  value: string;
  error: string | undefined;
  onChange: (patch: Partial<ExceptionDraft>) => void;
}) {
  const change: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange({ [field]: event.target.value });
  };
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="datetime-local"
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={change}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function NoteField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (patch: Partial<ExceptionDraft>) => void;
}) {
  const change: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    onChange({ note: event.target.value });
  };
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        Notatka <FieldOptional />
      </FieldLabel>
      <Textarea id={id} rows={3} maxLength={300} showCount value={value} onChange={change} />
    </Field>
  );
}

type ExceptionFormProps = {
  initialValue?: Partial<ExceptionDraft> | undefined;
  mode: 'create' | 'edit';
  errors?: ExceptionDialogProps['errors'];
  pending: boolean;
  timeZone?: string | undefined;
  onSubmit: (value: ExceptionDraft) => void;
  onCancel: () => void;
};

function ExceptionFields({
  id,
  draft,
  errorFor,
  onChange,
}: {
  id: string;
  draft: ExceptionDraft;
  errorFor: (field: FieldName) => string | undefined;
  onChange: (patch: Partial<ExceptionDraft>) => void;
}) {
  return (
    <FieldGroup>
      <KindField id={id} value={draft.kind} error={errorFor('kind')} onChange={onChange} />
      <DateTimeField
        id={`${id}-start`}
        field="startsAt"
        label="Początek"
        value={draft.startsAt}
        error={errorFor('startsAt')}
        onChange={onChange}
      />
      <DateTimeField
        id={`${id}-end`}
        field="endsAt"
        label="Koniec"
        value={draft.endsAt}
        error={errorFor('endsAt')}
        onChange={onChange}
      />
      <NoteField id={`${id}-note`} value={draft.note} onChange={onChange} />
    </FieldGroup>
  );
}

function useExceptionDraft(initialValue: Partial<ExceptionDraft> | undefined) {
  const [draft, setDraft] = useState<ExceptionDraft>(() => ({
    startsAt: initialValue?.startsAt ?? '',
    endsAt: initialValue?.endsAt ?? '',
    kind: initialValue?.kind ?? 'off',
    note: initialValue?.note ?? '',
  }));
  const patch = (partial: Partial<ExceptionDraft>) => {
    setDraft((current) => ({ ...current, ...partial }));
  };
  return { draft, patch };
}

function ExceptionFormBody(
  props: ExceptionFormProps & {
    id: string;
    draft: ExceptionDraft;
    errorFor: (field: FieldName) => string | undefined;
    patch: (partial: Partial<ExceptionDraft>) => void;
    submit: (event: SyntheticEvent<HTMLFormElement>) => void;
  },
) {
  const { id, draft, errorFor, patch, submit, mode, pending, timeZone, onCancel } = props;
  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-group">
      <DialogHeader>
        <DialogTitle>{mode === 'edit' ? 'Edytuj wyjątek' : 'Dodaj wyjątek'}</DialogTitle>
        <DialogDescription>
          Wyjątek zastępuje szablon tylko w tym zakresie.
          {timeZone ? ` Czas w strefie: ${timeZone}.` : ''}
        </DialogDescription>
      </DialogHeader>
      <ExceptionFields id={id} draft={draft} errorFor={errorFor} onChange={patch} />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
        <Button type="submit" loading={pending}>
          {mode === 'edit' ? 'Zapisz zmiany' : 'Dodaj wyjątek'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ExceptionForm(props: ExceptionFormProps) {
  const { initialValue, errors, onSubmit } = props;
  const id = useId();
  const { draft, patch } = useExceptionDraft(initialValue);
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const errorFor = (field: FieldName) =>
    localErrors[field] ?? errors?.find((item) => item.field === field)?.problem;

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: FieldErrors = {};
    if (!draft.startsAt) next.startsAt = 'Podaj datę i godzinę początku.';
    if (!draft.endsAt) next.endsAt = 'Podaj datę i godzinę końca.';
    if (draft.startsAt && draft.endsAt && draft.endsAt <= draft.startsAt) {
      next.endsAt = 'Koniec musi być później niż początek.';
    }
    setLocalErrors(next);
    if (!next.startsAt && !next.endsAt) onSubmit(draft);
  };

  return (
    <ExceptionFormBody
      {...props}
      id={id}
      draft={draft}
      errorFor={errorFor}
      patch={patch}
      submit={submit}
    />
  );
}

/** Add/edit an availability exception (M3, Q11): a range, a kind (`off`/`extra`) and a note. */
function ExceptionDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValue,
  mode = 'create',
  errors,
  pending = false,
  timeZone,
  className,
}: ExceptionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
    >
      <DialogContent closeLabel="Zamknij" className={className}>
        <ExceptionForm
          initialValue={initialValue}
          mode={mode}
          errors={errors}
          pending={pending}
          timeZone={timeZone}
          onSubmit={onSubmit}
          onCancel={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export { ExceptionDialog };
