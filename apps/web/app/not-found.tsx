import { buttonVariants } from '@kompas/ui';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

/** s09 — 404 in the product layout; never hints whether the resource exists (spec §8). */
export default async function NotFound() {
  const t = await getTranslations('Errors');
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-4 py-16">
      <p className="text-sm font-semibold text-muted-foreground">404</p>
      <h1 className="text-3xl">{t('notFoundTitle')}</h1>
      <p className="text-muted-foreground">{t('notFoundLead')}</p>
      <Link href="/" className={buttonVariants()}>
        {t('home')}
      </Link>
    </main>
  );
}
