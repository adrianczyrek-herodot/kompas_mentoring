import { Clock, TimerOff } from 'lucide-react';
import type * as React from 'react';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../components/alert';
import { Button } from '../components/button';
import { formatDateTime } from '../lib/format';
import { cn } from '../lib/utils';

type HoldCountdownProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** Seconds until the hold expires; the screen ticks it from `expiresAt` and its Clock. */
  secondsLeft: number;
  /** Hold expiry instant (ISO) — shown as a clock time, not only as a countdown. */
  expiresAt: string;
  timeZone: string;
  /** Expired: go back to U1 with the same mentor (KONCEPCJA §U2 Er). */
  onChooseAgain?: () => void;
};

const WARNING_FROM = 120;

function announcement(secondsLeft: number) {
  if (secondsLeft <= 0) return '';
  if (secondsLeft <= 60) return 'Została minuta blokady terminu.';
  if (secondsLeft <= WARNING_FROM) return 'Zostały 2 minuty blokady terminu.';
  return '';
}

// The only countdown allowed in Kompas (A02 exception): the 10-minute hold on a chosen slot
// (KONCEPCJA §U1/U2, E3-S4). Calm by default; amber with an icon only in the last 2 minutes.
// Screen readers get two announcements (2 min, 1 min) instead of every second (WCAG 2.2.1, 4.1.3).
function HoldCountdown({
  secondsLeft,
  expiresAt,
  timeZone,
  onChooseAgain,
  className,
  ...props
}: HoldCountdownProps) {
  if (secondsLeft <= 0) {
    return (
      <Alert variant="warning" role="alert" className={className} {...props}>
        <TimerOff aria-hidden="true" />
        <AlertTitle>Blokada terminu wygasła</AlertTitle>
        <AlertDescription>
          Termin mógł zająć ktoś inny. Wybierz go ponownie — wybrany mentor zostaje.
        </AlertDescription>
        {onChooseAgain ? (
          <AlertAction>
            <Button variant="outline" onClick={onChooseAgain}>
              Wybierz termin ponownie
            </Button>
          </AlertAction>
        ) : null}
      </Alert>
    );
  }

  const warning = secondsLeft <= WARNING_FROM;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div
      data-slot="hold-countdown"
      data-warning={warning || undefined}
      className={cn(
        'flex items-center justify-between gap-group rounded-panel border px-panel py-group',
        warning
          ? 'border-status-warning-fg bg-status-warning-bg'
          : 'border-border-divider bg-surface-panel',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-inline">
        <Clock
          aria-hidden="true"
          className={cn(
            'mt-tight size-icon-sm shrink-0',
            warning ? 'text-status-warning-fg' : 'text-text-muted',
          )}
        />
        <p className="text-body-dense text-text-default">
          Trzymamy ten termin dla Ciebie do{' '}
          <span className="font-medium tabular-nums">
            {formatDateTime(expiresAt, timeZone, 'time')}
          </span>
          .
        </p>
      </div>
      <p
        role="timer"
        aria-live="off"
        aria-label="Pozostały czas blokady"
        className={cn(
          'text-section-title font-semibold tabular-nums',
          warning ? 'text-status-warning-fg' : 'text-text-default',
        )}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
      <p aria-live="polite" className="sr-only">
        {announcement(secondsLeft)}
      </p>
    </div>
  );
}

export { HoldCountdown, type HoldCountdownProps };
