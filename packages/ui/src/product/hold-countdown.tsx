import { AlertTriangle, Clock } from 'lucide-react';
import * as React from 'react';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../components/alert';
import { Button } from '../components/button';
import { cn } from '../lib/utils';

export interface HoldCountdownProps extends React.ComponentProps<'div'> {
  secondsLeft: number;
  onRenew?: () => void;
  onExpire?: () => void;
}

export function HoldCountdown({
  secondsLeft,
  onRenew,
  onExpire,
  className,
  ...props
}: HoldCountdownProps) {
  const isExpired = secondsLeft <= 0;
  const isWarning = secondsLeft > 0 && secondsLeft <= 120; // ostatnie 2 minuty

  const minutes = Math.floor(Math.max(0, secondsLeft) / 60);
  const seconds = Math.max(0, secondsLeft) % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  React.useEffect(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  if (isExpired) {
    return (
      <Alert variant="danger" role="alert" className={className}>
        <AlertTriangle className="size-icon-sm" />
        <AlertTitle>Czas blokady terminu minął</AlertTitle>
        <AlertDescription>
          Ten termin został zwolniony i może zostać zarezerwowany przez innego ucznia.
        </AlertDescription>
        {onRenew ? (
          <AlertAction>
            <Button size="sm" onClick={onRenew}>
              Wybierz termin ponownie
            </Button>
          </AlertAction>
        ) : null}
      </Alert>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-group rounded-panel border p-panel',
        isWarning
          ? 'border-status-warning-fg bg-status-warning-bg'
          : 'border-border-divider bg-surface-panel',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-inline">
        <Clock
          className={cn(
            'size-icon-sm shrink-0',
            isWarning ? 'text-status-warning-fg' : 'text-text-muted',
          )}
        />
        <div className="space-y-tight">
          <p className="text-label font-medium text-text-default">
            Termin zarezerwowany na czas dokończenia zapisu
          </p>
          <p className="text-meta text-text-muted">
            Nikt inny nie może wybrać tej godziny przez najbliższe minuty.
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-meta text-text-muted block">Pozostały czas:</span>
        <span
          className={cn(
            'text-section-title font-medium tabular-nums',
            isWarning ? 'text-status-warning-fg font-semibold' : 'text-text-default',
          )}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
