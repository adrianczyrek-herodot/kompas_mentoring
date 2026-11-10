'use client';

import type { DataRequestKind } from '@kompas/core/identity';
import { Button } from '@kompas/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { requestPersonalData } from '../../../server/account-actions.ts';

type Request = (kind: DataRequestKind) => void;

function DeletionRequest({ busy, request }: { busy: boolean; request: Request }) {
  const t = useTranslations('Account');
  const [confirming, setConfirming] = useState(false);
  const confirm = (value: boolean) => () => {
    setConfirming(value);
  };
  if (!confirming) {
    return (
      <Button variant="destructive" className="self-start" onClick={confirm(true)}>
        {t('requestDeletion')}
      </Button>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p>{t('deletionWarning')}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="destructive"
          disabled={busy}
          onClick={() => {
            request('deletion');
          }}
        >
          {t('confirmDeletion')}
        </Button>
        <Button variant="ghost" onClick={confirm(false)}>
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
}

/** S3 (Q7): export and deletion are recorded as requests now and carried out in F8. */
export function DataRequests({ pending }: { pending: readonly DataRequestKind[] }) {
  const t = useTranslations('Account');
  const [failed, setFailed] = useState(false);
  const [busy, startTransition] = useTransition();
  const request: Request = (kind) => {
    startTransition(async () => {
      setFailed(!(await requestPersonalData(kind)).ok);
    });
  };

  return (
    <div className="flex flex-col gap-3" aria-busy={busy}>
      {pending.includes('export') ? (
        <p role="status">{t('exportPending')}</p>
      ) : (
        <Button
          variant="outline"
          className="self-start"
          disabled={busy}
          onClick={() => {
            request('export');
          }}
        >
          {t('requestExport')}
        </Button>
      )}
      {pending.includes('deletion') ? (
        <p role="status">{t('deletionPending')}</p>
      ) : (
        <DeletionRequest busy={busy} request={request} />
      )}
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          {t('actionFailed')}
        </p>
      )}
    </div>
  );
}
