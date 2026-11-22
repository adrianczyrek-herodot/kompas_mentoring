/** U8 · Plany i saldo (KONCEPCJA §U8, F2/F4). Payment is a simulation; its outcome comes from the review bar. */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Link,
  PageHeader,
  Skeleton,
  useToast,
} from '@kompas/ui';
import { CalendarX, CircleAlert } from 'lucide-react';
import { useState } from 'react';
import { type Mentor, mentorById } from '../data/mentors';
import { href, navigate, type Route } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo } from '../state/demo-context';
import { byTime } from '../state/world';
import { ActivePlanCard, BalanceTable, PaymentHistory } from './u8-ledger';
import { PlanPicker, type PlanChoice, PriceBreakdown } from './u8-parts';

const PAYMENT_FAILURES = {
  declined: {
    title: 'Płatność odrzucona',
    text: 'Bank odmówił autoryzacji: niewystarczające środki. Wybrany plan został — spróbuj ponownie lub innej metody.',
  },
  '3ds-cancelled': {
    title: 'Weryfikacja płatności przerwana',
    text: 'Potwierdzenie w aplikacji banku (3-D Secure) zostało przerwane. Nie pobraliśmy pieniędzy, wybrany plan został.',
  },
} as const;

type Failure = { title: string; text: string };

function Purchase({ mentor }: { mentor: Mentor }) {
  const { state, dispatch, studentId } = useDemo();
  const toast = useToast();
  const action = useAction();
  const [choice, setChoice] = useState<PlanChoice>({ perWeek: 1, durationMin: 60 });
  const [declined, setDeclined] = useState<Failure | null>(null);
  const pay = () => {
    if (!studentId) return;
    setDeclined(null);
    void action.run(() => {
      const outcome = state.scenarios.payment;
      if (outcome === 'declined' || outcome === '3ds-cancelled') {
        setDeclined(PAYMENT_FAILURES[outcome]);
        return;
      }
      dispatch({ type: 'start-plan', studentId, mentorId: mentor.id, ...choice });
      toast.add({
        title: 'Plan aktywny',
        description:
          outcome === 'webhook-delayed'
            ? `Dodano ${String(choice.perWeek * 4)} sesji do salda. Potwierdzenie płatności z banku dotrze za chwilę.`
            : `Dodano ${String(choice.perWeek * 4)} sesji do salda.`,
        type: 'success',
      });
      navigate(`/rezerwacja/${mentor.id}`);
    }, 900);
  };
  return (
    <div className="flex flex-col gap-section">
      <PageHeader
        title={`Wybierz plan — ${mentor.name}`}
        description="Rozliczenie co 4 tygodnie. Zmienisz, wstrzymasz lub anulujesz plan w dowolnym momencie."
      />
      <div className="grid gap-section md:grid-cols-3">
        <div className="flex flex-col gap-group md:col-span-2">
          <PlanPicker mentor={mentor} value={choice} onChange={setChoice} />
          <p className="text-body-dense text-text-muted">
            Opłacone sesje trafiają do salda. Zostają w nim, jeśli nie uda się ich wykorzystać, a plan możesz zmniejszyć od kolejnego okresu.
          </p>
        </div>
        <div className="flex flex-col gap-group">
          {declined ? (
            <Alert variant="danger" role="alert">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>{declined.title}</AlertTitle>
              <AlertDescription>{declined.text}</AlertDescription>
            </Alert>
          ) : null}
          <FailureAlert kind={action.failure} what="Nie opłaciliśmy planu" />
          <Card>
            <CardHeader>
              <CardTitle>Podsumowanie</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-group">
              <PriceBreakdown mentor={mentor} choice={choice} />
              <Button size="lg" loading={action.busy} onClick={pay}>
                {action.busy ? 'Przetwarzamy płatność…' : 'Opłać plan'}
              </Button>
              <p className="rounded-control border border-border-control bg-surface-sunken p-panel text-body-dense">
                Symulacja płatności: prototyp nie prosi o dane karty i niczego nie obciąża. Wynik płatności ustawisz w pasku przeglądu (Scenariusze).
              </p>
            </CardContent>
          </Card>
          <Link href={href('/plany')}>Wróć do planów i salda</Link>
        </div>
      </div>
    </div>
  );
}

function Overview() {
  const { state, studentId } = useDemo();
  const forced = state.scenarios.dataState;
  if (!studentId) return null;
  const subscriptions = forced === 'empty' ? [] : state.world.subscriptions.filter((s) => s.studentId === studentId);
  const payments = forced === 'empty' ? [] : state.world.payments.filter((p) => p.studentId === studentId).sort((a, b) => byTime(b, a));
  return (
    <div className="flex flex-col gap-section">
      <PageHeader title="Plany i saldo" />
      {forced === 'error' ? (
        <Alert variant="danger" role="alert">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Nie udało się odnowić planu — karta wygasła</AlertTitle>
          <AlertDescription>
            Zaktualizuj metodę płatności w ciągu 7 dni, inaczej plan zostanie wstrzymany. Twoje saldo pozostaje.{' '}
            <Link href={href('/konto?tab=platnosci')}>Zaktualizuj metodę płatności</Link>
          </AlertDescription>
        </Alert>
      ) : null}
      {subscriptions.length === 0 ? (
        <EmptyState
          titleAs="h2"
          icon={<CalendarX />}
          title="Nie masz aktywnego planu"
          description="Zacznij od sesji próbnej z wybranym mentorem — plan dobierzesz po niej."
          action={<Link href={href('/mentorzy')}>Znajdź mentora i umów sesję próbną</Link>}
        />
      ) : (
        <section aria-labelledby="u8-plans" className="flex flex-col gap-group">
          <h2 id="u8-plans" className="text-section-title font-semibold">Twoje plany</h2>
          {subscriptions.map((subscription) => {
            const mentor = mentorById(subscription.mentorId);
            return mentor ? <ActivePlanCard key={subscription.id} subscription={subscription} mentor={mentor} /> : null;
          })}
        </section>
      )}
      {forced === 'empty' ? null : (
        <>
          <BalanceTable studentId={studentId} />
          <PaymentHistory payments={payments} />
        </>
      )}
    </div>
  );
}

export function U8Plans({ route }: { route: Route }) {
  const { state, studentId } = useDemo();
  const status = state.scenarios.dataState;
  const mentorParam = route.query.get('mentor');
  if (status === 'loading') {
    return (
      <div aria-busy="true" className="flex flex-col gap-group">
        <p className="sr-only">Wczytujemy plany…</p>
        <Skeleton className="h-lh w-1/2 text-page-title" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (mentorParam) {
    const mentor = mentorById(mentorParam);
    const hasPlan = state.world.subscriptions.some(
      (s) => s.studentId === studentId && s.mentorId === mentorParam && s.status !== 'cancelled',
    );
    if (!mentor?.acceptingNew) {
      return (
        <ErrorState
          titleAs="h1"
          title="Nie możemy wybrać planu z tym mentorem"
          description="Mentor nie istnieje albo nie przyjmuje teraz nowych uczniów."
          action={<Link href={href('/mentorzy')}>Znajdź mentora</Link>}
        />
      );
    }
    if (!hasPlan) return <Purchase mentor={mentor} />;
  }
  return <Overview key={studentId} />;
}
