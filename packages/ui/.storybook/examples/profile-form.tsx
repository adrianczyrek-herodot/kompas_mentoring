/**
 * Example of the form pattern on M1 „Opis i wideo” (E2-S2): real @kompas/ui components composed
 * the way a screen should do it. Storybook only — the app builds its own with react-hook-form.
 */
import { CircleCheck, CircleX, WifiOff } from 'lucide-react';
import { type SyntheticEvent, useRef, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldOptional,
  Input,
  Textarea,
} from '../../src/index';
import type { ApiResult } from './api';

export type ProfileValues = { headline: string; bio: string; video: string };
type FieldName = keyof ProfileValues;

const empty: ProfileValues = { headline: '', bio: '', video: '' };

// Limits from KONCEPCJA §M1 „Walidacje” and E2-S2 T1.
export function validate(name: FieldName, value: string): string | undefined {
  const length = value.trim().length;
  if (name === 'headline') {
    if (length === 0) return 'Wpisz nagłówek profilu.';
    if (length < 20) return `Nagłówek ma ${String(length)} znaków — potrzeba co najmniej 20.`;
    if (length > 80) return 'Nagłówek może mieć najwyżej 80 znaków.';
  }
  if (name === 'bio') {
    if (length === 0) return 'Opisz, w czym pomagasz uczniom.';
    if (length < 300) return `Opis ma ${String(length)} znaków — potrzeba co najmniej 300.`;
  }
  if (
    name === 'video' &&
    length > 0 &&
    !/^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(value.trim())
  ) {
    return 'Wklej link do filmu z YouTube albo Vimeo.';
  }
  return undefined;
}

const order: FieldName[] = ['headline', 'bio', 'video'];

export function ProfileForm({
  onSubmit,
  initial,
}: {
  onSubmit: (values: ProfileValues) => Promise<ApiResult>;
  initial?: ProfileValues | undefined;
}) {
  const [values, setValues] = useState(initial ?? empty);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const refs = {
    headline: useRef<HTMLInputElement>(null),
    bio: useRef<HTMLTextAreaElement>(null),
    video: useRef<HTMLInputElement>(null),
  };

  const change = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    // Once shown, an error updates while typing, so it disappears as soon as the value is fixed.
    if (errors[name]) setErrors((current) => ({ ...current, [name]: validate(name, value) }));
  };
  // Validate on leaving the field (WCAG 3.3.1), not on every keystroke of a fresh field.
  const blur = (name: FieldName) => {
    setErrors((current) => ({ ...current, [name]: validate(name, values[name]) }));
  };

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return; // Double submit blocked (KONCEPCJA §P4 L).
    const next = Object.fromEntries(order.map((name) => [name, validate(name, values[name])]));
    setErrors(next);
    const firstInvalid = order.find((name) => next[name]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus(); // Focus on the first error (WCAG 3.3.1, 2.4.3).
      return;
    }
    setSubmitting(true);
    setResult(null);
    const run = async () => {
      const answer = await onSubmit(values);
      setSubmitting(false);
      setResult(answer);
      if (!answer.ok && answer.kind === 'field') {
        const field = answer.field as FieldName;
        setErrors((current) => ({ ...current, [field]: answer.message }));
        refs[field].current?.focus();
      }
    };
    void run();
  };

  const describedBy = (name: FieldName, hint?: boolean) =>
    [hint ? `${name}-hint` : '', errors[name] ? `${name}-error` : ''].filter(Boolean).join(' ') ||
    undefined;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        submit(event);
      }}
      className="flex max-w-form flex-col gap-group"
    >
      <FieldGroup>
        <Field data-invalid={errors.headline ? true : undefined}>
          <FieldLabel htmlFor="headline">Nagłówek profilu</FieldLabel>
          <Input
            ref={refs.headline}
            id="headline"
            name="headline"
            value={values.headline}
            maxLength={80}
            placeholder="np. Senior Frontend Engineer · React, TypeScript"
            aria-invalid={errors.headline ? true : undefined}
            aria-describedby={describedBy('headline', true)}
            onChange={(event) => {
              change('headline', event.target.value);
            }}
            onBlur={() => {
              blur('headline');
            }}
          />
          <FieldDescription id="headline-hint">
            20–80 znaków. Kim jesteś i w czym pomagasz — pokażemy to w wynikach wyszukiwania.
          </FieldDescription>
          {errors.headline ? <FieldError id="headline-error">{errors.headline}</FieldError> : null}
        </Field>

        <Field data-invalid={errors.bio ? true : undefined}>
          <FieldLabel htmlFor="bio">Opis</FieldLabel>
          <Textarea
            ref={refs.bio}
            id="bio"
            name="bio"
            rows={6}
            showCount
            maxLength={2000}
            value={values.bio}
            aria-invalid={errors.bio ? true : undefined}
            aria-describedby={describedBy('bio', true)}
            onChange={(event) => {
              change('bio', event.target.value);
            }}
            onBlur={() => {
              blur('bio');
            }}
          />
          <FieldDescription id="bio-hint">
            300–2000 znaków. Z czym przychodzą do Ciebie uczniowie i jak wygląda pierwsza sesja.
          </FieldDescription>
          {errors.bio ? <FieldError id="bio-error">{errors.bio}</FieldError> : null}
        </Field>

        <Field data-invalid={errors.video ? true : undefined}>
          <FieldLabel htmlFor="video">
            Link do filmu <FieldOptional />
          </FieldLabel>
          <Input
            ref={refs.video}
            id="video"
            name="video"
            type="url"
            inputMode="url"
            value={values.video}
            placeholder="https://www.youtube.com/watch?v=…"
            aria-invalid={errors.video ? true : undefined}
            aria-describedby={describedBy('video', true)}
            onChange={(event) => {
              change('video', event.target.value);
            }}
            onBlur={() => {
              blur('video');
            }}
          />
          <FieldDescription id="video-hint">YouTube albo Vimeo, od 30 s do 3 min.</FieldDescription>
          {errors.video ? <FieldError id="video-error">{errors.video}</FieldError> : null}
        </Field>
      </FieldGroup>

      {result && !result.ok && result.kind === 'server' ? (
        <Alert variant="danger" role="alert">
          <CircleX aria-hidden="true" />
          <AlertTitle>Nie udało się zapisać szkicu</AlertTitle>
          <AlertDescription>
            To błąd po naszej stronie. Wpisane dane zostały w formularzu — spróbuj ponownie za
            chwilę.
          </AlertDescription>
        </Alert>
      ) : null}
      {result && !result.ok && result.kind === 'offline' ? (
        <Alert variant="danger" role="alert">
          <WifiOff aria-hidden="true" />
          <AlertTitle>Brak połączenia z internetem</AlertTitle>
          <AlertDescription>
            Szkic nie został zapisany. Dane zostały w formularzu — zapisz ponownie, gdy połączenie
            wróci.
          </AlertDescription>
        </Alert>
      ) : null}
      {result?.ok ? (
        <Alert variant="success" role="status">
          <CircleCheck aria-hidden="true" />
          <AlertTitle>Zapisaliśmy szkic profilu</AlertTitle>
          <AlertDescription>Możesz wrócić do niego w każdej chwili.</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-inline">
        <Button type="submit" loading={submitting}>
          Zapisz szkic
        </Button>
      </div>
    </form>
  );
}
