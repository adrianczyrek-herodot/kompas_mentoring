'use client';

import { Button, Field, FieldDescription, FieldError, FieldLabel, Input } from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useState } from 'react';
import { type AuthFailure, callAuthApi } from '../../_components/auth/auth-api.ts';
import { FormStatus } from './form-status.tsx';

const text = (data: FormData, name: string) => {
  const value = data.get(name);
  return typeof value === 'string' ? value : '';
};

/** Other devices are signed out on success (Better Auth `revokeOtherSessions`). */
function usePasswordChange() {
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState<'saved' | AuthFailure | null>(null);
  const save = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = text(data, 'newPassword');
    const length = Array.from(newPassword).length;
    setInvalid(length < 10 || length > 128);
    if (length < 10 || length > 128) return;
    const failure = await callAuthApi('/change-password', {
      currentPassword: text(data, 'currentPassword'),
      newPassword,
      revokeOtherSessions: true,
    });
    setStatus(failure ?? 'saved');
    if (failure === null) form.reset();
  };
  return { invalid, status, save };
}

/** S3: password change, confirmed with the current password. */
export function PasswordForm() {
  const t = useTranslations('Account');
  const { invalid, status, save } = usePasswordChange();
  return (
    <form onSubmit={(event) => void save(event)} noValidate className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="account-current-password">{t('currentPassword')}</FieldLabel>
        <Input
          id="account-current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
        />
      </Field>
      <Field data-invalid={invalid}>
        <FieldLabel htmlFor="account-new-password">{t('newPassword')}</FieldLabel>
        <Input
          id="account-new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={invalid}
        />
        <FieldDescription>{t('passwordHint')}</FieldDescription>
        <FieldError errors={invalid ? [{ message: t('passwordLength') }] : []} />
      </Field>
      <FormStatus status={status} />
      <Button type="submit" className="self-start">
        {t('changePassword')}
      </Button>
    </form>
  );
}
