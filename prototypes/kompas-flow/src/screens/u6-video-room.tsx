/** U6 · Pokój sesji (KONCEPCJA §U6, F2). The room is a simulation; the clock and the mentor come from the review bar. */
import {
  BookingStatusBadge,
  Button,
  DateTime,
  EmptyState,
  ErrorState,
  formatCount,
  Link,
  PageHeader,
  Skeleton,
} from '@kompas/ui';
import { CalendarClock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Booking } from '../data/accounts';
import { type Mentor, mentorById } from '../data/mentors';
import { addMinutes, minutesBetween, toMs, TZ } from '../lib/clock';
import { href, type Route } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { displayStatus, joinFrom, joinOpen } from '../state/booking-rules';
import { useDemo, useRetry } from '../state/demo-context';
import {
  clock,
  ControlBar,
  DeviceCheck,
  EndSessionDialog,
  NoShowControl,
  SidePanel,
  useElapsedSeconds,
  VideoStage,
} from './u6-parts';

const MENTOR_JOINS_AFTER_MS = 1500;
const RECONNECT_MS = 3000;

function Room({ booking, mentor, chatOnly }: { booking: Booking; mentor: Mentor; chatOnly: boolean }) {
  const { state, dispatch, now } = useDemo();
  const [micOn, setMicOn] = useState(!chatOnly);
  const [cameraOn, setCameraOn] = useState(!chatOnly);
  const [sharing, setSharing] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [mentorHere, setMentorHere] = useState(false);
  const [ending, setEnding] = useState(false);
  const elapsed = useElapsedSeconds(booking, now);
  const joinLogged = useRef(false);
  const mentorLogged = useRef(false);
  // E state (waiting for the other person): the „Mentor nie przychodzi” scenario or the forced empty state.
  const mentorMissing = state.scenarios.mentorNoShow || state.scenarios.dataState === 'empty';
  const events = state.world.roomEvents[booking.id] ?? [];

  useEffect(() => {
    if (joinLogged.current || events.some((line) => line.includes('uczeń dołączył'))) return;
    joinLogged.current = true;
    dispatch({ type: 'log-room-event', bookingId: booking.id, text: 'uczeń dołączył do pokoju' });
  }, [booking.id, dispatch, events]);

  useEffect(() => {
    if (mentorMissing) return;
    const timer = window.setTimeout(() => {
      setMentorHere(true);
      if (mentorLogged.current || events.some((line) => line.includes('mentor dołączył'))) return;
      mentorLogged.current = true;
      dispatch({ type: 'log-room-event', bookingId: booking.id, text: 'mentor dołączył do pokoju' });
    }, MENTOR_JOINS_AFTER_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [booking.id, dispatch, events, mentorMissing]);

  const reconnect = () => {
    setReconnecting(true);
    window.setTimeout(() => {
      setReconnecting(false);
    }, RECONNECT_MS);
  };
  const remaining = booking.durationMin * 60 - elapsed;

  return (
    <div className="flex flex-col gap-section">
      <PageHeader
        title={`Pokój sesji — ${mentor.name}`}
        description={chatOnly ? 'Wchodzisz tylko z czatem: kamera i mikrofon są wyłączone.' : booking.goal}
        actions={
          <p className="text-section-title font-semibold tabular-nums" aria-label="Czas sesji">
            {elapsed < 0 ? `Start za ${clock(elapsed)}` : `${clock(elapsed)} / ${String(booking.durationMin)}:00`}
          </p>
        }
      />
      <div className="grid gap-section md:grid-cols-3">
        <div className="flex flex-col gap-group md:col-span-2">
          <VideoStage
            mentor={mentor}
            mentorHere={mentorHere}
            micOn={micOn}
            cameraOn={cameraOn}
            sharing={sharing}
            reconnecting={reconnecting}
          />
          <ControlBar
            micOn={micOn}
            cameraOn={cameraOn}
            sharing={sharing}
            chatOnly={chatOnly}
            onMic={() => { setMicOn((on) => !on); }}
            onCamera={() => { setCameraOn((on) => !on); }}
            onShare={() => { setSharing((on) => !on); }}
            onReconnect={reconnect}
            onEnd={() => { setEnding(true); }}
          />
          {remaining <= 0 ? (
            <p role="status" className="text-body-dense text-text-muted">
              Planowany czas sesji minął. Zakończ sesję, gdy skończycie rozmowę.
            </p>
          ) : null}
          {mentorMissing ? <NoShowControl booking={booking} mentor={mentor} elapsed={elapsed} /> : null}
          <p className="text-body-dense text-text-muted">
            Wideo, kamera, mikrofon i udostępnianie ekranu to symulacja — dostawca wideo będzie osadzony w produkcie.
          </p>
        </div>
        <SidePanel />
      </div>
      <EndSessionDialog booking={booking} open={ending} onOpenChange={setEnding} />
    </div>
  );
}

type Phase = 'check' | 'room';

function Entry({ booking, mentor }: { booking: Booking; mentor: Mentor }) {
  const { state } = useDemo();
  const retry = useRetry();
  const action = useAction();
  const [phase, setPhase] = useState<Phase>('check');
  const [chatOnly, setChatOnly] = useState(false);
  const permissionDenied = state.scenarios.dataState === 'error';
  if (phase === 'room') return <Room booking={booking} mentor={mentor} chatOnly={chatOnly} />;
  return (
    <div className="flex flex-col gap-section">
      <PageHeader title={`Wejście do pokoju — ${mentor.name}`} description="Sprawdź sprzęt i dołącz do sesji." />
      {permissionDenied ? (
        <ErrorState
          titleAs="h2"
          title="Brak dostępu do kamery i mikrofonu"
          description="Przeglądarka zablokowała dostęp. Kliknij ikonę kłódki obok adresu strony, zezwól na kamerę i mikrofon, a potem spróbuj ponownie. Możesz też wejść tylko z czatem."
          action={
            <div className="flex flex-wrap gap-inline">
              <Button variant="outline" onClick={retry}>Spróbuj ponownie</Button>
              <Button
                variant="ghost"
                loading={action.busy}
                onClick={() =>
                  void action.run(() => {
                    setChatOnly(true);
                    setPhase('room');
                  })
                }
              >
                Wejdź tylko z czatem
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-section md:grid-cols-3">
          <div className="md:col-span-2">
            <DeviceCheck mentor={mentor} booking={booking} />
          </div>
          <div className="flex flex-col gap-group">
            <FailureAlert kind={action.failure} what="Nie udało się połączyć z pokojem" />
            <Button
              size="lg"
              loading={action.busy}
              onClick={() =>
                void action.run(() => {
                  setPhase('room');
                }, 1200)
              }
            >
              {action.busy ? 'Łączymy z pokojem…' : 'Dołącz do sesji'}
            </Button>
            <Link href={href(`/sesje/${booking.id}`)}>Szczegóły sesji</Link>
          </div>
        </div>
      )}
    </div>
  );
}

/** „za 5 min”, „za 2 godz. 10 min”, „za 3 dni” — the room can be days away. */
function untilText(minutes: number): string {
  if (minutes < 60) return `${String(minutes)} min`;
  if (minutes < 24 * 60) return `${formatCount(Math.floor(minutes / 60), { one: 'godzinę', few: 'godziny', many: 'godzin' })}${minutes % 60 ? ` ${String(minutes % 60)} min` : ''}`;
  return formatCount(Math.floor(minutes / (24 * 60)), { one: 'dzień', few: 'dni', many: 'dni' });
}

function Closed({ booking, mentor }: { booking: Booking; mentor: Mentor }) {
  const { now } = useDemo();
  const minutes = minutesBetween(now, joinFrom(booking));
  return (
    <div className="flex flex-col gap-section">
      <PageHeader title={`Pokój sesji — ${mentor.name}`} actions={<BookingStatusBadge status={displayStatus(booking, now)} />} />
      <EmptyState
        titleAs="h2"
        icon={<CalendarClock />}
        title={`Pokój otworzy się za ${untilText(minutes)}`}
        description={
          <>
            Wejście jest możliwe 10 minut przed startem — od <DateTime value={joinFrom(booking)} timeZone={TZ} />. Sesja zaczyna się{' '}
            <DateTime value={booking.startsAt} timeZone={TZ} />.
          </>
        }
        action={<Link href={href(`/sesje/${booking.id}`)}>Wróć do szczegółów sesji</Link>}
      />
    </div>
  );
}

/** Why the room cannot be entered right now (status or time), or null when it can. */
function blockedReason(booking: Booking, now: string): { title: string; description: string; link: { to: string; label: string } } | null {
  const details = { to: `/sesje/${booking.id}`, label: 'Szczegóły sesji' };
  if (booking.status === 'requested') {
    return { title: 'Mentor jeszcze nie potwierdził sesji', description: 'Pokój będzie dostępny po potwierdzeniu sesji próbnej przez mentora.', link: details };
  }
  if (booking.status === 'completed') {
    return {
      title: 'Ta sesja już się zakończyła',
      description: booking.reviewed ? 'Dziękujemy za ocenę. Notatki i zadania znajdziesz w szczegółach sesji.' : 'Oceń sesję, żeby mentor wiedział, co poszło dobrze.',
      link: booking.reviewed ? details : { to: `/sesje/${booking.id}/ocena`, label: 'Oceń sesję' },
    };
  }
  if (booking.status !== 'scheduled') {
    return { title: 'Ta sesja nie odbędzie się w pokoju', description: 'Sesja została anulowana, zgłoszona jako nieobecność mentora albo jest w sporze.', link: details };
  }
  if (toMs(now) >= toMs(addMinutes(booking.startsAt, booking.durationMin))) {
    return { title: 'Czas tej sesji minął', description: 'Pokój jest zamknięty po zakończeniu planowanego czasu sesji.', link: details };
  }
  return null;
}

export function U6VideoRoom({ route }: { route: Route }) {
  const { state, myBookings, now } = useDemo();
  const booking = myBookings.find((b) => b.id === route.params['id']);
  const mentor = mentorById(booking?.mentorId);
  const status = state.scenarios.dataState;
  // The permission-denied state (Er) is handled inside the entry step; here only loading is global.
  if (status === 'loading') {
    return (
      <div aria-busy="true" className="flex flex-col gap-group">
        <p className="sr-only">Łączymy z pokojem…</p>
        <Skeleton className="h-lh w-1/2 text-page-title" />
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-control w-1/3" />
      </div>
    );
  }
  if (!booking || !mentor) {
    return (
      <ErrorState
        titleAs="h1"
        title="Nie znaleźliśmy tej sesji"
        description="Sesja nie istnieje albo nie masz do niej dostępu. Sprawdź listę swoich sesji."
        action={<Link href={href('/sesje')}>Przejdź do moich sesji</Link>}
      />
    );
  }
  const blocked = blockedReason(booking, now);
  if (blocked) {
    return (
      <ErrorState
        titleAs="h1"
        title={blocked.title}
        description={blocked.description}
        action={<Link href={href(blocked.link.to)}>{blocked.link.label}</Link>}
      />
    );
  }
  if (!joinOpen(booking, now)) return <Closed booking={booking} mentor={mentor} />;
  return <Entry key={booking.id} booking={booking} mentor={mentor} />;
}
