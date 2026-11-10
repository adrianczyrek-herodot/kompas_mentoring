'use client';

import { Alert, AlertDescription } from '@kompas/ui';
import { useTranslations } from 'next-intl';
import type { AuthFailure } from '../../_components/auth/auth-api.ts';

/** Result line of an S3 form: success as a polite status, failures as an alert. */
export function FormStatus({ status }: { status: 'saved' | AuthFailure | null }) {
  const t = useTranslations();
  if (status === null) return null;
  if (status === 'saved') {
    return (
      <p role="status" className="text-sm font-medium text-success">
        {t('Account.saved')}
      </p>
    );
  }
  return (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{t(`Auth.failure.${status}`)}</AlertDescription>
    </Alert>
  );
}
