import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Skeleton } from '../components/skeleton';
import { cn } from '../lib/utils';

export interface ProfileHeroProps extends React.ComponentProps<'section'> {
  name: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  initials: string;
  tags: string[];
  trialRate: string;
  standardRate: string;
  responseTime?: string;
  languages?: string[];
  isNew?: boolean;
  onBookClick?: () => void;
}

export function ProfileHero({
  name,
  headline,
  bio,
  avatarUrl,
  initials,
  tags,
  trialRate,
  standardRate,
  responseTime = 'zwykle do 24 godzin',
  languages = ['polski', 'angielski'],
  isNew,
  onBookClick,
  className,
  ...props
}: ProfileHeroProps) {
  return (
    <section
      className={cn(
        'w-full border-b border-border-divider bg-surface-panel px-panel py-section',
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-content flex-col gap-section sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-group sm:flex-row sm:items-start">
          <Avatar size="lg" className="shrink-0">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-group">
            <div className="space-y-tight">
              <div className="flex flex-wrap items-center gap-inline">
                <h1 className="font-serif text-display font-medium text-text-default">{name}</h1>
                {isNew ? (
                  <Badge variant="warning">Nowy mentor</Badge>
                ) : (
                  <Badge variant="neutral">Zweryfikowany</Badge>
                )}
              </div>
              <p className="text-body font-medium text-text-muted">{headline}</p>
            </div>

            <p className="max-w-measure text-body text-text-default">{bio}</p>

            <div className="flex flex-wrap items-center gap-inline">
              {tags.map((tag) => (
                <Badge key={tag} variant="neutral">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-group text-meta text-text-muted">
              <span>
                Czas odpowiedzi:{' '}
                <strong className="text-text-default font-normal">{responseTime}</strong>
              </span>
              <span>
                Języki:{' '}
                <strong className="text-text-default font-normal">{languages.join(', ')}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-group rounded-panel border border-border-divider bg-surface-panel p-panel sm:w-72">
          <div className="space-y-tight">
            <span className="text-meta text-text-muted">Sesja próbna 30 min:</span>
            <p className="text-page-title font-medium text-text-default tabular-nums">
              {trialRate}
            </p>
            <p className="text-meta text-text-subtle tabular-nums">
              Pełna sesja 60 min: {standardRate}
            </p>
          </div>
          <Button onClick={onBookClick} className="w-full">
            Wybierz termin sesji
          </Button>
          <p className="text-center text-meta text-text-muted">
            Bezpłatne odwołanie do 12 h przed spotkaniem.
          </p>
        </div>
      </div>
    </section>
  );
}

export function ProfileHeroSkeleton() {
  return (
    <section
      className="w-full border-b border-border-divider bg-surface-panel px-panel py-section"
      aria-busy="true"
    >
      <div className="mx-auto flex max-w-content flex-col gap-section sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-group sm:flex-row sm:items-start">
          <Skeleton className="size-avatar-lg shrink-0 rounded-round" />
          <div className="space-y-group">
            <div className="space-y-tight">
              <Skeleton className="h-9 w-64 rounded-control" />
              <Skeleton className="h-5 w-80 rounded-control" />
            </div>
            <div className="space-y-tight">
              <Skeleton className="h-4 w-full max-w-measure rounded-control" />
              <Skeleton className="h-4 w-4/5 rounded-control" />
            </div>
            <div className="flex gap-inline">
              <Skeleton className="h-6 w-20 rounded-tag" />
              <Skeleton className="h-6 w-24 rounded-tag" />
              <Skeleton className="h-6 w-16 rounded-tag" />
            </div>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-group rounded-panel border border-border-divider p-panel sm:w-72">
          <Skeleton className="h-8 w-32 rounded-control" />
          <Skeleton className="h-11 w-full rounded-control" />
        </div>
      </div>
    </section>
  );
}
