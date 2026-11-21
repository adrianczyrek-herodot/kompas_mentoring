/**
 * Product frame: AppHeader for students and mentors (desktop navigation + mobile bottom bar from
 * @kompas/ui); guest and admin headers are a DS gap built from the same tokens as AppHeader.
 */
import {
  AppHeader,
  Avatar,
  AvatarFallback,
  Button,
  initialsOf,
  Link,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from '@kompas/ui';
import { Bell } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Account } from '../data/accounts';
import { href, navigate } from '../lib/router';
import type { ScreenDef } from '../screens/registry';
import { useDemo } from '../state/demo-context';

function AccountMenu({ account }: { account: Account }) {
  const { dispatch } = useDemo();
  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Avatar size="sm" aria-hidden="true">
          <AvatarFallback>{initialsOf(account.name)}</AvatarFallback>
        </Avatar>
        <span className="sr-only">Menu konta: {account.name}</span>
      </MenuTrigger>
      <MenuContent align="end">
        <MenuItem
          onClick={() => {
            navigate('/konto');
          }}
        >
          Konto i ustawienia
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          onClick={() => {
            dispatch({ type: 'switch-account', accountId: 'guest' });
            navigate('/');
          }}
        >
          Wyloguj
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

function HeaderActions({ account }: { account: Account }) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Powiadomienia"
        onClick={() => {
          navigate('/powiadomienia');
        }}
      >
        <Bell aria-hidden="true" />
      </Button>
      <AccountMenu account={account} />
    </>
  );
}

// DS-GAP: GuestHeader / AdminHeader — AppHeader supports only the student and mentor roles.
// Same classes as AppHeader (tokens only), no navigation of its own.
function SimpleHeader({ children }: { children: ReactNode }) {
  return (
    <header className="flex min-h-control-lg items-center justify-between gap-group border-b border-border-divider bg-surface-panel px-panel">
      <a href={href('/')} className="rounded-control text-section-title font-semibold text-text-default">
        Kompas
      </a>
      <div className="flex items-center gap-inline">{children}</div>
    </header>
  );
}

function GuestActions() {
  return (
    <>
      <Link href={href('/logowanie')}>Zaloguj się</Link>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigate('/rejestracja');
        }}
      >
        Załóż konto
      </Button>
    </>
  );
}

function AdminNav({ account }: { account: Account }) {
  return (
    <>
      <nav aria-label="Główna" className="flex gap-inline">
        <Link href={href('/admin/weryfikacja')}>Weryfikacja</Link>
        <Link href={href('/admin/spory')}>Spory</Link>
      </nav>
      <AccountMenu account={account} />
    </>
  );
}

export function ProductShell({
  screen,
  children,
}: {
  screen: ScreenDef | undefined;
  children: ReactNode;
}) {
  const { account } = useDemo();
  const withAppHeader = account.role === 'student' || account.role === 'mentor';
  return (
    <div className="min-h-dvh bg-surface-page text-text-default">
      {account.role === 'student' || account.role === 'mentor' ? (
        <AppHeader
          role={account.role}
          {...(screen?.nav ? { current: screen.nav } : {})}
          actions={<HeaderActions account={account} />}
        />
      ) : account.role === 'admin' ? (
        <SimpleHeader>
          <AdminNav account={account} />
        </SimpleHeader>
      ) : (
        <SimpleHeader>
          <GuestActions />
        </SimpleHeader>
      )}
      <main
        className={`mx-auto flex max-w-content flex-col gap-section px-panel pt-section ${
          withAppHeader ? 'pb-bottom-nav md:pb-section' : 'pb-section'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
