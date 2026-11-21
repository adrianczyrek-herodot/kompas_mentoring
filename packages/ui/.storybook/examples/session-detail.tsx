/**
 * U5 „Szczegóły sesji” (E3-S5, E3-S6) composed from real @kompas/ui components: the detail-view
 * pattern and the 12-hour-rule change pattern. Storybook only; decisions such as `policy` and
 * `joinOpen` come from the domain (`canCancelFree`) in the app, never from the UI clock.
 */
import { CircleX, Video } from 'lucide-react';
import { useId, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertTitle,
  BookingStatusBadge,
  Button,
  DateTime,
  ErrorState,
  Link,
  PageHeader,
  PolicyNotice,
  type PolicyState,
  type SessionSummary,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Skeleton,
  SlotGrid,
  useToast,
} from '../../src/index';
import { TZ, TZ_LABEL, WEEK_LABEL, week } from '../fixtures/kompas';
import { type ApiScenario, fakeRequest } from './api';

export type SessionDetailProps = {
  status?: 'ready' | 'loading' | 'not-found' | 'error';
  session: SessionSummary;
  policy: PolicyState;
  freeUntil?: string;
  joinOpen?: boolean;
  joinFrom?: string;
  cancelApi?: ApiScenario;
  onRetry?: () => void;
};

// „Sesja — imię” avoids Polish declension of names (KONCEPCJA §U5 SessionHeader).
const withWhom = (name: string) => `Sesja — ${name}`;

function Facts({ session }: { session: SessionSummary }) {
  return (
    <dl className="grid grid-cols-1 gap-group md:grid-cols-3">
      <div className="flex flex-col gap-tight">
        <dt className="text-meta text-text-muted">Termin (Twoja strefa)</dt>
        <dd className="text-body font-medium">
          <DateTime value={session.startsAt} timeZone={TZ} />
        </dd>
      </div>
      <div className="flex flex-col gap-tight">
        <dt className="text-meta text-text-muted">Rodzaj</dt>
        <dd className="text-body font-medium">
          {session.type === 'trial' ? 'Sesja próbna' : 'Plan'} · {session.durationMin} min
        </dd>
      </div>
      <div className="flex flex-col gap-tight md:col-span-3">
        <dt className="text-meta text-text-muted">Cel sesji</dt>
        <dd className="max-w-measure text-body">{session.goal}</dd>
      </div>
    </dl>
  );
}

export function SessionDetail({
  status = 'ready',
  session: initialSession,
  policy,
  freeUntil,
  joinOpen = false,
  joinFrom,
  cancelApi = 'success',
  onRetry,
}: SessionDetailProps) {
  const toast = useToast();
  const [session, setSession] = useState(initialSession);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [slot, setSlot] = useState<string | undefined>();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const policyId = useId();
  const joinReasonId = useId();

  if (status === 'loading') {
    return (
      <div aria-busy="true" className="flex flex-col gap-group">
        <p className="sr-only">Wczytujemy sesję…</p>
        <Skeleton className="h-lh w-1/2 text-page-title" />
        <Skeleton className="h-lh w-2/3" />
        <Skeleton className="h-control w-1/3" />
      </div>
    );
  }
  if (status === 'not-found') {
    // One message for „does not exist” and „not yours” — never reveal which (E3-S5 T2: 404/403).
    return (
      <ErrorState
        titleAs="h1"
        title="Nie znaleźliśmy tej sesji"
        description="Sesja nie istnieje albo nie masz do niej dostępu. Sprawdź listę swoich sesji."
        action={<Link href="/sesje">Przejdź do moich sesji</Link>}
      />
    );
  }
  if (status === 'error') {
    return (
      <ErrorState
        titleAs="h1"
        title="Nie udało się wczytać sesji"
        description="Sprawdź połączenie i spróbuj ponownie."
        action={
          <Button variant="outline" onClick={onRetry}>
            Ponów
          </Button>
        }
      />
    );
  }

  const active = session.status === 'scheduled' || session.status === 'in_progress';
  const late = policy === 'late';
  const blocked = policy === 'started';

  const cancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    setCancelError(null);
    const answer = await fakeRequest(cancelApi);
    setCancelling(false);
    if (answer.ok) {
      setCancelOpen(false);
      setSession((current) => ({ ...current, status: 'cancelled' }));
      toast.add({
        title: 'Sesja anulowana',
        description: late
          ? 'Sesja przepadła zgodnie z zasadą 12 godzin.'
          : 'Sesja wróciła do salda.',
      });
    } else {
      setCancelError(
        answer.kind === 'offline'
          ? 'Brak połączenia z internetem. Sesja nadal jest umówiona — spróbuj ponownie.'
          : 'Nie udało się anulować. Sesja nadal jest umówiona — spróbuj ponownie za chwilę.',
      );
    }
  };

  return (
    <div className="flex flex-col gap-section">
      <PageHeader
        title={withWhom(session.withName)}
        actions={<BookingStatusBadge status={session.status} />}
      />

      <div className="flex flex-col gap-group">
        <Facts session={session} />
        {active ? (
          <div className="flex flex-col gap-inline md:flex-row md:items-center">
            <Button
              disabled={!joinOpen}
              focusableWhenDisabled
              aria-describedby={joinOpen ? undefined : joinReasonId}
            >
              <Video aria-hidden="true" />
              Dołącz do sesji
            </Button>
            {joinOpen || !joinFrom ? null : (
              <p id={joinReasonId} className="text-body-dense text-text-muted">
                Pokój otworzy się 10 minut przed startem —{' '}
                <DateTime value={joinFrom} timeZone={TZ} />.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {active ? (
        <section aria-labelledby={`${policyId}-h`} className="flex flex-col gap-group">
          <h2 id={`${policyId}-h`} className="text-section-title font-semibold">
            Zmiana terminu
          </h2>
          <PolicyNotice id={policyId} state={policy} freeUntil={freeUntil} timeZone={TZ} />
          <div className="flex flex-wrap gap-inline">
            <Button
              variant="outline"
              disabled={late || blocked}
              focusableWhenDisabled
              aria-describedby={late || blocked ? policyId : undefined}
              onClick={() => setRescheduleOpen(true)}
            >
              Przełóż
            </Button>
            <Button
              variant="ghost"
              disabled={blocked}
              focusableWhenDisabled
              aria-describedby={blocked ? policyId : undefined}
              onClick={() => setCancelOpen(true)}
            >
              Anuluj sesję
            </Button>
          </div>
        </section>
      ) : null}

      <AlertDialog open={cancelOpen} onOpenChange={(open) => !cancelling && setCancelOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Anulować sesję ({session.withName},{' '}
              <DateTime value={session.startsAt} timeZone={TZ} />
              )?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {late
                ? 'Do sesji zostało mniej niż 12 godzin. Jeśli ją anulujesz, przepadnie i nie wróci do salda.'
                : 'Sesja wróci do salda — wykorzystasz ją na inny termin.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {cancelError ? (
            <Alert variant="danger" role="alert">
              <CircleX aria-hidden="true" />
              <AlertTitle>Sesja nie została anulowana</AlertTitle>
              <AlertDescription>{cancelError}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <Button variant="outline" disabled={cancelling} onClick={() => setCancelOpen(false)}>
              Zostaw sesję
            </Button>
            <Button variant="destructive" loading={cancelling} onClick={() => void cancel()}>
              {late ? 'Anuluj i strać sesję' : 'Anuluj sesję'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <SheetContent side="right" closeLabel="Zamknij przekładanie">
          <SheetHeader>
            <SheetTitle>Przełóż sesję</SheetTitle>
            <SheetDescription>
              Wybierz nowy termin. Stary zwolnimy po potwierdzeniu.
            </SheetDescription>
          </SheetHeader>
          <SlotGrid
            days={week}
            timeZone={TZ}
            timeZoneLabel={TZ_LABEL}
            weekLabel={WEEK_LABEL}
            canGoPrev={false}
            selectedSlotId={slot}
            onSelect={(next) => setSlot(next.id)}
            layout="stacked"
          />
          <SheetFooter>
            <Button disabled={!slot} onClick={() => setRescheduleOpen(false)}>
              Przełóż na wybrany termin
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
