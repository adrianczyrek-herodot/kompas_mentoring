/**
 * M5 — Zarobki i wypłaty mentora.
 * DS-GAP: EarningsSummary
 */
import { Button, Card, CardContent, CardHeader, CardTitle, Money } from '@kompas/ui';
import type { Route } from '../lib/router';
import { useDemo } from '../state/demo-context';

export function M5Earnings({ route }: { route: Route }) {
  const { state, account } = useDemo();
  if (account.role !== 'mentor') return null;

  // Simulated earnings data
  const pending = [
    { id: 's1', studentName: 'Adrian C.', date: '2026-10-20', amount: 180, status: 'pending' as const },
    { id: 'j1', studentName: 'Julia M.', date: '2026-10-20', amount: 180, status: 'pending' as const },
  ];

  const completed = [
    { id: 's4', studentName: 'Adrian C.', date: '2026-10-18', amount: 180, commission: 36, payout: 144, status: 'paid' as const },
    { id: 'j2', studentName: 'Julia M.', date: '2026-10-19', amount: 180, commission: 36, payout: 144, status: 'paid' as const },
    { id: 'j3', studentName: 'Julia M.', date: '2026-10-17', amount: 180, commission: 36, payout: 144, status: 'paid' as const },
  ];

  const totalPending = pending.reduce((sum, s) => sum + s.amount, 0);
  const totalPaid = completed.reduce((sum, s) => sum + s.payout, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-surface-border bg-surface-primary">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{totalPending}</p>
            <p className="text-meta text-text-muted">Oczekujące na rozliczenie</p>
          </CardContent>
        </Card>
        <Card className="border-surface-border bg-surface-primary">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{totalPaid}</p>
            <p className="text-meta text-text-muted">Wypłacone łącznie</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Do rozliczenia</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr className="text-meta text-text-muted">
                <th className="pb-2 font-normal">Uczeń</th>
                <th className="pb-2 font-normal">Data</th>
                <th className="pb-2 font-normal text-right">Kwota</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((session) => (
                <tr key={session.id} className="border-t border-surface-border">
                  <td className="py-2 text-body-dense text-text-primary">{session.studentName}</td>
                  <td className="py-2 text-body-dense text-text-muted">
                    {new Date(session.date).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="py-2 text-body-dense text-text-primary text-right">
                    {session.amount} zł
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Rozliczone</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr className="text-meta text-text-muted">
                <th className="pb-2 font-normal">Uczeń</th>
                <th className="pb-2 font-normal">Data</th>
                <th className="pb-2 font-normal text-right">Kwota</th>
                <th className="pb-2 font-normal text-right">Prowizja</th>
                <th className="pb-2 font-normal text-right">Wypłata</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((session) => (
                <tr key={session.id} className="border-t border-surface-border">
                  <td className="py-2 text-body-dense text-text-primary">{session.studentName}</td>
                  <td className="py-2 text-body-dense text-text-muted">
                    {new Date(session.date).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="py-2 text-body-dense text-text-primary text-right">
                    {session.amount} zł
                  </td>
                  <td className="py-2 text-body-dense text-text-muted text-right">
                    -{session.commission} zł
                  </td>
                  <td className="py-2 text-body-dense text-accent-primary text-right font-semibold">
                    {session.payout} zł
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Payout button */}
      <Button disabled={totalPending === 0}>
        Zleć wypłatę ({totalPending} zł)
      </Button>
      {totalPending > 0 && (
        <p className="text-meta text-text-muted">
          Wypłata zostanie zrealizowana w ciągu 1–2 dni roboczych.
        </p>
      )}
    </div>
  );
}
