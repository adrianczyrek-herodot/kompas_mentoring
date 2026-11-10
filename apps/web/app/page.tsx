import { Button } from '@kompas/ui';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('Home');
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16">
      <h1 className="text-4xl font-bold">{t('heading')}</h1>
      <p className="text-lg text-slate-700">{t('lead')}</p>
      <div>
        <Button>{t('cta')}</Button>
      </div>
    </main>
  );
}
