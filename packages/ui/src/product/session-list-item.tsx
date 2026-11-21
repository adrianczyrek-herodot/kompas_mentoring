import type * as React from 'react';
import { Avatar, AvatarFallback } from '../components/avatar';
import { Link } from '../components/link';
import { Skeleton } from '../components/skeleton';
import { initialsOf } from '../lib/format';
import { cn } from '../lib/utils';
import { type BookingStatus, BookingStatusBadge } from './booking-status-badge';
import { DateTime } from './date-time';

/** One booking as seen in U4 (student) or M2 (mentor) lists. */
type SessionSummary = {
  id: string;
  startsAt: string;
  durationMin: 30 | 60;
  type: 'trial' | 'plan';
  status: BookingStatus;
  /** The other person: mentor for a student, student for a mentor. */
  withName: string;
  /** Goal from the booking („Z czym przychodzisz?”). */
  goal: string;
};

type SessionListItemProps = Omit<React.ComponentProps<'li'>, 'children'> & {
  session: SessionSummary;
  timeZone: string;
  /** U5 URL. */
  href: string;
  linkRender?: React.ReactElement;
  /** Optional quick action (secondary), e.g. „Przełóż” — KONCEPCJA §U4. */
  action?: React.ReactNode;
};

// Row of a session list: time first (what users scan for), then who, goal and status (R01.1, R01.4).
// Rendered as <li>; wrap rows in <ul>.
function SessionListItem({
  session,
  timeZone,
  href,
  linkRender,
  action,
  className,
  ...props
}: SessionListItemProps) {
  return (
    <li
      data-slot="session-list-item"
      className={cn(
        'flex flex-col gap-inline border-b border-border-divider py-row-y md:flex-row md:items-center md:gap-group',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col md:w-1/5 md:shrink-0">
        <DateTime
          value={session.startsAt}
          timeZone={timeZone}
          format="weekday"
          className="text-label font-medium text-text-default"
        />
        <span className="text-meta text-text-muted tabular-nums">
          <DateTime value={session.startsAt} timeZone={timeZone} format="time" /> ·{' '}
          {session.durationMin} min
        </span>
      </div>
      <div className="flex min-w-0 flex-1 items-start gap-inline">
        <Avatar size="sm">
          <AvatarFallback>{initialsOf(session.withName)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-tight">
          <p className="text-body-dense font-medium text-text-default">
            <Link href={href} render={linkRender} className="text-text-default">
              {session.withName}
            </Link>
            <span className="font-normal text-text-muted">
              {' '}
              · {session.type === 'trial' ? 'Sesja próbna' : 'Plan'}
            </span>
          </p>
          <p className="line-clamp-2 text-body-dense text-text-muted">{session.goal}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-inline md:justify-end">
        <BookingStatusBadge status={session.status} />
        {action}
      </div>
    </li>
  );
}

function SessionListItemSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="flex flex-col gap-inline border-b border-border-divider py-row-y md:flex-row md:gap-group"
    >
      <Skeleton className="h-lh w-1/3 md:w-1/5" />
      <div className="flex flex-1 gap-inline">
        <Skeleton className="size-avatar-sm rounded-round" />
        <div className="flex flex-1 flex-col gap-tight">
          <Skeleton className="h-lh w-1/2" />
          <Skeleton className="h-lh w-3/4" />
        </div>
      </div>
    </li>
  );
}

export { SessionListItem, type SessionListItemProps, SessionListItemSkeleton, type SessionSummary };
