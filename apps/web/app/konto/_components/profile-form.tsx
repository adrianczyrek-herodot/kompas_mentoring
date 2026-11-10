'use client';

import { Button, Field, FieldError, FieldLabel, Input } from '@kompas/ui';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useState } from 'react';
import { type AuthFailure, callAuthApi } from '../../_components/auth/auth-api.ts';
import { FormStatus } from './form-status.tsx';

/** S3 profile: the name (Better Auth `/update-user`); e-mail changes need verification (F3). */
export function ProfileForm({ name, email }: { name: string; email: string }) {
  const t = useTranslations('Account');
  const router = useRouter();
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState<'saved' | AuthFailure | null>(null);

  const save = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('name');
    const next = typeof value === 'string' ? value.trim() : '';
    const length = Array.from(next).length;
    setInvalid(length < 2 || length > 50);
    if (length < 2 || length > 50) return;
    const failure = await callAuthApi('/update-user', { name: next });
    setStatus(failure ?? 'saved');
    if (failure === null) router.refresh();
  };

  return (
    <form onSubmit={(event) => void save(event)} noValidate className="flex flex-col gap-4">
      <Field data-invalid={invalid}>
        <FieldLabel htmlFor="account-name">{t('name')}</FieldLabel>
        <Input
          id="account-name"
          name="name"
          defaultValue={name}
          autoComplete="name"
          aria-invalid={invalid}
        />
        <FieldError errors={invalid ? [{ message: t('nameLength') }] : []} />
      </Field>
      <p className="text-sm text-muted-foreground">{t('email', { email })}</p>
      <FormStatus status={status} />
      <Button type="submit" className="self-start">
        {t('save')}
      </Button>
    </form>
  );
}
