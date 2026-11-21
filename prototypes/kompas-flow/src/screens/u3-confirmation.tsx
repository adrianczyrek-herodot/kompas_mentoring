/** U3 · Potwierdzenie rezerwacji (KONCEPCJA §U3). */
import {
  BookingStatusBadge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  DateTime,
  ErrorState,
  Link,
  PageHeader,
  Spinner,
} from '@kompas/ui';
import { useId, useState } from 'react';
import type { Booking } from '../data/accounts';
import { mentorById } from '../data/mentors';
import { addMinutes, TZ } from '../lib/clock';
import { href, replace, type Route, withQuery } from '../lib/router';
import { displayStatus } from '../state/booking-rules';
import { useDemo } from '../state/demo-context';

const PREP = [
  'Sprawdź kamerę i mikrofon w przeglądarce',
  'Przygotuj link do repozytorium lub projektu, o którym chcesz rozmawiać',
  'Zapisz 2–3 pytania, od których zaczniecie',
];

function icsOf(booking: Booking, mentorName: string): string {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kompas//Prototyp//PL',
    'BEGIN:VEVENT',
    `UID:${booking.id}@kompas-prototyp`,
    `DTSTAMP:${stamp(booking.startsAt)}`,
    `DTSTART:${stamp(booking.startsAt)}`,
    `DTEND:${stamp(addMinutes(booking.startsAt, booking.durationMin))}`,
    `SUMMARY:Sesja z ${mentorName} (Kompas — prototyp)`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// DS-GAP: CalendarButtons — .ics is a real local file; Google/Outlook would open external services.
function CalendarButtons({ booking, mentorName }: { booking: Booking; mentorName: string }) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([icsOf(booking, mentorName)], { type: 'text/calendar' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `kompas-${booking.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-col gap-inline">
      <div className="flex flex-wrap gap-inline">
        <Button variant="outline" onClick={download}>
          Pobierz plik .ics
        </Button>
        <Button variant="outline" disabled focusableWhenDisabled aria-describedby="cal-note">
          Google Calendar
        </Button>
        <Button variant="outline" disabled focusableWhenDisabled aria-describedby="cal-note">
          Outlook
        </Button>
      </div>
      <p id="cal-note" className="text-body-dense text-text-muted">
        Google Calendar i Outlook w prototypie nie działają (nie otwieramy zewnętrznych serwisów).
      </p>
    </div>
  );
}

// DS-GAP: PrepChecklist — Checkbox list, state kept only on this screen.
function PrepChecklist() {
  const id = useId();
  const [done, setDone] = useState<string[]>([]);
  return (
    <ul className="flex flex-col gap-inline">
      {PREP.map((item, index) => (
        <li key={item} className="flex items-center gap-inline">
          <Checkbox
            id={`${id}-${String(index)}`}
            checked={done.includes(item)}
            onCheckedChange={(checked) => {
              setDone((current) => (checked ? [...current, item] : current.filter((d) => d !== item)));
            }}
          />
          <label htmlFor={`${id}-${String(index)}`} className="text-body">
            {item}
          </label>
        </li>
      ))}
    </ul>
  );
}

function Processing({ path }: { path: string }) {
  return (
    <div className="flex flex-col items-start gap-group">
      <PageHeader title="Przetwarzamy płatność" />
      <Spinner label="Czekamy na potwierdzenie od operatora płatności…" />
      <p className="max-w-measure text-body">
        Rezerwację potwierdzimy, gdy operator potwierdzi płatność (zwykle do 30 sekund). Jeśli to
        potrwa dłużej, potwierdzimy ją e-mailem — nie płać drugi raz.
      </p>
      <Button
        variant="outline"
        onClick={() => {
          replace(path);
        }}
      >
        Sprawdź status
      </Button>
    </div>
  );
}

export function U3Confirmation({ route }: { route: Route }) {
  const { myBookings, now } = useDemo();
  const booking = myBookings.find((b) => b.id === route.params['bookingId']);
  const mentor = mentorById(booking?.mentorId);
  if (!booking || !mentor) {
    return (
      <ErrorState
        titleAs="h1"
        title="Nie znaleźliśmy tej rezerwacji"
        description="Rezerwacja nie istnieje albo należy do innego konta."
        action={<Link href={href('/sesje')}>Przejdź do moich sesji</Link>}
      />
    );
  }
  if (route.query.get('platnosc') === 'przetwarzanie') return <Processing path={route.path} />;
  const trial = booking.type === 'trial';
  return (
    <>
      <PageHeader
        title={trial ? 'Zapłacone — czekamy na potwierdzenie mentora' : 'Sesja zarezerwowana'}
        description={
          trial
            ? `${mentor.name} potwierdzi sesję próbną w ciągu 24 godzin. Jeśli odrzuci, zwrócimy 100% płatności.`
            : 'Sesja została opłacona z salda. Mentor dostał powiadomienie.'
        }
        actions={<BookingStatusBadge status={displayStatus(booking, now)} />}
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {trial ? 'Sesja próbna' : 'Sesja z planu'} · {mentor.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-inline">
          <p className="text-body font-medium">
            <DateTime value={booking.startsAt} timeZone={TZ} /> · {booking.durationMin} min
          </p>
          <p className="max-w-measure text-body text-text-muted">Cel: {booking.goal}</p>
          <p className="text-body-dense">
            Pokój sesji otworzy się 10 minut przed startem —{' '}
            <Link href={href(`/sesje/${booking.id}`)}>szczegóły sesji i link do pokoju</Link>.
          </p>
        </CardContent>
      </Card>
      <section aria-labelledby="cal-h" className="flex flex-col gap-inline">
        <h2 id="cal-h" className="text-section-title font-semibold">
          Dodaj do kalendarza
        </h2>
        <CalendarButtons booking={booking} mentorName={mentor.name} />
      </section>
      <section aria-labelledby="prep-h" className="flex flex-col gap-inline">
        <h2 id="prep-h" className="text-section-title font-semibold">
          Jak się przygotować
        </h2>
        <PrepChecklist />
      </section>
      <div className="flex flex-wrap gap-group">
        <Link href={href('/sesje')}>Przejdź do moich sesji</Link>
        <Link href={href(withQuery('/wiadomosci', { do: mentor.id }))}>Napisz do mentora</Link>
      </div>
    </>
  );
}
