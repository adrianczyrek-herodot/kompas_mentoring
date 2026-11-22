import { Card, CardContent, CardHeader, CardTitle } from '@kompas/ui';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '../../server/session.ts';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin');
  return { title: t('title') };
}

/** Admin landing (s07 target and the role home s08 links to). The layout enforces 2FA. */
export default async function AdminPage() {
  const t = await getTranslations('Admin');
  const user = await getCurrentUser();
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8">
      <h1 className="text-3xl">{t('title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">{t('welcome', { name: user?.name ?? '' })}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('lead')}</p>
        </CardContent>
      </Card>
    </main>
  );
}
