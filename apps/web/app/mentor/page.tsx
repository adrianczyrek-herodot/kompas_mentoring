import { hasPermission } from '@kompas/core/identity';
import { Card, CardContent, CardHeader, CardTitle } from '@kompas/ui';
import type { Metadata } from 'next';
import { forbidden, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '../../server/session.ts';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Mentor');
  return { title: t('title') };
}

/**
 * Placeholder mentor home for F1 (the real M-screens arrive in F2). Guards `mentor.access`, so a
 * student lands on s08 — the E2E for "wrong role → 403" (spec [s08]).
 */
export default async function MentorPage() {
  const user = await getCurrentUser();
  if (user === null) redirect('/logowanie?returnTo=%2Fmentor');
  if (!hasPermission(user.roles, 'mentor.access')) forbidden();
  const t = await getTranslations('Mentor');
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8">
      <h1 className="text-3xl">{t('title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">{t('welcome', { name: user.name })}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('lead')}</p>
        </CardContent>
      </Card>
    </main>
  );
}
