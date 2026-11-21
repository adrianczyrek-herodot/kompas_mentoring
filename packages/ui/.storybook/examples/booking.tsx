/**
 * U1 „Wybór terminu” with the 10-minute hold (E3-S4), composed from real @kompas/ui components:
 * the slot-hold pattern. Storybook only; in the app `createHold` returns `{ holdId, expiresAt }`
 * or 409, and the countdown ticks from `expiresAt` with the injected Clock.
 */
import { CircleX } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Button,
  type DaySlots,
  FieldTitle,
  HoldCountdown,
  initialsOf,
  type MentorSummary,
  Money,
  PolicyNotice,
  SlotGrid,
  ToggleGroup,
  ToggleGroupItem,
  useToast,
} from '../../src/index';
import { TZ, TZ_LABEL, WEEK_LABEL, week } from '../fixtures/kompas';

export type HoldAnswer = 'success' | 'conflict' | 'pending' | 'server-error' | 'offline';

const HOLD_SECONDS = 600;
const HOLD_EXPIRES = '2026-10-20T14:10:00+02:00';

export function BookingSlotPicker({
  mentor,
  sessionType = 'trial',
  days = week,
  slotsStatus = 'ready',
  holdAnswer = 'success',
  initialSecondsLeft = HOLD_SECONDS,
  tick = true,
}: {
  mentor: MentorSummary;
  sessionType?: 'trial' | 'plan';
  days?: DaySlots[];
  slotsStatus?: 'ready' | 'loading' | 'error';
  holdAnswer?: HoldAnswer;
  /** Seconds left when the hold starts (stories show the last minutes without waiting). */
  initialSecondsLeft?: number;
  /** Off in static stories so screenshots and a11y checks are stable. */
  tick?: boolean;
}) {
  const toast = useToast();
  const [slots, setSlots] = useState(days);
  const [selected, setSelected] = useState<string | undefined>();
  const [holding, setHolding] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(['60']);
  const reasonId = useId();
  const durationId = useId();

  useEffect(() => {
    if (!tick || secondsLeft === null || secondsLeft <= 0) return;
    const id = setTimeout(() => {
      setSecondsLeft((value) => (value ?? 1) - 1);
    }, 1000);
    return () => {
      clearTimeout(id);
    };
  }, [tick, secondsLeft]);

  const createHold = () => {
    if (!selected || holding) return;
    setHolding(true);
    setError(null);
    if (holdAnswer === 'pending') return; // never answers — the button stays busy
    setTimeout(() => {
      setHolding(false);
      if (holdAnswer === 'success') {
        setSecondsLeft(initialSecondsLeft);
      } else if (holdAnswer === 'conflict') {
        // 409: someone else took it — toast + refreshed grid without that slot (KONCEPCJA §U1 Er).
        setSlots((current) =>
          current.map((day) => ({ ...day, slots: day.slots.filter((s) => s.id !== selected) })),
        );
        setSelected(undefined);
        toast.add({
          title: 'Ten termin został właśnie zajęty',
          description: 'Odświeżyliśmy listę — wybierz inny termin.',
        });
      } else {
        setError(
          holdAnswer === 'offline'
            ? 'Brak połączenia z internetem. Wybrany termin zostaje zaznaczony — spróbuj ponownie.'
            : 'To błąd po naszej stronie. Wybrany termin zostaje zaznaczony — spróbuj ponownie za chwilę.',
        );
      }
    }, 300);
  };

  const held = secondsLeft !== null;

  return (
    <div className="flex flex-col gap-section">
      <div className="flex items-center gap-group border-b border-border-divider pb-group">
        <Avatar size="md">
          <AvatarFallback>{initialsOf(mentor.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-tight">
          <p className="text-body font-semibold">{mentor.name}</p>
          <p className="text-body-dense text-text-muted">
            {sessionType === 'trial' ? (
              <>
                Sesja próbna · 30 min · <Money amount={mentor.trialPrice} />
              </>
            ) : (
              <>
                Sesja z planu · <Money amount={mentor.rate60} /> / 60 min
              </>
            )}
          </p>
        </div>
      </div>

      {sessionType === 'plan' && !held ? (
        <div className="flex flex-col gap-inline">
          <FieldTitle id={durationId}>Długość sesji</FieldTitle>
          <ToggleGroup
            aria-labelledby={durationId}
            value={duration}
            onValueChange={(value) => {
              if (value.length > 0) setDuration(value);
            }}
          >
            <ToggleGroupItem value="30">30 min</ToggleGroupItem>
            <ToggleGroupItem value="60">60 min</ToggleGroupItem>
          </ToggleGroup>
        </div>
      ) : null}

      {held ? (
        <div className="flex flex-col gap-group">
          <HoldCountdown
            secondsLeft={secondsLeft}
            expiresAt={HOLD_EXPIRES}
            timeZone={TZ}
            onChooseAgain={() => {
              setSecondsLeft(null);
              setSelected(undefined);
            }}
          />
          {secondsLeft > 0 ? (
            <div>
              <Button size="lg">Przejdź do płatności</Button>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <SlotGrid
            status={slotsStatus}
            days={slots}
            timeZone={TZ}
            timeZoneLabel={TZ_LABEL}
            weekLabel={WEEK_LABEL}
            canGoPrev={false}
            selectedSlotId={selected}
            onSelect={(slot) => {
              setSelected(slot.id);
            }}
          />
          <PolicyNotice state="free" timeZone={TZ} />
          {error ? (
            <Alert variant="danger" role="alert">
              <CircleX aria-hidden="true" />
              <AlertTitle>Termin nie został zarezerwowany</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="sticky bottom-0 flex flex-col gap-inline border-t border-border-divider bg-surface-page py-group md:flex-row md:items-center">
            <Button
              size="lg"
              disabled={!selected}
              focusableWhenDisabled
              loading={holding}
              aria-describedby={selected ? undefined : reasonId}
              onClick={createHold}
            >
              Dalej
            </Button>
            {selected ? null : (
              <p id={reasonId} className="text-body-dense text-text-muted">
                Wybierz termin, żeby przejść dalej.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
