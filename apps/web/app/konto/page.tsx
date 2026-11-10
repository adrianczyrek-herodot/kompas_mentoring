import { createRequestScope } from '@kompas/core';
import { Card, CardContent, CardHeader, CardTitle } from '@kompas/ui';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { getContainer } from '../../server/runtime.ts';
import { getCurrentUser } from '../../server/session.ts';
import { DataRequests } from './_components/data-requests.tsx';
import { MarketingConsent } from './_components/marketing-consent.tsx';
import { PasswordForm } from './_components/password-form.tsx';
import { ProfileForm } from './_components/profile-form.tsx';
import { SignOutEverywhere } from './_components/sign-out-everywhere.tsx';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account');
  return { title: t('title') };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-xl">{title}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** S3 — account and settings in the scope of Q7. */
export default async function AccountPage() {
  const user = await getCurrentUser();
  if (user === null) redirect('/logowanie?returnTo=%2Fkonto');
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const overview = await scope.cradle.getAccountOverview(user, user.id);
  if (overview.isErr()) notFound();
  const t = await getTranslations('Account');

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8">
      <h1 className="text-3xl">{t('title')}</h1>
      <Section title={t('profile')}>
        <ProfileForm name={user.name} email={user.email} />
      </Section>
      <Section title={t('password')}>
        <PasswordForm />
      </Section>
      <Section title={t('consents')}>
        <MarketingConsent granted={overview.value.marketingConsent} />
      </Section>
      <Section title={t('sessions')}>
        <SignOutEverywhere />
      </Section>
      <Section title={t('privacy')}>
        <DataRequests pending={overview.value.pendingRequests} />
      </Section>
    </main>
  );
}
