'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TotpCodeForm } from '../../_components/auth/totp-code-form.tsx';

export function TwoFactorChallenge({ returnTo }: { returnTo: string }) {
  const t = useTranslations('Auth');
  const router = useRouter();
  return (
    <TotpCodeForm
      submitLabel={t('totpSubmit')}
      onVerified={() => {
        router.push(returnTo);
        router.refresh();
      }}
    />
  );
}
