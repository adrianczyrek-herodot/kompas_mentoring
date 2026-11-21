/** U5 · Szczegóły sesji (KONCEPCJA §U5, E3-S5, E3-S6). */
import {
  BookingStatusBadge,
  Button,
  Checkbox,
  DateTime,
  ErrorState,
  Link,
  PageHeader,
  PolicyNotice,
  Skeleton,
} from '@kompas/ui';
import { Video } from 'lucide-react';
import { useId, useState } from 'react';
import type { Booking } from '../data/accounts';
import { type Mentor, mentorById } from '../data/mentors';
import { TZ } from '../lib/clock';
import { href, navigate, type Route } from '../lib/router';
import {
  canReportProblem,
  displayStatus,
  freeUntil,
  isUpcoming,
  joinFrom,
  joinOpen,
  policyOf,
} from '../state/booking-rules';
import { useDemo, useRetry } from '../state/demo-context';
import { CancelDialog, ProblemDialog, RescheduleSheet } from './u5-dialogs';

function Facts({ booking }: { booking: Booking }) {
  return (
    <dl className="grid grid-cols-1 gap-group md:grid-cols-3">
      <div className="flex flex-col gap-tight">
        <dt className="text-meta text-text-muted">Termin (Twoja strefa)</dt>
        <dd className="text-body font-medium">
          <DateTime value={booking.startsAt} timeZone={TZ} />
        </dd>
      </div>
      <div className="flex flex-col gap-tight">
        <dt className="text-meta text-text-muted">Rodzaj</dt>
        <dd className="text-body font-medium">
          {booking.type === 'trial' ? 'Sesja próbna' : 'Plan'} · {booking.durationMin} min
        </dd>
      </div>
      <div className="flex flex-col gap-tight md:col-span-3">
        <dt className="text-meta text-text-muted">Cel sesji</dt>
        <dd className="max-w-measure text-body">{booking.goal}</dd>
      </div>
    </dl>
  );
}

function JoinRow({ booking }: { booking: Booking }) {
  const { now } = useDemo();
  const reasonId = useId();
  const open = joinOpen(booking, now);
  if (booking.status === 'requested') {
    return <p className="text-body">Czekamy, aż mentor potwierdzi sesję próbną (do 24 h). Link do pokoju pojawi się po potwierdzeniu.</p>;
  }
  return (
    <div className="flex flex-col gap-inline md:flex-row md:items-center">
      <Button disabled={!open} focusableWhenDisabled aria-describedby={open ? undefined : reasonId} onClick={() => { navigate(`/sesje/${booking.id}/pokoj`); }}>
        <Video aria-hidden="true" />
        Dołącz do sesji
      </Button>
      {open ? null : (
        <p id={reasonId} className="text-body-dense text-text-muted">
          Pokój otworzy się 10 minut przed startem — <DateTime value={joinFrom(booking)} timeZone={TZ} />.
        </p>
      )}
    </div>
  );
}

function ChangeSection({ booking, mentor }: { booking: Booking; mentor: Mentor }) {
  const { now } = useDemo();
  const policyId = useId();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const policy = policyOf(booking, now);
  const late = policy === 'late';
  const blocked = policy === 'started';
  return (
    <section aria-labelledby={`${policyId}-h`} className="flex flex-col gap-group">
      <h2 id={`${policyId}-h`} className="text-section-title font-semibold">Zmiana terminu</h2>
      <PolicyNotice id={policyId} state={policy} freeUntil={freeUntil(booking)} timeZone={TZ} />
      <div className="flex flex-wrap gap-inline">
        {booking.status === 'requested' ? null : (
          <Button variant="outline" disabled={late || blocked} focusableWhenDisabled aria-describedby={late || blocked ? policyId : undefined} onClick={() => { setRescheduleOpen(true); }}>
            Przełóż
          </Button>
        )}
        <Button variant="ghost" disabled={blocked} focusableWhenDisabled aria-describedby={blocked ? policyId : undefined} onClick={() => { setCancelOpen(true); }}>
          Anuluj sesję
        </Button>
      </div>
      <CancelDialog booking={booking} mentor={mentor} late={late} open={cancelOpen} onOpenChange={setCancelOpen} />
      <RescheduleSheet booking={booking} mentor={mentor} open={rescheduleOpen} onOpenChange={setRescheduleOpen} />
    </section>
  );
}

// DS-GAP: NotesPanel — session note and action items (read-only for the student, checkable).
function NotesPanel({ booking }: { booking: Booking }) {
  const id = useId();
  const [done, setDone] = useState(() => booking.actionItems?.map((item) => item.done) ?? []);
  if (!booking.note && !booking.actionItems?.length) {
    return <p className="text-body text-text-muted">Mentor nie dodał jeszcze notatki po sesji.</p>;
  }
  return (
    <div className="flex flex-col gap-group">
      {booking.note ? <p className="max-w-measure text-body">{booking.note}</p> : null}
      {booking.actionItems?.length ? (
        <ul aria-label="Zadania" className="flex flex-col gap-inline">
          {booking.actionItems.map((item, index) => (
            <li key={item.text} className="flex items-center gap-inline">
              <Checkbox id={`${id}-${String(index)}`} checked={done[index] ?? false} onCheckedChange={(checked) => { setDone((d) => d.map((v, i) => (i === index ? checked : v))); }} />
              <label htmlFor={`${id}-${String(index)}`} className="text-body">{item.text}</label>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function PastSection({ booking }: { booking: Booking }) {
  const { now } = useDemo();
  const [problemOpen, setProblemOpen] = useState(false);
  return (
    <>
      <section aria-labelledby="notes-h" className="flex flex-col gap-group">
        <h2 id="notes-h" className="text-section-title font-semibold">Notatka mentora i zadania</h2>
        <NotesPanel booking={booking} />
      </section>
      <div className="flex flex-wrap items-center gap-group">
        {booking.status === 'completed' && !booking.reviewed ? <Link href={href(`/sesje/${booking.id}/ocena`)}>Oceń sesję</Link> : null}
        {canReportProblem(booking, now) ? (
          <Button variant="outline" onClick={() => { setProblemOpen(true); }}>Zgłoś problem</Button>
        ) : booking.status === 'completed' ? (
          <p className="text-body-dense text-text-muted">Problem można zgłosić do 72 h po sesji.</p>
        ) : null}
      </div>
      <ProblemDialog booking={booking} open={problemOpen} onOpenChange={setProblemOpen} />
    </>
  );
}

export function U5SessionDetail({ route }: { route: Route }) {
  const { state, myBookings, now } = useDemo();
  const retry = useRetry();
  const booking = myBookings.find((b) => b.id === route.params['id']);
  const mentor = mentorById(booking?.mentorId);
  const status = state.scenarios.dataState;
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
  if (status === 'error') {
    return <ErrorState titleAs="h1" title="Nie udało się wczytać sesji" description="Sprawdź połączenie i spróbuj ponownie." action={<Button variant="outline" onClick={retry}>Ponów</Button>} />;
  }
  if (!booking || !mentor || status === 'empty') {
    // One message for „does not exist” and „not yours” (E3-S5: 404/403).
    return <ErrorState titleAs="h1" title="Nie znaleźliśmy tej sesji" description="Sesja nie istnieje albo nie masz do niej dostępu. Sprawdź listę swoich sesji." action={<Link href={href('/sesje')}>Przejdź do moich sesji</Link>} />;
  }
  const upcoming = isUpcoming(booking, now);
  return (
    <div className="flex flex-col gap-section">
      <PageHeader title={`Sesja — ${mentor.name}`} actions={<BookingStatusBadge status={displayStatus(booking, now)} />} />
      <div className="flex flex-col gap-group">
        <Facts booking={booking} />
        {upcoming ? <JoinRow booking={booking} /> : null}
      </div>
      {upcoming ? <ChangeSection booking={booking} mentor={mentor} /> : <PastSection booking={booking} />}
      <Link href={href('/sesje')}>Wróć do moich sesji</Link>
    </div>
  );
}
