import { Clock } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';
import { cn } from '../lib/utils';

export interface TrialRequestCardProps extends React.ComponentProps<'div'> {
  studentName: string;
  studentInitials: string;
  avatarUrl?: string;
  goal: string;
  requestedDateTime: string; // e.g. "Środa, 26 listopada 2026, 17:30"
  hoursLeftToRespond: number;
  onAccept?: () => void;
  onReject?: () => void;
}

export function TrialRequestCard({
  studentName,
  studentInitials,
  avatarUrl,
  goal,
  requestedDateTime,
  hoursLeftToRespond,
  onAccept,
  onReject,
  className,
  ...props
}: TrialRequestCardProps) {
  const isUrgent = hoursLeftToRespond <= 4;

  return (
    <Card
      className={cn('w-full border-border-divider bg-surface-panel p-panel', className)}
      {...props}
    >
      <CardContent className="flex flex-col gap-group p-0">
        <div className="flex flex-col gap-group sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-group">
            <Avatar size="md" className="shrink-0">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={studentName} /> : null}
              <AvatarFallback>{studentInitials}</AvatarFallback>
            </Avatar>
            <div className="space-y-tight">
              <div className="flex items-center gap-inline">
                <h3 className="text-body font-medium text-text-default">{studentName}</h3>
                <Badge variant="warning">Nowa prośba 30 min</Badge>
              </div>
              <p className="text-meta text-text-muted">
                Proponowany termin:{' '}
                <strong className="font-normal text-text-default tabular-nums">
                  {requestedDateTime}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-tight text-meta tabular-nums">
            <Clock
              className={cn('size-icon-sm', isUrgent ? 'text-status-danger-fg' : 'text-text-muted')}
            />
            <span
              className={cn(isUrgent ? 'text-status-danger-fg font-medium' : 'text-text-muted')}
            >
              Odpowiedz w ciągu: {hoursLeftToRespond} h
            </span>
          </div>
        </div>

        <div className="rounded-control bg-surface-sunken p-panel">
          <p className="text-meta font-medium text-text-muted">Cel sesji zgłoszony przez ucznia:</p>
          <p className="text-body-dense text-text-default mt-tight">{goal}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-inline border-t border-border-divider pt-group">
          {onReject ? (
            <Button variant="outline" size="sm" onClick={onReject}>
              Odrzuć z powodem
            </Button>
          ) : null}
          {onAccept ? (
            <Button size="sm" onClick={onAccept}>
              Zaakceptuj prośbę
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
