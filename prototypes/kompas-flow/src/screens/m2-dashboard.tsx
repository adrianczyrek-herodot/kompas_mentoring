/**
 * M2 — Panel mentora.
 */
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, TodayAgenda } from '@kompas/ui';
import { useDemo } from '../state/demo-context';

export function M2Dashboard() {
  const { account, myBookings } = useDemo();
  if (account.role !== 'mentor') return null;

  // Simulated today's agenda
  const todaySessions = myBookings.filter((b) => b.startsAt.startsWith('2026-10-20'));

  // Trial requests
  const trialRequests = [
    { id: 'r1', studentName: 'Paweł R.', goal: 'Live coding w React na rozmowie technicznej', date: '2026-10-22T09:00:00+02:00' },
    { id: 'r2', studentName: 'Anna K.', goal: 'Przejście z juniora do mid level', date: '2026-10-25T14:00:00+02:00' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome */}
      <Card className="border-surface-border bg-surface-primary">
        <CardContent className="py-4">
          <p className="text-heading-md text-text-primary">Dzień dobry, {account.name}!</p>
          <p className="mt-1 text-body text-text-muted">Masz {todaySessions.length} sesji dzisiaj i {trialRequests.length} próśb o sesję próbną.</p>
        </CardContent>
      </Card>

      {/* Today's agenda */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Dzisiaj</CardTitle>
        </CardHeader>
        <CardContent>
          {todaySessions.length > 0 ? (
            <TodayAgenda
              items={todaySessions.map((b) => ({
                id: b.id,
                startsAt: b.startsAt,
                durationMin: b.durationMin,
                type: b.type,
                status: b.status as any,
                withName: getStudentName(b.studentId),
                goal: b.goal || 'Sesja z planu',
                joinOpen: false,
              }))}
              timeZone="Europe/Warsaw"
            />
          ) : (
            <p className="text-body text-text-muted">Brak sesji na dziś.</p>
          )}
        </CardContent>
      </Card>

      {/* Trial requests */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Prośby o sesję próbną</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {trialRequests.map((req) => (
              <div key={req.id} className="flex items-start justify-between rounded-lg border border-surface-border p-3">
                <div>
                  <p className="text-body-semibold text-text-primary">{req.studentName}</p>
                  <p className="text-body-dense text-text-muted">{req.goal}</p>
                  <p className="text-meta text-text-muted">
                    {new Date(req.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Oczekuje</Badge>
                  <Button variant="outline" size="sm">Akceptuj</Button>
                  <Button variant="outline" size="sm">Odrzuć</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-surface-border bg-surface-primary">
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-text-primary">47</p>
            <p className="text-meta text-text-muted">Sesji łącznie</p>
          </CardContent>
        </Card>
        <Card className="border-surface-border bg-surface-primary">
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-text-primary">4.9</p>
            <p className="text-meta text-text-muted">Ocena</p>
          </CardContent>
        </Card>
        <Card className="border-surface-border bg-surface-primary">
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-text-primary">82%</p>
            <p className="text-meta text-text-muted">Powroty</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getStudentName(studentId: string): string {
  switch (studentId) {
    case 'adrian': return 'Adrian C.';
    case 'julia': return 'Julia M.';
    case 'pawel': return 'Paweł R.';
    default: return 'Uczeń';
  }
}
