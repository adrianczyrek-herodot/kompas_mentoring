import { enabledSocialProviders, safeReturnTo } from '@kompas/core/identity';
import { Card, CardContent, cn } from '@kompas/ui';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getContainer } from '../../../server/runtime.ts';
import { getCurrentUser } from '../../../server/session.ts';
import { AuthForm, type AuthMode } from './auth-form.tsx';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

function AuthTabs({
  mode,
  suffix,
  labels,
}: {
  mode: AuthMode;
  suffix: string;
  labels: { nav: string; login: string; register: string };
}) {
  const tabs = [
    { mode: 'login', href: `/logowanie${suffix}`, label: labels.login },
    { mode: 'register', href: `/rejestracja${suffix}`, label: labels.register },
  ] as const;
  return (
    <nav aria-label={labels.nav} className="flex gap-1 border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.mode}
          href={tab.href}
          aria-current={tab.mode === mode ? 'page' : undefined}
          className={cn(
            '-mb-px flex min-h-11 items-center border-b-2 px-3.5 font-semibold',
            tab.mode === mode
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

/** P4 — sign-in and sign-up share one card; `returnTo` and `jako` survive switching tabs. */
export async function AuthPage({
  mode,
  searchParams,
}: {
  mode: AuthMode;
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const returnTo = safeReturnTo(first(params['returnTo']));
  if ((await getCurrentUser()) !== null) redirect(returnTo);

  const t = await getTranslations('Auth');
  const asMentor = first(params['jako']) === 'mentor';
  const query = new URLSearchParams();
  if (returnTo !== '/') query.set('returnTo', returnTo);
  if (asMentor) query.set('jako', 'mentor');
  const labels = { nav: t('tabsLabel'), login: t('tabLogin'), register: t('tabRegister') };

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="sr-only">{mode === 'login' ? labels.login : labels.register}</h1>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <AuthTabs mode={mode} suffix={query.size > 0 ? `?${query}` : ''} labels={labels} />
          <AuthForm
            key={mode}
            mode={mode}
            returnTo={returnTo}
            asMentor={asMentor}
            socialProviders={enabledSocialProviders(getContainer().cradle.env)}
          />
        </CardContent>
      </Card>
    </main>
  );
}
