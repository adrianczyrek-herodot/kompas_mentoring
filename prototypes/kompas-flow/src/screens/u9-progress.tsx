/**
 * U9 — Postępy ucznia: cele, notatki i zadania z sesji.
 * DS-GAP: GoalProgress, ActionItemList
 */
import { Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsList, TabsTrigger } from '@kompas/ui';

import { useDemo } from '../state/demo-context';

export function U9Progress() {
  const { myBookings } = useDemo();

  const completed = myBookings.filter((b) => b.status === 'completed' && b.actionItems);
  const actionItems = completed.flatMap((b) =>
    (b.actionItems ?? []).map((item) => ({ ...item, bookingId: b.id, mentorName: getMentorName(b.mentorId), goal: b.goal }))
  );
  const doneCount = actionItems.filter((a) => a.done).length;
  const pendingCount = actionItems.length - doneCount;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress overview */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Twój postęp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-text-primary">{myBookings.filter((b) => b.status === 'completed').length}</p>
              <p className="text-meta text-text-muted">Ukończone sesje</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{doneCount}</p>
              <p className="text-meta text-text-muted">Zrealizowane zadania</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{pendingCount}</p>
              <p className="text-meta text-text-muted">Oczekujące zadania</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Cele / Zadania / Notatki */}
      <Tabs defaultValue="goals" className="flex flex-col gap-3">
        <TabsList>
          <TabsTrigger value="goals">Cele</TabsTrigger>
          <TabsTrigger value="actions">Zadania</TabsTrigger>
          <TabsTrigger value="notes">Notatki</TabsTrigger>
        </TabsList>

        {/* Goals tab */}
        <div className="hidden space-y-3" id="goals-panel">
          <Card className="border-surface-border bg-surface-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-semibold text-text-primary">Cel: pierwsza praca jako frontend developer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-tertiary">
                <div className="h-full w-[60%] rounded-full bg-accent-primary" />
              </div>
              <p className="text-meta text-text-muted">Postęp: 60%</p>
              <p className="mt-2 text-body-dense text-text-muted">
                Plan: portfolio (3 projekty), code review co tydzień, 2 próbne rozmowy techniczne.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions tab */}
        <div className="space-y-2" id="actions-panel">
          {actionItems.map((item, idx) => (
            <Card key={idx} className="border-surface-border bg-surface-primary">
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    readOnly
                    className="h-4 w-4 accent-accent-primary"
                  />
                  <span className={`text-body ${item.done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {item.text}
                  </span>
                </div>
                <Badge variant={item.done ? 'success' : 'neutral'}>
                  {item.done ? 'Zrobione' : 'Oczekuje'}
                </Badge>
              </CardContent>
            </Card>
          ))}
          {actionItems.length === 0 && (
            <p className="text-body text-text-muted">Brak zadań do wyświetlenia.</p>
          )}
        </div>

        {/* Notes tab */}
        <div className="space-y-3" id="notes-panel">
          {completed
            .filter((b) => b.note)
            .map((booking) => (
              <Card key={booking.id} className="border-surface-border bg-surface-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-body-semibold text-text-primary">
                    Notatka od {getMentorName(booking.mentorId)}
                  </CardTitle>
                  <p className="text-meta text-text-muted">
                    {new Date(booking.startsAt).toLocaleDateString('pl-PL')}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-body-dense text-text-muted">{booking.note}</p>
                </CardContent>
              </Card>
            ))}
          {completed.filter((b) => b.note).length === 0 && (
            <p className="text-body text-text-muted">Brak notatek do wyświetlenia.</p>
          )}
        </div>
      </Tabs>
    </div>
  );
}

function getMentorName(mentorId: string): string {
  switch (mentorId) {
    case 'm1': return 'Kasia Nowicka';
    case 'm3': return 'Ewa Sadowska';
    case 'm5': return 'Natalia Kurek';
    default: return 'Mentor';
  }
}
