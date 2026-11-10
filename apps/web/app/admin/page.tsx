import { mustSetUpTwoFactor } from '@kompas/core/identity';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '../../server/session.ts';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin');
  return { title: t('title') };
}

/** Admin panel entry (F1: access rules only; admin tools arrive with their phases). */
export default async function AdminPage() {
  const admin = await requireAdmin('/admin');
  // Q4: no admin route without 2FA set up.
  if (mustSetUpTwoFactor(admin.roles, admin.twoFactorEnabled)) redirect('/admin/2fa');
  const t = await getTranslations('Admin');
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <h1 className="text-3xl">{t('title')}</h1>
      <p className="text-muted-foreground">{t('placeholder')}</p>
    </main>
  );
}
