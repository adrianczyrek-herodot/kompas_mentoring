/**
 * M4 — Uczniowie i notatki mentora.
 * DS-GAP: StudentDetail, SessionNoteForm
 */
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Sheet, Textarea } from '@kompas/ui';
import type { Route } from '../lib/router';
import { useDemo } from '../state/demo-context';

export function M4Students({ route }: { route: Route }) {
  const { state, account } = useDemo();
  if (account.role !== 'mentor') return null;

  const students = [
    { id: 'adrian', name: 'Adrian C.', sessions: 5, lastSession: '2026-10-18', nextSession: '2026-10-20T14:05:00+02:00' },
    { id: 'julia', name: 'Julia M.', sessions: 3, lastSession: '2026-10-19', nextSession: '2026-10-20T17:00:00+02:00' },
  ];

  const selectedStudentId = (route.params)['id'];
  const selectedStudent = students.find((s) => s.id === (route.params)['id']);

  if (selectedStudent) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="border-surface-border bg-surface-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-heading-md text-text-primary">{selectedStudent.name}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => { navigate(`/mentor/uczniowie`); }}>
                ← Wróć do listy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-body-dense text-text-muted mb-3">
              {selectedStudent.sessions} sesji · Ostatnia: {new Date(selectedStudent.lastSession).toLocaleDateString('pl-PL')}
            </p>

            {/* Goals */}
            <h3 className="text-body-semibold text-text-primary mb-2">Cele</h3>
            <Card className="mb-3 border-surface-border bg-surface-secondary">
              <CardContent className="py-2">
                <p className="text-body-dense text-text-primary">Pierwsza praca jako frontend developer do marca 2027</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-tertiary">
                  <div className="h-full w-[60%] rounded-full bg-accent-primary" />
                </div>
                <p className="mt-1 text-meta text-text-muted">Postęp: 60%</p>
              </CardContent>
            </Card>

            {/* Notes */}
            <h3 className="text-body-semibold text-text-primary mb-2">Notatki po sesjach</h3>
            <Card className="mb-3 border-surface-border bg-surface-secondary">
              <CardHeader className="pb-2">
                <CardTitle className="text-body-dense text-text-primary">Sesja z 2026-10-18</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-dense text-text-muted">
                  Omówiliśmy, kiedy stan lokalny wystarcza, a kiedy potrzebny jest store. Twoje komponenty formularza robią za dużo — rozdziel walidację od prezentacji.
                </p>
              </CardContent>
            </Card>

            {/* Add note */}
            <h3 className="text-body-semibold text-text-primary mb-2">Dodaj notatkę</h3>
            <Textarea placeholder="Zapisz uwagi z sesji..." rows={3} />
            <Button size="sm" className="mt-2">Zapisz notatkę</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Student list
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Uczniowie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-0">
            {students.map((student, idx) => (
              <a
                key={student.id}
                href={`/mentor/uczniowie/${student.id}`}
                className={`flex items-center justify-between px-3 py-3 hover:bg-surface-hover ${idx > 0 ? 'border-t border-surface-border' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-tertiary text-body-semibold text-text-primary">
                    {student.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-body-semibold text-text-primary">{student.name}</p>
                    <p className="text-meta text-text-muted">{student.sessions} sesji</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-body-dense text-text-muted">Następna:</p>
                  <p className="text-meta text-text-muted">
                    {new Date(student.nextSession).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function navigate(to: string): void {
  window.location.hash = `#${to}`;
}
