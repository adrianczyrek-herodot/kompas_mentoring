import { CircleCheck, CircleDot, CircleX, Clock, MessageSquareWarning, UserX } from 'lucide-react';
import type * as React from 'react';
import { Badge, type BadgeProps } from '../components/badge';

/** Booking states from KONCEPCJA §U5 plus `requested` (trial waiting for the mentor, §M2). */
type BookingStatus =
  | 'requested'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'disputed';

const statusConfig: Record<
  BookingStatus,
  { label: string; variant: NonNullable<BadgeProps['variant']>; Icon: typeof Clock }
> = {
  requested: { label: 'Oczekuje na mentora', variant: 'warning', Icon: Clock },
  scheduled: { label: 'Potwierdzona', variant: 'success', Icon: CircleCheck },
  in_progress: { label: 'W trakcie', variant: 'success', Icon: CircleDot },
  completed: { label: 'Zakończona', variant: 'neutral', Icon: CircleCheck },
  cancelled: { label: 'Anulowana', variant: 'danger', Icon: CircleX },
  no_show: { label: 'Nieobecność', variant: 'danger', Icon: UserX },
  disputed: { label: 'Zgłoszony problem', variant: 'warning', Icon: MessageSquareWarning },
};

type BookingStatusBadgeProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  status: BookingStatus;
};

// Status always as icon + word, never colour alone (WCAG 1.4.1).
function BookingStatusBadge({ status, ...props }: BookingStatusBadgeProps) {
  const { label, variant, Icon } = statusConfig[status];
  return (
    <Badge variant={variant} data-status={status} {...props}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}

export { type BookingStatus, BookingStatusBadge, type BookingStatusBadgeProps };
