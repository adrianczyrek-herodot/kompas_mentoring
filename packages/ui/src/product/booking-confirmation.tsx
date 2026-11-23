import { CalendarPlus, CheckCircle2, Clock } from 'lucide-react';
import type * as React from 'react';
import { buttonVariants } from '../components/button';
import { cn } from '../lib/utils';
import { DateTime } from './date-time';

type BookingConfirmationProps = Omit<React.ComponentProps<'section'>, 'children'> & {
  /** U3: a trial waits for the mentor; a later session is already confirmed (requirement 6). */
  status: 'requested' | 'scheduled';
  startsAt: string;
  endsAt: string;
  timeZone: string;
  /** Q14: the mentor's answer deadline of a trial request. */
  acceptDeadlineAt?: string | null;
  /** `GET /bookings/{id}/ics`; when given, the „Dodaj do kalendarza” link appears. */
  icsHref?: string;
  /** Session details (U5); rendered only when the caller passes it. */
  detailsHref?: string;
};

// U3: the minimal confirmation — status, term and the calendar file. No confetti, no exclamation
// marks (design system): the calm tone matches the rest of the booking flow.
function BookingConfirmation({
  status,
  startsAt,
  endsAt,
  timeZone,
  acceptDeadlineAt,
  icsHref,
  detailsHref,
  className,
  ...props
}: BookingConfirmationProps) {
  const requested = status === 'requested';
  const Icon = requested ? Clock : CheckCircle2;
  return (
    <section
      data-slot="booking-confirmation"
      className={cn('flex flex-col gap-group', className)}
      {...props}
    >
      <Icon aria-hidden="true" className="size-icon-lg text-text-link" />
      <h2 className="text-section-title text-text-default">
        {requested ? 'Prośba wysłana — mentor odpowie' : 'Sesja umówiona'}
      </h2>
      <p className="max-w-measure text-body text-text-default">
        {requested && acceptDeadlineAt ? (
          <>
            Odpowiedź spodziewaj się do <DateTime value={acceptDeadlineAt} timeZone={timeZone} />.
            Jeśli mentor nie odpowie w tym czasie, potwierdzimy sesję automatycznie.
          </>
        ) : (
          'Termin jest zarezerwowany. Dodaj go do swojego kalendarza, żeby go nie przegapić.'
        )}
      </p>
      <p className="text-body text-text-default">
        <DateTime value={startsAt} timeZone={timeZone} /> –{' '}
        <DateTime value={endsAt} timeZone={timeZone} format="time" />{' '}
        <span className="text-body-dense text-text-muted">({timeZone})</span>
      </p>
      <div className="flex flex-wrap items-center gap-inline">
        {icsHref ? (
          <a href={icsHref} download className={buttonVariants({ variant: 'default' })}>
            <CalendarPlus aria-hidden="true" />
            Dodaj do kalendarza
          </a>
        ) : null}
        {detailsHref ? (
          <a href={detailsHref} className={buttonVariants({ variant: 'outline' })}>
            Zobacz szczegóły sesji
          </a>
        ) : null}
      </div>
    </section>
  );
}

export { BookingConfirmation, type BookingConfirmationProps };
