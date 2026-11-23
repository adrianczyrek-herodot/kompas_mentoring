import { ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import type * as React from 'react';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { cn } from '../lib/utils';
import { type AvailabilityRuleView, weekdayLabel } from './availability-editor.logic';
import { DateTime } from './date-time';
import { dateKeyInZone, noonInstant, weekDates, weekRangeLabel } from './week-calendar.logic';

export interface WeekSessionView {
  readonly id: string;
  readonly title: string;
  /** ISO instant. */
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: 'requested' | 'scheduled';
  /** Outside availability — M3 shows „poza dostępnością — przełóż lub odwołaj” (Q11). */
  readonly outsideAvailability?: boolean;
}

export interface WeekExceptionView {
  readonly id: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly kind: 'off' | 'extra';
  readonly note?: string | null;
}

export interface WeekCalendarProps extends Omit<React.ComponentProps<'section'>, 'children'> {
  /** ISO Monday date `YYYY-MM-DD` in the mentor's zone. */
  readonly weekStart: string;
  /** IANA zone, signed next to the grid. */
  readonly timeZone: string;
  readonly rules: readonly AvailabilityRuleView[];
  readonly exceptions?: readonly WeekExceptionView[];
  readonly sessions?: readonly WeekSessionView[];
  readonly onPreviousWeek?: () => void;
  readonly onNextWeek?: () => void;
  readonly canGoPrevious?: boolean;
  readonly canGoNext?: boolean;
  readonly readOnly?: boolean;
}

function NavButton({
  direction,
  onClick,
}: {
  direction: 'previous' | 'next';
  onClick?: (() => void) | undefined;
}) {
  const previous = direction === 'previous';
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={previous ? 'Poprzedni tydzień' : 'Następny tydzień'}
      onClick={onClick}
    >
      {previous ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
    </Button>
  );
}

function WeekNav({
  weekStart,
  timeZone,
  onPreviousWeek,
  onNextWeek,
  canGoPrevious,
  canGoNext,
}: {
  weekStart: string;
  timeZone: string;
  onPreviousWeek?: (() => void) | undefined;
  onNextWeek?: (() => void) | undefined;
  canGoPrevious: boolean;
  canGoNext: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-inline">
      <div className="flex items-center gap-inline">
        {canGoPrevious ? <NavButton direction="previous" onClick={onPreviousWeek} /> : null}
        <h2 className="text-section-title font-semibold text-text-default tabular-nums">
          {weekRangeLabel(weekStart)}
        </h2>
        {canGoNext ? <NavButton direction="next" onClick={onNextWeek} /> : null}
      </div>
      <p className="text-meta text-text-muted">Godziny w strefie: {timeZone}</p>
    </div>
  );
}

function AvailabilityBlock({ rule }: { rule: AvailabilityRuleView }) {
  return (
    <li className="rounded-tag border border-selected-border bg-selected-bg px-inline py-tight text-meta text-text-link tabular-nums">
      {rule.startLocal}–{rule.endLocal}
    </li>
  );
}

function ExceptionBlock({
  exception,
  timeZone,
}: {
  exception: WeekExceptionView;
  timeZone: string;
}) {
  const off = exception.kind === 'off';
  return (
    <div
      className={cn(
        'flex flex-col gap-tight rounded-tag border px-inline py-tight text-meta',
        off
          ? 'border-status-danger-fg bg-status-danger-bg text-status-danger-fg'
          : 'border-status-success-fg bg-status-success-bg text-status-success-fg',
      )}
    >
      <span className="font-medium">{off ? 'Urlop / blokada' : 'Dodatkowe godziny'}</span>
      <span className="tabular-nums">
        <DateTime value={exception.startsAt} timeZone={timeZone} format="time" />–
        <DateTime value={exception.endsAt} timeZone={timeZone} format="time" />
      </span>
      {exception.note ? <span className="text-text-default">{exception.note}</span> : null}
    </div>
  );
}

function SessionCard({ session, timeZone }: { session: WeekSessionView; timeZone: string }) {
  const scheduled = session.status === 'scheduled';
  return (
    <div className="flex flex-col gap-tight rounded-control border border-border-control bg-surface-panel px-inline py-tight">
      <div className="flex items-center justify-between gap-tight">
        <span className="text-meta text-text-muted tabular-nums">
          <DateTime value={session.startsAt} timeZone={timeZone} format="time" />–
          <DateTime value={session.endsAt} timeZone={timeZone} format="time" />
        </span>
        <Badge variant={scheduled ? 'success' : 'warning'}>
          {scheduled ? 'Zaplanowana' : 'Prośba'}
        </Badge>
      </div>
      <span className="text-label text-text-default">{session.title}</span>
      {session.outsideAvailability ? (
        <span className="flex items-center gap-tight text-meta text-status-warning-fg">
          <TriangleAlert aria-hidden="true" className="size-icon-sm" />
          Poza dostępnością — przełóż lub odwołaj
        </span>
      ) : null}
    </div>
  );
}

function DayAvailability({
  rules,
  weekday,
}: {
  rules: readonly AvailabilityRuleView[];
  weekday: number;
}) {
  const dayRules = rules.filter((rule) => rule.weekday === weekday);
  if (dayRules.length === 0) {
    return <p className="text-meta text-text-muted">Brak dostępności</p>;
  }
  return (
    <ul className="flex list-none flex-col gap-tight">
      {dayRules.map((rule) => (
        <AvailabilityBlock key={`${rule.weekday}-${rule.startLocal}`} rule={rule} />
      ))}
    </ul>
  );
}

function DayItems({
  date,
  timeZone,
  exceptions,
  sessions,
}: {
  date: string;
  timeZone: string;
  exceptions: readonly WeekExceptionView[];
  sessions: readonly WeekSessionView[];
}) {
  const dayExceptions = exceptions.filter(
    (item) => dateKeyInZone(item.startsAt, timeZone) === date,
  );
  const daySessions = sessions
    .filter((item) => dateKeyInZone(item.startsAt, timeZone) === date)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return (
    <>
      {dayExceptions.map((item) => (
        <ExceptionBlock key={item.id} exception={item} timeZone={timeZone} />
      ))}
      {daySessions.map((item) => (
        <SessionCard key={item.id} session={item} timeZone={timeZone} />
      ))}
    </>
  );
}

function DayColumn({
  date,
  weekday,
  timeZone,
  rules,
  exceptions,
  sessions,
}: {
  date: string;
  weekday: number;
  timeZone: string;
  rules: readonly AvailabilityRuleView[];
  exceptions: readonly WeekExceptionView[];
  sessions: readonly WeekSessionView[];
}) {
  return (
    <section
      aria-label={weekdayLabel(weekday)}
      className="flex flex-col gap-inline rounded-panel border border-border-divider p-group"
    >
      <header className="flex items-baseline justify-between gap-tight">
        <h3 className="text-label font-medium text-text-default">{weekdayLabel(weekday)}</h3>
        <DateTime
          value={noonInstant(date)}
          timeZone={timeZone}
          format="weekday"
          className="text-meta text-text-muted"
        />
      </header>
      <DayAvailability rules={rules} weekday={weekday} />
      <DayItems date={date} timeZone={timeZone} exceptions={exceptions} sessions={sessions} />
    </section>
  );
}

function WeekGrid({ dates, timeZone, rules, exceptions, sessions }: WeekGridProps) {
  return (
    <div className="flex flex-col gap-group">
      {rules.length === 0 ? (
        <p className="text-body-dense text-text-muted">
          Brak dostępności w tym tygodniu. Ustaw szablon, żeby uczniowie mogli rezerwować.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-group md:grid-cols-7 md:gap-inline">
        {dates.map((date, index) => (
          <DayColumn
            key={date}
            date={date}
            weekday={index + 1}
            timeZone={timeZone}
            rules={rules}
            exceptions={exceptions}
            sessions={sessions}
          />
        ))}
      </div>
    </div>
  );
}

type WeekGridProps = {
  dates: readonly string[];
  timeZone: string;
  rules: readonly AvailabilityRuleView[];
  exceptions: readonly WeekExceptionView[];
  sessions: readonly WeekSessionView[];
};

// Week view (M3): the mentor's sessions and availability side by side, zone signed next to the
// grid. Sessions outside availability carry the Q11 warning.
function WeekCalendar({
  weekStart,
  timeZone,
  rules,
  exceptions = [],
  sessions = [],
  onPreviousWeek,
  onNextWeek,
  canGoPrevious = true,
  canGoNext = true,
  readOnly = false,
  className,
  ...props
}: WeekCalendarProps) {
  return (
    <section
      data-slot="week-calendar"
      aria-label={`Tydzień ${weekRangeLabel(weekStart)}`}
      className={cn('flex flex-col gap-group', className)}
      {...props}
    >
      <WeekNav
        weekStart={weekStart}
        timeZone={timeZone}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
        canGoPrevious={canGoPrevious && !readOnly}
        canGoNext={canGoNext && !readOnly}
      />
      <WeekGrid
        dates={weekDates(weekStart)}
        timeZone={timeZone}
        rules={rules}
        exceptions={exceptions}
        sessions={sessions}
      />
    </section>
  );
}

export { WeekCalendar };
