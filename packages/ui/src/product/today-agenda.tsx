import { CalendarCheck } from 'lucide-react';
import * as React from 'react';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { Skeleton } from '../components/skeleton';
import { cn } from '../lib/utils';
import { DateTime } from './date-time';
import type { SessionSummary } from './session-list-item';

type AgendaItem = SessionSummary & {
  /** Room is open (start − 10 min … end) — from the domain. */
  joinOpen: boolean;
};

type TodayAgendaProps = Omit<React.ComponentProps<'section'>, 'children'> & {
  status?: 'ready' | 'loading' | 'error';
  items: AgendaItem[];
  timeZone: string;
  onJoin?: (item: AgendaItem) => void;
  /** Per-section retry (KONCEPCJA §M2 Er). */
  onRetry?: () => void;
  /** Action of the empty state, e.g. Link to M3 calendar. */
  emptyAction?: React.ReactNode;
  headingAs?: 'h2' | 'h3';
};

// Today's sessions in M2 (KONCEPCJA §M2 TodayAgenda): time, student, goal; „Dołącz” only on the
// session whose room is open — at most one primary action at a time (R01.6).
function TodayAgenda({
  status = 'ready',
  items,
  timeZone,
  onJoin,
  onRetry,
  emptyAction,
  headingAs: Heading = 'h2',
  className,
  ...props
}: TodayAgendaProps) {
  const headingId = React.useId();
  return (
    <section
      data-slot="today-agenda"
      aria-labelledby={headingId}
      aria-busy={status === 'loading' || undefined}
      className={cn('flex flex-col gap-inline', className)}
      {...props}
    >
      <Heading id={headingId} className="text-section-title font-semibold text-text-default">
        Dzisiaj
      </Heading>
      {status === 'loading' ? (
        <ul aria-hidden="true">
          {[0, 1, 2].map((row) => (
            <li key={row} className="flex gap-group border-b border-border-divider py-row-y">
              <Skeleton className="h-lh w-1/6" />
              <Skeleton className="h-lh flex-1" />
            </li>
          ))}
        </ul>
      ) : status === 'error' ? (
        <ErrorState
          titleAs="p"
          className="py-group"
          title="Nie udało się wczytać dzisiejszych sesji"
          description="Pozostałe sekcje panelu działają. Spróbuj wczytać tę jeszcze raz."
          action={
            <Button variant="outline" onClick={onRetry}>
              Ponów
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          titleAs="p"
          className="py-group"
          icon={<CalendarCheck />}
          title="Brak sesji dzisiaj"
          description="Nowe rezerwacje pojawią się tutaj. Im więcej wolnych godzin w kalendarzu, tym więcej terminów do wyboru mają uczniowie."
          action={emptyAction}
        />
      ) : (
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-inline border-b border-border-divider py-row-y md:flex-row md:items-center md:gap-group"
            >
              <p className="text-label font-medium text-text-default tabular-nums md:w-1/6">
                <DateTime value={item.startsAt} timeZone={timeZone} format="time" />
                <span className="font-normal text-text-muted"> · {item.durationMin} min</span>
              </p>
              <div className="flex min-w-0 flex-1 flex-col gap-tight">
                <p className="text-body-dense font-medium text-text-default">
                  {item.withName}
                  <span className="font-normal text-text-muted">
                    {' '}
                    · {item.type === 'trial' ? 'Sesja próbna' : 'Plan'}
                  </span>
                </p>
                <p className="line-clamp-2 text-body-dense text-text-muted">{item.goal}</p>
              </div>
              {item.joinOpen ? (
                <Button onClick={() => onJoin?.(item)}>Dołącz do sesji</Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export { type AgendaItem, TodayAgenda, type TodayAgendaProps };
