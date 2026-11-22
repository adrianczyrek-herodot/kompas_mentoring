/** M4 · szczegóły ucznia: cel, historia sesji, edytor notatki po sesji, prywatna notatka (KONCEPCJA §M4). */
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DateTime,
  ErrorState,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  formatCount,
  initialsOf,
  Input,
  Link,
  PageHeader,
  Skeleton,
  Textarea,
  useToast,
} from '@kompas/ui';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { type SyntheticEvent, useId, useState } from 'react';
import { type ActionItem, type Booking, STUDENT_NAMES } from '../data/accounts';
import { KASIA_STUDENTS, type MentorStudent } from '../data/mentor-work';
import { TZ, warsawIso } from '../lib/clock';
import { href, navigate } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo, useRetry } from '../state/demo-context';
import { findThreadId } from '../state/world';

export const STATUS_LABEL: Record<MentorStudent['status'], { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Aktywny', variant: 'success' },
  trial: { label: 'Próbny', variant: 'warning' },
  inactive: { label: 'Nieaktywny', variant: 'neutral' },
};

type PlanLike = { studentId: string; mentorId: string; perWeek: number; durationMin: number; status: string };

/** Plan of a student: the live subscription when there is one, otherwise the label of the data. */
export function planOf(student: MentorStudent, subscriptions: PlanLike[], mentorId: string): string {
  const sub = subscriptions.find((s) => s.studentId === student.studentId && s.mentorId === mentorId && s.status !== 'cancelled');
  return sub ? `${String(sub.perWeek)}×${String(sub.durationMin)} min / tydz.` : student.planLabel;
}

const SESSION_FORMS = { one: 'sesja', few: 'sesje', many: 'sesji' };

type Task = { key: number; text: string; due: string };
type NoteErrors = { covered?: string | undefined; tasks: Record<number, string> };

function dueIso(date: string): string {
  const [year = 0, month = 0, day = 0] = date.split('-').map(Number);
  return warsawIso(year, month, day, 23);
}

function SessionNoteEditor({ booking, student }: { booking: Booking; student: string }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const id = useId();
  const [covered, setCovered] = useState('');
  const [next, setNext] = useState('');
  const [tasks, setTasks] = useState<Task[]>([{ key: 0, text: '', due: '' }]);
  const [nextKey, setNextKey] = useState(1);
  const [errors, setErrors] = useState<NoteErrors>({ tasks: {} });

  const patchTask = (key: number, patch: Partial<Task>) => {
    setTasks((list) => list.map((t) => (t.key === key ? { ...t, ...patch } : t)));
  };

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    const found: NoteErrors = { tasks: {} };
    const length = covered.trim().length;
    if (length < 20 || length > 3000) found.covered = `Opisz, co omówiliście, w 20–3000 znakach (teraz ${String(length)}).`;
    for (const t of tasks) {
      const size = t.text.trim().length;
      if (size === 0 && t.due) found.tasks[t.key] = 'Wpisz treść zadania albo usuń termin.';
      else if (size > 0 && (size < 3 || size > 200)) found.tasks[t.key] = `Zadanie ma mieć 3–200 znaków (teraz ${String(size)}).`;
    }
    setErrors(found);
    if (found.covered || Object.keys(found.tasks).length > 0) return;
    const items: ActionItem[] = tasks
      .filter((t) => t.text.trim())
      .map((t) => ({ text: t.text.trim(), done: false, ...(t.due ? { dueAt: dueIso(t.due) } : {}) }));
    const note = next.trim() ? `${covered.trim()}\n\nNa następną sesję: ${next.trim()}` : covered.trim();
    void action.run(() => {
      dispatch({ type: 'add-session-note', bookingId: booking.id, note, actionItems: items });
      toast.add({ title: 'Notatka wysłana uczniowi', description: items.length > 0 ? `${student} dostaje notatkę i ${formatCount(items.length, { one: 'zadanie', few: 'zadania', many: 'zadań' })}.` : `${student} dostaje notatkę.` });
    });
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-group">
      <Field data-invalid={errors.covered ? true : undefined}>
        <FieldLabel htmlFor={`${id}-covered`}>Co omówiliśmy</FieldLabel>
        <Textarea
          id={`${id}-covered`}
          rows={4}
          maxLength={3000}
          showCount
          value={covered}
          aria-invalid={errors.covered ? true : undefined}
          aria-describedby={errors.covered ? `${id}-covered-error` : undefined}
          placeholder="np. Rozdzielenie logiki formularza od prezentacji…"
          onChange={(e) => { setCovered(e.target.value); }}
        />
        {errors.covered ? <FieldError id={`${id}-covered-error`}>{errors.covered}</FieldError> : null}
      </Field>
      <fieldset className="flex flex-col gap-inline">
        <legend className="mb-inline text-label font-medium text-text-default">Zadania dla ucznia</legend>
        {tasks.map((t, index) => (
          <Field key={t.key} data-invalid={errors.tasks[t.key] ? true : undefined}>
            <div className="flex flex-col gap-inline md:flex-row md:items-center">
              <Input
                aria-label={`Zadanie ${String(index + 1)}`}
                value={t.text}
                maxLength={200}
                placeholder="np. Dodaj testy do walidacji"
                aria-invalid={errors.tasks[t.key] ? true : undefined}
                onChange={(e) => { patchTask(t.key, { text: e.target.value }); }}
              />
              {/* DS-GAP: DatePicker — the DS has none; a plain date field of the DS Input. */}
              <Input
                type="date"
                aria-label={`Termin zadania ${String(index + 1)} (opcjonalny)`}
                className="md:w-48"
                value={t.due}
                onChange={(e) => { patchTask(t.key, { due: e.target.value }); }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Usuń zadanie ${String(index + 1)}`}
                disabled={tasks.length === 1 && !t.text && !t.due}
                onClick={() => { setTasks((list) => (list.length === 1 ? [{ key: nextKey, text: '', due: '' }] : list.filter((x) => x.key !== t.key))); setNextKey((k) => k + 1); }}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
            {errors.tasks[t.key] ? <FieldError>{errors.tasks[t.key]}</FieldError> : null}
          </Field>
        ))}
        <Button type="button" variant="link" className="self-start" onClick={() => { setTasks((list) => [...list, { key: nextKey, text: '', due: '' }]); setNextKey((k) => k + 1); }}>
          <Plus aria-hidden="true" />
          Dodaj zadanie
        </Button>
      </fieldset>
      <Field>
        <FieldLabel htmlFor={`${id}-next`}>Na następną sesję <span className="font-normal text-text-muted">(opcjonalnie)</span></FieldLabel>
        <Textarea id={`${id}-next`} rows={2} maxLength={500} value={next} onChange={(e) => { setNext(e.target.value); }} />
      </Field>
      <FailureAlert kind={action.failure} what="Notatka nie została wysłana" />
      <div>
        <Button type="submit" loading={action.busy}>Wyślij notatkę uczniowi</Button>
      </div>
    </form>
  );
}

function NoteSection({ booking, student }: { booking: Booking | undefined; student: string }) {
  if (!booking) {
    return <p className="text-body text-text-muted">Wszystkie zakończone sesje mają notatkę — nic do uzupełnienia.</p>;
  }
  return (
    <section aria-labelledby="m4-note" className="flex flex-col gap-group">
      <h2 id="m4-note" className="text-section-title font-semibold">
        Notatka po sesji · <DateTime value={booking.startsAt} timeZone={TZ} format="date" />
      </h2>
      <p className="text-body-dense text-text-muted">Sesja: {booking.goal}. Uczeń zobaczy notatkę i zadania w swoich postępach.</p>
      <SessionNoteEditor key={booking.id} booking={booking} student={student} />
    </section>
  );
}

function History({ past }: { past: Booking[] }) {
  return (
    <section aria-labelledby="m4-history" className="flex flex-col gap-inline">
      <h2 id="m4-history" className="text-section-title font-semibold">Historia sesji</h2>
      {past.length === 0 ? (
        <p className="text-body text-text-muted">Brak odbytych sesji.</p>
      ) : (
        <ol>
          {past.map((b) => (
            <li key={b.id} className="flex flex-col gap-tight border-b border-border-divider py-row-y">
              <p className="text-body-dense font-medium">
                <DateTime value={b.startsAt} timeZone={TZ} format="date" />
                <span className="font-normal text-text-muted"> · {b.type === 'trial' ? 'Sesja próbna' : 'Plan'} · {b.durationMin} min · {b.goal}</span>
              </p>
              {b.note ? <p className="max-w-measure text-body-dense">{b.note}</p> : <p className="text-body-dense text-text-muted">Brak notatki.</p>}
              {b.actionItems?.length ? (
                <ul aria-label="Zadania z sesji" className="flex flex-col gap-tight text-body-dense text-text-muted">
                  {b.actionItems.map((item) => (
                    <li key={item.text}>
                      {item.done ? 'Zrobione' : 'Do zrobienia'}: {item.text}
                      {item.dueAt ? <> (termin: <DateTime value={item.dueAt} timeZone={TZ} format="date" />)</> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function PrivateNote({ studentId }: { studentId: MentorStudent['studentId'] }) {
  const { state, dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const id = useId();
  const saved = state.world.mentorNotes[studentId] ?? '';
  const [text, setText] = useState(saved);
  return (
    <section aria-labelledby={`${id}-h`} className="flex flex-col gap-inline md:w-1/3">
      <h2 id={`${id}-h`} className="text-section-title font-semibold">Prywatna notatka</h2>
      <Field>
        <FieldLabel htmlFor={id}>Widzisz tylko Ty</FieldLabel>
        <Textarea id={id} rows={6} maxLength={2000} showCount value={text} onChange={(e) => { setText(e.target.value); }} />
        <FieldDescription>Uczeń jej nie zobaczy i nie dostaje powiadomienia.</FieldDescription>
      </Field>
      <FailureAlert kind={action.failure} what="Notatka nie została zapisana" />
      <div>
        <Button
          variant="outline"
          loading={action.busy}
          disabled={text === saved}
          onClick={() =>
            void action.run(() => {
              dispatch({ type: 'set-mentor-note', studentId, text });
              toast.add({ title: 'Zapisano prywatną notatkę' });
            })
          }
        >
          Zapisz notatkę
        </Button>
      </div>
    </section>
  );
}

export function M4StudentDetail({ studentId }: { studentId: string }) {
  const { state, dispatch, account } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  const mentorId = account.mentorId ?? 'm1';
  const student = KASIA_STUDENTS.find((s) => s.studentId === studentId);
  if (status === 'loading') {
    return (
      <div aria-busy="true" className="flex flex-col gap-group">
        <p className="sr-only">Wczytujemy ucznia…</p>
        <Skeleton className="h-lh w-1/2 text-page-title" />
        <Skeleton className="h-lh w-2/3" />
        <Skeleton className="h-control-lg w-full" />
      </div>
    );
  }
  if (status === 'error') {
    return <ErrorState titleAs="h1" title="Nie udało się wczytać ucznia" description="Sprawdź połączenie i spróbuj ponownie." action={<Button variant="outline" onClick={retry}>Ponów</Button>} />;
  }
  if (!student || status === 'empty') {
    return <ErrorState titleAs="h1" title="Nie znaleźliśmy tego ucznia" description="Ucznia nie ma na Twojej liście albo adres jest błędny." action={<Link href={href('/mentor/uczniowie')}>Wróć do uczniów</Link>} />;
  }
  const name = STUDENT_NAMES[student.studentId];
  const badge = STATUS_LABEL[student.status];
  const goal = state.world.goals[student.studentId];
  const balance = state.balances[student.studentId][mentorId] ?? 0;
  const past = state.bookings
    .filter((b) => b.mentorId === mentorId && b.studentId === student.studentId && b.status === 'completed')
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const needsNote = past.find((b) => !b.note);
  return (
    <div className="flex flex-col gap-section">
      <Link href={href('/mentor/uczniowie')}>← Uczniowie</Link>
      <PageHeader
        title={name}
        actions={
          <Button
            variant="outline"
            onClick={() => {
              dispatch({ type: 'open-thread', studentId: student.studentId, mentorId });
              navigate(`/wiadomosci/${findThreadId(state.world, student.studentId, mentorId)}`);
            }}
          >
            <MessageSquare aria-hidden="true" />
            Napisz
          </Button>
        }
      />
      <div className="flex items-start gap-inline">
        <Avatar size="md"><AvatarFallback>{initialsOf(name)}</AvatarFallback></Avatar>
        <dl className="flex flex-col gap-inline">
          <div className="flex flex-col gap-tight">
            <dt className="text-meta text-text-muted">Cel</dt>
            <dd className="max-w-measure text-body">
              {goal?.text ?? student.goal}
              {goal?.targetDate ? <span className="text-text-muted"> · do <DateTime value={`${goal.targetDate}T12:00:00+01:00`} timeZone={TZ} format="date" /></span> : null}
            </dd>
          </div>
          <div className="flex flex-wrap items-center gap-inline text-body-dense">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            <span>Plan: {planOf(student, state.world.subscriptions, mentorId)}</span>
            <span>· saldo: {formatCount(balance, SESSION_FORMS)}</span>
            <span>· razem {formatCount(student.sessionsCount, SESSION_FORMS)}</span>
          </div>
        </dl>
      </div>
      <div className="flex flex-col gap-section md:flex-row">
        <div className="flex flex-col gap-section md:flex-1">
          <NoteSection booking={needsNote} student={name} />
          <History past={past} />
        </div>
        <PrivateNote key={student.studentId} studentId={student.studentId} />
      </div>
    </div>
  );
}
