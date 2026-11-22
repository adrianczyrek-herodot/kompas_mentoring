/** P3 · Profil mentora (KONCEPCJA §P3, E2-S6). */
import {
  Badge,
  Button,
  Card,
  CardContent,
  DateTime,
  ErrorState,
  formatCount,
  Link,
  MentorCard,
  ProfileHero,
  ProfileHeroSkeleton,
  Separator,
  SlotGrid,
  SlotGridSkeleton,
  StickyBookingBar,
  ToggleGroup,
  ToggleGroupItem,
} from '@kompas/ui';
import { PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { type Mentor, PUBLIC_MENTORS, publicMentorById } from '../data/mentors';
import { hasSlotsIn14Days, weekDays, weekLabel } from '../data/slots';
import { timeZoneLabel, TZ } from '../lib/clock';
import { href, navigate, type Route, withQuery } from '../lib/router';
import { bookingIntent } from '../state/booking-intent';
import { useDemo, useRetry } from '../state/demo-context';
import { liveMentor } from '../state/world';

const SESSION_FORMS = { one: 'sesję', few: 'sesje', many: 'sesji' };

function BookingBox({ mentor, noSlots }: { mentor: Mentor; noSlots: boolean }) {
  const { account, myBookings, balanceWith } = useDemo();
  const intent = bookingIntent(account, mentor, myBookings, balanceWith(mentor.id));
  const write = (
    <Link href={href(withQuery('/wiadomosci', { do: mentor.id }))}>Napisz wiadomość</Link>
  );
  if (intent.kind === 'plan' || intent.kind === 'needs-plan' || intent.kind === 'not-student') {
    return (
      <Card>
        <CardContent className="flex flex-col gap-inline md:flex-row md:items-center md:justify-between">
          <p className="text-body">
            {intent.kind === 'plan'
              ? `Masz ${formatCount(intent.balance, SESSION_FORMS)} w saldzie u tego mentora.`
              : intent.kind === 'needs-plan'
                ? 'Sesja próbna z tym mentorem już się odbyła (jedna na parę uczeń–mentor). Kolejne sesje rezerwujesz z planu.'
                : 'Sesje rezerwują uczniowie. Jesteś zalogowany jako mentor lub zespół zaufania.'}
          </p>
          <div className="flex flex-wrap items-center gap-inline">
            {intent.kind === 'plan' ? (
              <Button
                onClick={() => {
                  navigate(`/rezerwacja/${mentor.id}`);
                }}
              >
                Zarezerwuj sesję z planu
              </Button>
            ) : intent.kind === 'needs-plan' ? (
              <Button
                onClick={() => {
                  navigate('/plany');
                }}
              >
                Wybierz plan
              </Button>
            ) : null}
            {intent.kind === 'not-student' ? null : write}
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <StickyBookingBar
      trialPrice={mentor.trialPrice}
      acceptingNew={intent.kind !== 'paused'}
      noSlotsIn14Days={noSlots}
      onBook={() => {
        navigate(`/rezerwacja/${mentor.id}`);
      }}
      secondary={write}
    />
  );
}

// DS-GAP: VideoPlayer — the intro video is a simulation; nothing is loaded or played.
function VideoPlaceholder({ name }: { name: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-group">
        <PlayCircle aria-hidden="true" className="size-icon-lg text-text-muted" />
        <div className="flex flex-col gap-tight">
          <p className="text-body font-medium">Wideo-wprowadzenie: {name}</p>
          <p className="text-body-dense text-text-muted">
            Symulacja — w prototypie wideo się nie odtwarza (w aplikacji: link YouTube/Vimeo z M1).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Reviews({ mentor, hidden }: { mentor: Mentor; hidden: boolean }) {
  const [filter, setFilter] = useState('all');
  const reviews = hidden
    ? []
    : mentor.reviews.filter((r) =>
        filter === 'all' ? true : filter === '5' ? r.rating === 5 : r.rating <= 4,
      );
  return (
    <section aria-labelledby="reviews-h" className="flex flex-col gap-inline">
      <h2 id="reviews-h" className="text-section-title font-semibold">
        Opinie
      </h2>
      {mentor.reviews.length > 0 && !hidden ? (
        <ToggleGroup
          aria-label="Filtr opinii"
          value={[filter]}
          onValueChange={(value) => {
            if (value[0]) setFilter(value[0]);
          }}
        >
          <ToggleGroupItem value="all">Wszystkie</ToggleGroupItem>
          <ToggleGroupItem value="5">Ocena 5</ToggleGroupItem>
          <ToggleGroupItem value="4">Ocena 4 i niżej</ToggleGroupItem>
        </ToggleGroup>
      ) : null}
      {reviews.length > 0 ? (
        <ul>
          {reviews.map((review) => (
            <li
              key={review.author}
              className="flex flex-col gap-tight border-b border-border-divider py-row-y"
            >
              <p className="text-body-dense font-medium">
                {review.author}
                <span className="font-normal text-text-muted">
                  {' '}
                  · ocena {review.rating}/5 ·{' '}
                  <DateTime value={review.date} timeZone={TZ} format="date" /> · zweryfikowana sesja
                </span>
              </p>
              <p className="max-w-measure text-body">{review.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-text-muted">
          {hidden || mentor.reviews.length === 0
            ? 'Nowy mentor — jeszcze bez opinii. Sesja próbna to najprostszy sposób, żeby sprawdzić, czy się dogadacie.'
            : 'Brak opinii z tą oceną.'}
        </p>
      )}
      <p className="text-meta text-text-muted">
        Pokazujemy opinie z danych demo ({mentor.reviews.length} z {mentor.reviewsCount}).
      </p>
    </section>
  );
}

function Similar({ mentor }: { mentor: Mentor }) {
  const similar = PUBLIC_MENTORS.filter(
    (m) => m.id !== mentor.id && m.categories.some((c) => mentor.categories.includes(c)),
  ).slice(0, 2);
  if (similar.length === 0) return null;
  return (
    <section aria-labelledby="similar-h" className="flex flex-col gap-inline">
      <h2 id="similar-h" className="text-section-title font-semibold">
        Podobni mentorzy
      </h2>
      <ul>
        {similar.map((m) => (
          <li key={m.id}>
            <MentorCard mentor={m} profileHref={href(`/mentorzy/${m.id}`)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function NotFound() {
  return (
    <ErrorState
      titleAs="h1"
      title="Profil niedostępny"
      description="Ten mentor nie przyjmuje teraz rezerwacji albo profil nie jest jeszcze publiczny. Zobacz mentorów o podobnych kompetencjach."
      action={<Link href={href('/mentorzy')}>Pokaż innych mentorów</Link>}
    />
  );
}

export function P3Profile({ route }: { route: Route }) {
  const { state, now } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  const mentor = publicMentorById(route.params['id']);
  if (!mentor) return <NotFound />;
  if (status === 'loading')
    return (
      <div aria-busy="true" className="flex flex-col gap-section">
        <p className="sr-only">Wczytujemy profil…</p>
        <ProfileHeroSkeleton />
        <SlotGridSkeleton />
      </div>
    );
  if (status === 'error')
    return (
      <ErrorState
        titleAs="h1"
        title="Nie udało się wczytać profilu"
        description="Sprawdź połączenie i spróbuj ponownie."
        action={
          <Button variant="outline" onClick={retry}>
            Ponów
          </Button>
        }
      />
    );
  const empty = status === 'empty';
  const days = empty
    ? weekDays(mentor, 0, now, []).map((d) => ({ ...d, slots: [] }))
    : weekDays(liveMentor(state.world, mentor), 0, now, state.bookings, state.takenSlots);
  const noSlots = empty || !hasSlotsIn14Days(mentor, now, state.bookings);
  return (
    <>
      <ProfileHero mentor={empty ? { ...mentor, reviewsCount: 0, rating: 0 } : mentor} />
      <BookingBox mentor={mentor} noSlots={noSlots} />
      <VideoPlaceholder name={mentor.name} />
      <section aria-labelledby="about-h" className="flex flex-col gap-inline">
        <h2 id="about-h" className="text-section-title font-semibold">
          O mnie
        </h2>
        <p className="max-w-measure text-body">{mentor.bio}</p>
        <ul aria-label="Kompetencje" className="flex flex-wrap gap-tight pt-inline">
          {mentor.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="neutral">{tag}</Badge>
            </li>
          ))}
        </ul>
        <p className="text-body-dense text-text-muted">
          Doświadczenie: {mentor.yearsExp} lat · {mentor.companies.join(', ')} · {mentor.country}
        </p>
      </section>
      <Separator />
      <SlotGrid
        days={days}
        timeZone={TZ}
        timeZoneLabel={timeZoneLabel(TZ)}
        weekLabel={weekLabel(0)}
        canGoPrev={false}
        onSelect={(slot) => {
          navigate(withQuery(`/rezerwacja/${mentor.id}`, { termin: slot.startsAt }));
        }}
        onNextWeek={() => {
          navigate(`/rezerwacja/${mentor.id}`);
        }}
      />
      <Separator />
      <Reviews mentor={mentor} hidden={empty} />
      <Similar mentor={mentor} />
    </>
  );
}
