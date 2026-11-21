import * as React from 'react';
import { Button } from '../components/button';
import { Skeleton } from '../components/skeleton';
import { cn } from '../lib/utils';

export interface Slot {
  id: string;
  time: string; // e.g. "17:00"
  available: boolean;
}

export interface DaySlots {
  date: string; // e.g. "2026-11-25"
  dayName: string; // e.g. "Wtorek, 25 lis"
  slots: Slot[];
}

export interface SlotGridProps extends React.ComponentProps<'div'> {
  days: DaySlots[];
  selectedSlotId?: string;
  onSlotSelect?: (slot: Slot, day: DaySlots) => void;
  timezone?: string;
}

export function SlotGrid({
  days,
  selectedSlotId,
  onSlotSelect,
  timezone = 'Europe/Warsaw',
  className,
  ...props
}: SlotGridProps) {
  return (
    <div className={cn('w-full space-y-group', className)} {...props}>
      <div className="flex items-center justify-between text-meta text-text-muted">
        <span>Dostępne godziny w Twojej strefie ({timezone}):</span>
      </div>

      <div className="grid grid-cols-1 gap-group sm:grid-cols-3">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex flex-col gap-tight rounded-panel border border-border-divider bg-surface-panel p-panel"
          >
            <h4 className="border-b border-border-divider pb-tight text-center text-label font-medium text-text-default">
              {day.dayName}
            </h4>
            <div className="grid grid-cols-2 gap-inline pt-tight">
              {day.slots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                return (
                  <Button
                    key={slot.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => onSlotSelect?.(slot, day)}
                    className={cn(
                      'tabular-nums',
                      isSelected &&
                        'border-selected-border bg-selected-bg text-text-link hover:bg-selected-bg hover:text-text-link',
                    )}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SlotGridSkeleton() {
  return (
    <div className="w-full space-y-group" aria-busy="true">
      <Skeleton className="h-4 w-60 rounded-control" />
      <div className="grid grid-cols-1 gap-group sm:grid-cols-3">
        {[1, 2, 3].map((col) => (
          <div
            key={col}
            className="space-y-tight rounded-panel border border-border-divider p-panel"
          >
            <Skeleton className="h-5 w-full rounded-control" />
            <div className="grid grid-cols-2 gap-inline pt-tight">
              {[1, 2, 3, 4].map((slot) => (
                <Skeleton key={slot} className="h-8 w-full rounded-control" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
