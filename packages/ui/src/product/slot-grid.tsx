import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { Skeleton } from '../components/skeleton';
import { formatDateTime } from '../lib/format';
import { cn } from '../lib/utils';

type Slot = {
  id: string;
  /** Start instant (ISO). Shown in the viewer's zone. */
  startsAt: string;
};

type DaySlots = {
  /** Any instant on that day (ISO) — used for the day heading. */
  date: string;
  slots: Slot[];
};

type SlotGridProps = Omit<React.ComponentProps<'section'>, 'children' | 'onSelect'> & {
  /** `loading` → skeleton, `error` → ErrorState with retry (KONCEPCJA §U1 L/Er). */
  status?: 'ready' | 'loading' | 'error';
  days: DaySlots[];
  /** Viewer's IANA zone (brief rule 10); shown above the grid. */
  timeZone: string;
  /** Label of the zone, e.g. „Warszawa (GMT+2)”. Defaults to the IANA name. */
  timeZoneLabel?: string;
  /** Week range label, e.g. „20–26 października 2026”. */
  weekLabel: string;
  selectedSlotId?: string | undefined;
  onSelect?: (slot: Slot) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  /** False for the current week: booking in the past is impossible. */
  canGoPrev?: boolean;
  /** First free slot after this week (KONCEPCJA §U1, state E). */
  nextAvailable?: string | undefined;
  onJumpToNext?: () => void;
  onRetry?: () => void;
  /** Heading level of the week label. */
  headingAs?: 'h2' | 'h3';
};

// Week of free slots in the viewer's zone (U1, U5 reschedule). Slots are toggle buttons with
// aria-pressed; one can be selected (KONCEPCJA §U1). Selected = `selected-*` tokens (R04.2, K4).
function SlotGrid({
  status = 'ready',
  days,
  timeZone,
  timeZoneLabel,
  weekLabel,
  selectedSlotId,
  onSelect,
  onPrevWeek,
  onNextWeek,
  canGoPrev = true,
  nextAvailable,
  onJumpToNext,
  onRetry,
  headingAs: Heading = 'h2',
  className,
  ...props
}: SlotGridProps) {
  const headingId = React.useId();
  const isEmpty = days.every((day) => day.slots.length === 0);

  return (
    <section
      data-slot="slot-grid"
      aria-labelledby={headingId}
      aria-busy={status === 'loading' || undefined}
      className={cn('flex flex-col gap-group', className)}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-inline">
        <div className="flex items-center gap-inline">
          <Button
            variant="outline"
            size="icon"
            aria-label="Poprzedni tydzień"
            disabled={!canGoPrev}
            onClick={onPrevWeek}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Heading
            id={headingId}
            className="text-section-title font-semibold text-text-default tabular-nums"
          >
            {weekLabel}
          </Heading>
          <Button variant="outline" size="icon" aria-label="Następny tydzień" onClick={onNextWeek}>
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
        <p className="text-meta text-text-muted">
          Godziny w Twojej strefie: {timeZoneLabel ?? timeZone}
        </p>
      </div>

      {status === 'loading' ? (
        <SlotGridSkeleton />
      ) : status === 'error' ? (
        <ErrorState
          titleAs="p"
          title="Nie udało się wczytać terminów"
          description="Sprawdź połączenie i spróbuj ponownie. Wybrany mentor i tydzień zostaną zachowane."
          action={
            <Button variant="outline" onClick={onRetry}>
              Ponów
            </Button>
          }
        />
      ) : isEmpty ? (
        <EmptyState
          titleAs="p"
          title="Brak wolnych terminów w tym tygodniu"
          description={
            nextAvailable
              ? 'Mentor ma wolne terminy później. Przejdź do najbliższego.'
              : 'W najbliższych 14 dniach nie ma wolnych terminów. Napisz do mentora, by ustalić termin.'
          }
          action={
            nextAvailable ? (
              <Button variant="outline" onClick={onJumpToNext}>
                Następny wolny termin: {formatDateTime(nextAvailable, timeZone)}
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-group md:grid-cols-7 md:gap-inline">
          {days.map((day) => (
            <DayColumn
              key={day.date}
              day={day}
              timeZone={timeZone}
              selectedSlotId={selectedSlotId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DayColumn({
  day,
  timeZone,
  selectedSlotId,
  onSelect,
}: {
  day: DaySlots;
  timeZone: string;
  selectedSlotId: string | undefined;
  onSelect: ((slot: Slot) => void) | undefined;
}) {
  return (
    <fieldset className="flex flex-col gap-inline border-b border-border-divider pb-group md:border-b-0 md:pb-0">
      <legend className="pb-inline text-label font-medium text-text-default">
        {formatDateTime(day.date, timeZone, 'weekday')}
      </legend>
      {day.slots.length === 0 ? (
        <p className="text-meta text-text-muted">Brak terminów</p>
      ) : (
        <div className="flex flex-wrap gap-inline md:flex-col">
          {day.slots.map((slot) => {
            const selected = slot.id === selectedSlotId;
            return (
              <Button
                key={slot.id}
                variant="outline"
                aria-pressed={selected}
                onClick={() => onSelect?.(slot)}
                className="tabular-nums aria-pressed:border-selected-border aria-pressed:bg-selected-bg aria-pressed:text-text-link"
              >
                {formatDateTime(slot.startsAt, timeZone, 'time')}
              </Button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

function SlotGridSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-group md:grid-cols-7 md:gap-inline">
      {['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'].map((day) => (
        <div key={day} className="flex flex-col gap-inline">
          <Skeleton className="h-lh w-2/3" />
          <Skeleton className="h-control w-full" />
          <Skeleton className="h-control w-full" />
        </div>
      ))}
    </div>
  );
}

export { type DaySlots, type Slot, SlotGrid, type SlotGridProps, SlotGridSkeleton };
