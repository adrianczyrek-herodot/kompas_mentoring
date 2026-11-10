'use client';

import { Checkbox, Field, FieldDescription, FieldError, FieldLabel, Input } from '@kompas/ui';
import { useTranslations } from 'next-intl';
import type { FieldErrors } from './auth-validation.ts';

type Mode = 'login' | 'register';
type TextField = 'name' | 'email' | 'password';

const INPUT_TYPES: Record<TextField, string> = {
  name: 'text',
  email: 'email',
  password: 'password',
};
const AUTOCOMPLETE: Record<TextField, Record<Mode, string>> = {
  name: { login: 'name', register: 'name' },
  email: { login: 'email', register: 'email' },
  password: { login: 'current-password', register: 'new-password' },
};

function useFieldErrors(errors: FieldErrors) {
  const t = useTranslations('Auth');
  return (name: keyof FieldErrors) => {
    const key = errors[name];
    return key === undefined ? [] : [{ message: t(`errors.${key}`) }];
  };
}

function TextInput({ name, mode, errors }: { name: TextField; mode: Mode; errors: FieldErrors }) {
  const t = useTranslations('Auth');
  const errorOf = useFieldErrors(errors);
  const invalid = errors[name] !== undefined;
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={`auth-${name}`}>{t(name)}</FieldLabel>
      <Input
        id={`auth-${name}`}
        name={name}
        type={INPUT_TYPES[name]}
        autoComplete={AUTOCOMPLETE[name][mode]}
        aria-invalid={invalid}
        aria-describedby={invalid ? `auth-${name}-error` : undefined}
      />
      {name === 'password' && mode === 'register' && (
        <FieldDescription>{t('passwordHint')}</FieldDescription>
      )}
      <FieldError id={`auth-${name}-error`} errors={errorOf(name)} />
    </Field>
  );
}

/** "I want to learn / mentor" (Q3) as a segmented control of native radios. */
function RoleChoice({ asMentor }: { asMentor: boolean }) {
  const t = useTranslations('Auth');
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold text-muted-foreground">{t('want')}</legend>
      <div className="inline-flex w-fit gap-1 rounded-full border p-1">
        {(['student', 'mentor'] as const).map((value) => (
          <label
            key={value}
            className="flex min-h-11 cursor-pointer items-center rounded-full px-4 has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name="as"
              value={value}
              defaultChecked={asMentor === (value === 'mentor')}
              className="sr-only"
            />
            {value === 'mentor' ? t('asMentor') : t('asStudent')}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ConsentFields({ errors }: { errors: FieldErrors }) {
  const t = useTranslations('Auth');
  const errorOf = useFieldErrors(errors);
  const invalid = errors.terms !== undefined;
  return (
    <>
      <Field orientation="horizontal" data-invalid={invalid}>
        <Checkbox
          id="auth-terms"
          name="terms"
          aria-invalid={invalid}
          aria-describedby={invalid ? 'auth-terms-error' : undefined}
        />
        <FieldLabel htmlFor="auth-terms">{t('terms')}</FieldLabel>
      </Field>
      <FieldError id="auth-terms-error" errors={errorOf('terms')} />
      <Field orientation="horizontal">
        <Checkbox id="auth-marketing" name="marketing" />
        <FieldLabel htmlFor="auth-marketing">{t('marketing')}</FieldLabel>
      </Field>
    </>
  );
}

export function CredentialFields({
  mode,
  errors,
  asMentor,
}: {
  mode: Mode;
  errors: FieldErrors;
  asMentor: boolean;
}) {
  const fields: TextField[] =
    mode === 'register' ? ['name', 'email', 'password'] : ['email', 'password'];
  return (
    <>
      {fields.map((name) => (
        <TextInput key={name} name={name} mode={mode} errors={errors} />
      ))}
      {mode === 'register' && (
        <>
          <RoleChoice asMentor={asMentor} />
          <ConsentFields errors={errors} />
        </>
      )}
    </>
  );
}
