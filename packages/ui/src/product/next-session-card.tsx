import { Video } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback } from '../components/avatar';
import { Button } from '../components/button';
import { formatDateTime, initialsOf } from '../lib/format';
import { cn } from '../lib/utils';
import { DateTime } from './date-time';
import type { SessionSummary } from './session-list-item';

type NextSessionCardProps = Omit<React.ComponentProps<'section'>, 'children'> & {
  session: SessionSummary;
  timeZone: string;
  /** Room opens 10 min before start (KONCEPCJA §U4, §U6) — decided by the domain, not the UI. */
  joinOpen: boolean;
  /** Instant from which „Dołącz” works (start − 10 min), ISO. */
  joinFrom: string;
  onJoin?: () => void;
  /** Secondary actions, e.g. Link „Szczegóły sesji”. */
  secondary?: React.ReactNode;
  headingAs?: 'h2' | 'h3';
};

// The nearest session on top of U4: the one panel with a primary action („Dołącz”, R01.6).
// Before the room opens the button is disabled and the time it opens is written next to it (D2).
function NextSessionCard({
  session,
  timeZone,
  joinOpen,
  joinFrom,
  onJoin,
  secondary,
  headingAs: Heading = 'h2',
  className,
  ...props
}: NextSessionCardProps) {
  const headingId = React.useId();
  const reasonId = React.useId();
  return (
    <section
      data-slot="next-session-card"
      aria-labelledby={headingId}
      className={cn(
        'flex flex-col gap-group rounded-panel border border-border-divider bg-surface-panel p-panel',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-tight">
        <Heading id={headingId} className="text-label font-medium text-text-muted">
          Najbliższa sesja
        </Heading>
        <p className="text-section-title font-semibold text-text-default">
          <DateTime value={session.startsAt} timeZone={timeZone} /> · {session.durationMin} min
        </p>
      </div>
      <div className="flex items-start gap-inline">
        <Avatar size="md">
          <AvatarFallback>{initialsOf(session.withName)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-tight">
          <p className="text-body font-medium text-text-default">
            {session.withName}
            <span className="font-normal text-text-muted">
              {' '}
              · {session.type === 'trial' ? 'Sesja próbna' : 'Plan'}
            </span>
          </p>
          <p className="max-w-measure text-body-dense text-text-muted">{session.goal}</p>
        </div>
      </div>
      <div className="flex flex-col gap-inline md:flex-row md:items-center">
        <Button
          disabled={!joinOpen}
          focusableWhenDisabled
          onClick={onJoin}
          aria-describedby={joinOpen ? undefined : reasonId}
        >
          <Video aria-hidden="true" />
          Dołącz do sesji
        </Button>
        {joinOpen ? null : (
          <p id={reasonId} className="text-body-dense text-text-muted">
            Pokój otworzy się o {formatDateTime(joinFrom, timeZone, 'time')}, 10 minut przed
            startem.
          </p>
        )}
        {secondary}
      </div>
    </section>
  );
}

export { NextSessionCard, type NextSessionCardProps };
