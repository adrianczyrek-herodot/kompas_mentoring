'use client';

import { Alert, AlertDescription, Button, Field, FieldLabel, Input } from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useState } from 'react';
import { VERIFICATION_CALLBACK_PATH } from '../../_components/auth/auth-api.ts';

/** s10 "Wyślij nowy link": asks Better Auth to resend the verification e-mail to a given address. */
export function ResendVerificationLink() {
  const t = useTranslations('Verification');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setSent(false);
    setFailed(false);
    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, callbackURL: VERIFICATION_CALLBACK_PATH }),
      });
      if (!response.ok) {
        setFailed(true);
        return;
      }
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} noValidate className="flex flex-col gap-3" aria-busy={busy}>
      <Field>
        <FieldLabel htmlFor="resend-email">{t('email')}</FieldLabel>
        <Input
          id="resend-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
      </Field>
      <Button type="submit" disabled={busy}>
        {busy ? t('busy') : t('resend')}
      </Button>
      {sent && (
        <p role="status" className="text-sm font-medium text-success">
          {t('resent')}
        </p>
      )}
      {failed && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{t('resendFailed')}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
