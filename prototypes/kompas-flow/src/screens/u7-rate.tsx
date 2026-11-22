/** U7 · Ocena sesji (KONCEPCJA §U7, F2). One review per session, editable for 7 days. */
import {
  Button,
  DateTime,
  ErrorState,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Link,
  PageHeader,
  Skeleton,
  Textarea,
  useToast,
} from '@kompas/ui';
import { type SyntheticEvent, useId, useState } from 'react';
import type { Booking, Review } from '../data/accounts';
import { type Mentor, mentorById } from '../data/mentors';
import { addMinutes, toMs, TZ } from '../lib/clock';
import { href, navigate, type Route } from '../lib/router';
import { FailureAlert, useAction } from '../shell/request-feedback';
import { useDemo, useRetry } from '../state/demo-context';
import { ContinueChoice, type Next, StarInput, Summary, TagSelector } from './u7-parts';

const EDIT_DAYS = 7;
const PUBLIC_MIN = 20;
const PUBLIC_MAX = 1000;
const PRIVATE_MAX = 500;

type Errors = { rating?: string; publicText?: string };

function validate(form: Review): Errors {
  const errors: Errors = {};
  const publicText = form.publicText.trim();
  if (form.rating === 0) errors.rating = 'Wybierz ocenę od 1 do 5.';
  if (publicText.length > 0 && publicText.length < PUBLIC_MIN) {
    errors.publicText = `Opinia publiczna: co najmniej ${String(PUBLIC_MIN)} znaków albo zostaw pole puste.`;
  } else if (form.rating > 0 && form.rating <= 2 && publicText.length === 0 && form.privateText.trim().length === 0) {
    // Rating 1–2 needs a reason, public or only for the mentor (KONCEPCJA §U7 „Walidacje”).
    errors.publicText = 'Przy ocenie 1–2 napisz, co poszło nie tak — w opinii publicznej albo w uwadze dla mentora.';
  }
  return errors;
}

function TextArea({
  label,
  description,
  value,
  max,
  rows,
  error,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  max: number;
  rows: number;
  error?: string | undefined;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        rows={rows}
        maxLength={max}
        showCount
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={(event) => { onChange(event.target.value); }}
      />
      {error ? <FieldError>{error}</FieldError> : null}
      <FieldDescription>{description}</FieldDescription>
    </Field>
  );
}

function ReviewForm({ booking, mentor, initial, onDone }: { booking: Booking; mentor: Mentor; initial: Review | null; onDone: () => void }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const action = useAction();
  const [form, setForm] = useState<Review>(initial ?? { rating: 0, tags: [], publicText: '', privateText: '' });
  const [next, setNext] = useState<Next>('continue');
  const [errors, setErrors] = useState<Errors>({});
  const choice = booking.type === 'trial' && !initial;
  const patch = (change: Partial<Review>, clear: keyof Errors) => {
    setForm((current) => ({ ...current, ...change }));
    setErrors((current) => ({ ...current, [clear]: undefined }));
  };

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const review: Review = { ...form, publicText: form.publicText.trim(), privateText: form.privateText.trim() };
    void action.run(() => {
      dispatch({ type: 'submit-review', id: booking.id, review, replacement: choice && next === 'swap' });
      toast.add({ title: initial ? 'Ocena zaktualizowana' : 'Dziękujemy za ocenę!', type: 'success' });
      if (!choice) onDone();
      else if (next === 'continue') navigate(`/plany?mentor=${mentor.id}`);
      else {
        toast.add({ title: 'Następna sesja próbna jest na nasz koszt', description: 'Wybierz innego mentora.' });
        navigate('/mentorzy');
      }
    });
  };

  return (
    <form noValidate onSubmit={submit} className="flex max-w-form flex-col gap-section">
      <FailureAlert kind={action.failure} what="Nie udało się zapisać oceny" />
      <StarInput value={form.rating} error={errors.rating ?? null} onChange={(rating) => { patch({ rating }, 'rating'); }} />
      <TagSelector value={form.tags} onChange={(tags) => { setForm((current) => ({ ...current, tags })); }} />
      <TextArea
        label="Opinia publiczna (opcjonalnie)"
        description={`Widoczna na profilu mentora. Zostaw puste albo napisz ${String(PUBLIC_MIN)}–${String(PUBLIC_MAX)} znaków.`}
        value={form.publicText}
        max={PUBLIC_MAX}
        rows={4}
        error={errors.publicText}
        onChange={(publicText) => { patch({ publicText }, 'publicText'); }}
      />
      <TextArea
        label="Uwaga tylko dla mentora (opcjonalnie)"
        description="Nie jest publiczna — przeczyta ją tylko mentor."
        value={form.privateText}
        max={PRIVATE_MAX}
        rows={3}
        onChange={(privateText) => { patch({ privateText }, 'publicText'); }}
      />
      {choice ? <ContinueChoice mentor={mentor} value={next} onChange={setNext} /> : null}
      <div className="flex flex-wrap items-center gap-group">
        <Button type="submit" loading={action.busy}>
          {initial ? 'Zapisz zmiany' : 'Wyślij ocenę'}
        </Button>
        {initial ? (
          <Button type="button" variant="ghost" disabled={action.busy} onClick={onDone}>
            Anuluj edycję
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Rate({ booking, mentor }: { booking: Booking; mentor: Mentor }) {
  const { now } = useDemo();
  const [editing, setEditing] = useState(false);
  const editable = toMs(now) < toMs(addMinutes(booking.startsAt, booking.durationMin + EDIT_DAYS * 24 * 60));
  const review = booking.review;
  return (
    <div className="flex flex-col gap-section">
      <PageHeader
        title={`Oceń sesję — ${mentor.name}`}
        description={`${booking.type === 'trial' ? 'Sesja próbna' : 'Sesja z planu'}, ${String(booking.durationMin)} min · cel: ${booking.goal}`}
        actions={<DateTime value={booking.startsAt} timeZone={TZ} className="text-body text-text-muted" />}
      />
      {booking.reviewed && !review ? (
        // Seed data: reviewed without stored answers (no summary to show).
        <p className="flex flex-col items-start gap-inline text-body">
          Ocena tej sesji została już wysłana. Dziękujemy!
          <Link href={href(`/sesje/${booking.id}`)}>Szczegóły sesji</Link>
        </p>
      ) : booking.reviewed && review && !editing ? (
        <Summary review={review} mentor={mentor} booking={booking} editable={editable} onEdit={() => { setEditing(true); }} />
      ) : (
        <ReviewForm
          booking={booking}
          mentor={mentor}
          initial={booking.reviewed && review ? review : null}
          onDone={() => { setEditing(false); }}
        />
      )}
    </div>
  );
}

export function U7Rate({ route }: { route: Route }) {
  const { state, myBookings } = useDemo();
  const retry = useRetry();
  const booking = myBookings.find((b) => b.id === route.params['id']);
  const mentor = mentorById(booking?.mentorId);
  const status = state.scenarios.dataState;
  if (status === 'loading') {
    return (
      <div aria-busy="true" className="flex flex-col gap-group">
        <p className="sr-only">Wczytujemy sesję…</p>
        <Skeleton className="h-lh w-1/2 text-page-title" />
        <Skeleton className="h-control w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (status === 'error') {
    return (
      <ErrorState
        titleAs="h1"
        title="Nie udało się wczytać sesji"
        description="Sprawdź połączenie i spróbuj ponownie."
        action={<Button variant="outline" onClick={retry}>Ponów</Button>}
      />
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
  if (booking.status !== 'completed') {
    return (
      <ErrorState
        titleAs="h1"
        title="Tę sesję można ocenić dopiero po jej zakończeniu"
        description="Ocenisz ją, gdy się odbędzie. Anulowanych sesji i nieobecności mentora się nie ocenia."
        action={<Link href={href(`/sesje/${booking.id}`)}>Szczegóły sesji</Link>}
      />
    );
  }
  return <Rate booking={booking} mentor={mentor} />;
}
