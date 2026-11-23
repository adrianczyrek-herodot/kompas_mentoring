import { BadgeCheck } from 'lucide-react';
import type * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { initialsOf } from '../lib/format';
import { cn } from '../lib/utils';
import type { MentorSummary } from './mentor-card';

type MentorSummaryBarProps = Omit<React.ComponentProps<'section'>, 'children'> & {
  /** The mentor of the booking flow (U1/U2); only what the summary needs. */
  mentor: Pick<MentorSummary, 'name' | 'headline' | 'photoUrl' | 'verified'>;
  /** Q12: the mentor's own zone, shown so the grid is never ambiguous. */
  timeZone?: string;
  /** Human label of the zone, e.g. „Europa/Warszawa”. */
  timeZoneLabel?: string;
  /** Optional trailing action, e.g. a link to the profile. */
  action?: React.ReactNode;
};

// The mentor header of U1/U2 (MentorSummaryBar): avatar, name, headline and the mentor's zone.
// Deliberately quiet — the slot grid is the focus of the screen.
function MentorSummaryBar({
  mentor,
  timeZone,
  timeZoneLabel,
  action,
  className,
  ...props
}: MentorSummaryBarProps) {
  return (
    <section
      data-slot="mentor-summary-bar"
      className={cn(
        'flex flex-wrap items-center gap-group border-b border-border-divider pb-group',
        className,
      )}
      {...props}
    >
      <Avatar size="md">
        {mentor.photoUrl ? <AvatarImage src={mentor.photoUrl} alt="" /> : null}
        <AvatarFallback>{initialsOf(mentor.name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-tight">
        <p className="flex items-center gap-inline text-body font-semibold text-text-default">
          <span className="truncate">{mentor.name}</span>
          {mentor.verified ? (
            <BadgeCheck
              role="img"
              aria-label="Profil zweryfikowany"
              className="size-icon-sm shrink-0 text-text-link"
            />
          ) : null}
        </p>
        <p className="truncate text-body-dense text-text-muted">{mentor.headline}</p>
        {timeZone ? (
          <p className="text-body-dense text-text-muted">
            Strefa mentora: {timeZoneLabel ? `${timeZoneLabel} ` : ''}
            <span className="tabular-nums">{timeZone}</span>
          </p>
        ) : null}
      </div>
      {action}
    </section>
  );
}

export { MentorSummaryBar, type MentorSummaryBarProps };
