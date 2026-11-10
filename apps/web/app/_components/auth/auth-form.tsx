'use client';

import type { SocialProvider } from '@kompas/core/identity';
import { Alert, AlertDescription, Button, Separator } from '@kompas/ui';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useState } from 'react';
import {
  type AuthFailure,
  signInWithEmail,
  signInWithProvider,
  signUpWithEmail,
  TWO_FACTOR_REQUIRED,
} from './auth-api.ts';
import { type FieldErrors, readCredentials, validateCredentials } from './auth-validation.ts';
import { CredentialFields } from './credential-fields.tsx';

export type AuthMode = 'login' | 'register';

const PROVIDER_NAMES: Record<SocialProvider, string> = { google: 'Google', linkedin: 'LinkedIn' };

/** Validates, sends to Better Auth and, on success, goes to `returnTo` with a fresh RSC tree. */
function useAuthSubmit(mode: AuthMode, returnTo: string) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const credentials = readCredentials(new FormData(form));
    const invalid = validateCredentials(mode, credentials);
    setErrors(invalid);
    setFailure(null);
    const firstInvalid = Object.keys(invalid)[0];
    if (firstInvalid !== undefined) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    setBusy(true);
    const result =
      mode === 'login' ? await signInWithEmail(credentials) : await signUpWithEmail(credentials);
    if (result === TWO_FACTOR_REQUIRED) {
      router.push(`/logowanie/2fa?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (result === null) {
      router.push(returnTo);
      router.refresh();
      return;
    }
    setBusy(false);
    setFailure(result);
  };

  return { errors, failure, busy, submit };
}

function SocialSignIn({
  providers,
  returnTo,
}: {
  providers: readonly SocialProvider[];
  returnTo: string;
}) {
  const t = useTranslations('Auth');
  if (providers.length === 0) return null;
  return (
    <>
      <div className="flex flex-col gap-2">
        {providers.map((provider) => (
          <Button
            key={provider}
            variant="outline"
            onClick={() => {
              void signInWithProvider(provider, returnTo);
            }}
          >
            {t('continueWith', { provider: PROVIDER_NAMES[provider] })}
          </Button>
        ))}
        <p className="text-sm text-muted-foreground">{t('socialConsent')}</p>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Separator className="flex-1" />
        {t('orEmail')}
        <Separator className="flex-1" />
      </div>
    </>
  );
}

/**
 * P4 form. Requests go from the browser to `/api/auth/*`, so Better Auth's rate limit and
 * origin check apply (they do not run for server-side `auth.api` calls).
 */
export function AuthForm(props: {
  mode: AuthMode;
  returnTo: string;
  asMentor: boolean;
  socialProviders: readonly SocialProvider[];
}) {
  const t = useTranslations('Auth');
  const { errors, failure, busy, submit } = useAuthSubmit(props.mode, props.returnTo);
  return (
    <div className="flex flex-col gap-4" aria-busy={busy}>
      {failure !== null && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{t(`failure.${failure}`)}</AlertDescription>
        </Alert>
      )}
      <SocialSignIn providers={props.socialProviders} returnTo={props.returnTo} />
      <form onSubmit={(event) => void submit(event)} noValidate className="flex flex-col gap-4">
        <CredentialFields mode={props.mode} errors={errors} asMentor={props.asMentor} />
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? t('busy') : props.mode === 'login' ? t('submitLogin') : t('submitRegister')}
        </Button>
      </form>
    </div>
  );
}
