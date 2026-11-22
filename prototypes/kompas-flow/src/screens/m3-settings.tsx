/** M3 side panels: booking settings, availability exceptions and the Google Calendar simulation. */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  DateTime,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  RadioGroup,
  RadioGroupItem,
  Switch,
  useToast,
} from '@kompas/ui';
import { CalendarCheck, CircleX } from 'lucide-react';
import { type SyntheticEvent, useId, useState } from 'react';
import type { AvailabilityException, MentorSettings } from '../data/mentor-work';
import { toMs, TZ } from '../lib/clock';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo, useRetry } from '../state/demo-context';
import { dayKey } from './m2-parts';
import { ConflictAlert } from './m3-template';
import type { Booking } from '../data/accounts';

type SettingsErrors = { notice?: string | undefined; buffer?: string | undefined };

function integerIn(text: string, min: number, max: number, unit: string): string | undefined {
  const value = Number(text);
  if (text.trim() === '' || !Number.isInteger(value) || value < min || value > max) {
    return `Podaj liczbę całkowitą od ${String(min)} do ${String(max)} ${unit}.`;
  }
  return undefined;
}

export function SettingsForm({ settings, mentorId }: { settings: MentorSettings; mentorId: string }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const id = useId();
  const [notice, setNotice] = useState(String(settings.minNoticeHours));
  const [buffer, setBuffer] = useState(String(settings.bufferMin));
  const [accepting, setAccepting] = useState(settings.acceptingNew);
  const [errors, setErrors] = useState<SettingsErrors>({});

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    const found: SettingsErrors = {
      notice: integerIn(notice, 2, 48, 'godz.'),
      buffer: integerIn(buffer, 0, 30, 'min'),
    };
    setErrors(found);
    if (found.notice ?? found.buffer) return;
    void action.run(() => {
      dispatch({ type: 'update-mentor-settings', mentorId, patch: { minNoticeHours: Number(notice), bufferMin: Number(buffer), acceptingNew: accepting } });
      toast.add({ title: 'Zapisano ustawienia rezerwacji' });
    });
  };

  return (
    <section aria-labelledby={`${id}-h`} className="flex flex-col gap-group">
      <h2 id={`${id}-h`} className="text-section-title font-semibold">Ustawienia rezerwacji</h2>
      <form noValidate onSubmit={submit} className="flex flex-col gap-group">
        <Field data-invalid={errors.notice ? true : undefined}>
          <FieldLabel htmlFor={`${id}-notice`}>Minimalne wyprzedzenie (godz.)</FieldLabel>
          <Input id={`${id}-notice`} type="number" inputMode="numeric" value={notice} aria-invalid={errors.notice ? true : undefined} onChange={(e) => { setNotice(e.target.value); }} />
          {errors.notice ? <FieldError>{errors.notice}</FieldError> : <FieldDescription>Od 2 do 48 godzin przed sesją.</FieldDescription>}
        </Field>
        <Field data-invalid={errors.buffer ? true : undefined}>
          <FieldLabel htmlFor={`${id}-buffer`}>Przerwa między sesjami (min)</FieldLabel>
          <Input id={`${id}-buffer`} type="number" inputMode="numeric" value={buffer} aria-invalid={errors.buffer ? true : undefined} onChange={(e) => { setBuffer(e.target.value); }} />
          {errors.buffer ? <FieldError>{errors.buffer}</FieldError> : <FieldDescription>Od 0 do 30 minut.</FieldDescription>}
        </Field>
        <Field orientation="horizontal" className="justify-between">
          <FieldLabel htmlFor={`${id}-accepting`}>Przyjmuję nowych uczniów</FieldLabel>
          <Switch id={`${id}-accepting`} checked={accepting} onCheckedChange={setAccepting} />
        </Field>
        <FailureAlert kind={action.failure} what="Ustawienia nie zostały zapisane" />
        <div>
          <Button type="submit" variant="outline" loading={action.busy}>Zapisz ustawienia</Button>
        </div>
      </form>
    </section>
  );
}

type ExceptionType = AvailabilityException['type'];

function ExceptionDialog({ mentorId, open, onOpenChange }: { mentorId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { state, dispatch, now } = useDemo();
  const toast = useToast();
  const action = useAction();
  const id = useId();
  const [type, setType] = useState<ExceptionType>('off');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [label, setLabel] = useState('');
  const [errors, setErrors] = useState<{ from?: string | undefined; to?: string | undefined }>({});
  const [conflicts, setConflicts] = useState<Booking[]>([]);

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    const found: typeof errors = {};
    if (!from) found.from = 'Podaj datę początkową.';
    if (!to) found.to = 'Podaj datę końcową.';
    else if (from && to < from) found.to = 'Data końca nie może być wcześniejsza niż początku.';
    setErrors(found);
    setConflicts([]);
    if (found.from ?? found.to) return;
    // An „off” period over a booked session must not silently cancel it (KONCEPCJA §M3 Er).
    const blocking = type === 'off'
      ? state.bookings.filter((b) => b.mentorId === mentorId && (b.status === 'scheduled' || b.status === 'requested') && dayKey(b.startsAt) >= from && dayKey(b.startsAt) <= to && toMs(b.startsAt) > toMs(now))
      : [];
    if (blocking.length > 0) {
      setConflicts(blocking);
      return;
    }
    const exception: AvailabilityException = {
      id: `ex-${String(state.world.mentorSettings[mentorId]?.exceptions.length ?? 0)}-${from}-${to}`,
      from,
      to,
      type,
      label: label.trim() || (type === 'off' ? 'Niedostępność' : 'Dodatkowe godziny'),
    };
    void action.run(() => {
      dispatch({ type: 'add-exception', mentorId, exception });
      onOpenChange(false);
      setFrom(''); setTo(''); setLabel('');
      toast.add({ title: 'Wyjątek dodany', description: `${exception.label}: ${from} – ${to}.` });
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!action.busy) { action.reset(); setConflicts([]); onOpenChange(next); } }}>
      <DialogContent closeLabel="Zamknij">
        <form noValidate onSubmit={submit} className="flex flex-col gap-group">
          <DialogHeader>
            <DialogTitle>Dodaj wyjątek</DialogTitle>
            <DialogDescription>Urlop zamyka terminy w podanym zakresie dat. Dodatkowe godziny są w prototypie tylko oznaczone w kalendarzu.</DialogDescription>
          </DialogHeader>
          <FieldSet>
            <FieldLegend variant="label">Rodzaj</FieldLegend>
            <RadioGroup value={type} onValueChange={(next) => { setType(next as ExceptionType); setConflicts([]); }}>
              <label className="flex items-center gap-inline text-body"><RadioGroupItem value="off" />Niedostępność (urlop)</label>
              <label className="flex items-center gap-inline text-body"><RadioGroupItem value="extra" />Dodatkowe godziny</label>
            </RadioGroup>
          </FieldSet>
          {/* DS-GAP: DatePicker / DateRangePicker — the DS has none; two date fields of the DS Input. */}
          <div className="flex flex-col gap-group md:flex-row">
            <Field data-invalid={errors.from ? true : undefined}>
              <FieldLabel htmlFor={`${id}-from`}>Od</FieldLabel>
              <Input id={`${id}-from`} type="date" value={from} aria-invalid={errors.from ? true : undefined} onChange={(e) => { setFrom(e.target.value); }} />
              {errors.from ? <FieldError>{errors.from}</FieldError> : null}
            </Field>
            <Field data-invalid={errors.to ? true : undefined}>
              <FieldLabel htmlFor={`${id}-to`}>Do (włącznie)</FieldLabel>
              <Input id={`${id}-to`} type="date" value={to} aria-invalid={errors.to ? true : undefined} onChange={(e) => { setTo(e.target.value); }} />
              {errors.to ? <FieldError>{errors.to}</FieldError> : null}
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor={`${id}-label`}>Opis (opcjonalnie)</FieldLabel>
            <Input id={`${id}-label`} value={label} maxLength={60} placeholder={type === 'off' ? 'np. Urlop' : 'np. Dodatkowe godziny w sobotę'} onChange={(e) => { setLabel(e.target.value); }} />
          </Field>
          {conflicts.length > 0 ? <ConflictAlert title="W tym okresie masz zaplanowane sesje" sessions={conflicts} /> : null}
          <FailureAlert kind={action.failure} what="Wyjątek nie został dodany" />
          <DialogFooter>
            <Button type="button" variant="outline" disabled={action.busy} onClick={() => { onOpenChange(false); }}>Anuluj</Button>
            <Button type="submit" loading={action.busy}>Dodaj wyjątek</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Exceptions({ exceptions, mentorId }: { exceptions: AvailabilityException[]; mentorId: string }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  return (
    <section aria-labelledby="m3-exceptions" className="flex flex-col gap-inline">
      <h2 id="m3-exceptions" className="text-section-title font-semibold">Wyjątki</h2>
      {exceptions.length === 0 ? (
        <p className="text-body-dense text-text-muted">Brak wyjątków. Dodaj urlop, żeby zamknąć terminy na kilka dni.</p>
      ) : (
        <ul>
          {exceptions.map((ex) => (
            <li key={ex.id} className="flex flex-wrap items-center justify-between gap-inline border-b border-border-divider py-row-y text-body-dense">
              <span className="flex flex-wrap items-center gap-inline">
                <Badge variant={ex.type === 'off' ? 'warning' : 'success'}>{ex.type === 'off' ? 'Urlop' : 'Dodatkowe'}</Badge>
                {ex.label} · <DateTime value={`${ex.from}T12:00:00+02:00`} timeZone={TZ} format="date" /> – <DateTime value={`${ex.to}T12:00:00+02:00`} timeZone={TZ} format="date" />
              </span>
              <Button
                variant="ghost"
                size="sm"
                loading={removing === ex.id}
                aria-label={`Usuń wyjątek: ${ex.label}`}
                onClick={() => {
                  setRemoving(ex.id);
                  void action.run(() => {
                    dispatch({ type: 'remove-exception', mentorId, id: ex.id });
                    toast.add({ title: 'Wyjątek usunięty' });
                  }).finally(() => { setRemoving(null); });
                }}
              >
                Usuń
              </Button>
            </li>
          ))}
        </ul>
      )}
      <FailureAlert kind={action.failure} what="Wyjątek nie został usunięty" />
      <div>
        <Button variant="outline" onClick={() => { setOpen(true); }}>Dodaj wyjątek</Button>
      </div>
      <ExceptionDialog mentorId={mentorId} open={open} onOpenChange={setOpen} />
    </section>
  );
}

export function GoogleCard({ settings, mentorId }: { settings: MentorSettings; mentorId: string }) {
  const { state, dispatch } = useDemo();
  const retry = useRetry();
  const toast = useToast();
  const action = useAction();
  const broken = state.scenarios.dataState === 'error' || settings.googleCalendar === 'error';
  const status = broken ? 'error' : settings.googleCalendar;
  const connect = (reconnect: boolean) => {
    void action.run(() => {
      dispatch({ type: 'update-mentor-settings', mentorId, patch: { googleCalendar: 'connected' } });
      if (state.scenarios.dataState === 'error') retry();
      toast.add({ title: reconnect ? 'Połączono ponownie' : 'Połączono z Google Calendar (symulacja)', description: 'Zajęte terminy z kalendarza będą automatycznie niedostępne.' });
    }, 900);
  };
  return (
    <section aria-labelledby="m3-google" className="flex flex-col gap-inline">
      <h2 id="m3-google" className="text-section-title font-semibold">Google Calendar</h2>
      <p className="text-body-dense text-text-muted">To symulacja — prototyp nie łączy się z Google i nie czyta Twojego kalendarza.</p>
      {status === 'error' ? (
        <Alert variant="danger" role="alert">
          <CircleX aria-hidden="true" />
          <AlertTitle>Synchronizacja przestała działać</AlertTitle>
          <AlertDescription>Nie widzimy Twoich zajętych terminów, więc mogą się nakładać na sesje. Połącz kalendarz ponownie.</AlertDescription>
        </Alert>
      ) : status === 'connected' ? (
        <p className="flex items-center gap-inline text-body"><CalendarCheck aria-hidden="true" className="size-icon-sm" />Połączono · zajęte terminy są automatycznie niedostępne</p>
      ) : (
        <p className="text-body">Nie połączono. Po połączeniu terminy zajęte w Google Calendar znikną z Twojej oferty.</p>
      )}
      <FailureAlert kind={action.failure} what="Nie udało się połączyć kalendarza" />
      <div>
        {status === 'connected' ? (
          <Button
            variant="outline"
            onClick={() => { dispatch({ type: 'update-mentor-settings', mentorId, patch: { googleCalendar: 'off' } }); toast.add({ title: 'Rozłączono Google Calendar' }); }}
          >
            Rozłącz
          </Button>
        ) : (
          <Button variant={status === 'error' ? 'default' : 'outline'} loading={action.busy} onClick={() => { connect(status === 'error'); }}>
            {status === 'error' ? 'Połącz ponownie' : 'Połącz z Google Calendar'}
          </Button>
        )}
      </div>
    </section>
  );
}
