import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';
import { Skeleton } from '../components/skeleton';
import { cn } from '../lib/utils';

export interface MentorCardProps extends React.ComponentProps<'div'> {
  name: string;
  title: string;
  avatarUrl?: string;
  initials: string;
  tags: string[];
  trialRate: string; // e.g. "80 zł"
  standardRate: string; // e.g. "160 zł"
  isNew?: boolean;
  rating?: string;
  reviewCount?: number;
  availableSoon?: boolean;
  onBookTrial?: () => void;
  onViewProfile?: () => void;
}

export function MentorCard({
  name,
  title,
  avatarUrl,
  initials,
  tags,
  trialRate,
  standardRate,
  isNew,
  rating,
  reviewCount,
  availableSoon = true,
  onBookTrial,
  onViewProfile,
  className,
  ...props
}: MentorCardProps) {
  return (
    <Card
      className={cn('w-full border-border-divider bg-surface-panel p-panel', className)}
      {...props}
    >
      <CardContent className="flex flex-col gap-group p-0">
        <div className="flex flex-col gap-group sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-group">
            <Avatar size="md" className="shrink-0">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-tight">
              <div className="flex flex-wrap items-center gap-inline">
                <h3 className="text-body font-medium text-text-default">{name}</h3>
                {isNew ? (
                  <Badge variant="warning">Nowy mentor</Badge>
                ) : rating ? (
                  <span className="text-meta font-medium text-text-muted tabular-nums">
                    ★ {rating} ({reviewCount ?? 0})
                  </span>
                ) : null}
              </div>
              <p className="text-body-dense text-text-muted">{title}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col text-left sm:text-right">
            <span className="text-meta text-text-muted">Sesja próbna 30 min:</span>
            <span className="text-body font-medium text-text-default tabular-nums">
              {trialRate}
            </span>
            <span className="text-meta text-text-subtle tabular-nums">
              Pełna sesja 60 min: {standardRate}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-inline">
          {tags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col gap-inline border-t border-border-divider pt-group sm:flex-row sm:items-center sm:justify-between">
          <span className="text-meta text-text-muted">
            {availableSoon
              ? 'Dostępne terminy w tym tygodniu'
              : 'Brak wolnych terminów w tym tygodniu'}
          </span>
          <div className="flex items-center gap-inline">
            {onViewProfile ? (
              <Button variant="outline" size="sm" onClick={onViewProfile}>
                Profil
              </Button>
            ) : null}
            <Button size="sm" onClick={onBookTrial} disabled={!availableSoon}>
              Zarezerwuj sesję próbną
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MentorCardSkeleton() {
  return (
    <Card className="w-full border-border-divider bg-surface-panel p-panel" aria-busy="true">
      <CardContent className="flex flex-col gap-group p-0">
        <div className="flex flex-col gap-group sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-group">
            <Skeleton className="size-avatar-md shrink-0 rounded-round" />
            <div className="space-y-tight">
              <Skeleton className="h-5 w-40 rounded-control" />
              <Skeleton className="h-4 w-60 rounded-control" />
            </div>
          </div>
          <div className="space-y-tight text-right sm:w-32">
            <Skeleton className="h-3 w-24 rounded-control" />
            <Skeleton className="h-5 w-20 rounded-control" />
          </div>
        </div>

        <div className="flex gap-inline">
          <Skeleton className="h-6 w-16 rounded-tag" />
          <Skeleton className="h-6 w-20 rounded-tag" />
          <Skeleton className="h-6 w-24 rounded-tag" />
        </div>

        <div className="flex items-center justify-between border-t border-border-divider pt-group">
          <Skeleton className="h-4 w-48 rounded-control" />
          <Skeleton className="h-8 w-44 rounded-control" />
        </div>
      </CardContent>
    </Card>
  );
}
