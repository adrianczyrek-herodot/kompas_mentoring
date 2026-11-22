'use client';

import {
  Alert,
  AlertDescription,
  Button,
  buttonVariants,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
} from '@kompas/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useState } from 'react';

type Failure = 'invalidPassword' | 'invalidCode' | 'unexpected';

/** `otpauth://totp/...?secret=…` — the base32 secret to type into the authenticator app by hand. */
const secretFromUri = (uri: string): string => {
  try {
    return new URL(uri).searchParams.get('secret') ?? '';
  } catch {
    return '';
  }
};

const post = async (path: string, body: object) => {
  const response = await fetch(`/api/auth${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: response.ok, payload };
};

const codesOf = (payload: Record<string, unknown>): readonly string[] =>
  Array.isArray(payload['backupCodes'])
    ? payload['backupCodes'].filter((code): code is string => typeof code === 'string')
    : [];

/**
 * s07 setup: enable TOTP with the current password (`/two-factor/enable`), confirm a code from the
 * app (`/two-factor/verify-totp`) and show the one-time backup codes. Calls go through the Better
 * Auth HTTP handler from the browser, like P4 (origin check and rate limit apply).
 */
export function TwoFactorSetup({
  email,
  enabled,
  returnTo,
}: {
  email: string;
  enabled: boolean;
  returnTo: string;
}) {
  const t = useTranslations('TwoFactor');
  const [active, setActive] = useState(enabled);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<readonly string[]>([]);

  const enable = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setFailure(null);
    try {
      const { ok, payload } = await post('/two-factor/enable', { password });
      if (!ok) {
        setFailure('invalidPassword');
        return;
      }
      setTotpURI(typeof payload['totpURI'] === 'string' ? payload['totpURI'] : '');
      setBackupCodes(codesOf(payload));
    } catch {
      setFailure('unexpected');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setFailure(null);
    try {
      const { ok } = await post('/two-factor/verify-totp', { code });
      if (!ok) {
        setFailure('invalidCode');
        return;
      }
      setActive(true);
    } catch {
      setFailure('unexpected');
    } finally {
      setBusy(false);
    }
  };

  const failureAlert = failure !== null && (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{t(`errors.${failure}`)}</AlertDescription>
    </Alert>
  );

  const backupCodeList =
    backupCodes.length > 0 && (
      <div className="flex flex-col gap-2">
        <p className="font-semibold">{t('backupCodes')}</p>
        <p className="text-sm text-muted-foreground">{t('backupCodesHint')}</p>
        <ul className="grid grid-cols-2 gap-1">
          {backupCodes.map((backup) => (
            <li key={backup}>
              <code className="text-sm">{backup}</code>
            </li>
          ))}
        </ul>
      </div>
    );

  if (active) {
    return (
      <div className="flex flex-col gap-4" aria-busy={busy}>
        <p role="status" className="text-sm font-medium text-success">
          {t('enabled')}
        </p>
        <p className="text-muted-foreground">{t('enabledHint')}</p>
        {backupCodeList}
        <div>
          <Link href={returnTo} className={buttonVariants()}>
            {t('goToAdmin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" aria-busy={busy}>
      {failureAlert}
      {totpURI === null ? (
        <form onSubmit={(event) => void enable(event)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="totp-password">{t('password')}</FieldLabel>
            <Input
              id="totp-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
            <FieldDescription>{t('passwordHint')}</FieldDescription>
          </Field>
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? t('busy') : t('start')}
          </Button>
        </form>
      ) : (
        <form onSubmit={(event) => void verify(event)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="font-semibold">{t('secretLabel')}</p>
            <code data-testid="totp-secret" className="break-all rounded-control bg-surface-panel p-2">
              {secretFromUri(totpURI)}
            </code>
            <p className="text-sm text-muted-foreground">{t('secretHint', { email })}</p>
          </div>
          <Field>
            <FieldLabel htmlFor="totp-code">{t('code')}</FieldLabel>
            <Input
              id="totp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
              }}
            />
            <FieldDescription>{t('codeHint')}</FieldDescription>
          </Field>
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? t('busy') : t('verify')}
          </Button>
        </form>
      )}
    </div>
  );
}
