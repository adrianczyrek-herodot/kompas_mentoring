'use client';

import { Button, Card, CardContent, Field, FieldLabel, Input } from '@kompas/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useState } from 'react';
import {
  type AuthFailure,
  enableTwoFactor,
  type TwoFactorEnrollment,
} from '../../_components/auth/auth-api.ts';
import { TotpCodeForm } from '../../_components/auth/totp-code-form.tsx';
import { FormStatus } from '../../konto/_components/form-status.tsx';

type Enabled = TwoFactorEnrollment;

function PasswordStep({ onEnabled }: { onEnabled: (data: Enabled) => void }) {
  const t = useTranslations('TwoFactorSetup');
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const start = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('password');
    const result = await enableTwoFactor(typeof value === 'string' ? value : '');
    if (result.ok) onEnabled(result.data);
    else setFailure(result.failure);
  };
  return (
    <form onSubmit={(event) => void start(event)} noValidate className="flex flex-col gap-4">
      <FormStatus status={failure} />
      <Field>
        <FieldLabel htmlFor="two-factor-password">{t('password')}</FieldLabel>
        <Input
          id="two-factor-password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </Field>
      <Button type="submit" className="self-start">
        {t('start')}
      </Button>
    </form>
  );
}

function BackupCodes({ codes }: { codes: readonly string[] }) {
  const t = useTranslations('TwoFactorSetup');
  return (
    <div className="flex flex-col gap-3">
      <p role="status" className="font-medium text-success">
        {t('done')}
      </p>
      <p>{t('backupCodes')}</p>
      <ul className="grid grid-cols-2 gap-1 font-mono text-sm">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <Link href="/admin" className="font-semibold text-primary underline-offset-4 hover:underline">
        {t('toAdmin')}
      </Link>
    </div>
  );
}

/** Q4: password → secret for the authenticator app → first code → backup codes. */
export function TwoFactorSetup() {
  const t = useTranslations('TwoFactorSetup');
  const [enabled, setEnabled] = useState<Enabled | null>(null);
  const [verified, setVerified] = useState(false);
  const secret = enabled === null ? null : new URL(enabled.totpURI).searchParams.get('secret');

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {enabled === null && <PasswordStep onEnabled={setEnabled} />}
        {enabled !== null && !verified && (
          <>
            <p>{t('scan')}</p>
            <p className="font-mono text-sm break-all" data-testid="totp-secret">
              {secret}
            </p>
            <a
              href={enabled.totpURI}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {t('openInApp')}
            </a>
            {/* No refresh here: the page redirects admins with 2FA, and the backup codes must stay. */}
            <TotpCodeForm
              submitLabel={t('verify')}
              onVerified={() => {
                setVerified(true);
              }}
            />
          </>
        )}
        {enabled !== null && verified && <BackupCodes codes={enabled.backupCodes} />}
      </CardContent>
    </Card>
  );
}
