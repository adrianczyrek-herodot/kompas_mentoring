/** P4 · Logowanie / Rejestracja (KONCEPCJA §P4, E1). Sign-in is simulated; nothing is stored. */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  PageHeader,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kompas/ui';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { replace, type Route, navigate, withQuery } from '../lib/router';
import { homeOf } from '../shell/gates';
import { useDemo } from '../state/demo-context';
import { ACCOUNTS } from '../data/accounts';
import { PasswordResetDialog, type Provider, SocialSignInDialog } from './p4-dialogs';
import { LoginForm, RegisterForm } from './p4-forms';

function SimulationNotice() {
  return (
    <Alert variant="neutral">
      <Info aria-hidden="true" />
      <AlertTitle>Prototyp: logowanie jest symulowane</AlertTitle>
      <AlertDescription>
        Nie wpisuj prawdziwego hasła — dane nie są nigdzie wysyłane ani zapisywane. Poprawny
        formularz logowania otwiera konto demo Adrian C.
      </AlertDescription>
    </Alert>
  );
}

export function P4Auth({ route }: { route: Route }) {
  const { dispatch } = useDemo();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const tab = route.path === '/rejestracja' ? 'register' : 'login';
  const returnTo = route.query.get('returnTo') ?? undefined;
  const asMentor = route.query.get('rola') === 'mentor';

  const finishLogin = () => {
    dispatch({ type: 'switch-account', accountId: 'adrian' });
    const adrian = ACCOUNTS.find((a) => a.id === 'adrian');
    navigate(returnTo ?? (adrian ? homeOf(adrian) : '/sesje'));
  };

  return (
    <div className="mx-auto flex w-full max-w-form flex-col gap-group">
      <PageHeader
        title={tab === 'login' ? 'Zaloguj się' : 'Załóż konto'}
        description={
          returnTo?.startsWith('/rezerwacja/')
            ? 'Wybrany termin czeka — po zalogowaniu wrócisz do rezerwacji.'
            : undefined
        }
      />
      <SimulationNotice />
      <Tabs
        value={tab}
        onValueChange={(value) => {
          replace(
            withQuery(value === 'register' ? '/rejestracja' : '/logowanie', {
              returnTo,
              rola: asMentor ? 'mentor' : undefined,
            }),
          );
        }}
      >
        <TabsList>
          <TabsTrigger value="login">Logowanie</TabsTrigger>
          <TabsTrigger value="register">Rejestracja</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm
            onSuccess={finishLogin}
            onForgot={() => {
              setResetOpen(true);
            }}
          />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm
            defaultRole={asMentor ? 'mentor' : 'student'}
            onStudent={(name) => {
              dispatch({ type: 'register', name });
              navigate(returnTo ?? '/mentorzy');
            }}
            onMentor={() => {
              // A new mentor account in the demo is Adam Górski (application under review).
              dispatch({ type: 'switch-account', accountId: 'adam' });
              navigate('/mentor/onboarding/1');
            }}
          />
        </TabsContent>
      </Tabs>
      <Separator />
      <div className="flex flex-col gap-inline">
        <p className="text-body-dense text-text-muted">Albo kontynuuj przez:</p>
        {/* DS-GAP: SocialSignInButtons — outline Buttons; the provider sign-in is simulated. */}
        <div className="flex flex-wrap gap-inline">
          {(['Google', 'LinkedIn'] as const).map((name) => (
            <Button
              key={name}
              variant="outline"
              onClick={() => {
                setProvider(name);
              }}
            >
              {name} (symulacja)
            </Button>
          ))}
        </div>
      </div>
      <SocialSignInDialog
        provider={provider}
        onClose={() => {
          setProvider(null);
        }}
        onContinue={() => {
          setProvider(null);
          finishLogin();
        }}
      />
      <PasswordResetDialog
        open={resetOpen}
        onClose={() => {
          setResetOpen(false);
        }}
      />
    </div>
  );
}
