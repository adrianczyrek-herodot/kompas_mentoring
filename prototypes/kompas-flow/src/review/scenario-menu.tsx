/**
 * Scenario controls (review bar only, never in the product): they decide how the next simulated
 * request answers. Every control here is wired; screens read them through `useDemo().state`.
 */
import {
  Button,
  FieldTitle,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
} from '@kompas/ui';
import { useId } from 'react';
import { useDemo } from '../state/demo-context';
import {
  DEFAULT_SCENARIOS,
  type DataState,
  type FailNext,
  type PaymentOutcome,
} from '../state/demo-state';

const PAYMENT: { value: PaymentOutcome; label: string }[] = [
  { value: 'success', label: 'Sukces' },
  { value: 'declined', label: 'Odrzucona przez bank' },
  { value: '3ds-cancelled', label: '3-D Secure przerwane' },
  { value: 'webhook-delayed', label: 'Potwierdzenie opóźnione (webhook)' },
];

const FAIL: { value: FailNext; label: string }[] = [
  { value: 'none', label: 'Brak' },
  { value: 'network', label: 'Brak sieci' },
  { value: 'server', label: 'Błąd serwera' },
];

/** Minutes added to the fixed „now” (Tue 20 Oct 2026, 14:00). Adrian's session s1 starts 14:05. */
const CLOCK: { value: string; label: string }[] = [
  { value: '0', label: 'Wt 20.10, 14:00 — stały „teraz”' },
  { value: '-10', label: '13:50 — pokój sesji 14:05 jeszcze zamknięty' },
  { value: '20', label: '14:20 — sesja 14:05 trwa' },
  { value: '70', label: '15:10 — sesja 14:05 zakończona' },
  { value: '3960', label: 'Pt 23.10, 08:00 — mniej niż 12 h do sesji 18:00' },
];

const DATA: { value: DataState; label: string }[] = [
  { value: 'default', label: 'Dane' },
  { value: 'loading', label: 'Ładowanie' },
  { value: 'empty', label: 'Pusto' },
  { value: 'error', label: 'Błąd' },
];

function Choice<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-tight">
      <FieldTitle id={id}>{title}</FieldTitle>
      <RadioGroup
        aria-labelledby={id}
        value={value}
        onValueChange={(next) => {
          onChange(next as T);
        }}
      >
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-inline text-body-dense">
            <RadioGroupItem value={option.value} />
            {option.label}
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

function DataStateToggle() {
  const id = useId();
  const { state, dispatch } = useDemo();
  return (
    <div className="flex flex-col gap-tight">
      <FieldTitle id={id}>Stan danych bieżącego ekranu</FieldTitle>
      <ToggleGroup
        aria-labelledby={id}
        value={[state.scenarios.dataState]}
        onValueChange={(value) => {
          const next = value[0] as DataState | undefined;
          if (next) dispatch({ type: 'set-scenarios', patch: { dataState: next } });
        }}
      >
        {DATA.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-inline">
      <label htmlFor={id} className="text-body-dense">
        {label}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function TrialAnswer() {
  const { dispatch, myBookings } = useDemo();
  const pending = myBookings.filter((b) => b.status === 'requested');
  const answer = (accept: boolean) => {
    for (const booking of pending) {
      dispatch({
        type: 'answer-trial',
        id: booking.id,
        accept,
        ...(accept ? {} : { reason: 'Termin koliduje z innym zobowiązaniem' }),
      });
    }
  };
  const disabled = pending.length === 0;
  return (
    <div className="flex flex-col gap-tight">
      <FieldTitle>Mentor odpowiada na prośbę o sesję próbną</FieldTitle>
      <div className="flex gap-inline">
        <Button variant="outline" size="sm" disabled={disabled} focusableWhenDisabled onClick={() => { answer(true); }}>
          Akceptuje
        </Button>
        <Button variant="outline" size="sm" disabled={disabled} focusableWhenDisabled onClick={() => { answer(false); }}>
          Odrzuca
        </Button>
      </div>
      <p className="text-meta text-text-muted">
        {disabled
          ? 'Działa dla ucznia z prośbą czekającą na mentora (np. Paweł R.). Mentor odpowiada też sam w M2.'
          : `Próśb bieżącego konta czekających na mentora: ${String(pending.length)}.`}
      </p>
    </div>
  );
}

function ClockChoice() {
  const { state, dispatch } = useDemo();
  const value = String(state.scenarios.clockOffset);
  const options = CLOCK.some((o) => o.value === value) ? CLOCK : [...CLOCK, { value, label: `Przesunięty o ${value} min` }];
  return (
    <Choice
      title="Zegar demo (U5, U6, M2)"
      options={options}
      value={value}
      onChange={(next) => {
        dispatch({ type: 'set-scenarios', patch: { clockOffset: Number(next) } });
      }}
    />
  );
}

function ScenarioBody() {
  const { state, dispatch } = useDemo();
  const set = (patch: Partial<typeof state.scenarios>) => {
    dispatch({ type: 'set-scenarios', patch });
  };
  const holdActive = (state.draft?.hold?.secondsLeft ?? 0) > 0;
  return (
    <div className="flex flex-col gap-group">
      <DataStateToggle />
      <Separator />
      <Choice
        title="Wynik płatności (U2)"
        options={PAYMENT}
        value={state.scenarios.payment}
        onChange={(payment) => {
          set({ payment });
        }}
      />
      <Choice
        title="Błąd następnego żądania (jednorazowo)"
        options={FAIL}
        value={state.scenarios.failNext}
        onChange={(failNext) => {
          set({ failNext });
        }}
      />
      <SwitchRow
        label="Następna blokada terminu: konflikt 409"
        checked={state.scenarios.slotConflict}
        onChange={(slotConflict) => {
          set({ slotConflict });
        }}
      />
      <SwitchRow
        label="Następne żądanie: sesja logowania wygasła"
        checked={state.scenarios.sessionExpired}
        onChange={(sessionExpired) => {
          set({ sessionExpired });
        }}
      />
      <div className="flex flex-col gap-tight">
        <Button
          variant="outline"
          size="sm"
          disabled={!holdActive}
          focusableWhenDisabled
          onClick={() => {
            dispatch({ type: 'expire-hold' });
          }}
        >
          Wygaś blokadę terminu teraz
        </Button>
        {holdActive ? null : (
          <p className="text-meta text-text-muted">Działa, gdy w U2 trwa blokada terminu.</p>
        )}
      </div>
      <Separator />
      <ClockChoice />
      <SwitchRow
        label="Mentor nie dołącza do pokoju (U6)"
        checked={state.scenarios.mentorNoShow}
        onChange={(mentorNoShow) => {
          set({ mentorNoShow });
        }}
      />
      <TrialAnswer />
      <Separator />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          set(DEFAULT_SCENARIOS);
        }}
      >
        Przywróć domyślne scenariusze
      </Button>
    </div>
  );
}

export function ScenarioMenu() {
  const { state } = useDemo();
  const changed = Object.entries(DEFAULT_SCENARIOS).filter(
    ([key, value]) => state.scenarios[key as keyof typeof DEFAULT_SCENARIOS] !== value,
  ).length;
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        Scenariusze{changed > 0 ? ` (${String(changed)} zmienione)` : ''}
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverTitle>Scenariusze przeglądu</PopoverTitle>
        <PopoverDescription>
          Decydują, jak odpowie następne symulowane żądanie. Nie są częścią produktu.
        </PopoverDescription>
        <ScenarioBody />
      </PopoverContent>
    </Popover>
  );
}
