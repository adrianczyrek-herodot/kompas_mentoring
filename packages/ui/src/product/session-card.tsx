import { Calendar, Video } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';
import { Skeleton } from '../components/skeleton';
import { cn } from '../lib/utils';

export type SessionStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface SessionCardProps extends React.ComponentProps<'div'> {
  participantName: string;
  participantRole: string; // e.g. "Mentor" or "Uczeń"
  participantInitials: string;
  avatarUrl?: string;
  topic: string;
  dateTime: string; // e.g. "Czwartek, 27 listopada 2026, 17:00 – 18:00"
  status: SessionStatus;
  isRoomReady?: boolean; // np. 15 min przed spotkaniem
  onJoinRoom?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}

export function SessionCard({
  participantName,
  participantRole,
  participantInitials,
  avatarUrl,
  topic,
  dateTime,
  status,
  isRoomReady = false,
  onJoinRoom,
  onReschedule,
  onCancel,
  className,
  ...props
}: SessionCardProps) {
  const statusBadge = {
    confirmed: <Badge variant="success">Potwierdzona</Badge>,
    pending: <Badge variant="warning">Oczekuje na akceptację</Badge>,
    completed: <Badge variant="neutral">Zakończona</Badge>,
    cancelled: <Badge variant="danger">Odwołana</Badge>,
  }[status];

  return (
    <Card
      className={cn('w-full border-border-divider bg-surface-panel p-panel', className)}
      {...props}
    >
      <CardContent className="flex flex-col gap-group p-0">
        <div className="flex flex-col gap-group sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-group">
            <Avatar size="md" className="shrink-0">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={participantName} /> : null}
              <AvatarFallback>{participantInitials}</AvatarFallback>
            </Avatar>
            <div className="space-y-tight">
              <div className="flex flex-wrap items-center gap-inline">
                <h3 className="text-body font-medium text-text-default">{participantName}</h3>
                <span className="text-meta text-text-muted">({participantRole})</span>
                {statusBadge}
              </div>
              <p className="text-body-dense font-medium text-text-default">{topic}</p>
              <div className="flex items-center gap-tight text-meta text-text-muted tabular-nums">
                <Calendar className="size-icon-sm shrink-0" />
                <span>{dateTime}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-inline sm:justify-end">
            {isRoomReady && status === 'confirmed' ? (
              <Button size="sm" onClick={onJoinRoom} className="gap-tight">
                <Video className="size-icon-sm" />
                Dołącz do pokoju
              </Button>
            ) : null}

            {status === 'confirmed' || status === 'pending' ? (
              <>
                {onReschedule ? (
                  <Button variant="outline" size="sm" onClick={onReschedule}>
                    Przełóż termin
                  </Button>
                ) : null}
                {onCancel ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="text-text-danger hover:text-text-danger"
                  >
                    Odwołaj
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionCardSkeleton() {
  return (
    <Card className="w-full border-border-divider bg-surface-panel p-panel" aria-busy="true">
      <CardContent className="flex flex-col gap-group p-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-group">
          <Skeleton className="size-avatar-md shrink-0 rounded-round" />
          <div className="space-y-tight">
            <Skeleton className="h-5 w-44 rounded-control" />
            <Skeleton className="h-4 w-64 rounded-control" />
            <Skeleton className="h-3 w-52 rounded-control" />
          </div>
        </div>
        <div className="flex gap-inline">
          <Skeleton className="h-8 w-28 rounded-control" />
          <Skeleton className="h-8 w-20 rounded-control" />
        </div>
      </CardContent>
    </Card>
  );
}
