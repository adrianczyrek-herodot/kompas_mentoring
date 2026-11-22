/**
 * M3 — Kalendarz i dostępność mentora.
 * DS-GAP: AvailabilityWeek, ExceptionForm, CalendarSettingsForm
 */
import { Button, Card, CardContent, CardHeader, CardTitle, ToggleGroup, ToggleGroupItem } from '@kompas/ui';
import type { Route } from '../lib/router';
import { useDemo } from '../state/demo-context';

const DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

export function M3Calendar({ route }: { route: Route }) {
  const { state, account } = useDemo();
  if (account.role !== 'mentor') return null;

  // Simulated availability
  const availability = [
    { day: 0, hours: [9, 10, 17, 18], enabled: true },
    { day: 1, hours: [17, 18, 19], enabled: true },
    { day: 2, hours: [9, 10, 11], enabled: true },
    { day: 3, hours: [18, 19], enabled: true },
    { day: 4, hours: [8, 9, 16], enabled: true },
    { day: 5, hours: [], enabled: false },
    { day: 6, hours: [], enabled: false },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Kalendarz i dostępność</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-dense text-text-muted mb-4">
            Ustaw cykliczną dostępność. Uczniowie widzą tylko wolne terminy.
          </p>

          {/* Week editor */}
          <div className="flex flex-col gap-2">
            {availability.map((day) => (
              <div key={day.day} className={`flex items-center justify-between rounded-lg border border-surface-border p-3 ${!day.enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => {}}
                    className="h-4 w-4 accent-accent-primary"
                  />
                  <span className="text-body-semibold text-text-primary">{DAYS[day.day]}</span>
                </div>
                <div className="flex items-center gap-2">
                  {day.hours.length > 0 && (
                    <span className="text-body-dense text-text-muted">
                      {day.hours.join(', ')}:00
                    </span>
                  )}
                  <Button variant="outline" size="sm">Edytuj</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exceptions */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Wyjątki</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-dense text-text-muted mb-3">
            Dodaj pojedyncze dni wolne lub zmiany godzin.
          </p>
          <Button variant="outline" size="sm">+ Dodaj wyjątek</Button>
        </CardContent>
      </Card>

      {/* Sync */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Synchronizacja kalendarza</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-dense text-text-muted mb-3">
            Połącz z Google Calendar lub Outlook, żeby automatycznie blokować zajęte terminy.
          </p>
          <Button variant="outline" size="sm">Połącz z Google Calendar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
