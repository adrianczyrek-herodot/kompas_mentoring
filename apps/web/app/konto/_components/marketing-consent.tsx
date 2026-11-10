'use client';

import { Checkbox, Field, FieldLabel } from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { setMarketingConsent } from '../../../server/account-actions.ts';

/** S3: give or withdraw the marketing consent (each change recorded with the document version). */
export function MarketingConsent({ granted }: { granted: boolean }) {
  const t = useTranslations('Account');
  const [checked, setChecked] = useState(granted);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const change = (next: boolean) => {
    setChecked(next);
    startTransition(async () => {
      const result = await setMarketingConsent(next);
      setFailed(!result.ok);
      if (!result.ok) setChecked(!next);
    });
  };

  return (
    <div className="flex flex-col gap-2" aria-busy={pending}>
      <Field orientation="horizontal">
        <Checkbox
          id="account-marketing"
          checked={checked}
          disabled={pending}
          onCheckedChange={change}
        />
        <FieldLabel htmlFor="account-marketing">{t('marketing')}</FieldLabel>
      </Field>
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          {t('actionFailed')}
        </p>
      )}
    </div>
  );
}
