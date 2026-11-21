/** U4 · Moje sesje (KONCEPCJA §U4, E3-S5). */
import {
  Button,
  EmptyState,
  ErrorState,
  FieldLabel,
  formatCount,
  Link,
  NextSessionCard,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SessionListItem,
  SessionListItemSkeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kompas/ui';
import { CalendarX } from 'lucide-react';
import { useId, useState } from 'react';
import type { Booking } from '../data/accounts';
import { mentorById } from '../data/mentors';
import { TZ, toMs } from '../lib/clock';
import { href, navigate } from '../lib/router';
import { isUpcoming, joinFrom, joinOpen, toSummary } from '../state/booking-rules';
import { useDemo, useRetry } from '../state/demo-context';

const SESSION_FORMS = { one: 'sesja', few: 'sesje', many: 'sesji' };

// DS-GAP: BalancePill (KONCEPCJA §U4) — plain text per mentor, linking to U8.
function Balances() {
  const { state, studentId } = useDemo();
  if (!studentId) return null;
  const entries = Object.entries(state.balances[studentId]).filter(([, count]) => count > 0);
  if (entries.length === 0) return null;
  return (
    <p className="text-body-dense">
      Saldo:{' '}
      {entries
        .map(([mentorId, count]) => `${mentorById(mentorId)?.name ?? mentorId} — ${formatCount(count, SESSION_FORMS)}`)
        .join(' · ')}{' '}
      · <Link href={href('/plany')}>Plany i saldo</Link>
    </p>
  );
}

function MentorFilter({
  bookings,
  value,
  onChange,
}: {
  bookings: Booking[];
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const mentorIds = [...new Set(bookings.map((b) => b.mentorId))];
  if (mentorIds.length < 2) return null;
  const items = [
    { value: 'all', label: 'Wszyscy mentorzy' },
    ...mentorIds.map((m) => ({ value: m, label: mentorById(m)?.name ?? m })),
  ];
  return (
    <div className="flex items-center gap-inline">
      <FieldLabel htmlFor={id}>Mentor</FieldLabel>
      <Select items={items} value={value} onValueChange={(next) => { onChange(next ?? 'all'); }}>
        <SelectTrigger id={id} className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SessionList({ bookings, upcoming }: { bookings: Booking[]; upcoming: boolean }) {
  const { now } = useDemo();
  if (bookings.length === 0) {
    return (
      <p className="py-group text-body text-text-muted">
        {upcoming ? 'Brak nadchodzących sesji.' : 'Brak minionych sesji.'}
      </p>
    );
  }
  return (
    <ul aria-label={upcoming ? 'Nadchodzące sesje' : 'Minione sesje'}>
      {bookings.map((booking) => (
        <SessionListItem
          key={booking.id}
          session={toSummary(booking, now)}
          timeZone={TZ}
          href={href(`/sesje/${booking.id}`)}
          {...(upcoming && booking.status === 'scheduled'
            ? {
                action: (
                  <Button variant="outline" size="sm" onClick={() => { navigate(`/sesje/${booking.id}`); }}>
                    Przełóż lub anuluj
                  </Button>
                ),
              }
            : {})}
        />
      ))}
    </ul>
  );
}

function Loaded({ bookings }: { bookings: Booking[] }) {
  const { now } = useDemo();
  const [mentor, setMentor] = useState('all');
  const visible = bookings.filter((b) => mentor === 'all' || b.mentorId === mentor);
  const upcoming = visible.filter((b) => isUpcoming(b, now)).sort((a, b) => toMs(a.startsAt) - toMs(b.startsAt));
  const past = visible.filter((b) => !isUpcoming(b, now)).sort((a, b) => toMs(b.startsAt) - toMs(a.startsAt));
  const next = upcoming.find((b) => b.status === 'scheduled');
  return (
    <>
      {next ? (
        <NextSessionCard
          session={toSummary(next, now)}
          timeZone={TZ}
          joinOpen={joinOpen(next, now)}
          joinFrom={joinFrom(next)}
          onJoin={() => {
            navigate(`/sesje/${next.id}/pokoj`);
          }}
          secondary={<Link href={href(`/sesje/${next.id}`)}>Szczegóły sesji</Link>}
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-inline">
        <Balances />
        <MentorFilter bookings={bookings} value={mentor} onChange={setMentor} />
      </div>
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Nadchodzące ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Minione ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <SessionList bookings={upcoming} upcoming />
        </TabsContent>
        <TabsContent value="past">
          <SessionList bookings={past} upcoming={false} />
        </TabsContent>
      </Tabs>
    </>
  );
}

export function U4Sessions() {
  const { state, myBookings } = useDemo();
  const retry = useRetry();
  const status = state.scenarios.dataState;
  const bookings = status === 'empty' ? [] : myBookings;
  return (
    <>
      <PageHeader title="Moje sesje" />
      {status === 'loading' ? (
        <ul aria-busy="true" aria-label="Wczytujemy sesje">
          {[0, 1, 2].map((row) => (
            <SessionListItemSkeleton key={row} />
          ))}
        </ul>
      ) : status === 'error' ? (
        <ErrorState
          titleAs="h2"
          title="Nie udało się wczytać sesji"
          description="Sprawdź połączenie i spróbuj ponownie."
          action={<Button variant="outline" onClick={retry}>Ponów</Button>}
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          titleAs="h2"
          icon={<CalendarX />}
          title="Nie masz jeszcze sesji"
          description="Znajdź mentora i umów 30-minutową sesję próbną."
          action={<Link href={href('/mentorzy')}>Znajdź mentora</Link>}
        />
      ) : (
        <Loaded bookings={bookings} />
      )}
    </>
  );
}
