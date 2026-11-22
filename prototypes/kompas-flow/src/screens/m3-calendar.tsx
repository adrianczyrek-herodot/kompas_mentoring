/** M3 · Kalendarz i dostępność (KONCEPCJA §M3, F5). Template edits feed P3, U1 and U5 through `liveMentor`. */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  PageHeader,
  Skeleton,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kompas/ui';
import { ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { initialSettings, type MentorSettings } from '../data/mentor-work';
import { TZ } from '../lib/clock';
import { useDemo } from '../state/demo-context';
import { studentNameOf } from '../state/world';
import { dayKey, weekRange } from './m2-parts';
import { Exceptions, GoogleCard, SettingsForm } from './m3-settings';
import { DAY_SHORT, HOURS, hourOf, TemplateEditor, totalHours } from './m3-template';

const WEEK_MIN = -1;
const WEEK_MAX = 3;

const dayFormat = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', timeZone: TZ });

/** `YYYY-MM-DD` of the n-th day after a `YYYY-MM-DD` date (calendar arithmetic, no clock reads). */
function plusDays(date: string, days: number): string {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function WeekView({ settings, mentorId }: { settings: MentorSettings; mentorId: string }) {
  const { state, now } = useDemo();
  const [week, setWeek] = useState(0);
  const monday = plusDays(weekRange(now).from, week * 7);
  const days = DAY_SHORT.map((short, index) => ({ short, date: plusDays(monday, index), weekday: index }));
  const sessions = state.bookings.filter((b) => b.mentorId === mentorId && (b.status === 'scheduled' || b.status === 'requested'));
  const label = `${dayFormat.format(Date.parse(`${monday}T12:00:00Z`))} – ${dayFormat.format(Date.parse(`${plusDays(monday, 6)}T12:00:00Z`))}`;
  const off = settings.exceptions.filter((e) => e.type === 'off');
  const extra = settings.exceptions.filter((e) => e.type === 'extra');
  const inRange = (list: typeof off, date: string) => list.some((e) => date >= e.from && date <= e.to);

  return (
    <section aria-labelledby="m3-week" className="flex flex-col gap-inline">
      <div className="flex flex-wrap items-center justify-between gap-inline">
        <h2 id="m3-week" className="text-section-title font-semibold">Tydzień {label}</h2>
        <div className="flex gap-inline">
          <Button variant="outline" size="icon" aria-label="Poprzedni tydzień" disabled={week <= WEEK_MIN} onClick={() => { setWeek((w) => w - 1); }}>
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Następny tydzień" disabled={week >= WEEK_MAX} onClick={() => { setWeek((w) => w + 1); }}>
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      {/* DS-GAP: WeekCalendar (KONCEPCJA §M3) — a Table of hours × days, state shown as text and background. */}
      <Table>
        <TableCaption>Dostępne — godziny z szablonu. Sesja — umówiona lub czekająca na odpowiedź. Urlop — wyjątek zamyka dzień.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Godzina</TableHead>
            {days.map((d) => (
              <TableHead key={d.date}>
                {d.short} {Number(d.date.slice(8))}
                {inRange(extra, d.date) ? <Badge variant="success" className="ml-tight">+</Badge> : null}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {HOURS.map((h) => (
            <TableRow key={h}>
              <TableCell className="tabular-nums text-text-muted">{h}:00</TableCell>
              {days.map((d) => {
                const booked = sessions.find((b) => dayKey(b.startsAt) === d.date && hourOf(b.startsAt) === h);
                const blocked = inRange(off, d.date);
                const free = !blocked && (settings.template[d.weekday] ?? []).includes(h);
                if (booked) {
                  return (
                    <TableCell key={d.date} className="bg-selected-bg text-meta font-medium">
                      {studentNameOf({ newStudentName: state.newStudentName }, booked.studentId).split(' ')[0]}
                      {booked.status === 'requested' ? ' (prośba)' : ''}
                    </TableCell>
                  );
                }
                if (blocked) return <TableCell key={d.date} className="bg-surface-sunken text-meta text-text-muted">Urlop</TableCell>;
                return free
                  ? <TableCell key={d.date} className="bg-status-success-bg text-meta">Dostępne</TableCell>
                  : <TableCell key={d.date} className="text-meta text-text-subtle">—</TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

export function M3Calendar() {
  const { state, account } = useDemo();
  const mentorId = account.mentorId ?? 'm1';
  const status = state.scenarios.dataState;
  const settings = state.world.mentorSettings[mentorId] ?? initialSettings(mentorId);
  // „Pusto” scenario: the same screen as a mentor without any availability.
  const shown: MentorSettings = status === 'empty' ? { ...settings, template: {} } : settings;
  return (
    <>
      <PageHeader title="Kalendarz i dostępność" description="Strefa czasowa: Europe/Warsaw. Zmiany szablonu od razu widzą uczniowie." />
      {status === 'loading' ? (
        <div aria-busy="true" className="flex flex-col gap-group">
          <p className="sr-only">Wczytujemy kalendarz…</p>
          <Skeleton className="h-control-lg w-full" />
          <Skeleton className="h-lh w-full" />
          <Skeleton className="h-lh w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-section">
          {totalHours(shown.template) === 0 ? (
            <Alert variant="warning" role="status">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Uczniowie nie mogą Cię zarezerwować</AlertTitle>
              <AlertDescription>Nie masz ustawionej dostępności. Zaznacz godziny w szablonie tygodniowym poniżej i zapisz.</AlertDescription>
            </Alert>
          ) : null}
          <WeekView settings={shown} mentorId={mentorId} />
          <TemplateEditor key={status} saved={shown.template} mentorId={mentorId} />
          <div className="flex flex-col gap-section md:flex-row md:items-start">
            <div className="md:flex-1"><SettingsForm settings={settings} mentorId={mentorId} /></div>
            <div className="md:flex-1"><Exceptions exceptions={settings.exceptions} mentorId={mentorId} /></div>
            <div className="md:flex-1"><GoogleCard settings={settings} mentorId={mentorId} /></div>
          </div>
        </div>
      )}
    </>
  );
}
