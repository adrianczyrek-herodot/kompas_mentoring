/** M2 · Panel mentora (KONCEPCJA §M2, F5). Every number is computed from the demo data. */
import {
  type AgendaItem,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  formatCount,
  Link,
  Money,
  PageHeader,
  Skeleton,
  TodayAgenda,
  TrialRequestCard,
  useToast,
} from '@kompas/ui';
import { CircleCheck, Inbox } from 'lucide-react';
import { useState } from 'react';
import type { Booking } from '../data/accounts';
import { mentorById } from '../data/mentors';
import { addMinutes, formatShort, TZ } from '../lib/clock';
import { href } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { joinOpen, toSummary } from '../state/booking-rules';
import { useDemo, useRetry } from '../state/demo-context';
import { studentNameOf } from '../state/world';
import { dayKey, DeclineDialog, weekRange } from './m2-parts';

type Section = 'ready' | 'loading' | 'error';

function useMentorData() {
  const { state, account, now } = useDemo();
  const mentorId = account.mentorId ?? 'm1';
  const names = { newStudentName: state.newStudentName };
  const mine = state.bookings.filter((b) => b.mentorId === mentorId);
  const nameOf = (b: Booking) => studentNameOf(names, b.studentId);
  return { state, mentorId, now, mine, nameOf };
}

function Agenda({ status }: { status: Section | 'empty' }) {
  const { now, mine, nameOf } = useMentorData();
  const retry = useRetry();
  const toast = useToast();
  const today = dayKey(now);
  const items: AgendaItem[] = status === 'empty' ? [] : mine
    .filter((b) => b.status === 'scheduled' && dayKey(b.startsAt) === today)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((b) => ({ ...toSummary(b, now, nameOf(b)), joinOpen: joinOpen(b, now) }));
  return (
    <TodayAgenda
      className="md:flex-1"
      status={status === 'empty' ? 'ready' : status}
      items={items}
      timeZone={TZ}
      onRetry={retry}
      emptyAction={<Link href={href('/mentor/kalendarz')}>Otwórz kalendarz</Link>}
      onJoin={() => {
        // The mentor's side of the room is outside the screen map: U6 is the student's view.
        toast.add({ title: 'Dołączenie do sesji — w prototypie nie działa', description: 'Pokój sesji pokazujemy tylko z perspektywy ucznia (U6).' });
      }}
    />
  );
}

function Requests({ status }: { status: Section | 'empty' }) {
  const { mine, nameOf, now } = useMentorData();
  const retry = useRetry();
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const [accepting, setAccepting] = useState<string | null>(null);
  const [declining, setDeclining] = useState<Booking | null>(null);
  const requests = status === 'empty' ? [] : mine.filter((b) => b.status === 'requested');
  return (
    <section aria-labelledby="m2-requests" className="flex flex-col gap-inline md:flex-1">
      <h2 id="m2-requests" className="text-section-title font-semibold text-text-default">
        Prośby o sesję próbną{requests.length > 0 ? <Badge variant="warning" className="ml-inline">{requests.length}</Badge> : null}
      </h2>
      {status === 'loading' ? (
        <div aria-busy="true" className="flex flex-col gap-inline">
          <p className="sr-only">Wczytujemy prośby…</p>
          <Skeleton className="h-lh w-2/3" />
          <Skeleton className="h-lh w-full" />
        </div>
      ) : status === 'error' ? (
        <ErrorState titleAs="p" className="py-group" title="Nie udało się wczytać próśb" description="Pozostałe sekcje panelu działają. Spróbuj wczytać tę jeszcze raz." action={<Button variant="outline" onClick={retry}>Ponów</Button>} />
      ) : requests.length === 0 ? (
        <EmptyState titleAs="p" className="py-group" icon={<Inbox />} title="Brak nowych próśb" description="Gdy uczeń poprosi o sesję próbną, zobaczysz ją tutaj." />
      ) : (
        <>
          <FailureAlert kind={action.failure} what="Prośba nie została przyjęta" />
          <ul>
            {requests.map((b) => (
              <TrialRequestCard
                key={b.id}
                request={{ id: b.id, student: nameOf(b), startsAt: b.startsAt, goal: b.goal, respondBy: addMinutes(now, 24 * 60) }}
                timeZone={TZ}
                accepting={accepting === b.id}
                onAccept={() => {
                  setAccepting(b.id);
                  void action.run(() => {
                    dispatch({ type: 'answer-trial', id: b.id, accept: true });
                    toast.add({ title: 'Prośba przyjęta', description: `Sesja próbna z ${nameOf(b)} jest umówiona, uczeń dostał powiadomienie.` });
                  }).finally(() => { setAccepting(null); });
                }}
                onDecline={() => { setDeclining(b); }}
              />
            ))}
          </ul>
        </>
      )}
      {declining ? (
        <DeclineDialog
          bookingId={declining.id}
          student={nameOf(declining)}
          open
          onOpenChange={(open) => { if (!open) setDeclining(null); }}
        />
      ) : null}
    </section>
  );
}

const TASK_FORMS = { one: 'wiadomość', few: 'wiadomości', many: 'wiadomości' };

function Tasks({ status }: { status: Section | 'empty' }) {
  const { state, mine, nameOf, mentorId } = useMentorData();
  if (status === 'loading') return <Skeleton className="h-lh w-1/2" />;
  if (status === 'error') return null;
  const unread = status === 'empty' ? [] : state.world.threads.filter((t) => t.mentorId === mentorId && t.unread.mentor > 0);
  const needNote = status === 'empty' ? [] : mine
    .filter((b) => b.status === 'completed' && !b.note)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return (
    <section aria-labelledby="m2-tasks" className="flex flex-col gap-inline">
      <h2 id="m2-tasks" className="text-section-title font-semibold text-text-default">Do zrobienia</h2>
      {unread.length === 0 && needNote.length === 0 ? (
        <p className="flex items-center gap-inline text-body text-text-muted"><CircleCheck aria-hidden="true" className="size-icon-sm" />Wszystko zrobione.</p>
      ) : (
        <ul className="flex flex-col gap-inline">
          {unread.map((t) => (
            <li key={t.id} className="text-body">
              <Link href={href(`/wiadomosci/${t.id}`)}>
                Odpowiedz: {formatCount(t.unread.mentor, TASK_FORMS)} od {studentNameOf({ newStudentName: state.newStudentName }, t.studentId)}
              </Link>
            </li>
          ))}
          {needNote.map((b) => (
            <li key={b.id} className="text-body">
              <Link href={href(`/mentor/uczniowie/${b.studentId}`)}>
                Uzupełnij notatkę po sesji: {nameOf(b)} ({formatShort(b.startsAt)})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stat({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-tight">
      <dt className="text-meta text-text-muted">{label}</dt>
      <dd className="text-section-title font-semibold tabular-nums">{children}</dd>
      {hint ? <dd className="text-meta text-text-muted">{hint}</dd> : null}
    </div>
  );
}

// DS-GAP: KpiTiles (KONCEPCJA §M2) — a plain description list of numbers computed from the data.
function WeekStats() {
  const { state, mentorId, now, mine } = useMentorData();
  const mentor = mentorById(mentorId);
  const { from, to } = weekRange(now);
  const inWeek = (iso: string) => dayKey(iso) >= from && dayKey(iso) <= to;
  const hours = (list: Booking[]) => list.reduce((sum, b) => sum + b.durationMin, 0) / 60;
  const done = hours(mine.filter((b) => b.status === 'completed' && inWeek(b.startsAt)));
  const planned = hours(mine.filter((b) => b.status === 'scheduled' && inWeek(b.startsAt)));
  const net = state.world.earnings
    .filter((e) => e.mentorId === mentorId && e.date >= from && e.date <= to)
    .reduce((sum, e) => sum + e.gross - e.fee, 0n);
  return (
    <section aria-labelledby="m2-week" className="flex flex-col gap-inline">
      <h2 id="m2-week" className="text-section-title font-semibold text-text-default">Ten tydzień</h2>
      <dl className="grid grid-cols-2 gap-group md:grid-cols-4">
        <Stat label="Przeprowadzone godziny">{String(done)} h</Stat>
        <Stat label="Zaplanowane godziny">{String(planned)} h</Stat>
        <Stat label="Netto z sesji w tygodniu" hint="po prowizji platformy"><Money amount={net} /></Stat>
        <Stat label="Ocena" hint={`${String(mentor?.reviewsCount ?? 0)} opinii`}>{mentor ? mentor.rating.toFixed(1).replace('.', ',') : '—'}</Stat>
      </dl>
    </section>
  );
}

function ProfileStatus() {
  const { state, mentorId } = useMentorData();
  const accepting = (state.world.mentorSettings[mentorId]?.acceptingNew ?? true);
  return (
    <section aria-labelledby="m2-profile" className="flex flex-col gap-inline">
      <h2 id="m2-profile" className="text-section-title font-semibold text-text-default">Status profilu</h2>
      <div className="flex flex-wrap items-center gap-inline">
        <Badge variant="success">Profil zatwierdzony i publiczny</Badge>
        <Badge variant={accepting ? 'success' : 'warning'}>{accepting ? 'Przyjmujesz nowych uczniów' : 'Wstrzymano przyjmowanie nowych uczniów'}</Badge>
      </div>
      <p className="flex flex-wrap gap-group text-body-dense">
        <Link href={href(`/mentorzy/${mentorId}`)}>Zobacz profil publiczny</Link>
        <Link href={href('/mentor/kalendarz')}>Zmień dostępność i ustawienia</Link>
      </p>
    </section>
  );
}

export function M2Dashboard() {
  const { state } = useDemo();
  const status = state.scenarios.dataState;
  const section: Section | 'empty' = status === 'default' ? 'ready' : status;
  return (
    <>
      <PageHeader title="Panel mentora" description="Co wymaga Twojej uwagi dzisiaj." />
      <div className="flex flex-col gap-section">
        {section === 'loading' ? <span className="sr-only">Wczytujemy panel…</span> : null}
        {section === 'loading' ? <Skeleton className="h-control-lg w-full" /> : <WeekStats />}
        <div className="flex flex-col gap-section md:flex-row">
          <Agenda status={section} />
          <Requests status={section} />
        </div>
        <Tasks status={section} />
        <ProfileStatus />
      </div>
    </>
  );
}
