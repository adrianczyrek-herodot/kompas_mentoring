import { CalendarCheck, Video } from 'lucide-react';
import * as React from 'react';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { Skeleton } from '../components/skeleton';
import { cn } from '../lib/utils';

export interface AgendaItem {
  id: string;
  timeRange: string; // e.g. "16:00 – 17:00"
  studentName: string;
  topic: string;
  isNow?: boolean;
}

export interface TodayAgendaProps extends React.ComponentProps<'div'> {
  items: AgendaItem[];
  dateTitle?: string;
  onJoinRoom?: (item: AgendaItem) => void;
}

export function TodayAgenda({
  items,
  dateTitle = 'Dzisiaj, 25 listopada',
  onJoinRoom,
  className,
  ...props
}: TodayAgendaProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          'rounded-panel border border-border-divider bg-surface-panel p-panel',
          className,
        )}
        {...props}
      >
        <EmptyState
          icon={<CalendarCheck className="size-icon-lg text-text-muted" />}
          title="Twój kalendarz ma dziś wolne"
          description="Brak zaplanowanych sesji na dzisiaj. Możesz sprawdzić prośby uczniów lub uzupełnić grafik na kolejny tydzień."
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-panel border border-border-divider bg-surface-panel p-panel space-y-group',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-border-divider pb-tight">
        <h3 className="text-section-title font-medium text-text-default">{dateTitle}</h3>
        <span className="text-meta text-text-muted">Zaplanowane sesje: {items.length}</span>
      </div>

      <div className="divide-y divide-border-divider">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-tight py-group sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-tight">
              <span className="text-body font-medium text-text-default tabular-nums">
                {item.timeRange}
              </span>
              <p className="text-body-dense text-text-default font-medium">
                Uczeń: {item.studentName}
              </p>
              <p className="text-meta text-text-muted">{item.topic}</p>
            </div>

            {onJoinRoom ? (
              <Button
                size="sm"
                onClick={() => {
                  onJoinRoom(item);
                }}
                className="gap-tight shrink-0 self-start sm:self-center"
              >
                <Video className="size-icon-sm" />
                Pokój sesji
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TodayAgendaSkeleton() {
  return (
    <div
      className="rounded-panel border border-border-divider bg-surface-panel p-panel space-y-group"
      aria-busy="true"
    >
      <div className="flex items-center justify-between border-b border-border-divider pb-tight">
        <Skeleton className="h-6 w-48 rounded-control" />
        <Skeleton className="h-4 w-28 rounded-control" />
      </div>
      <div className="space-y-group py-group">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-tight">
              <Skeleton className="h-4 w-32 rounded-control" />
              <Skeleton className="h-4 w-44 rounded-control" />
              <Skeleton className="h-3 w-64 rounded-control" />
            </div>
            <Skeleton className="h-8 w-28 rounded-control" />
          </div>
        ))}
      </div>
    </div>
  );
}
