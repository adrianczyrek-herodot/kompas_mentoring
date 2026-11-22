import { hasPermission, safeReturnTo } from '@kompas/core/identity';
import { Alert, AlertDescription, Card, CardContent } from '@kompas/ui';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSessionState } from '../../../server/session.ts';
import { TwoFactorSetup } from './_components/two-factor-setup.tsx';

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('TwoFactor');
  return { title: t('title') };
}

/** s07 — TOTP setup for admins, outside `/admin` so an admin without 2FA can actually reach it. */
export default async function TwoFactorPage({ searchParams }: PageProps<'/konto/2fa'>) {
  const params = await searchParams;
  const { user, expiredByAdminPolicy } = await getSessionState();
  if (user === null) {
    redirect(
      expiredByAdminPolicy
        ? '/logowanie?reason=admin-session-expired'
        : `/logowanie?returnTo=${encodeURIComponent('/konto/2fa')}`,
    );
  }
  if (!hasPermission(user.roles, 'admin.access')) notFound();

  const t = await getTranslations('TwoFactor');
  const returnTo = safeReturnTo(first(params['returnTo']) ?? '/admin');

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8">
      <h1 className="text-3xl">{t('heading')}</h1>
      <Card>
        <CardContent className="flex flex-col gap-4">
          {first(params['reason']) === '2fa' && (
            <Alert role="alert">
              <AlertDescription>{t('required')}</AlertDescription>
            </Alert>
          )}
          <p className="text-muted-foreground">{t('intro')}</p>
          <TwoFactorSetup
            email={user.email}
            enabled={user.twoFactorEnabled}
            returnTo={returnTo}
          />
        </CardContent>
      </Card>
    </main>
  );
}
