import { isAdmin } from '@kompas/core/identity';
import { Alert, AlertDescription, Card, CardContent, buttonVariants } from '@kompas/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '../../server/session.ts';
import { ResendVerificationLink } from './_components/resend-verification-link.tsx';

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Verification');
  return { title: t('title') };
}

/**
 * s10 — e-mail verification landing. Better Auth redirects here after verifying the link: plain on
 * success, `?error=<CODE>` when the token is expired or invalid (spec [s10]). No sign-in required.
 */
export default async function VerificationPage({ searchParams }: PageProps<'/weryfikacja-email'>) {
  const params = await searchParams;
  const t = await getTranslations('Verification');

  if (first(params['error']) !== undefined) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8">
        <h1 className="text-3xl">{t('expiredTitle')}</h1>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Alert role="alert">
              <AlertDescription>{t('expiredLead')}</AlertDescription>
            </Alert>
            <ResendVerificationLink />
          </CardContent>
        </Card>
      </main>
    );
  }

  const user = await getCurrentUser();
  const home = user !== null && isAdmin(user.roles) ? '/admin' : '/konto';
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8">
      <h1 className="text-3xl">{t('successTitle')}</h1>
      <Card>
        <CardContent className="flex flex-col items-start gap-4">
          <p role="status" className="text-sm font-medium text-success">
            {t('successLead')}
          </p>
          <Link href={home} className={buttonVariants()}>
            {t('goHome')}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
