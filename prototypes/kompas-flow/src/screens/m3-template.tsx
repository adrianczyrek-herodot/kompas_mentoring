/**
 * M3 weekly template editor (KONCEPCJA §M3 AvailabilityTemplateEditor). Saving is refused while a
 * session sits on an hour that is being removed: the error lists the sessions to move first (Er).
 */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  DateTime,
  FieldLegend,
  FieldSet,
  formatCount,
  Link,
  ToggleGroup,
  ToggleGroupItem,
  useToast,
} from '@kompas/ui';
import { CircleX } from 'lucide-react';
import { useState } from 'react';
import type { Booking } from '../data/accounts';
import type { Availability } from '../data/mentor-work';
import { toMs, TZ } from '../lib/clock';
import { href } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { isUpcoming } from '../state/booking-rules';
import { useDemo } from '../state/demo-context';
import { studentNameOf } from '../state/world';
import { weekdayOf } from './m2-parts';

export const DAY_NAMES = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
export const DAY_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
export const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);

const PARTS = [
  { label: 'rano', hours: HOURS.slice(0, 5) },
  { label: 'popołudnie', hours: HOURS.slice(5, 10) },
  { label: 'wieczór', hours: HOURS.slice(10) },
];

const hourFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: TZ });

/** Hour of day (0–23) of an instant in the demo time zone. */
export function hourOf(iso: string): number {
  return Number(hourFormat.format(toMs(iso)));
}

/** Comparable form of a template, independent of key and hour order. */
function signature(template: Availability): string {
  return JSON.stringify(DAY_NAMES.map((_, day) => [...(template[day] ?? [])].sort((a, b) => a - b)));
}

export function totalHours(template: Availability): number {
  return Object.values(template).reduce((sum, hours) => sum + hours.length, 0);
}

/** Upcoming sessions of the mentor that start inside the given (weekday, hour) cells. */
export function sessionsOn(bookings: Booking[], mentorId: string, cells: Set<string>, now: string): Booking[] {
  return bookings
    .filter((b) => b.mentorId === mentorId && isUpcoming(b, now) && cells.has(`${String(weekdayOf(b.startsAt))}-${String(hourOf(b.startsAt))}`))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function ConflictAlert({ title, sessions }: { title: string; sessions: Booking[] }) {
  const { state } = useDemo();
  return (
    <Alert variant="danger" role="alert">
      <CircleX aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>Najpierw trzeba przełożyć {formatCount(sessions.length, { one: 'tę sesję', few: 'te sesje', many: 'te sesje' })} — poproś ucznia o nowy termin w wiadomościach:</p>
        <ul className="flex flex-col gap-tight">
          {sessions.map((b) => (
            <li key={b.id}>
              <DateTime value={b.startsAt} timeZone={TZ} /> · {studentNameOf({ newStudentName: state.newStudentName }, b.studentId)} ·{' '}
              <Link href={href(`/mentor/uczniowie/${b.studentId}`)}>Zobacz ucznia</Link>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

// DS-GAP: WeeklyAvailabilityEditor (KONCEPCJA §M3, §M1 krok 5) — one ToggleGroup of hours per day part.
export function AvailabilityGrid({ value, onChange }: { value: Availability; onChange: (next: Availability) => void }) {
  const setPart = (weekday: number, part: number[], picked: number[]) => {
    const others = (value[weekday] ?? []).filter((h) => !part.includes(h));
    onChange({ ...value, [weekday]: [...others, ...picked].sort((a, b) => a - b) });
  };
  return (
    <div className="flex flex-col gap-group">
      {DAY_NAMES.map((name, weekday) => (
        <FieldSet key={name} className="gap-inline">
          <FieldLegend variant="label">{name}</FieldLegend>
          <div className="flex flex-wrap gap-inline">
            {PARTS.map((part) => (
              <ToggleGroup
                key={part.label}
                multiple
                className="max-w-full"
                aria-label={`${name}, ${part.label}`}
                value={part.hours.filter((h) => (value[weekday] ?? []).includes(h)).map(String)}
                onValueChange={(picked) => { setPart(weekday, part.hours, picked.map(Number)); }}
              >
                {part.hours.map((h) => (
                  <ToggleGroupItem key={h} value={String(h)} className="px-tight" aria-label={`${name} ${String(h)}:00`}>
                    {h}:00
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ))}
          </div>
        </FieldSet>
      ))}
    </div>
  );
}

export function TemplateEditor({ saved, mentorId }: { saved: Availability; mentorId: string }) {
  const { state, dispatch, now } = useDemo();
  const toast = useToast();
  const action = useAction();
  const [draft, setDraft] = useState<Availability>(saved);
  const [conflicts, setConflicts] = useState<Booking[]>([]);
  const dirty = signature(draft) !== signature(saved);

  const save = () => {
    const removed = new Set<string>();
    for (const [day, hours] of Object.entries(saved)) {
      for (const h of hours) if (!(draft[Number(day)] ?? []).includes(h)) removed.add(`${day}-${String(h)}`);
    }
    const blocking = sessionsOn(state.bookings, mentorId, removed, now);
    setConflicts(blocking);
    if (blocking.length > 0) return;
    void action.run(() => {
      dispatch({ type: 'update-mentor-settings', mentorId, patch: { template: draft } });
      toast.add({ title: 'Zapisano szablon dostępności', description: `${formatCount(totalHours(draft), { one: 'godzina', few: 'godziny', many: 'godzin' })} tygodniowo. Nowe terminy widzą uczniowie w profilu i przy rezerwacji.` });
    });
  };

  return (
    <section aria-labelledby="m3-template" className="flex flex-col gap-group">
      <div className="flex flex-col gap-tight">
        <h2 id="m3-template" className="text-section-title font-semibold">Szablon tygodniowy</h2>
        <p className="max-w-measure text-body-dense text-text-muted">
          Zaznacz godziny, od których uczniowie mogą rezerwować sesje (strefa Europe/Warsaw). Powtarza się co tydzień.
        </p>
      </div>
      {conflicts.length > 0 ? <ConflictAlert title="Nie można usunąć tej dostępności" sessions={conflicts} /> : null}
      <AvailabilityGrid value={draft} onChange={(next) => { setConflicts([]); setDraft(next); }} />
      <FailureAlert kind={action.failure} what="Szablon nie został zapisany" />
      <div className="flex flex-wrap items-center gap-inline">
        <Button loading={action.busy} disabled={!dirty} onClick={save}>Zapisz szablon</Button>
        <Button variant="ghost" disabled={!dirty || action.busy} onClick={() => { setDraft(saved); setConflicts([]); action.reset(); }}>Cofnij zmiany</Button>
        <p aria-live="polite" className="text-body-dense text-text-muted">
          {formatCount(totalHours(draft), { one: 'godzina', few: 'godziny', many: 'godzin' })} tygodniowo{dirty ? ' · niezapisane zmiany' : ''}
        </p>
      </div>
    </section>
  );
}
