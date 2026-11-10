import { Button, buttonVariants } from '@kompas/ui';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { signOut } from '../../server/actions.ts';
import { getCurrentUser } from '../../server/session.ts';

export async function SiteHeader() {
  const t = await getTranslations('Header');
  const user = await getCurrentUser();
  return (
    <header className="border-b bg-card">
      <nav
        aria-label={t('navLabel')}
        className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2"
      >
        <Link href="/" className="font-serif text-xl font-semibold text-primary">
          {t('brand')}
        </Link>
        {user === null ? (
          <div className="flex items-center gap-2">
            <Link href="/logowanie" className={buttonVariants({ variant: 'ghost' })}>
              {t('signIn')}
            </Link>
            <Link href="/rejestracja" className={buttonVariants()}>
              {t('signUp')}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/konto" className={buttonVariants({ variant: 'ghost' })}>
              {t('account', { name: user.name })}
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="outline">
                {t('signOut')}
              </Button>
            </form>
          </div>
        )}
      </nav>
    </header>
  );
}
