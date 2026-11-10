import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '../../../server/session.ts';
import { TwoFactorSetup } from './two-factor-setup.tsx';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('TwoFactorSetup');
  return { title: t('title') };
}

/** Q4: an admin sets up TOTP before any other admin route opens. */
export default async function TwoFactorSetupPage() {
  const admin = await requireAdmin('/admin/2fa');
  if (admin.twoFactorEnabled) redirect('/admin');
  const t = await getTranslations('TwoFactorSetup');
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
      <h1 className="text-3xl">{t('title')}</h1>
      <p className="text-muted-foreground">{t('lead')}</p>
      <TwoFactorSetup />
    </main>
  );
}
