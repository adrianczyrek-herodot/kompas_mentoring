/**
 * Route guards (KONCEPCJA §3.2): U*, M*, A* need a signed-in user; after signing in the user
 * returns to the target (`returnTo`). M2–M5 open only after the mentor profile is approved.
 */
import { Button, EmptyState, ErrorState, Link } from '@kompas/ui';
import { LogIn } from 'lucide-react';
import type { Account, Role } from '../data/accounts';
import { href, navigate, withQuery } from '../lib/router';
import type { Access, ScreenDef } from '../screens/registry';

const ROLE_NAMES: Record<Role, string> = {
  guest: 'gości',
  student: 'uczniów',
  mentor: 'mentorów',
  admin: 'zespołu zaufania',
};

const ACCOUNT_ROLE: Record<Role, string> = {
  guest: 'gość',
  student: 'uczeń',
  mentor: 'mentor',
  admin: 'zespół zaufania',
};

export function homeOf(account: Account): string {
  switch (account.role) {
    case 'student':
      return '/sesje';
    case 'mentor':
      return account.approved ? '/mentor' : '/mentor/onboarding/1';
    case 'admin':
      return '/admin/weryfikacja';
    case 'guest':
      return '/';
  }
}

export type GateResult = 'open' | 'login' | 'role' | 'pending-mentor' | 'signed-in';

export function gateFor(screen: ScreenDef, account: Account): GateResult {
  const access: Access = screen.access;
  if (access === 'public' || access === 'booking') return 'open';
  if (access === 'guest') return account.role === 'guest' ? 'open' : 'signed-in';
  if (account.role === 'guest') return 'login';
  if (access === 'auth') return 'open';
  if (access !== account.role) return 'role';
  if (access === 'mentor' && !account.approved && screen.id !== 'M1') return 'pending-mentor';
  return 'open';
}

export function LoginGate({ returnTo }: { returnTo: string }) {
  return (
    <EmptyState
      titleAs="h2"
      icon={<LogIn />}
      title="Zaloguj się, żeby zobaczyć tę stronę"
      description="Po zalogowaniu wrócisz dokładnie tutaj."
      action={
        <Button
          onClick={() => {
            navigate(withQuery('/logowanie', { returnTo }));
          }}
        >
          Zaloguj się
        </Button>
      }
    />
  );
}

export function RoleGate({ screen, account }: { screen: ScreenDef; account: Account }) {
  const needed = screen.access as Role;
  return (
    <ErrorState
      titleAs="h1"
      title="Ta strona wymaga innej roli"
      description={`„${screen.name}” jest dla ${ROLE_NAMES[needed]}. Jesteś zalogowany jako ${ACCOUNT_ROLE[account.role]} (${account.name}).`}
      action={<Link href={href(homeOf(account))}>Wróć na swoją stronę główną</Link>}
    />
  );
}

export function PendingMentorGate() {
  return (
    <ErrorState
      titleAs="h1"
      title="Twój profil czeka na weryfikację"
      description="Panel, kalendarz, uczniowie i zarobki otworzą się po zatwierdzeniu wniosku przez zespół zaufania (zwykle do 2 dni roboczych)."
      action={<Link href={href('/mentor/onboarding/6')}>Zobacz status wniosku</Link>}
    />
  );
}

export function SignedInGate({ account }: { account: Account }) {
  return (
    <EmptyState
      titleAs="h2"
      title={`Jesteś już zalogowany jako ${account.name}`}
      description="Żeby zalogować się na inne konto, najpierw się wyloguj (menu konta w nagłówku)."
      action={<Link href={href(homeOf(account))}>Przejdź do swojej strony głównej</Link>}
    />
  );
}
