/** U2 · Checkout (KONCEPCJA §U2). Payment is a simulation; the outcome comes from the review bar. */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  EmptyState,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  formatMoney,
  HoldCountdown,
  Link,
  PageHeader,
  Spinner,
  Textarea,
} from '@kompas/ui';
import { CircleX } from 'lucide-react';
import { type SyntheticEvent, useEffect, useId, useRef, useState } from 'react';
import { type Mentor, publicMentorById } from '../data/mentors';
import type { StudentId } from '../data/accounts';
import { href, navigate, type Route } from '../lib/router';
import { type RequestFailure, useDemo, useFakeRequest } from '../state/demo-context';
import type { Draft } from '../state/demo-state';
import { type HoldResult, useCreateHold } from '../state/use-create-hold';
import { MentorNotFound, MentorSummaryBar } from './booking-parts';
import { OrderSummary, PaymentMethodSelector, priceOf, PromoCodeField } from './u2-parts';

type Failure = { title: string; text: string };

const PAYMENT_FAILURES: Record<'declined' | '3ds-cancelled', Failure> = {
  declined: {
    title: 'Płatność odrzucona',
    text: 'Bank odmówił autoryzacji: niewystarczające środki. Termin jest nadal zablokowany — spróbuj inną metodą.',
  },
  '3ds-cancelled': {
    title: 'Weryfikacja płatności przerwana',
    text: 'Potwierdzenie w aplikacji banku (3-D Secure) zostało przerwane. Nie pobraliśmy pieniędzy, termin jest nadal zablokowany.',
  },
};

const REQUEST_FAILURES: Record<RequestFailure, Failure> = {
  network: {
    title: 'Brak połączenia',
    text: 'Nie udało się wysłać płatności. Wpisane dane i termin zostały — spróbuj ponownie.',
  },
  server: {
    title: 'Błąd po naszej stronie',
    text: 'Nie pobraliśmy pieniędzy. Wpisane dane i termin zostały — spróbuj ponownie za chwilę.',
  },
  expired: {
    title: 'Sesja logowania wygasła',
    text: 'Nie pobraliśmy pieniędzy. Zaloguj się ponownie — wpisane dane i termin zostały.',
  },
};

function validateGoal(draft: Draft): string | null {
  const length = draft.goal.trim().length;
  if (draft.type === 'trial' && length === 0) return 'Opisz krótko, z czym przychodzisz — mentor przeczyta to przed sesją.';
  if (draft.type === 'trial' && length < 20) return 'Napisz co najmniej 20 znaków.';
  if (length > 500) return 'Maksymalnie 500 znaków.';
  return null;
}

function GoalField({ draft, error, onEdit }: { draft: Draft; error: string | null; onEdit: () => void }) {
  const { dispatch } = useDemo();
  const id = useId();
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>
        {draft.type === 'trial' ? 'Z czym przychodzisz?' : 'Temat sesji (opcjonalnie)'}
      </FieldLabel>
      <Textarea
        id={id}
        rows={4}
        maxLength={500}
        showCount
        value={draft.goal}
        aria-invalid={error ? true : undefined}
        placeholder="np. Uczę się Reacta od pół roku, chcę wiedzieć, czy mój projekt nadaje się do portfolio."
        onChange={(event) => {
          dispatch({ type: 'update-draft', patch: { goal: event.target.value } });
          onEdit();
        }}
      />
      {error ? <FieldError>{error}</FieldError> : null}
      <FieldDescription>Mentor zobaczy to przed sesją. {draft.type === 'trial' ? '20–500 znaków.' : ''}</FieldDescription>
    </Field>
  );
}

/** Guest flow: the hold is created when the student enters checkout after signing in. */
function useHoldOnEntry(draft: Draft | null, mentor: Mentor | undefined) {
  const createHold = useCreateHold();
  const started = useRef(false);
  const [result, setResult] = useState<HoldResult | 'pending' | null>(null);
  useEffect(() => {
    if (!draft?.startsAt || draft.hold || started.current || !mentor) return;
    started.current = true;
    setResult('pending');
    void createHold().then((answer) => {
      setResult(answer);
      if (answer === 'conflict') navigate(`/rezerwacja/${mentor.id}`);
    });
  }, [draft, mentor, createHold]);
  return {
    result,
    retry: () => {
      started.current = false;
      setResult(null);
    },
  };
}

function Checkout({ mentor, draft, studentId }: { mentor: Mentor; draft: Draft; studentId: StudentId }) {
  const { state, dispatch, balanceWith } = useDemo();
  const request = useFakeRequest();
  const [goalError, setGoalError] = useState<string | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [busy, setBusy] = useState(false);
  const hold = draft.hold;
  const expired = hold?.secondsLeft === 0;
  const trial = draft.type === 'trial';

  const pay = async (event: SyntheticEvent) => {
    event.preventDefault();
    const error = validateGoal(draft);
    setGoalError(error);
    if (error || busy || expired) return;
    setBusy(true);
    setFailure(null);
    const answer = await request(trial ? 1100 : 600);
    setBusy(false);
    if (!answer.ok) {
      setFailure(REQUEST_FAILURES[answer.kind]);
      return;
    }
    const outcome = state.scenarios.payment;
    if (trial && (outcome === 'declined' || outcome === '3ds-cancelled')) {
      setFailure(PAYMENT_FAILURES[outcome]);
      return;
    }
    const id = `b${String(state.seq + 1)}`;
    dispatch({ type: 'confirm-booking', id, studentId, ...(trial ? { amount: priceOf(mentor, draft).total } : {}) });
    navigate(`/rezerwacja/${id}/potwierdzenie${trial && outcome === 'webhook-delayed' ? '?platnosc=przetwarzanie' : ''}`);
  };

  return (
    <form noValidate onSubmit={(e) => void pay(e)} className="grid gap-section md:grid-cols-3">
      <div className="flex flex-col gap-group md:col-span-2">
        {failure ? (
          <Alert variant="danger" role="alert">
            <CircleX aria-hidden="true" />
            <AlertTitle>{failure.title}</AlertTitle>
            <AlertDescription>{failure.text}</AlertDescription>
          </Alert>
        ) : null}
        <MentorSummaryBar mentor={mentor} type={draft.type} durationMin={draft.durationMin} />
        <GoalField draft={draft} error={goalError} onEdit={() => { setGoalError(null); }} />
        {trial ? (
          <>
            <PaymentMethodSelector value={draft.method} onChange={(method) => { dispatch({ type: 'update-draft', patch: { method } }); }} />
            <PromoCodeField applied={draft.promoApplied} onApply={() => { dispatch({ type: 'update-draft', patch: { promoApplied: true } }); }} />
          </>
        ) : null}
      </div>
      <div className="flex flex-col gap-group">
        {hold ? (
          <HoldCountdown
            secondsLeft={hold.secondsLeft}
            expiresAt={hold.expiresAt}
            timeZone={draft.timeZone}
            onChooseAgain={() => {
              dispatch({ type: 'release-hold' });
              navigate(`/rezerwacja/${mentor.id}`);
            }}
          />
        ) : null}
        <OrderSummary mentor={mentor} draft={draft} balance={balanceWith(mentor.id)}>
          {expired ? null : (
            <Button type="submit" size="lg" loading={busy}>
              {busy && trial ? 'Przetwarzamy płatność…' : trial ? `Zapłać ${formatMoney(priceOf(mentor, draft).total)}` : 'Zarezerwuj z salda'}
            </Button>
          )}
        </OrderSummary>
        <Link href={href(`/rezerwacja/${mentor.id}`)}>Zmień termin</Link>
      </div>
    </form>
  );
}

export function U2Checkout({ route }: { route: Route }) {
  const { state, studentId } = useDemo();
  const mentor = publicMentorById(route.params['mentorId']);
  const draft = state.draft?.mentorId === mentor?.id ? state.draft : null;
  const entry = useHoldOnEntry(draft, mentor);
  if (!mentor) return <MentorNotFound />;
  if (!draft?.startsAt || !studentId) {
    return (
      <EmptyState
        titleAs="h2"
        title="Nie wybrano terminu"
        description="Wróć do kalendarza mentora i wybierz termin."
        action={<Link href={href(`/rezerwacja/${mentor.id}`)}>Wybierz termin</Link>}
      />
    );
  }
  if (!draft.hold) {
    return entry.result === 'network' || entry.result === 'server' || entry.result === 'expired' ? (
      <Alert variant="danger" role="alert">
        <CircleX aria-hidden="true" />
        <AlertTitle>Nie udało się zablokować terminu</AlertTitle>
        <AlertDescription>
          Wybrany termin zostaje zaznaczony.{' '}
          <Button variant="link" onClick={entry.retry}>
            Spróbuj ponownie
          </Button>
        </AlertDescription>
      </Alert>
    ) : (
      <Spinner label="Blokujemy wybrany termin…" />
    );
  }
  return (
    <div className="flex flex-col gap-section">
      <PageHeader title={draft.type === 'trial' ? 'Opłać sesję próbną' : 'Potwierdź rezerwację z salda'} />
      <Checkout mentor={mentor} draft={draft} studentId={studentId} />
    </div>
  );
}
