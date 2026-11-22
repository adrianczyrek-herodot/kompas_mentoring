/** U1 · Wybór terminu (KONCEPCJA §U1, E3-S3, E3-S4). */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  EmptyState,
  FieldLabel,
  FieldTitle,
  Link,
  PageHeader,
  PolicyNotice,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SlotGrid,
  ToggleGroup,
  ToggleGroupItem,
} from '@kompas/ui';
import { CircleX } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { type Mentor, publicMentorById } from '../data/mentors';
import { nextAvailableAfter, slotId, WEEKS_AHEAD, weekDays, weekLabel } from '../data/slots';
import { TIME_ZONES, timeZoneLabel } from '../lib/clock';
import { href, navigate, type Route, withQuery } from '../lib/router';
import { type BookingIntent, bookingIntent } from '../state/booking-intent';
import { type RequestFailure, useDemo, useRetry } from '../state/demo-context';
import { liveMentor, slotRulesOf } from '../state/world';
import type { Draft } from '../state/demo-state';
import { useCreateHold } from '../state/use-create-hold';
import { MentorNotFound, MentorSummaryBar } from './booking-parts';

function CannotBook({ intent, mentor }: { intent: BookingIntent; mentor: Mentor }) {
  const text =
    intent.kind === 'needs-plan'
      ? 'Sesja próbna z tym mentorem już się odbyła (jedna na parę uczeń–mentor). Kolejne sesje rezerwujesz z planu.'
      : intent.kind === 'paused'
        ? `${mentor.name} nie przyjmuje teraz nowych uczniów.`
        : 'Sesje rezerwują uczniowie. Jesteś zalogowany jako mentor lub zespół zaufania.';
  return (
    <EmptyState
      titleAs="h2"
      title="Nie możesz teraz zarezerwować sesji u tego mentora"
      description={text}
      action={
        intent.kind === 'needs-plan' ? (
          <Link href={href('/plany')}>Wybierz plan</Link>
        ) : (
          <Link href={href('/mentorzy')}>Wróć do wyszukiwarki</Link>
        )
      }
    />
  );
}

// DS-GAP: TimezoneSelect (KONCEPCJA §U1) — Select with a few IANA zones.
function TimezoneSelect({ draft }: { draft: Draft }) {
  const { dispatch } = useDemo();
  const id = useId();
  const items = TIME_ZONES.map((zone) => ({ value: zone.value, label: zone.label }));
  return (
    <div className="flex flex-col gap-tight md:w-1/3">
      <FieldLabel htmlFor={id}>Strefa czasowa</FieldLabel>
      <Select
        items={items}
        value={draft.timeZone}
        onValueChange={(value) => {
          if (value) dispatch({ type: 'update-draft', patch: { timeZone: value } });
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// DS-GAP: DurationToggle (plan only: 30/60 min) — ToggleGroup as in the Storybook booking example.
function DurationToggle({ draft }: { draft: Draft }) {
  const { dispatch } = useDemo();
  const id = useId();
  return (
    <div className="flex flex-col gap-inline">
      <FieldTitle id={id}>Długość sesji</FieldTitle>
      <ToggleGroup
        aria-labelledby={id}
        value={[String(draft.durationMin)]}
        onValueChange={(value) => {
          if (value[0]) dispatch({ type: 'update-draft', patch: { durationMin: value[0] === '30' ? 30 : 60 } });
        }}
      >
        <ToggleGroupItem value="30">30 min</ToggleGroupItem>
        <ToggleGroupItem value="60">60 min</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

function ContinueBar({ draft, mentor }: { draft: Draft; mentor: Mentor }) {
  const { account } = useDemo();
  const createHold = useCreateHold();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<RequestFailure | null>(null);
  const reasonId = useId();
  const checkout = `/rezerwacja/${mentor.id}/platnosc`;

  const next = async () => {
    if (!draft.slotId || busy) return;
    // F1: a guest logs in here; the chosen slot waits in the draft (KONCEPCJA §2.2).
    if (account.role === 'guest') {
      navigate(withQuery('/logowanie', { returnTo: checkout }));
      return;
    }
    setBusy(true);
    setFailure(null);
    const result = await createHold();
    setBusy(false);
    if (result === 'held') navigate(checkout);
    else if (result !== 'conflict') setFailure(result);
  };

  return (
    <>
      {failure ? (
        <Alert variant="danger" role="alert">
          <CircleX aria-hidden="true" />
          <AlertTitle>Termin nie został zarezerwowany</AlertTitle>
          <AlertDescription>
            {failure === 'network'
              ? 'Brak połączenia z internetem. Wybrany termin zostaje zaznaczony — spróbuj ponownie.'
              : failure === 'expired'
                ? 'Twoja sesja logowania wygasła. Zaloguj się ponownie — wybrany termin zostaje zaznaczony.'
                : 'To błąd po naszej stronie. Wybrany termin zostaje zaznaczony — spróbuj ponownie za chwilę.'}
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="sticky bottom-0 flex flex-col gap-inline border-t border-border-divider bg-surface-page py-group md:flex-row md:items-center">
        <Button
          size="lg"
          disabled={!draft.slotId}
          focusableWhenDisabled
          loading={busy}
          aria-describedby={draft.slotId ? undefined : reasonId}
          onClick={() => void next()}
        >
          Dalej
        </Button>
        {draft.slotId ? (
          account.role === 'guest' ? (
            <p className="text-body-dense text-text-muted">Zaloguj się lub załóż konto w następnym kroku.</p>
          ) : null
        ) : (
          <p id={reasonId} className="text-body-dense text-text-muted">
            Wybierz termin, żeby przejść dalej.
          </p>
        )}
      </div>
    </>
  );
}

function Picker({ mentor, draft }: { mentor: Mentor; draft: Draft }) {
  const { state, dispatch, now } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  const days =
    status === 'empty'
      ? weekDays(mentor, draft.week, now, []).map((d) => ({ ...d, slots: [] }))
      : weekDays(liveMentor(state.world, mentor), draft.week, now, state.bookings, state.takenSlots, slotRulesOf(state.world, mentor.id));
  const next =
    status === 'empty' ? undefined : nextAvailableAfter(mentor, draft.week, now, state.bookings, state.takenSlots);
  const setWeek = (week: number) => {
    dispatch({ type: 'update-draft', patch: { week } });
  };
  return (
    <SlotGrid
      status={status === 'loading' ? 'loading' : status === 'error' ? 'error' : 'ready'}
      days={days}
      timeZone={draft.timeZone}
      timeZoneLabel={timeZoneLabel(draft.timeZone)}
      weekLabel={weekLabel(draft.week)}
      canGoPrev={draft.week > 0}
      selectedSlotId={draft.slotId}
      onSelect={(slot) => {
        dispatch({ type: 'update-draft', patch: { slotId: slot.id, startsAt: slot.startsAt } });
      }}
      onPrevWeek={() => {
        setWeek(Math.max(0, draft.week - 1));
      }}
      {...(draft.week < WEEKS_AHEAD - 1 ? { onNextWeek: () => { setWeek(draft.week + 1); } } : {})}
      nextAvailable={next?.startsAt}
      onJumpToNext={() => {
        if (next) setWeek(next.week);
      }}
      onRetry={retry}
    />
  );
}

export function U1PickSlot({ route }: { route: Route }) {
  const { state, dispatch, account, myBookings, balanceWith } = useDemo();
  const mentor = publicMentorById(route.params['mentorId']);
  const intent = mentor ? bookingIntent(account, mentor, myBookings, balanceWith(mentor.id)) : null;
  const draft = state.draft?.mentorId === mentor?.id ? state.draft : null;
  const preselect = route.query.get('termin');

  const intentKind = intent?.kind;
  // Start (or keep) the draft for this mentor; the draft keeps the user's choices across screens.
  useEffect(() => {
    if (!mentor || (intentKind !== 'trial' && intentKind !== 'plan')) return;
    dispatch({
      type: 'start-draft',
      draft: { mentorId: mentor.id, type: intentKind, durationMin: intentKind === 'trial' ? 30 : 60 },
    });
    if (preselect) {
      dispatch({
        type: 'update-draft',
        patch: { slotId: slotId(mentor.id, preselect), startsAt: preselect, week: 0 },
      });
    }
  }, [mentor, intentKind, preselect, dispatch]);

  if (!mentor || !intent) return <MentorNotFound />;
  if (intent.kind !== 'trial' && intent.kind !== 'plan') return <CannotBook intent={intent} mentor={mentor} />;
  if (!draft) return null;
  return (
    <div className="flex flex-col gap-section">
      <PageHeader title="Wybierz termin" />
      <MentorSummaryBar mentor={mentor} type={draft.type} durationMin={draft.durationMin} />
      <div className="flex flex-col gap-group md:flex-row md:items-end md:justify-between">
        {draft.type === 'plan' ? <DurationToggle draft={draft} /> : <p className="text-body-dense text-text-muted">Sesja próbna trwa zawsze 30 minut.</p>}
        <TimezoneSelect draft={draft} />
      </div>
      <Picker mentor={mentor} draft={draft} />
      <PolicyNotice state="free" timeZone={draft.timeZone} />
      <ContinueBar draft={draft} mentor={mentor} />
    </div>
  );
}
