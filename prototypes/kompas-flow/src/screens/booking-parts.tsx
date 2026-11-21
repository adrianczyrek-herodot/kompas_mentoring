/** Pieces shared by U1 and U2. */
import { Avatar, AvatarFallback, ErrorState, initialsOf, Link, Money } from '@kompas/ui';
import type { Mentor } from '../data/mentors';
import { href } from '../lib/router';

// DS-GAP: MentorSummaryBar (KONCEPCJA §U1) — composition from the Storybook booking example.
export function MentorSummaryBar({
  mentor,
  type,
  durationMin,
}: {
  mentor: Mentor;
  type: 'trial' | 'plan';
  durationMin: 30 | 60;
}) {
  return (
    <div className="flex items-center gap-group border-b border-border-divider pb-group">
      <Avatar size="md">
        <AvatarFallback>{initialsOf(mentor.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-tight">
        <p className="text-body font-semibold">{mentor.name}</p>
        <p className="text-body-dense text-text-muted">
          {type === 'trial' ? (
            <>
              Sesja próbna · 30 min · <Money amount={mentor.trialPrice} />
            </>
          ) : (
            <>Sesja z planu · {durationMin} min · opłacona z salda</>
          )}
        </p>
      </div>
    </div>
  );
}

export function MentorNotFound() {
  return (
    <ErrorState
      titleAs="h1"
      title="Nie znaleźliśmy tego mentora"
      description="Profil nie istnieje albo nie jest jeszcze publiczny."
      action={<Link href={href('/mentorzy')}>Przejdź do wyszukiwarki</Link>}
    />
  );
}
