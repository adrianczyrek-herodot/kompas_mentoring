import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

/** 403 — signed in, but the role does not allow this page (spec §8). */
export default async function Forbidden() {
  const t = await getTranslations('Forbidden');
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-16">
      <h1 className="text-3xl">{t('title')}</h1>
      <p className="text-muted-foreground">{t('body')}</p>
      <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
        {t('home')}
      </Link>
    </main>
  );
}
