/** U7 building blocks: star input, tag selector, continue choice, submitted summary. */
import {
  Button,
  Checkbox,
  FieldError,
  FieldLegend,
  FieldSet,
  Link,
  RadioGroup,
  RadioGroupItem,
} from '@kompas/ui';
import { Star } from 'lucide-react';
import { useId } from 'react';
import type { Booking, Review } from '../data/accounts';
import type { Mentor } from '../data/mentors';
import { REVIEW_TAGS } from '../data/progress';
import { href } from '../lib/router';

const RATING_WORDS = ['słabo', 'poniżej oczekiwań', 'w porządku', 'dobrze', 'świetnie'];

// DS-GAP: StarInput (KONCEPCJA §U7 „StarRating”) — RadioGroup, one radio per rating; the stars
// are decoration, the number and word are the accessible label.
export function StarInput({
  value,
  error,
  onChange,
}: {
  value: number;
  error: string | null;
  onChange: (rating: number) => void;
}) {
  return (
    <FieldSet data-invalid={error ? true : undefined}>
      <FieldLegend variant="label">Ocena (wymagana)</FieldLegend>
      <RadioGroup
        aria-label="Ocena sesji"
        className="gap-group sm:flex-row sm:flex-wrap"
        value={value === 0 ? '' : String(value)}
        onValueChange={(next) => {
          onChange(Number(next));
        }}
      >
        {RATING_WORDS.map((word, index) => {
          const rating = index + 1;
          return (
            <label key={word} className="flex items-center gap-inline text-body">
              <RadioGroupItem value={String(rating)} aria-invalid={error ? true : undefined} />
              <span className="flex flex-col">
                <span className="flex" aria-hidden="true">
                  {RATING_WORDS.map((_, star) => (
                    <Star
                      key={RATING_WORDS[star]}
                      className={`size-icon-md ${star < rating ? 'fill-current text-status-warning-fg' : 'text-text-muted'}`}
                    />
                  ))}
                </span>
                <span className="text-meta text-text-muted">
                  {rating} — {word}
                </span>
              </span>
            </label>
          );
        })}
      </RadioGroup>
      {error ? <FieldError>{error}</FieldError> : null}
    </FieldSet>
  );
}

// DS-GAP: TagSelector (KONCEPCJA §U7) — a Checkbox per tag; ToggleGroup is a joined segmented
// control and does not wrap five long labels.
export function TagSelector({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const id = useId();
  return (
    <FieldSet>
      <FieldLegend variant="label">Co wyróżniało tę sesję? (opcjonalnie)</FieldLegend>
      <ul className="flex flex-col gap-inline">
        {REVIEW_TAGS.map((tag, index) => (
          <li key={tag} className="flex items-center gap-inline">
            <Checkbox
              id={`${id}-${String(index)}`}
              checked={value.includes(tag)}
              onCheckedChange={(checked) => {
                onChange(checked ? [...value, tag] : value.filter((t) => t !== tag));
              }}
            />
            <label htmlFor={`${id}-${String(index)}`} className="text-body">
              {tag}
            </label>
          </li>
        ))}
      </ul>
    </FieldSet>
  );
}

export type Next = 'continue' | 'swap';

// DS-GAP: ContinueChoice (KONCEPCJA §U7) — RadioGroup with a description under each option.
export function ContinueChoice({
  mentor,
  value,
  onChange,
}: {
  mentor: Mentor;
  value: Next;
  onChange: (next: Next) => void;
}) {
  return (
    <FieldSet>
      <FieldLegend variant="label">Co dalej?</FieldLegend>
      <RadioGroup
        value={value}
        onValueChange={(next) => {
          onChange(next as Next);
        }}
      >
        <label className="flex items-start gap-inline text-body">
          <RadioGroupItem value="continue" />
          <span className="flex flex-col">
            <span className="font-medium">Kontynuuję z mentorem: {mentor.name}</span>
            <span className="text-body-dense text-text-muted">Wybierzesz plan — ile sesji tygodniowo.</span>
          </span>
        </label>
        <label className="flex items-start gap-inline text-body">
          <RadioGroupItem value="swap" />
          <span className="flex flex-col">
            <span className="font-medium">Chcę spróbować z innym mentorem</span>
            <span className="text-body-dense text-text-muted">Kolejna sesja próbna na nasz koszt (darmowa zamiana).</span>
          </span>
        </label>
      </RadioGroup>
    </FieldSet>
  );
}

export function Summary({
  review,
  mentor,
  booking,
  editable,
  onEdit,
}: {
  review: Review;
  mentor: Mentor;
  booking: Booking;
  editable: boolean;
  onEdit: () => void;
}) {
  return (
    <section aria-labelledby="u7-summary" className="flex flex-col gap-group">
      <h2 id="u7-summary" className="text-section-title font-semibold">Dziękujemy za ocenę</h2>
      <dl className="flex flex-col gap-group">
        <div className="flex flex-col gap-tight">
          <dt className="text-meta text-text-muted">Twoja ocena</dt>
          <dd className="text-body font-medium">
            {review.rating} / 5 — {RATING_WORDS[review.rating - 1]}
          </dd>
        </div>
        {review.tags.length > 0 ? (
          <div className="flex flex-col gap-tight">
            <dt className="text-meta text-text-muted">Tagi</dt>
            <dd className="text-body">{review.tags.join(', ')}</dd>
          </div>
        ) : null}
        {review.publicText ? (
          <div className="flex flex-col gap-tight">
            <dt className="text-meta text-text-muted">Opinia publiczna</dt>
            <dd className="max-w-measure text-body">{review.publicText}</dd>
          </div>
        ) : null}
        {review.privateText ? (
          <div className="flex flex-col gap-tight">
            <dt className="text-meta text-text-muted">Uwaga tylko dla mentora</dt>
            <dd className="max-w-measure text-body">{review.privateText}</dd>
          </div>
        ) : null}
      </dl>
      {booking.replacementRequested ? (
        <p className="text-body">Zamiana mentora jest zgłoszona — kolejna sesja próbna na nasz koszt.</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-group">
        {booking.type === 'trial' && !booking.replacementRequested ? (
          <Link href={href(`/plany?mentor=${mentor.id}`)}>Wybierz plan z mentorem: {mentor.name}</Link>
        ) : null}
        {booking.replacementRequested ? <Link href={href('/mentorzy')}>Znajdź innego mentora</Link> : null}
        <Link href={href('/postepy')}>Zobacz swoje postępy</Link>
        <Link href={href(`/sesje/${booking.id}`)}>Szczegóły sesji</Link>
        {editable ? (
          <Button variant="outline" onClick={onEdit}>
            Edytuj ocenę
          </Button>
        ) : (
          <p className="text-body-dense text-text-muted">Ocenę można edytować do 7 dni po sesji.</p>
        )}
      </div>
    </section>
  );
}
