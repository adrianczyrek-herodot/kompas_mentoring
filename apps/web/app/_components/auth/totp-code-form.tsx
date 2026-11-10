'use client';

import { Alert, AlertDescription, Button, Field, FieldLabel, Input } from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useState } from 'react';
import { type AuthFailure, callAuthApi } from './auth-api.ts';

function useTotpVerification(onVerified: () => void) {
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [busy, setBusy] = useState(false);
  const verify = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('code');
    const code = typeof value === 'string' ? value.replace(/\s/g, '') : '';
    if (!/^\d{6}$/.test(code)) {
      setFailure('invalidCode');
      return;
    }
    setBusy(true);
    const result = await callAuthApi('/two-factor/verify-totp', { code });
    setBusy(false);
    setFailure(result);
    if (result === null) onVerified();
  };
  return { failure, busy, verify };
}

/** Six-digit code from the authenticator app, checked by Better Auth `/two-factor/verify-totp`. */
export function TotpCodeForm({
  submitLabel,
  onVerified,
}: {
  submitLabel: string;
  onVerified: () => void;
}) {
  const t = useTranslations('Auth');
  const { failure, busy, verify } = useTotpVerification(onVerified);
  return (
    <form
      onSubmit={(event) => void verify(event)}
      noValidate
      className="flex flex-col gap-4"
      aria-busy={busy}
    >
      {failure !== null && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{t(`failure.${failure}`)}</AlertDescription>
        </Alert>
      )}
      <Field>
        <FieldLabel htmlFor="totp-code">{t('totpCode')}</FieldLabel>
        <Input
          id="totp-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
        />
      </Field>
      <Button type="submit" size="lg" disabled={busy}>
        {submitLabel}
      </Button>
    </form>
  );
}
