import { ChevronLeft, ChevronRight } from 'lucide-react';
import type * as React from 'react';
import { Button } from '../components/button';
import { cn } from '../lib/utils';

type WeekPickerProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The current week, e.g. „20–26 października”. */
  label: string;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  /** Q10: how far the booking horizon reaches, e.g. „Terminy do 15 grudnia”. */
  horizonLabel?: string;
};

// Week navigation of U1: one week at a time, never before today and never past the 8-week horizon.
function WeekPicker({
  label,
  canGoPrev = false,
  canGoNext = false,
  onPrev,
  onNext,
  horizonLabel,
  className,
  ...props
}: WeekPickerProps) {
  return (
    <div
      data-slot="week-picker"
      className={cn('flex items-center justify-between gap-inline', className)}
      {...props}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Poprzedni tydzień"
      >
        <ChevronLeft aria-hidden="true" />
      </Button>
      <div className="flex min-w-0 flex-col items-center text-center">
        <p aria-live="polite" className="text-body font-medium text-text-default">
          {label}
        </p>
        {horizonLabel ? <p className="text-body-dense text-text-muted">{horizonLabel}</p> : null}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Następny tydzień"
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  );
}

export { WeekPicker, type WeekPickerProps };
