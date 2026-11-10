import { safeReturnTo } from '@kompas/core/identity';
import { Card, CardContent } from '@kompas/ui';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TwoFactorChallenge } from './two-factor-challenge.tsx';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth');
  return { title: t('totpTitle') };
}

/** Second sign-in step for accounts with 2FA (Better Auth keeps the pending sign-in in a cookie). */
export default async function TwoFactorChallengePage({
  searchParams,
}: PageProps<'/logowanie/2fa'>) {
  const raw = (await searchParams)['returnTo'];
  const returnTo = safeReturnTo(Array.isArray(raw) ? raw[0] : raw);
  const t = await getTranslations('Auth');
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <h1 className="text-2xl">{t('totpTitle')}</h1>
          <p className="text-muted-foreground">{t('totpLead')}</p>
          <TwoFactorChallenge returnTo={returnTo} />
        </CardContent>
      </Card>
    </main>
  );
}
