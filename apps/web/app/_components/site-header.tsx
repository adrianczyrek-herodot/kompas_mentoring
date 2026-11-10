import { type CurrentUser, isAdmin } from '@kompas/core/identity';
import { Button, buttonVariants } from '@kompas/ui';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { signOut } from '../../server/actions.ts';
import { getCurrentUser } from '../../server/session.ts';

async function GuestLinks() {
  const t = await getTranslations('Header');
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link href="/logowanie" className={buttonVariants({ variant: 'ghost' })}>
        {t('signIn')}
      </Link>
      <Link href="/rejestracja" className={buttonVariants()}>
        {t('signUp')}
      </Link>
    </div>
  );
}

/** Signed-in links by role: admins also see the admin panel (2FA is enforced there). */
async function UserLinks({ user }: { user: CurrentUser }) {
  const t = await getTranslations('Header');
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {isAdmin(user.roles) && (
        <Link href="/admin" className={buttonVariants({ variant: 'ghost' })}>
          {t('admin')}
        </Link>
      )}
      <Link href="/konto" className={buttonVariants({ variant: 'ghost' })}>
        {t('account', { name: user.name })}
      </Link>
      <form action={signOut}>
        <Button type="submit" variant="outline">
          {t('signOut')}
        </Button>
      </form>
    </div>
  );
}

export async function SiteHeader() {
  const t = await getTranslations('Header');
  const user = await getCurrentUser();
  return (
    <header className="border-b bg-card">
      <nav
        aria-label={t('navLabel')}
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2"
      >
        <Link href="/" className="font-serif text-xl font-semibold text-primary">
          {t('brand')}
        </Link>
        {user === null ? <GuestLinks /> : <UserLinks user={user} />}
      </nav>
    </header>
  );
}
