/** U9 building blocks: goal form, goal card with milestones, action items, session notes timeline. */
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  DateTime,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  formatCount,
  Input,
  Link,
  Textarea,
  useToast,
} from '@kompas/ui';
import { type SyntheticEvent, useId, useState } from 'react';
import type { ActionItem, Booking, StudentId } from '../data/accounts';
import { mentorById } from '../data/mentors';
import type { Goal } from '../data/progress';
import { toMs, TZ } from '../lib/clock';
import { href } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo } from '../state/demo-context';
import { calendarDate } from './u8-parts';

const GOAL_MIN = 10;
const GOAL_MAX = 200;

type GoalErrors = { text?: string | undefined; date?: string | undefined };

/** `YYYY-MM-DD` of the demo „now” in the viewer zone. */
function today(now: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(toMs(now));
}

// DS-GAP: DatePicker — @kompas/ui has none; the DS Input with type „date” stands in.
export function GoalForm({ studentId, goal, onDone }: { studentId: StudentId; goal?: Goal | undefined; onDone?: () => void }) {
  const { dispatch, now } = useDemo();
  const toast = useToast();
  const action = useAction();
  const textId = useId();
  const dateId = useId();
  const [text, setText] = useState(goal?.text ?? '');
  const [date, setDate] = useState(goal?.targetDate ?? '');
  const [errors, setErrors] = useState<GoalErrors>({});
  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    const length = text.trim().length;
    const found: GoalErrors = {};
    if (length < GOAL_MIN || length > GOAL_MAX) {
      found.text = length === 0 ? 'Opisz cel — co chcesz osiągnąć.' : `Cel ma mieć ${String(GOAL_MIN)}–${String(GOAL_MAX)} znaków.`;
    }
    if (date && date <= today(now)) found.date = 'Termin musi być w przyszłości.';
    setErrors(found);
    if (found.text || found.date) return;
    void action.run(() => {
      dispatch({ type: 'set-goal', studentId, text: text.trim(), ...(date ? { targetDate: date } : {}) });
      toast.add({ title: 'Cel zapisany', type: 'success' });
      onDone?.();
    });
  };
  return (
    <form noValidate onSubmit={submit} className="flex max-w-form flex-col gap-group">
      <FailureAlert kind={action.failure} what="Nie zapisaliśmy celu" />
      <Field data-invalid={errors.text ? true : undefined}>
        <FieldLabel htmlFor={textId}>Mój cel</FieldLabel>
        <Textarea
          id={textId}
          rows={3}
          maxLength={GOAL_MAX}
          showCount
          value={text}
          aria-invalid={errors.text ? true : undefined}
          placeholder="np. Pierwsza praca jako frontend developer do marca 2027"
          onChange={(event) => { setText(event.target.value); setErrors((e) => ({ ...e, text: undefined })); }}
        />
        {errors.text ? <FieldError>{errors.text}</FieldError> : null}
      </Field>
      <Field data-invalid={errors.date ? true : undefined}>
        <FieldLabel htmlFor={dateId}>Termin (opcjonalnie)</FieldLabel>
        <Input
          id={dateId}
          type="date"
          value={date}
          aria-invalid={errors.date ? true : undefined}
          onChange={(event) => { setDate(event.target.value); setErrors((e) => ({ ...e, date: undefined })); }}
        />
        {errors.date ? <FieldError>{errors.date}</FieldError> : null}
        <FieldDescription>Data, do której chcesz osiągnąć cel — musi być przyszła.</FieldDescription>
      </Field>
      <div className="flex flex-wrap gap-inline">
        <Button type="submit" loading={action.busy}>Zapisz cel</Button>
        {onDone ? <Button type="button" variant="ghost" disabled={action.busy} onClick={onDone}>Anuluj</Button> : null}
      </div>
    </form>
  );
}

// DS-GAP: ProgressBar — no Progress component in @kompas/ui; track and fill from surface tokens.
function ProgressBar({ done, total }: { done: number; total: number }) {
  const percent = Math.round((done / total) * 100);
  return (
    <div className="flex flex-col gap-tight">
      <div
        role="progressbar"
        aria-label="Kamienie milowe"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${String(done)} z ${String(total)} kamieni milowych`}
        className="h-inline overflow-hidden rounded-round bg-surface-sunken"
      >
        <div className="h-full bg-action-primary" style={{ width: `${String(percent)}%` }} />
      </div>
      <p className="text-meta text-text-muted">
        {done} z {total} kamieni milowych
      </p>
    </div>
  );
}

// DS-GAP: GoalCard + MilestoneList (KONCEPCJA §U9) — Card with a Checkbox per milestone.
export function GoalCard({ studentId, goal }: { studentId: StudentId; goal: Goal }) {
  const { dispatch } = useDemo();
  const action = useAction();
  const id = useId();
  const [editing, setEditing] = useState(false);
  const done = goal.milestones.filter((m) => m.done).length;
  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Zmień cel</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalForm studentId={studentId} goal={goal} onDone={() => { setEditing(false); }} />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardDescription>Mój cel</CardDescription>
        <CardTitle>{goal.text}</CardTitle>
        {goal.targetDate ? <CardDescription>Termin: {calendarDate(goal.targetDate)}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-group">
        {goal.milestones.length > 0 ? (
          <>
            <ProgressBar done={done} total={goal.milestones.length} />
            <ul aria-label="Kamienie milowe" className="flex flex-col gap-inline">
              {goal.milestones.map((milestone, index) => (
                <li key={milestone.text} className="flex items-center gap-inline">
                  <Checkbox
                    id={`${id}-${String(index)}`}
                    checked={milestone.done}
                    disabled={action.busy}
                    onCheckedChange={() => { void action.run(() => { dispatch({ type: 'toggle-milestone', studentId, index }); }, 250); }}
                  />
                  <label htmlFor={`${id}-${String(index)}`} className="text-body">{milestone.text}</label>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-body text-text-muted">Kamienie milowe ustalisz z mentorem na sesji — pojawią się tutaj.</p>
        )}
        <FailureAlert kind={action.failure} what="Nie zapisaliśmy zmiany" />
        <div>
          <Button variant="outline" onClick={() => { setEditing(true); }}>Zmień cel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

type TaskRow = { booking: Booking; item: ActionItem; index: number };

// DS-GAP: ActionItemChecklist (KONCEPCJA §U9) — Checkbox list grouped under the session date.
export function ActionItemChecklist({ rows }: { rows: TaskRow[] }) {
  const { dispatch } = useDemo();
  const action = useAction();
  const id = useId();
  return (
    <section aria-labelledby={`${id}-h`} className="flex flex-col gap-group">
      <h2 id={`${id}-h`} className="text-section-title font-semibold">Zadania od mentorów</h2>
      {rows.length === 0 ? (
        <p className="text-body text-text-muted">Brak zadań. Mentor doda je w notatce po sesji.</p>
      ) : (
        <ul className="flex flex-col gap-inline">
          {rows.map(({ booking, item, index }) => (
            <li key={`${booking.id}-${String(index)}`} className="flex items-start gap-inline">
              <Checkbox
                id={`${id}-${booking.id}-${String(index)}`}
                checked={item.done}
                disabled={action.busy}
                onCheckedChange={() => { void action.run(() => { dispatch({ type: 'toggle-action-item', bookingId: booking.id, index }); }, 250); }}
              />
              <label htmlFor={`${id}-${booking.id}-${String(index)}`} className="flex flex-col text-body">
                {item.text}
                <span className="text-meta text-text-muted">
                  {mentorById(booking.mentorId)?.name ?? 'Mentor'}, <DateTime value={booking.startsAt} timeZone={TZ} format="weekday" />
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <FailureAlert kind={action.failure} what="Nie zapisaliśmy zmiany" />
    </section>
  );
}

// DS-GAP: SessionNotesTimeline (KONCEPCJA §U9) — ordered list, newest session first.
export function SessionNotesTimeline({ bookings }: { bookings: Booking[] }) {
  return (
    <section aria-labelledby="u9-notes" className="flex flex-col gap-group">
      <h2 id="u9-notes" className="text-section-title font-semibold">Notatki z sesji</h2>
      {bookings.length === 0 ? (
        <p className="text-body text-text-muted">Notatki mentora pojawią się tu po pierwszej sesji.</p>
      ) : (
        <ol className="flex flex-col gap-group border-l border-border-divider pl-group">
          {bookings.map((booking) => (
            <li key={booking.id} className="flex flex-col gap-tight">
              <p className="text-label font-medium">
                <Link href={href(`/sesje/${booking.id}`)}>
                  <DateTime value={booking.startsAt} timeZone={TZ} format="date" />, {mentorById(booking.mentorId)?.name ?? 'Mentor'}
                </Link>
              </p>
              <p className="max-w-measure text-body">{booking.note}</p>
              <p className="text-meta text-text-muted">{formatCount(booking.actionItems?.length ?? 0, { one: 'zadanie', few: 'zadania', many: 'zadań' })} z tej sesji</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
