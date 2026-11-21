import { BadgeCheck } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Badge } from '../components/badge';
import { Link } from '../components/link';
import { Skeleton } from '../components/skeleton';
import { formatCount, initialsOf } from '../lib/format';
import { cn } from '../lib/utils';
import { Money } from './money';

/** Fields of the P2 list row (KONCEPCJA §P2 „MentorCard”). */
type MentorSummary = {
  id: string;
  name: string;
  headline: string;
  photoUrl?: string;
  tags: string[];
  languages: string[];
  /** Price of a 60-minute session, minor units. */
  rate60: bigint;
  /** Price of the 30-minute trial session, minor units. */
  trialPrice: bigint;
  /** Average rating, e.g. 4.9; `0` reviews → „Nowy mentor” (KONCEPCJA §P3, state E). */
  rating: number;
  reviewsCount: number;
  sessions: number;
  responseHours: number;
  verified: boolean;
  acceptingNew: boolean;
};

type MentorCardProps = Omit<React.ComponentProps<'article'>, 'children'> & {
  mentor: MentorSummary;
  /** Profile URL (P3). */
  profileHref: string;
  /** Router link element for the name, e.g. `<NextLink href={profileHref} />` (see `Link`). */
  linkRender?: React.ReactElement;
  /** Booking action (secondary, R01.6) — usually a Button `outline size="sm"`. */
  action?: React.ReactNode;
  /** Heading level inside the list. */
  headingAs?: 'h2' | 'h3';
  /** Tags shown before „+N”. */
  maxTags?: number;
};

const ratingFormat = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// One row of the P2 result list: divided by a line, not a shadowed card (R01.4); dense (K1).
function MentorCard({
  mentor,
  profileHref,
  linkRender,
  action,
  headingAs: Heading = 'h3',
  maxTags = 5,
  className,
  ...props
}: MentorCardProps) {
  const headingId = React.useId();
  const shownTags = mentor.tags.slice(0, maxTags);
  const hiddenTags = mentor.tags.length - shownTags.length;
  const isNew = mentor.reviewsCount === 0;

  return (
    <article
      data-slot="mentor-card"
      aria-labelledby={headingId}
      className={cn(
        'flex flex-col gap-inline border-b border-border-divider py-row-y md:flex-row md:gap-group',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 gap-group">
        <Avatar size="md">
          {mentor.photoUrl ? <AvatarImage src={mentor.photoUrl} alt="" /> : null}
          <AvatarFallback>{initialsOf(mentor.name)}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col gap-tight">
          <div className="flex flex-wrap items-center gap-x-inline gap-y-tight">
            <Heading id={headingId} className="text-body font-semibold text-text-default">
              <Link href={profileHref} render={linkRender} className="text-text-default">
                {mentor.name}
              </Link>
            </Heading>
            {mentor.verified ? (
              <span className="inline-flex items-center gap-tight text-meta text-text-muted">
                <BadgeCheck aria-hidden="true" className="size-icon-sm text-status-success-fg" />
                Zweryfikowany
              </span>
            ) : null}
          </div>
          <p className="text-body-dense text-text-muted">{mentor.headline}</p>
          <p className="flex flex-wrap items-center gap-x-inline gap-y-tight text-meta text-text-muted">
            {isNew ? (
              <Badge variant="neutral">Nowy mentor</Badge>
            ) : (
              <span className="tabular-nums">
                <span className="font-medium text-text-default">
                  {ratingFormat.format(mentor.rating)}
                </span>{' '}
                (
                {formatCount(mentor.reviewsCount, { one: 'opinia', few: 'opinie', many: 'opinii' })}
                )
              </span>
            )}
            {mentor.sessions > 0 ? (
              <span className="tabular-nums">
                {formatCount(mentor.sessions, { one: 'sesja', few: 'sesje', many: 'sesji' })}
              </span>
            ) : null}
            <span>Odpowiada zwykle w {mentor.responseHours} h</span>
            <span>{mentor.languages.join(', ')}</span>
          </p>
          {shownTags.length > 0 ? (
            <ul aria-label="Kompetencje" className="flex flex-wrap gap-tight pt-tight">
              {shownTags.map((tag) => (
                <li key={tag}>
                  <Badge variant="neutral">{tag}</Badge>
                </li>
              ))}
              {hiddenTags > 0 ? (
                <li className="self-center text-meta text-text-muted">+{hiddenTags}</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-tight md:shrink-0 md:items-end md:text-right">
        <p className="text-body text-text-default">
          <Money amount={mentor.rate60} className="font-semibold" />
          <span className="text-meta text-text-muted"> / 60 min</span>
        </p>
        <p className="text-meta text-text-muted">
          Sesja próbna 30 min: <Money amount={mentor.trialPrice} />
        </p>
        {mentor.acceptingNew ? (
          action ? (
            <div className="pt-tight">{action}</div>
          ) : null
        ) : (
          // Reason instead of a disabled button (D2, KONCEPCJA §P3 „Walidacje”).
          <p className="text-meta text-text-muted">Nie przyjmuje teraz nowych uczniów</p>
        )}
      </div>
    </article>
  );
}

function MentorCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-inline border-b border-border-divider py-row-y md:flex-row md:gap-group"
    >
      <div className="flex flex-1 gap-group">
        <Skeleton className="size-avatar-md rounded-round" />
        <div className="flex flex-1 flex-col gap-inline">
          <Skeleton className="h-lh w-1/3" />
          <Skeleton className="h-lh w-2/3" />
          <Skeleton className="h-lh w-1/2" />
        </div>
      </div>
      <div className="flex flex-col gap-inline md:w-1/4 md:items-end">
        <Skeleton className="h-lh w-1/2 md:w-full" />
        <Skeleton className="h-control-sm w-1/2 md:w-full" />
      </div>
    </div>
  );
}

export { MentorCard, type MentorCardProps, MentorCardSkeleton, type MentorSummary };
