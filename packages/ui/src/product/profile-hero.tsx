import { BadgeCheck } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Badge } from '../components/badge';
import { Skeleton } from '../components/skeleton';
import { formatCount, initialsOf } from '../lib/format';
import { cn } from '../lib/utils';

/** Header data of the mentor profile (KONCEPCJA §P3: hero + StatsRow). */
type MentorProfileSummary = {
  name: string;
  headline: string;
  photoUrl?: string;
  languages: string[];
  companies: string[];
  yearsExp: number;
  verified: boolean;
  acceptingNew: boolean;
  rating: number;
  reviewsCount: number;
  sessions: number;
  /** Share of students who booked again, 0–100. */
  returningPct: number;
  responseHours: number;
};

type ProfileHeroProps = Omit<React.ComponentProps<'section'>, 'children'> & {
  mentor: MentorProfileSummary;
};

const ratingFormat = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-tight border-l border-border-divider pl-group first:border-l-0 first:pl-0">
      <dt className="text-meta text-text-muted">{label}</dt>
      <dd className="text-section-title font-semibold text-text-default tabular-nums">
        {children}
      </dd>
    </div>
  );
}

// Top of P3: who the mentor is and why to trust them, before the fold. Serif only here and on P1
// (K6, R01.2). Stats without reviews collapse to „Nowy mentor” (KONCEPCJA §P3, state E).
function ProfileHero({ mentor, className, ...props }: ProfileHeroProps) {
  const isNew = mentor.reviewsCount === 0;
  const nameId = React.useId();
  return (
    <section
      data-slot="profile-hero"
      aria-labelledby={nameId}
      className={cn('flex flex-col gap-group', className)}
      {...props}
    >
      <div className="flex flex-col gap-group md:flex-row md:items-center">
        <Avatar size="lg">
          {mentor.photoUrl ? <AvatarImage src={mentor.photoUrl} alt="" /> : null}
          <AvatarFallback>{initialsOf(mentor.name)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-tight">
          <h1 id={nameId} className="font-serif text-display text-text-default">
            {mentor.name}
          </h1>
          <p className="max-w-measure text-body text-text-muted">{mentor.headline}</p>
          <div className="flex flex-wrap items-center gap-inline pt-tight">
            {mentor.verified ? (
              <Badge variant="success">
                <BadgeCheck aria-hidden="true" />
                Zweryfikowany
              </Badge>
            ) : null}
            {isNew ? <Badge variant="neutral">Nowy mentor</Badge> : null}
            {mentor.acceptingNew ? null : (
              <Badge variant="neutral">Nie przyjmuje teraz nowych uczniów</Badge>
            )}
          </div>
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-group gap-y-group">
        {isNew ? null : (
          <>
            <Stat label="Ocena">
              {ratingFormat.format(mentor.rating)}{' '}
              <span className="text-body font-normal text-text-muted">
                (
                {formatCount(mentor.reviewsCount, { one: 'opinia', few: 'opinie', many: 'opinii' })}
                )
              </span>
            </Stat>
            <Stat label="Sesje">{new Intl.NumberFormat('pl-PL').format(mentor.sessions)}</Stat>
            <Stat label="Wracający uczniowie">{mentor.returningPct}%</Stat>
          </>
        )}
        <Stat label="Odpowiada zwykle w">{mentor.responseHours} h</Stat>
        <Stat label="Doświadczenie">
          {formatCount(mentor.yearsExp, { one: 'rok', few: 'lata', many: 'lat' })}
        </Stat>
      </dl>

      <p className="text-body-dense text-text-muted">
        Języki sesji: {mentor.languages.join(', ')}
        {mentor.companies.length > 0 ? ` · Firmy: ${mentor.companies.join(', ')}` : ''}
      </p>
    </section>
  );
}

function ProfileHeroSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-group">
      <div className="flex flex-col gap-group md:flex-row md:items-center">
        <Skeleton className="size-avatar-lg rounded-round" />
        <div className="flex flex-1 flex-col gap-inline">
          <Skeleton className="h-lh w-1/2 text-display" />
          <Skeleton className="h-lh w-2/3" />
        </div>
      </div>
      <Skeleton className="h-lh w-full text-section-title md:w-2/3" />
    </div>
  );
}

export { type MentorProfileSummary, ProfileHero, type ProfileHeroProps, ProfileHeroSkeleton };
