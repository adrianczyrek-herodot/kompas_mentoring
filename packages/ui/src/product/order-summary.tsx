import type * as React from 'react';
import { cn } from '../lib/utils';
import { DateTime } from './date-time';
import { Money } from './money';

type OrderSummaryProps = Omit<React.ComponentProps<'dl'>, 'children'> & {
  mentorName: string;
  type: 'trial' | 'plan';
  startsAt: string;
  endsAt: string;
  timeZone: string;
  durationMinutes: 30 | 60;
  /** Trial or session price in minor units; `null` when the mentor has no rate yet (F4 shows it). */
  price?: bigint | null;
  /** Extra rows, e.g. the payment method F4 adds without changing this component. */
  children?: React.ReactNode;
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-baseline justify-between gap-group border-b border-border-divider py-tight last:border-b-0">
    <dt className="text-body-dense text-text-muted">{label}</dt>
    <dd className="text-body text-text-default">{children}</dd>
  </div>
);

// U2 „Podsumowanie rezerwacji”: who, when (in the viewer's zone), how long and for how much.
// F4 adds the payment method by passing another row as a child.
function OrderSummary({
  mentorName,
  type,
  startsAt,
  endsAt,
  timeZone,
  durationMinutes,
  price = null,
  children,
  className,
  ...props
}: OrderSummaryProps) {
  return (
    <dl data-slot="order-summary" className={cn('flex flex-col', className)} {...props}>
      <Row label="Mentor">{mentorName}</Row>
      <Row label="Termin">
        <DateTime value={startsAt} timeZone={timeZone} /> –{' '}
        <DateTime value={endsAt} timeZone={timeZone} format="time" />{' '}
        <span className="text-body-dense text-text-muted">({timeZone})</span>
      </Row>
      <Row label="Rodzaj sesji">{type === 'trial' ? 'Sesja próbna' : 'Kolejna sesja'}</Row>
      <Row label="Długość">{durationMinutes} minut</Row>
      <Row label="Cena">
        {price === null ? (
          <span className="text-text-muted">Cena pojawi się po uruchomieniu płatności</span>
        ) : (
          <Money amount={price} />
        )}
      </Row>
      {children}
    </dl>
  );
}

export { OrderSummary, type OrderSummaryProps };
