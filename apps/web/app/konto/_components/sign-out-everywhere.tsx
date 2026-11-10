'use client';

import { Button } from '@kompas/ui';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { callAuthApi } from '../../_components/auth/auth-api.ts';

/** S3: ends every session of the account, including this one (Better Auth `/revoke-sessions`). */
export function SignOutEverywhere() {
  const t = useTranslations('Account');
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  const signOut = async () => {
    const failure = await callAuthApi('/revoke-sessions');
    setFailed(failure !== null);
    if (failure === null) {
      router.push('/logowanie');
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" className="self-start" onClick={() => void signOut()}>
        {t('signOutEverywhere')}
      </Button>
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          {t('actionFailed')}
        </p>
      )}
    </div>
  );
}
