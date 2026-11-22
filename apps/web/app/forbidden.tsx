import { isAdmin } from '@kompas/core/identity';
import { buttonVariants } from '@kompas/ui';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '../server/session.ts';

/** s08 — 403 in the product layout; the link goes to the signed-in role's own home (spec §8). */
export default async function Forbidden() {
  const t = await getTranslations('Errors');
  const user = await getCurrentUser();
  const home = user === null ? '/' : isAdmin(user.roles) ? '/admin' : '/konto';
  const label = user === null ? t('home') : isAdmin(user.roles) ? t('homeAdmin') : t('homeAccount');
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-4 py-16">
      <p className="text-sm font-semibold text-muted-foreground">403</p>
      <h1 className="text-3xl">{t('forbiddenTitle')}</h1>
      <p className="text-muted-foreground">{t('forbiddenLead')}</p>
      <Link href={home} className={buttonVariants()}>
        {label}
      </Link>
    </main>
  );
}
